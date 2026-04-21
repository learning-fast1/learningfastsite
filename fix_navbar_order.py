import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    # Skip .git
    dirs[:] = [d for d in dirs if d != '.git']
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

def find_li_block(html, start):
    """Find the end of a <li> block starting at 'start', handling nested tags."""
    depth = 0
    i = start
    while i < len(html):
        if html[i:i+3] == '<li':
            depth += 1
        elif html[i:i+5] == '</li>':
            depth -= 1
            if depth == 0:
                return i + 5
        i += 1
    return -1

fixed = 0
for fpath in html_files:
    with open(fpath, encoding='utf-8') as f:
        html = f.read()

    # Check if eidiki comes before glossa in this file's navbar
    eidiki_pos = html.find('eidiki-ekpaideysi/index.html')
    glossa_pos = html.find('/glossa/index.html')

    if eidiki_pos == -1 or glossa_pos == -1:
        continue
    if eidiki_pos > glossa_pos:
        # Already in correct order (glossa before eidiki)
        continue

    # Find the <li> block for eidiki-ekpaideysi
    # Go back to find <li
    eidiki_li_start = html.rfind('<li', 0, eidiki_pos)
    eidiki_li_end = find_li_block(html, eidiki_li_start)
    eidiki_block = html[eidiki_li_start:eidiki_li_end]

    # Find the <li> block for glossa
    glossa_li_start = html.rfind('<li', 0, glossa_pos)
    glossa_li_end = find_li_block(html, glossa_li_start)
    glossa_block = html[glossa_li_start:glossa_li_end]

    # Swap: replace eidiki block with glossa block and vice versa
    # We need to be careful about the whitespace between them
    # Extract what's between the two blocks
    between = html[eidiki_li_end:glossa_li_start]

    new_html = (
        html[:eidiki_li_start] +
        glossa_block +
        between +
        eidiki_block +
        html[glossa_li_end:]
    )

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f'Fixed: {fpath}')
    fixed += 1

print(f'\nTotal fixed: {fixed}')
