import re, sys, glob
sys.stdout.reconfigure(encoding='utf-8')

# Match the whole "Γλώσσα" navbar dropdown <li> (any relative depth, or the
# self-referencing "index.html" href used by pages inside glossa/ itself),
# including its nested <ul class="dropdown">...</ul>.
PATTERN = re.compile(
    r'\s*<li class="has-dropdown"><a href="(?:(?:\.\./)*glossa/index\.html|\.\./index\.html|index\.html)">Γλώσσα</a>\s*<ul class="dropdown">.*?</ul>\s*</li>\n?',
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
