import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

root = r'c:/Users/Teacher/Desktop/learningfastsite'

html_files = []
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in ['styles','assets','node_modules','.git','epikoinonia']]
    for f in filenames:
        if f.endswith('.html'):
            html_files.append(os.path.join(dirpath, f))

for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'epikoinonia' in content:
        print('Already has: ' + fpath)
        continue

    rel = os.path.relpath(fpath, root)
    parts = rel.replace('\\', '/').split('/')
    depth = len(parts) - 1
    prefix = '../' * depth

    epik_link = '        <li><a href="' + prefix + 'epikoinonia/index.html">\u0395\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03af\u03b1</a></li>'

    new_content = content.replace(
        '      </ul>\n    </nav>',
        epik_link + '\n      </ul>\n    </nav>'
    )

    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Updated: ' + fpath)
    else:
        print('No match: ' + fpath)

print('Done.')
