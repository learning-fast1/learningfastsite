import re, sys, glob
sys.stdout.reconfigure(encoding='utf-8')

# Match any navbar/footer <li> with a mathimatika link (any relative depth)
PATTERN = re.compile(
    r'\s*<li><a href="(?:\.\./)*mathimatika/index\.html"(?:[^>]*)>Μαθηματικά</a></li>\n?'
)

files = glob.glob('**/*.html', recursive=True)
updated = 0
for fpath in files:
    with open(fpath, encoding='utf-8') as f:
        html = f.read()
    new_html = PATTERN.sub('', html)
    if new_html != html:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f'Updated: {fpath}')
        updated += 1

print(f'\nTotal: {updated} files updated')
