import re, sys
sys.stdout.reconfigure(encoding='utf-8')

# Keywords per game URL fragment
GAME_SUBS = {
    'pollaplasiasmoiAdimotikou': 'Εξάσκηση στους πολλαπλασιασμούς και στην προπαίδεια για Α΄ Δημοτικού — πολλαπλασιασμοί ασκήσεις.',
    'pollaplasiasmoi': 'Εξάσκηση στην προπαίδεια: προπαίδεια του 1, 2, 3 … 10. Πολλαπλασιασμοί ασκήσεις για όλες τις τάξεις δημοτικού.',
    'mathimatikespraxis': 'Μαθηματικές πράξεις: πρόσθεση, αφαίρεση, υπερπήδηση δεκάδας, πράξεις με δανεισμό.',
    'telikon': 'Εξάσκηση στο τελικό -ν. Πότε βάζω το τελικό -ν στις λέξεις; Ασκήσεις τελικό -ν δημοτικό.',
    'orthografiamegalwn': 'Ορθογραφία άρθρα και καταλήξεις: η/οι, της/τις, των/τον. Εξάσκηση στην ορθογραφία δημοτικού.',
    'orthografia-game': 'Μάθε ορθογραφία με άρθρα ο/η/το και καταλήξεις. Εξάσκηση στα γένη — ορθογραφία Α΄ δημοτικού.',
}

