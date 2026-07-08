import re, sys, glob, os
sys.stdout.reconfigure(encoding='utf-8')

# Insert the new wordmark logo as a brand link at the start of every navbar,
# right before the hamburger button. Relative path prefix is computed from
# file depth, same convention as the other site-wide scripts.

NAV_OPEN = '<nav class="navbar">'

files = glob.glob('**/*.html', recursive=True)
updated = 0

for fpath in files:
    with open(fpath, encoding='utf-8') as f:
        html = f.read()

    if NAV_OPEN not in html:
        continue
    if 'navbar__logo' in html:
        continue  # already has the brand logo

    depth = fpath.replace('\\', '/').count('/')
    prefix = '../' * depth

    brand = (
        f'<nav class="navbar">\n'
        f'      <a href="{prefix}index.html" class="navbar__logo">'
        f'<img src="{prefix}assets/images/logo-wordmark.png" alt="Learning Fast" /></a>'
    )
    new_html = html.replace(NAV_OPEN, brand, 1)

    if new_html != html:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f'Updated: {fpath}')
        updated += 1

print(f'\nTotal updated: {updated}')
