import re, sys, glob
sys.stdout.reconfigure(encoding='utf-8')

# Match the whole "Τάξεις" navbar dropdown <li> (any relative depth, or the
# self-referencing "index.html"/"../index.html" hrefs used by pages inside
# taxeis/ itself), including its nested <ul class="dropdown">...</ul>.
PATTERN = re.compile(
    r'\s*<li class="has-dropdown"><a href="(?:(?:\.\./)*taxeis/index\.html|\.\./index\.html|index\.html)">Τάξεις</a>\s*<ul class="dropdown">.*?</ul>\s*</li>\n?',
    re.DOTALL
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
