import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

files = [
    r'ekpaideftika-paixnidia\d-dimotikou\mathimatika\index.html',
    r'ekpaideftika-paixnidia\e-dimotikou\mathimatika\index.html',
    r'ekpaideftika-paixnidia\g-dimotikou\mathimatika\index.html',
    r'ekpaideftika-paixnidia\st-dimotikou\mathimatika\index.html',
    r'mathimatika\index.html',
    r'taxeis\a-dimotikou\index.html',
    r'taxeis\a-gymnasiou\index.html',
    r'taxeis\b-dimotikou\index.html',
    r'taxeis\b-gymnasiou\index.html',
    r'taxeis\d-dimotikou\index.html',
    r'taxeis\e-dimotikou\index.html',
    r'taxeis\g-dimotikou\index.html',
    r'glossa\meri-logou\index.html',
    r'glossa\meri-protasis\index.html',
    r'glossa\orthografia\index.html',
    r'glossa\paragogi-graptou\index.html',
    r'glossa\katanoisi-graptou\index.html',
]

NEW_CSS = """    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: var(--surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      max-width: 600px;
      margin: 4rem auto;
      border: 1px solid rgba(0,0,0,0.03);
    }
    .empty-state__icon { font-size: 4.5rem; margin-bottom: 1rem; }
    .empty-state__title { font-size: 1.8rem; color: var(--text); margin-bottom: 0.5rem; font-weight: 800; }
    .empty-state__text { color: var(--muted); margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6; }
    .back-btn {
      display: inline-block;
      padding: 0.8rem 1.8rem;
      background: linear-gradient(135deg, var(--primary), #7c9aff);
      color: #fff;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
      box-shadow: 0 4px 14px rgba(79,70,229,.25);
    }
    .back-btn:hover {
      background: linear-gradient(135deg, var(--primary-dark), #5f7cf7);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(79,70,229,.35);
    }"""

for fpath in files:
    with open(fpath, encoding='utf-8') as f:
        html = f.read()

    # --- Fix CSS: replace everything between first .empty-state { ... last .back-btn:hover { ... } ---
    css_pat = re.compile(r'    \.empty-state \{.*?\.back-btn:hover \{.*?\}', re.DOTALL)
    if css_pat.search(html):
        html = css_pat.sub(NEW_CSS, html, count=1)
    elif '.empty-state {' not in html:
        html = html.replace('  </style>', NEW_CSS + '\n  </style>', 1)

    # --- Remove ::before / ::after CSS blocks if still present ---
    html = re.sub(r'\s*\.empty-state::(?:before|after) \{[^}]+\}', '', html)

    # --- Replace the entire empty-state div block (including all children) ---
    # Find back-btn href
    back_href_m = re.search(r'class="back-btn"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="back-btn"', html)
    back_href = (back_href_m.group(1) or back_href_m.group(2)) if back_href_m else '../index.html'
    back_text_m = re.search(r'class="back-btn"[^>]*>([^<]+)</a>|href="[^"]*" class="back-btn">([^<]+)</a>', html)
    back_text = (back_text_m.group(1) or back_text_m.group(2)).strip() if back_text_m else '← Επιστροφή'

    # Build new div
    new_div = (
        '      <div class="empty-state">\n'
        '        <div class="empty-state__icon">🚧</div>\n'
        '        <h2 class="empty-state__title">Η κατηγορία είναι άδεια</h2>\n'
        '        <p class="empty-state__text">Προς το παρόν δεν υπάρχει διαθέσιμο υλικό σε αυτή την κατηγορία. Σύντομα θα προσθέσουμε νέο περιεχόμενο!</p>\n'
        f'        <a href="{back_href}" class="back-btn">{back_text}</a>\n'
        '      </div>'
    )

    # Replace the whole block from <div class="empty-state"> to its matching </div>
    # Use a counter-based approach for nested divs
    start = html.find('<div class="empty-state">')
    if start != -1:
        depth = 0
        i = start
        while i < len(html):
            if html[i:i+4] == '<div':
                depth += 1
            elif html[i:i+6] == '</div>':
                depth -= 1
                if depth == 0:
                    end = i + 6
                    break
            i += 1
        html = html[:start] + new_div + html[end:]

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Fixed: {fpath}')

print('\nAll done.')
