import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

# Map of file path -> (title, description)
pages = {
    'index.html': (
        'Εκπαιδευτικά Βιβλία, Σημειώσεις & Σχολικά Βοηθήματα | Learning Fast',
        'Βιβλία, σημειώσεις εξετάσεων και εκπαιδευτικό υλικό για μαθητές, γονείς και εκπαιδευτικούς. Εκπαιδευτικά παιχνίδια για όλες τις τάξεις δημοτικού.'
    ),
    'glossa/index.html': (
        'Γλώσσα – Εκπαιδευτικό Υλικό & Ασκήσεις | Learning Fast',
        'Εκπαιδευτικό υλικό γλώσσας για δημοτικό: μέρη του λόγου, ορθογραφία, παραγωγή και κατανόηση γραπτού λόγου.'
    ),
    'glossa/meri-logou/index.html': (
        'Μέρη του Λόγου – Ασκήσεις & Εξηγήσεις | Learning Fast',
        'Μάθε τα μέρη του λόγου με απλές εξηγήσεις και ασκήσεις. Ουσιαστικά, ρήματα, επίθετα και άρθρα για δημοτικό.'
    ),
    'glossa/meri-protasis/index.html': (
        'Μέρη της Πρότασης – Υποκείμενο, Κατηγόρημα | Learning Fast',
        'Εκμάθηση μερών της πρότασης: υποκείμενο, κατηγόρημα, αντικείμενο. Ασκήσεις για μαθητές δημοτικού.'
    ),
    'glossa/orthografia/index.html': (
        'Ορθογραφία – Κανόνες & Ασκήσεις για Δημοτικό | Learning Fast',
        'Κανόνες ορθογραφίας, διαγωνίσματα και παιχνίδια ορθογραφίας για μαθητές δημοτικού.'
    ),
    'glossa/paragogi-graptou/index.html': (
        'Παραγωγή Γραπτού Λόγου – Εκθέσεις & Κείμενα | Learning Fast',
        'Μάθε να γράφεις εκθέσεις, περιγραφές και δημιουργικά κείμενα. Βοήθεια για παραγωγή γραπτού λόγου στο δημοτικό.'
    ),
    'glossa/katanoisi-graptou/index.html': (
        'Κατανόηση Γραπτού Λόγου – Κείμενα & Ερωτήσεις | Learning Fast',
        'Ανάγνωση και κατανόηση κειμένων για δημοτικό. Ασκήσεις κατανόησης γραπτού λόγου.'
    ),
    'mathimatika/index.html': (
        'Μαθηματικά Δημοτικού – Ασκήσεις & Παιχνίδια | Learning Fast',
        'Εκπαιδευτικό υλικό μαθηματικών για δημοτικό. Ασκήσεις, παιχνίδια και βοηθήματα για πρόσθεση, αφαίρεση, πολλαπλασιασμό και διαίρεση.'
    ),
    'ekpaideftika-paixnidia/index.html': (
        'Εκπαιδευτικά Παιχνίδια για Δημοτικό | Learning Fast',
        'Δωρεάν εκπαιδευτικά παιχνίδια για μαθητές δημοτικού. Παιχνίδια γλώσσας, μαθηματικών και ορθογραφίας για Α έως ΣΤ δημοτικού.'
    ),
    'ekpaideftika-paixnidia/a-dimotikou/index.html': (
        'Εκπαιδευτικά Παιχνίδια Α Δημοτικού | Learning Fast',
        'Δωρεάν εκπαιδευτικά παιχνίδια για Α δημοτικού. Παιχνίδια ορθογραφίας, μαθηματικών και γλώσσας για 6χρονα παιδιά.'
    ),
    'ekpaideftika-paixnidia/b-dimotikou/index.html': (
        'Εκπαιδευτικά Παιχνίδια Β Δημοτικού | Learning Fast',
        'Δωρεάν εκπαιδευτικά παιχνίδια για Β δημοτικού. Ασκήσεις και παιχνίδια μαθηματικών και γλώσσας.'
    ),
    'ekpaideftika-paixnidia/g-dimotikou/index.html': (
        'Εκπαιδευτικά Παιχνίδια Γ Δημοτικού | Learning Fast',
        'Δωρεάν εκπαιδευτικά παιχνίδια για Γ δημοτικού. Ασκήσεις γλώσσας και μαθηματικών.'
    ),
    'ekpaideftika-paixnidia/d-dimotikou/index.html': (
        'Εκπαιδευτικά Παιχνίδια Δ Δημοτικού | Learning Fast',
        'Δωρεάν εκπαιδευτικά παιχνίδια για Δ δημοτικού. Ορθογραφία, τελικό -ν, πολλαπλασιασμοί και άλλα παιχνίδια.'
    ),
    'ekpaideftika-paixnidia/e-dimotikou/index.html': (
        'Εκπαιδευτικά Παιχνίδια Ε Δημοτικού | Learning Fast',
        'Δωρεάν εκπαιδευτικά παιχνίδια για Ε δημοτικού. Παιχνίδια γλώσσας και μαθηματικών.'
    ),
    'ekpaideftika-paixnidia/st-dimotikou/index.html': (
        'Εκπαιδευτικά Παιχνίδια ΣΤ Δημοτικού | Learning Fast',
        'Δωρεάν εκπαιδευτικά παιχνίδια για ΣΤ δημοτικού. Παιχνίδια ορθογραφίας και μαθηματικών για τελευταία χρονιά δημοτικού.'
    ),
    'ekpaideftika-paixnidia/a-dimotikou/mathimatika/index.html': (
        'Μαθηματικά Α Δημοτικού – Παιχνίδια & Ασκήσεις | Learning Fast',
        'Εκπαιδευτικά παιχνίδια μαθηματικών για Α δημοτικού. Εξάσκηση στην προπαίδεια και μαθηματικές πράξεις για παιδιά 6 χρονών.'
    ),
    'ekpaideftika-paixnidia/b-dimotikou/mathimatika/index.html': (
        'Μαθηματικά Β Δημοτικού – Παιχνίδια & Ασκήσεις | Learning Fast',
        'Εκπαιδευτικά παιχνίδια μαθηματικών για Β δημοτικού. Πολλαπλασιασμός, πρόσθεση και αφαίρεση με διασκεδαστικό τρόπο.'
    ),
    'ekpaideftika-paixnidia/g-dimotikou/mathimatika/index.html': (
        'Μαθηματικά Γ Δημοτικού – Παιχνίδια & Ασκήσεις | Learning Fast',
        'Εκπαιδευτικά παιχνίδια μαθηματικών για Γ δημοτικού. Πολλαπλασιασμοί και αριθμητικές πράξεις.'
    ),
    'ekpaideftika-paixnidia/d-dimotikou/mathimatika/index.html': (
        'Μαθηματικά Δ Δημοτικού – Παιχνίδια & Ασκήσεις | Learning Fast',
        'Εκπαιδευτικά παιχνίδια μαθηματικών για Δ δημοτικού.'
    ),
    'ekpaideftika-paixnidia/e-dimotikou/mathimatika/index.html': (
        'Μαθηματικά Ε Δημοτικού – Παιχνίδια & Ασκήσεις | Learning Fast',
        'Εκπαιδευτικά παιχνίδια μαθηματικών για Ε δημοτικού.'
    ),
    'ekpaideftika-paixnidia/st-dimotikou/mathimatika/index.html': (
        'Μαθηματικά ΣΤ Δημοτικού – Παιχνίδια & Ασκήσεις | Learning Fast',
        'Εκπαιδευτικά παιχνίδια μαθηματικών για ΣΤ δημοτικού.'
    ),
    'ekpaideftika-paixnidia/d-dimotikou/glossa/index.html': (
        'Γλώσσα Δ Δημοτικού – Παιχνίδια Ορθογραφίας | Learning Fast',
        'Εκπαιδευτικά παιχνίδια γλώσσας για Δ δημοτικού. Ορθογραφία μεγάλων και τελικό -ν.'
    ),
    'ekpaideftika-paixnidia/e-dimotikou/glossa/index.html': (
        'Γλώσσα Ε Δημοτικού – Παιχνίδια Ορθογραφίας | Learning Fast',
        'Εκπαιδευτικά παιχνίδια γλώσσας για Ε δημοτικού. Ορθογραφία και γλωσσικές ασκήσεις.'
    ),
    'ekpaideftika-paixnidia/st-dimotikou/glossa/index.html': (
        'Γλώσσα ΣΤ Δημοτικού – Παιχνίδια Ορθογραφίας | Learning Fast',
        'Εκπαιδευτικά παιχνίδια γλώσσας για ΣΤ δημοτικού. Ορθογραφία και γλωσσικές ασκήσεις.'
    ),
    'eidiki-ekpaideysi/index.html': (
        'Ειδική Εκπαίδευση – Υλικό & Παιχνίδια | Learning Fast',
        'Εκπαιδευτικό υλικό για ειδική εκπαίδευση: κατηγορίες, ταξινόμηση και λειτουργικός λόγος για παιδιά με ειδικές εκπαιδευτικές ανάγκες.'
    ),
    'taxeis/index.html': (
        'Εκπαιδευτικό Υλικό ανά Τάξη Δημοτικού | Learning Fast',
        'Εκπαιδευτικό υλικό, βιβλία και παιχνίδια για κάθε τάξη δημοτικού και γυμνασίου. Βοήθεια για μαθητές Α έως ΣΤ δημοτικού.'
    ),
    'epikoinonia/index.html': (
        'Επικοινωνία | Learning Fast',
        'Επικοινωνήστε μαζί μας για εκπαιδευτικό υλικό, παιχνίδια και βιβλία. Email: info@learning-fast.com'
    ),
}

updated = 0
for fpath, (title, desc) in pages.items():
    if not os.path.exists(fpath):
        print(f'SKIP (not found): {fpath}')
        continue
    with open(fpath, encoding='utf-8') as f:
        html = f.read()

    # Update title
    html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, count=1)

    # Update or add meta description
    if 'name="description"' in html:
        html = re.sub(
            r'<meta name="description"[^>]*/?>',
            f'<meta name="description" content="{desc}" />',
            html, count=1
        )
    else:
        # Add after charset meta
        html = html.replace(
            '<meta charset="UTF-8" />',
            f'<meta charset="UTF-8" />\n  <meta name="description" content="{desc}" />'
        )

    # Add canonical link if not present
    canonical = f'https://learning-fast.com/{fpath.replace(os.sep, "/")}'.replace('/index.html', '/')
    if 'rel="canonical"' not in html:
        html = html.replace(
            '<link rel="stylesheet"',
            f'<link rel="canonical" href="{canonical}" />\n  <link rel="stylesheet"'
        )

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Updated: {fpath}')
    updated += 1

print(f'\nTotal: {updated} pages updated')
