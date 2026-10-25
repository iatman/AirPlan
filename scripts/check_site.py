#!/usr/bin/env python3
"""Check Hugo output for broken local references, invalid XML and SRI mismatches."""
import argparse
import base64
from collections import Counter
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET

CSS_URL = re.compile(r'''url\(\s*['"]?([^\s'"\)]+)''')


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.ids = []
        self.integrities = []
        self.in_style = False

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        key = 'src' if tag in ('script', 'img', 'source', 'iframe') else 'href'
        if attrs.get(key):
            self.references.append(attrs[key])
        for item in attrs.get('srcset', '').split(','):
            if item.strip() and not item.strip().startswith('data:'):
                self.references.append(item.strip().split()[0])
        self.references.extend(CSS_URL.findall(attrs.get('style', '')))
        if attrs.get('integrity') and attrs.get(key):
            self.integrities.append((attrs[key], attrs['integrity']))
        if tag == 'style':
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.references.extend(CSS_URL.findall(data))


def check(root, base_url):
    failures = set()
    documents = list(root.rglob('*.html'))
    xml_files = list(root.rglob('*.xml'))
    site = urlsplit(base_url)

    def local_target(document, reference):
        if not reference or reference.startswith(('data:', 'mailto:', 'tel:', 'javascript:')):
            return None
        url = urlsplit(urljoin(urljoin(base_url, document.relative_to(root).as_posix()), reference))
        if url.scheme not in ('http', 'https') or url.netloc != site.netloc:
            return None
        target = root / unquote(url.path).lstrip('/')
        # A site hosted in a subdirectory publishes that prefix outside the output directory.
        if site.path not in ('', '/'):
            prefix = site.path.rstrip('/') + '/'
            if url.path.startswith(prefix):
                target = root / unquote(url.path[len(prefix):])
        if target.is_dir():
            target /= 'index.html'
        return target

    def require(document, reference):
        target = local_target(document, reference)
        if target is not None and not target.is_file():
            failures.add(f'{document.relative_to(root)}: missing local reference {reference}')
        return target

    for document in documents:
        page = Page()
        page.feed(document.read_text(encoding='utf-8'))
        for name, count in Counter(page.ids).items():
            if count > 1:
                failures.add(f'{document.relative_to(root)}: duplicate id {name}')
        for reference in page.references:
            require(document, reference)
        for reference, integrity in page.integrities:
            target = local_target(document, reference)
            if target is None or not target.is_file():
                continue
            matches = False
            for token in integrity.split():
                algorithm, separator, digest = token.partition('-')
                if separator and algorithm in ('sha256', 'sha384', 'sha512'):
                    actual = base64.b64encode(hashlib.new(algorithm, target.read_bytes()).digest()).decode()
                    matches |= actual == digest
            if not matches:
                failures.add(f'{document.relative_to(root)}: SRI mismatch {reference}')
    for document in root.rglob('*.css'):
        for reference in CSS_URL.findall(document.read_text(encoding='utf-8')):
            require(document, reference)
    for document in xml_files:
        try:
            ET.fromstring(document.read_bytes())
        except ET.ParseError as error:
            failures.add(f'{document.relative_to(root)}: invalid XML: {error}')
        for reference in re.findall(r'<\?xml-stylesheet\b[^>]*\bhref=["\']([^"\']+)', document.read_text(encoding='utf-8')):
            require(document, reference)
    return failures, len(documents), len(xml_files)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', nargs='?', default='public')
    parser.add_argument('--base-url', default='https://atman.ihx.cc/')
    args = parser.parse_args()
    root = Path(args.directory).resolve()
    if not (root / 'index.html').is_file():
        parser.error(f'No generated index.html in {root}; run hugo --minify first')
    failures, html_count, xml_count = check(root, args.base_url)
    if failures:
        for error in sorted(failures):
            print(error)
        raise SystemExit(1)
    print(f'Site check passed: {html_count} HTML pages, {xml_count} XML files; local references, IDs and SRI valid.')


if __name__ == '__main__':
    main()
