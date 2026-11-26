#!/usr/bin/env python3
"""Check the repository's Polish, English and German Markdown variants."""
from collections import Counter
from pathlib import Path
import re
import subprocess

root = Path.cwd().resolve()
paths = subprocess.check_output(
    ['git', 'ls-files', '-co', '--exclude-standard', '*.md'], text=True
).splitlines()
topics = sorted({re.sub(r'\.(en|de)\.md$', '.md', p) for p in paths
                 if re.sub(r'\.(en|de)\.md$', '.md', Path(p).name) != 'AGENTS.md'})
errors = []
links = 0
fence = re.compile(r'^```[^\n]*\n(.*?)^```\s*$', re.M | re.S)
for name in topics:
    rel = Path(name)
    variants = [rel, rel.with_name(rel.stem + '.en.md'), rel.with_name(rel.stem + '.de.md')]
    texts = []
    for variant in variants:
        path = root / variant
        if not path.is_file():
            errors.append('missing ' + str(variant))
            continue
        text = path.read_text(encoding='utf-8')
        texts.append(text)
        nav = f'[Polski]({rel.name}) | [English]({rel.stem}.en.md) | [Deutsch]({rel.stem}.de.md)'
        if not text.splitlines() or text.splitlines()[0] != nav:
            errors.append('navigation ' + str(variant))
        body = fence.sub('', text).partition('\n')[2]
        for target in re.findall(r'\[[^\]]*\]\(([^)\s]+)\)', body):
            if re.match(r'\w+:', target) or target.startswith('#'):
                continue
            target = target.split('#', 1)[0]
            if not target:
                continue
            links += 1
            dest = (path.parent / target).resolve()
            if not dest.is_relative_to(root) or not dest.exists():
                errors.append(f'broken {variant}: {target}')
            language = '.en' if variant.name.endswith('.en.md') else '.de' if variant.name.endswith('.de.md') else ''
            if target.endswith('.md') and dest.name != 'AGENTS.md':
                if language and not target.endswith(language + '.md') or not language and target.endswith(('.en.md', '.de.md')):
                    errors.append(f'wrong language {variant}: {target}')
    if len(texts) != 3:
        continue
    for index in (1, 2):
        if fence.findall(texts[0]) != fence.findall(texts[index]):
            errors.append(f'code fences differ {variants[index]}')
        for label, pattern in [('checkboxes', r'^\s*- \[([ x])\]'), ('heading levels', r'^(#+) '),
                               ('inline identifiers', r'(?<!`)`([^`\n]+)`(?!`)')]:
            left = re.findall(pattern, fence.sub('', texts[0]), re.M)
            right = re.findall(pattern, fence.sub('', texts[index]), re.M)
            differs = Counter(left) != Counter(right) if label == 'inline identifiers' else left != right
            if differs:
                errors.append(f'{label} differ {variants[index]}')
print(f'{len(topics)} documentation topics; {len(topics) * 3} expected language files; {links} localized local links checked.')
for error in errors:
    print(error)
if errors:
    raise SystemExit(1)
print('All language variants, navigation, code fences, technical identifiers, checkboxes, heading structures and local links passed.')
