import sys
sys.stdout.reconfigure(encoding='utf-8')

FAQ_CSS = """
    .landing-intro { max-width:720px; margin:0 auto 2.5rem; font-size:1.05rem; color:var(--muted); line-height:1.8; text-align:center; }
    .faq { max-width:720px; margin:4rem auto 0; }
    .faq__title { font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:1.5rem; text-align:center; }
    .faq__item { background:var(--surface); border-radius:var(--radius); padding:1.4rem 1.8rem; margin-bottom:1rem; box-shadow:var(--shadow); }
    .faq__q { font-weight:700; color:var(--text); margin-bottom:0.5rem; font-size:1rem; }
    .faq__a { color:var(--muted); font-size:.95rem; line-height:1.6; margin:0; }"""

def make_faq(items):
    out = ['\n      <div class="faq">', '        <h2 class="faq__title">Συχνές ερωτήσεις</h2>']
    for q, a in items:
        out += [
            '        <div class="faq__item">',
            f'          <p class="faq__q">{q}</p>',
            f'          <p class="faq__a">{a}</p>',
            '        </div>',
        ]
    out.append('      </div>')
    return '\n'.join(out)


pages = {
    # ─── Εκπαιδευτικά Παιχνίδια ──────────────────────────────────────
    'ekpaideftika-paixnidia/index.html': {
        'subtitle_marker': 'Επίλεξε την τάξη σου και ξεκίνα τη διασκέδαση!',
        'grid_class': 'grades-grid',
        'intro': (
            'Τα εκπαιδευτικά παιχνίδια του Learning Fast είναι <strong>δωρεάν</strong> '
            'και σχεδιασμένα ειδικά για μαθητές δημοτικού. Κάθε παιχνίδι βοηθά τα '
            'παιδιά να εξασκήσουν τις γνώσεις τους σε <strong>μαθηματικά</strong>, '
            '<strong>γλώσσα</strong> και <strong>ορθογραφία</strong> με διασκεδαστικό '
            'τρόπο — χωρίς εγγραφή και χωρίς χρέωση.'
        ),
        'faq': [
            ('Τα εκπαιδευτικά παιχνίδια είναι δωρεάν;',
             'Ναι, όλα τα παιχνίδια στο Learning Fast είναι εντελώς δωρεάν. Δεν χρειάζεσαι εγγραφή — παίζεις αμέσως.'),
            ('Για ποιες τάξεις υπάρχουν παιχνίδια;',
             'Από την Α΄ μέχρι τη ΣΤ΄ Δημοτικού. Κάθε τάξη έχει παιχνίδια γλώσσας και μαθηματικών.'),
            ('Μπορούν τα παιδιά να παίζουν από κινητό ή tablet;',
             'Ναι! Τα παιχνίδια λειτουργούν σε κινητά, tablet και υπολογιστή χωρίς εγκατάσταση.'),
        ],
    },

    # ─── Γλώσσα ──────────────────────────────────────────────────────
    'glossa/index.html': {
        'subtitle_marker': 'Επίλεξε κατηγορία και ξεκίνα!',
        'grid_class': 'categories-grid',
        'intro': (
            'Το Learning Fast προσφέρει ολοκληρωμένο υλικό <strong>γλώσσας για το '
            'δημοτικό</strong>. Από τα μέρη του λόγου και τη δομή της πρότασης μέχρι '
            'την <strong>ορθογραφία</strong> και τη συγγραφή κειμένων — ασκήσεις, '
            'κανόνες και παιχνίδια που κάνουν τη γλώσσα εύκολη και διασκεδαστική.'
        ),
        'faq': [
            ('Σε ποιες τάξεις απευθύνεται το υλικό γλώσσας;',
             'Καλύπτει κυρίως το δημοτικό, από Α΄ έως ΣΤ΄ τάξη, με ασκήσεις και παιχνίδια ανά επίπεδο.'),
            ('Υπάρχουν ασκήσεις ορθογραφίας;',
             'Ναι! Η κατηγορία Ορθογραφία περιέχει παιχνίδια και ασκήσεις κατάλληλα για κάθε τάξη δημοτικού.'),
            ('Τι είναι τα μέρη του λόγου;',
             'Τα μέρη του λόγου είναι οι βασικές κατηγορίες λέξεων: ουσιαστικά, ρήματα, επίθετα, άρθρα, αντωνυμίες και άλλα.'),
        ],
    },

    # ─── Τάξεις ──────────────────────────────────────────────────────
    'taxeis/index.html': {
        'subtitle_marker': 'Επίλεξε την τάξη σου για να βρεις το κατάλληλο υλικό, παιχνίδια και βιβλία!',
        'grid_class': 'grades-grid',
        'intro': (
            'Βρες <strong>εκπαιδευτικό υλικό, παιχνίδια και ασκήσεις ανά τάξη</strong>. '
            'Το Learning Fast καλύπτει όλες τις τάξεις από την <strong>Α΄ μέχρι τη '
            'ΣΤ΄ Δημοτικού</strong> και το Γυμνάσιο — με παιχνίδια μαθηματικών, '
            'γλώσσας και ορθογραφίας σχεδιασμένα ειδικά για κάθε βαθμίδα.'
        ),
        'faq': [
            ('Τι υλικό υπάρχει για κάθε τάξη;',
             'Κάθε τάξη έχει εκπαιδευτικά παιχνίδια, ασκήσεις γλώσσας και μαθηματικών προσαρμοσμένα στο αναλυτικό πρόγραμμα.'),
            ('Υπάρχει υλικό για γυμνάσιο;',
             'Ναι, το Learning Fast έχει υλικό και για Α΄ και Β΄ Γυμνασίου.'),
            ('Το υλικό είναι δωρεάν;',
             'Ναι, όλο το υλικό και τα παιχνίδια είναι δωρεάν και ελεύθερα διαθέσιμα — χωρίς εγγραφή.'),
        ],
        'fix_navbar': True,
    },

    # ─── Ειδική Εκπαίδευση ────────────────────────────────────────────
    'eidiki-ekpaideysi/index.html': {
        'subtitle_marker': 'Επίλεξε κατηγορία και ξεκίνα!',
        'grid_class': 'categories-grid',
        'intro': (
            'Το Learning Fast διαθέτει εξειδικευμένο υλικό για παιδιά με '
            '<strong>ειδικές εκπαιδευτικές ανάγκες</strong>. Δραστηριότητες '
            'κατηγοριοποίησης, ταξινόμησης και ανάπτυξης '
            '<strong>λειτουργικού λόγου</strong> σχεδιασμένες ώστε κάθε παιδί '
            'να μαθαίνει με τον δικό του ρυθμό.'
        ),
        'faq': [
            ('Σε ποιους απευθύνεται η Ειδική Εκπαίδευση;',
             'Απευθύνεται σε παιδιά με ειδικές εκπαιδευτικές ανάγκες, γονείς και εκπαιδευτικούς ειδικής αγωγής.'),
            ('Τι είναι ο λειτουργικός λόγος;',
             'Λειτουργικός λόγος είναι η ανάπτυξη της επικοινωνίας για καθημερινές ανάγκες — αιτήματα, εκφράσεις, κοινωνικές αλληλεπιδράσεις.'),
            ('Τι περιλαμβάνουν οι δραστηριότητες κατηγοριών;',
             'Ασκήσεις ομαδοποίησης και ταξινόμησης που βοηθούν στην ανάπτυξη λογικής σκέψης και γλώσσας.'),
        ],
    },
}


