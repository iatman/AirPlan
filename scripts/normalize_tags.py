#!/usr/bin/env python3
"""Check tag rules, or apply them with --write. Requires PyYAML."""
import argparse
import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
RULES = json.loads((ROOT / 'scripts/tag-rules.json').read_text())


def normalize(tags):
    result = []
    for tag in tags:
        tag = tag.strip()
        if tag.casefold() in RULES['remove']:
            continue
        tag = RULES['aliases'].get(tag.casefold(), tag)
        if tag not in result:
            result.append(tag)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Apply normalization')
    args = parser.parse_args()
    changed = []
    for path in sorted((ROOT / 'content').rglob('*.md')):
        text = path.read_bytes().decode('utf-8')
        front = re.match(r'\A---\r?\n(.*?)\r?\n---[^\S\r\n]*(?=\r?\n|$)', text, re.S)
        if not front:
            continue
        data = yaml.safe_load(front[1]) or {}
        if 'tags' not in data:
            continue
        original = data['tags'] or []
        if not isinstance(original, list) or any(not isinstance(t, str) for t in original):
            raise ValueError(f'{path}: tags must be a list of strings')
        tags = normalize(original)
        if tags == original:
            continue
        changed.append(path.relative_to(ROOT))
        if not args.write:
            continue
        newline = '\r\n' if '\r\n' in front[0] else '\n'
        field = re.compile(r'^tags:[^\r\n]*(?:\r?\n(?:[ \t]+[^\r\n]+|-[^\r\n]+))*', re.M)
        metadata, replacements = field.subn(lambda _: 'tags: ' + json.dumps(tags, ensure_ascii=False), front[1])
        if replacements != 1:
            raise ValueError(f'{path}: expected one tags field')
        # Keep the former version tag in the body so its information is not lost.
        body = text[front.end():]
        versions = [tag for tag in original if re.fullmatch(r'TiDB\s+\d+(?:\.\d+)+', tag, re.I)]
        for version in versions:
            note = f'适用版本：{version}。'
            if note not in body:
                body = newline * 2 + '> ' + note + newline + body
        updated = text[:front.start(1)] + metadata + text[front.end(1):front.end()] + body
        path.write_bytes(updated.encode('utf-8'))
    print(f'{"Updated" if args.write else "Noncanonical"}: {len(changed)} documents')
    for path in changed:
        print(path)
    return 0 if args.write or not changed else 1


if __name__ == '__main__':
    raise SystemExit(main())
