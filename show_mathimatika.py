import re, sys, glob, os
sys.stdout.reconfigure(encoding='utf-8')

# Insert Μαθηματικά link after the Γλώσσα </li> block, before Ειδική Εκπαίδευση
INSERT_BEFORE = re.compile(
    r'(\s*)(<li class="has-dropdown"><a href="[^"]*eidiki-ekpaideysi/index\.html">Ειδική Εκπαίδευση</a>)'
)

files = glob.glob('**/*.html', recursive=True)
updated = 0

for fpath in files:
    # Calculate relative path depth to mathimatika
    depth = fpath.replace('\\', '/').count('/')
    prefix = '../' * depth
    math_href = f'{prefix}mathimatika/index.html'

    with open(fpath, encoding='utf-8') as f:
        html = f.read()

    # Skip if already has mathimatika link
    if 'mathimatika/index.html">Μαθηματικά</a>' in html:
        continue

    # Skip if no eidiki-ekpaideysi link (probably not a nav page)
    if 'eidiki-ekpaideysi/index.html">Ειδική Εκπαίδευση</a>' not in html:
        continue

    new_html = INSERT_BEFORE.sub(
        r'\1<li><a href="' + math_href + r'">Μαθηματικά</a></li>\n\1\2',
        html
    )

    if new_html != html:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f'Updated: {fpath}')
        updated += 1

print(f'\nTotal: {updated} files updated')