for fpath, cfg in pages.items():
    with open(fpath, encoding='utf-8') as f:
        html = f.read()

    # 1. Add CSS before </style>
    if '.landing-intro' not in html:
        html = html.replace('</style>', FAQ_CSS + '\n  </style>', 1)

    # 2. Add intro after section__header (before grid)
    intro_p = f'\n      <p class="landing-intro">{cfg["intro"]}</p>'
    grid_opener = f'<div class="{cfg["grid_class"]}">'
    if 'landing-intro' not in html:
        html = html.replace(grid_opener, intro_p + '\n\n      ' + grid_opener, 1)

    # 3. Add FAQ after the closing </div> of the grid, before </section>
    faq_block = make_faq(cfg['faq'])
    closing = f'      </div>\n    </section>'
    if 'faq__title' not in html:
        html = html.replace(closing, f'      </div>{faq_block}\n    </section>', 1)

    # 4. Fix taxeis navbar: Ειδική Εκπαίδευση must come after Μαθηματικά
    if cfg.get('fix_navbar'):
        wrong = (
            '        <li class="has-dropdown"><a href="../eidiki-ekpaideysi/index.html">Ειδική Εκπαίδευση</a>\n'
            '          <ul class="dropdown">\n'
            '            <li><a href="../eidiki-ekpaideysi/kategories-taxinomisi/index.html">Κατηγορίες - Ταξινόμηση</a></li>\n'
            '            <li><a href="../eidiki-ekpaideysi/leitourgikos-logos/index.html">Λειτουργικός λόγος</a></li>\n'
            '          </ul>\n'
            '        </li>\n'
            '        <li><a href="../mathimatika/index.html">Μαθηματικά</a></li>'
        )
        right = (
            '        <li><a href="../mathimatika/index.html">Μαθηματικά</a></li>\n'
            '        <li class="has-dropdown"><a href="../eidiki-ekpaideysi/index.html">Ειδική Εκπαίδευση</a>\n'
            '          <ul class="dropdown">\n'
            '            <li><a href="../eidiki-ekpaideysi/kategories-taxinomisi/index.html">Κατηγορίες - Ταξινόμηση</a></li>\n'
            '            <li><a href="../eidiki-ekpaideysi/leitourgikos-logos/index.html">Λειτουργικός λόγος</a></li>\n'
            '          </ul>\n'
            '        </li>'
        )
        if wrong in html:
            html = html.replace(wrong, right)
            print(f'  → navbar fixed')
        else:
            print(f'  → navbar pattern not found (may already be correct)')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Updated: {fpath}')