PAGE_DATA = {
    'ekpaideftika-paixnidia/a-dimotikou/mathimatika/index.html': {
        'title': 'Πολλαπλασιασμοί & Μαθηματικές Πράξεις Α΄ Δημοτικού | Learning Fast',
        'desc': 'Παιχνίδια μαθηματικών για Α΄ Δημοτικού: εξάσκηση στην προπαίδεια, πολλαπλασιασμοί Α΄ δημοτικού, μαθηματικές πράξεις. Δωρεάν online εξάσκηση χωρίς εγγραφή.',
        'intro': 'Εξάσκηση στις <strong>μαθηματικές πράξεις</strong> και την <strong>προπαίδεια</strong> για Α΄ Δημοτικού. Πολλαπλασιασμοί, πρόσθεση και αφαίρεση — <strong>δωρεάν παιχνίδια</strong> για παιδιά 6–7 χρονών.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/b-dimotikou/mathimatika/index.html': {
        'title': 'Μαθηματικές Πράξεις & Πολλαπλασιασμοί Β΄ Δημοτικού | Learning Fast',
        'desc': 'Παιχνίδια μαθηματικών για Β΄ Δημοτικού: μαθηματικές πράξεις Β΄ δημοτικού, πολλαπλασιασμοί, πράξεις με δανεισμό. Δωρεάν εξάσκηση online.',
        'intro': '<strong>Μαθηματικές πράξεις Β΄ Δημοτικού</strong>: πρόσθεση, αφαίρεση, πράξεις με δανεισμό και <strong>πολλαπλασιασμοί</strong>. Δωρεάν παιχνίδια εξάσκησης online.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/g-dimotikou/mathimatika/index.html': {
        'title': 'Πολλαπλασιασμοί & Προπαίδεια Γ΄ Δημοτικού – Παιχνίδια | Learning Fast',
        'desc': 'Εξάσκηση στους πολλαπλασιασμούς και την προπαίδεια για Γ΄ Δημοτικού. Δωρεάν παιχνίδια μαθηματικών: πολλαπλασιασμοί ασκήσεις, εξάσκηση στην προπαίδεια online.',
        'intro': 'Εξάσκηση στους <strong>πολλαπλασιασμούς</strong> και την <strong>προπαίδεια</strong> για Γ΄ Δημοτικού. <strong>Πολλαπλασιασμοί ασκήσεις</strong> — δωρεάν παιχνίδια online.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/d-dimotikou/mathimatika/index.html': {
        'title': 'Πολλαπλασιασμοί & Προπαίδεια Δ΄ Δημοτικού – Παιχνίδια | Learning Fast',
        'desc': 'Εξάσκηση στους πολλαπλασιασμούς και την προπαίδεια για Δ΄ Δημοτικού. Δωρεάν παιχνίδια μαθηματικών: πολλαπλασιασμοί ασκήσεις online.',
        'intro': 'Εξάσκηση στους <strong>πολλαπλασιασμούς</strong> και την <strong>προπαίδεια</strong> για Δ΄ Δημοτικού. <strong>Πολλαπλασιασμοί ασκήσεις</strong> — δωρεάν παιχνίδια online.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/e-dimotikou/mathimatika/index.html': {
        'title': 'Πολλαπλασιασμοί & Προπαίδεια Ε΄ Δημοτικού – Παιχνίδια | Learning Fast',
        'desc': 'Εξάσκηση στους πολλαπλασιασμούς και την προπαίδεια για Ε΄ Δημοτικού. Δωρεάν παιχνίδια μαθηματικών: πολλαπλασιασμοί ασκήσεις online.',
        'intro': 'Εξάσκηση στους <strong>πολλαπλασιασμούς</strong> και την <strong>προπαίδεια</strong> για Ε΄ Δημοτικού. <strong>Πολλαπλασιασμοί ασκήσεις</strong> — δωρεάν παιχνίδια online.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/st-dimotikou/mathimatika/index.html': {
        'title': 'Πολλαπλασιασμοί & Προπαίδεια ΣΤ΄ Δημοτικού – Παιχνίδια | Learning Fast',
        'desc': 'Εξάσκηση στους πολλαπλασιασμούς και την προπαίδεια για ΣΤ΄ Δημοτικού. Δωρεάν παιχνίδια μαθηματικών: πολλαπλασιασμοί ασκήσεις online.',
        'intro': 'Εξάσκηση στους <strong>πολλαπλασιασμούς</strong> και την <strong>προπαίδεια</strong> για ΣΤ΄ Δημοτικού. <strong>Πολλαπλασιασμοί ασκήσεις</strong> — δωρεάν παιχνίδια online.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/d-dimotikou/glossa/index.html': {
        'title': 'Τελικό -ν & Ορθογραφία Δ΄ Δημοτικού – Ασκήσεις | Learning Fast',
        'desc': 'Εξάσκηση στο τελικό -ν και ορθογραφία Δ΄ Δημοτικού. Πότε βάζω το τελικό -ν; Ορθογραφία άρθρα η/οι, της/τις, των/τον. Δωρεάν online ασκήσεις.',
        'intro': 'Εξάσκηση στο <strong>τελικό -ν</strong> και στην <strong>ορθογραφία</strong> για Δ΄ Δημοτικού. Πότε βάζω το τελικό -ν; Ορθογραφία άρθρα και καταλήξεις — δωρεάν ασκήσεις.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/e-dimotikou/glossa/index.html': {
        'title': 'Ορθογραφία Ε΄ Δημοτικού – Άρθρα & Καταλήξεις | Learning Fast',
        'desc': 'Ορθογραφία ασκήσεις για Ε΄ Δημοτικού: άρθρα η/οι, της/τις, των/τον. Εξάσκηση στην ορθογραφία καταλήξεων — δωρεάν online ασκήσεις.',
        'intro': '<strong>Ορθογραφία ασκήσεις</strong> για Ε΄ Δημοτικού: άρθρα η/οι, της/τις, των/τον. Εξάσκηση στην <strong>ορθογραφία καταλήξεων</strong> — δωρεάν online.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/st-dimotikou/glossa/index.html': {
        'title': 'Ορθογραφία ΣΤ΄ Δημοτικού – Άρθρα & Καταλήξεις | Learning Fast',
        'desc': 'Ορθογραφία ασκήσεις για ΣΤ΄ Δημοτικού: άρθρα η/οι, της/τις, των/τον. Εξάσκηση στην ορθογραφία καταλήξεων — δωρεάν online ασκήσεις.',
        'intro': '<strong>Ορθογραφία ασκήσεις</strong> για ΣΤ΄ Δημοτικού: άρθρα η/οι, της/τις, των/τον. Εξάσκηση στην <strong>ορθογραφία καταλήξεων</strong> — δωρεάν online.',
        'grid': 'games-grid',
    },
    'ekpaideftika-paixnidia/a-dimotikou/glossa/orthografia/index.html': {
        'title': 'Μαθαίνω Ορθογραφία – Άρθρα ο/η/το & Καταλήξεις | Α΄ Δημοτικού | Learning Fast',
        'desc': 'Εξάσκηση στην ορθογραφία για Α΄ Δημοτικού: άρθρα ο/η/το, καταλήξεις, εξάσκηση στα γένη. Ορθογραφία ασκήσεις δημοτικό — δωρεάν παιχνίδι online.',
        'intro': 'Μάθε <strong>ορθογραφία</strong> με άρθρα (ο, η, το) και καταλήξεις. <strong>Εξάσκηση στα γένη</strong> και <strong>ορθογραφία ασκήσεις δημοτικό</strong> — δωρεάν online.',
        'grid': 'games-grid',
    },
}

EXTRA_CSS = """
    .landing-intro { max-width:720px; margin:0 auto 2.5rem; font-size:1.05rem; color:var(--muted); line-height:1.8; text-align:center; }
    .game-card__sub { font-size:.9rem; color:var(--muted); line-height:1.5; margin:0; }"""


def add_game_sub(html, game_key, sub_text):
    """Insert <p class="game-card__sub"> after game-card__title for cards with matching URL."""
    if 'game-card__sub' in html:
        return html  # already has subs, skip
    url_fragment = game_key
    # find all positions of this URL in html
    pattern = (
        r'(href="https://learning-fast1\.github\.io/' + re.escape(url_fragment) + r'/[^"]*"'
        r'.*?<div class="game-card__title">.*?</div>)'
        r'(\s*<span class="game-card__btn">)'
    )
    sub_html = f'\n          <p class="game-card__sub">{sub_text}</p>'
    return re.sub(pattern, r'\1' + sub_html + r'\2', html, flags=re.DOTALL)


updated = 0
for fpath, cfg in PAGE_DATA.items():
    with open(fpath, encoding='utf-8') as f:
        html = f.read()

    # 1. Update title
    html = re.sub(r'<title>.*?</title>', f'<title>{cfg["title"]}</title>', html, count=1)

    # 2. Update or add meta description
    if 'name="description"' in html:
        html = re.sub(
            r'<meta name="description"[^>]*/?>',
            f'<meta name="description" content="{cfg["desc"]}" />',
            html, count=1
        )
    else:
        html = html.replace(
            '<meta charset="UTF-8" />',
            f'<meta charset="UTF-8" />\n  <meta name="description" content="{cfg["desc"]}" />'
        )

    # 3. Add extra CSS (landing-intro + game-card__sub) if not present
    if 'landing-intro' not in html:
        html = html.replace('</style>', EXTRA_CSS + '\n  </style>', 1)

    # 4. Add landing-intro before the games-grid
    grid_opener = f'<div class="{cfg["grid"]}">'
    intro_p = f'\n      <p class="landing-intro">{cfg["intro"]}</p>\n\n      '
    if 'landing-intro' not in html:
        html = html.replace(grid_opener, intro_p + grid_opener, 1)

    # 5. Add game-card__sub descriptions for each known game
    for game_key, sub_text in GAME_SUBS.items():
        if game_key in html:
            html = add_game_sub(html, game_key, sub_text)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Updated: {fpath}')
    updated += 1

print(f'\nTotal: {updated} pages updated')