# ─── mathimatika/index.html: full rewrite of <main> ──────────────────
MATH_MAIN = """\
  <main>
    <section>
      <div class="section__header">
        <span class="section__label">🔢 Μαθηματικά</span>
        <h1 class="section__title">Μαθηματικά Δημοτικού</h1>
        <p class="section__subtitle">Ασκήσεις και παιχνίδια για κάθε τάξη</p>
      </div>

      <p class="landing-intro">Τα <strong>μαθηματικά για δημοτικό</strong> γίνονται πιο εύκολα και διασκεδαστικά με τα παιχνίδια του Learning Fast. Πρόσθεση, αφαίρεση, πολλαπλασιασμός και διαίρεση — βρες ασκήσεις και παιχνίδια <strong>δωρεάν</strong> για κάθε τάξη.</p>

      <div class="grades-grid">

        <a href="../ekpaideftika-paixnidia/a-dimotikou/mathimatika/index.html" class="grade-card card--a">
          <div class="grade-card__icon" style="color:white;font-weight:bold;">Α</div>
          <div class="grade-card__title">Α΄ Δημοτικού</div>
          <p class="grade-card__sub">Προπαίδεια και μαθηματικές πράξεις για 6χρονα παιδιά.</p>
          <span class="grade-card__btn">Παίξε →</span>
        </a>

        <a href="../ekpaideftika-paixnidia/b-dimotikou/mathimatika/index.html" class="grade-card card--b">
          <div class="grade-card__icon" style="color:white;font-weight:bold;">Β</div>
          <div class="grade-card__title">Β΄ Δημοτικού</div>
          <p class="grade-card__sub">Πολλαπλασιασμός, πρόσθεση και αφαίρεση για Β΄ Δημοτικού.</p>
          <span class="grade-card__btn">Παίξε →</span>
        </a>

        <a href="../ekpaideftika-paixnidia/g-dimotikou/mathimatika/index.html" class="grade-card card--g">
          <div class="grade-card__icon" style="color:white;font-weight:bold;">Γ</div>
          <div class="grade-card__title">Γ΄ Δημοτικού</div>
          <p class="grade-card__sub">Πολλαπλασιασμοί και αριθμητικές πράξεις για Γ΄ Δημοτικού.</p>
          <span class="grade-card__btn">Παίξε →</span>
        </a>

        <a href="../ekpaideftika-paixnidia/d-dimotikou/mathimatika/index.html" class="grade-card card--d">
          <div class="grade-card__icon" style="color:white;font-weight:bold;">Δ</div>
          <div class="grade-card__title">Δ΄ Δημοτικού</div>
          <p class="grade-card__sub">Μαθηματικά παιχνίδια για Δ΄ Δημοτικού.</p>
          <span class="grade-card__btn">Παίξε →</span>
        </a>

        <a href="../ekpaideftika-paixnidia/e-dimotikou/mathimatika/index.html" class="grade-card card--e">
          <div class="grade-card__icon" style="color:white;font-weight:bold;">Ε</div>
          <div class="grade-card__title">Ε΄ Δημοτικού</div>
          <p class="grade-card__sub">Μαθηματικά παιχνίδια για Ε΄ Δημοτικού.</p>
          <span class="grade-card__btn">Παίξε →</span>
        </a>

        <a href="../ekpaideftika-paixnidia/st-dimotikou/mathimatika/index.html" class="grade-card card--st">
          <div class="grade-card__icon" style="color:white;font-weight:bold;">ΣΤ</div>
          <div class="grade-card__title">ΣΤ΄ Δημοτικού</div>
          <p class="grade-card__sub">Μαθηματικά παιχνίδια για ΣΤ΄ Δημοτικού.</p>
          <span class="grade-card__btn">Παίξε →</span>
        </a>

      </div>

      <div class="faq">
        <h2 class="faq__title">Συχνές ερωτήσεις</h2>
        <div class="faq__item">
          <p class="faq__q">Τα παιχνίδια μαθηματικών είναι δωρεάν;</p>
          <p class="faq__a">Ναι, όλα τα παιχνίδια είναι εντελώς δωρεάν και παίζονται online χωρίς εγγραφή.</p>
        </div>
        <div class="faq__item">
          <p class="faq__q">Ποιες πράξεις καλύπτουν τα παιχνίδια;</p>
          <p class="faq__a">Πρόσθεση, αφαίρεση, πολλαπλασιασμός (προπαίδεια) και εξάσκηση αριθμητικής για όλες τις τάξεις δημοτικού.</p>
        </div>
        <div class="faq__item">
          <p class="faq__q">Πώς βοηθούν τα παιχνίδια στη μάθηση των μαθηματικών;</p>
          <p class="faq__a">Μέσα από επαναλαμβανόμενη εξάσκηση σε παιγνιώδες περιβάλλον, τα παιδιά αυτοματοποιούν τις πράξεις και χτίζουν σιγουριά.</p>
        </div>
      </div>
    </section>
  </main>"""

MATH_CSS_ADDITIONS = """
    .grades-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    .grade-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
      box-shadow: var(--shadow);
      transition: transform var(--transition), box-shadow var(--transition);
      text-decoration: none;
      color: inherit;
    }
    .grade-card:hover { transform: translateY(-8px); box-shadow: 0 12px 36px rgba(79,110,247,.22); }
    .grade-card__icon { width:90px; height:90px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:.5rem; }
    .grade-card__title { font-size:1.4rem; font-weight:800; color:var(--text); }
    .grade-card__sub { font-size:.92rem; color:var(--muted); line-height:1.6; }
    .grade-card__btn { margin-top:.5rem; display:inline-block; padding:.6rem 1.6rem; border-radius:999px; font-size:.88rem; font-weight:700; color:#fff; transition:transform var(--transition); }
    .grade-card:hover .grade-card__btn { transform:scale(1.05); }
    .card--a .grade-card__icon,.card--a .grade-card__btn { background: linear-gradient(135deg,#4f6ef7,#7c9aff); }
    .card--b .grade-card__icon,.card--b .grade-card__btn { background: linear-gradient(135deg,#22c55e,#86efac); }
    .card--g .grade-card__icon,.card--g .grade-card__btn { background: linear-gradient(135deg,#f97316,#fdba74); }
    .card--d .grade-card__icon,.card--d .grade-card__btn { background: linear-gradient(135deg,#a855f7,#d8b4fe); }
    .card--e .grade-card__icon,.card--e .grade-card__btn { background: linear-gradient(135deg,#ef4444,#fca5a5); }
    .card--st .grade-card__icon,.card--st .grade-card__btn { background: linear-gradient(135deg,#14b8a6,#99f6e4); }"""

with open('mathimatika/index.html', encoding='utf-8') as f:
    math_html = f.read()

# Replace old empty-state CSS with new CSS
import re
math_html = re.sub(r'<style>.*?</style>', f'<style>{MATH_CSS_ADDITIONS}\n{FAQ_CSS}\n  </style>', math_html, count=1, flags=re.DOTALL)

# Replace entire <main>...</main>
math_html = re.sub(r'<main>.*?</main>', MATH_MAIN, math_html, count=1, flags=re.DOTALL)

with open('mathimatika/index.html', 'w', encoding='utf-8') as f:
    f.write(math_html)
print('Updated: mathimatika/index.html')
print('\nDone!')
