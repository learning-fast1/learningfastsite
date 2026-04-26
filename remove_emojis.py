import sys, re
sys.stdout.reconfigure(encoding='utf-8')

# Map of file -> list of (old, new) replacements
REPLACEMENTS = {
    'mathimatika/index.html': [
        ('<span class="section__label">🔢 Μαθηματικά</span>', '<span class="section__label">Μαθηματικά</span>'),
    ],
    'taxeis/index.html': [
        ('<span class="section__label">📚 Σχολικές Τάξεις</span>', '<span class="section__label">Σχολικές Τάξεις</span>'),
    ],
    'glossa/index.html': [
        ('<span class="section__label">📖 Γλώσσα</span>', '<span class="section__label">Γλώσσα</span>'),
    ],
    'glossa/meri-logou/index.html': [
        ('<span class="section__label">📝 Μέρη του Λόγου</span>', '<span class="section__label">Μέρη του Λόγου</span>'),
    ],
    'glossa/meri-protasis/index.html': [
        ('<span class="section__label">🔤 Μέρη της Πρότασης</span>', '<span class="section__label">Μέρη της Πρότασης</span>'),
    ],
    'glossa/orthografia/index.html': [
        ('<span class="section__label">✏️ Ορθογραφία</span>', '<span class="section__label">Ορθογραφία</span>'),
    ],
    'glossa/paragogi-graptou/index.html': [
        ('<span class="section__label">📖 Παραγωγή Γραπτού Λόγου</span>', '<span class="section__label">Παραγωγή Γραπτού Λόγου</span>'),
    ],
    'glossa/katanoisi-graptou/index.html': [
        ('<span class="section__label">📚 Κατανόηση Γραπτού Λόγου</span>', '<span class="section__label">Κατανόηση Γραπτού Λόγου</span>'),
    ],
    'ekpaideftika-paixnidia/index.html': [
        ('<span class="section__label">🎮 Παιχνίδια</span>', '<span class="section__label">Παιχνίδια</span>'),
        ('<div class="grade-card__icon">🎈</div>', '<div class="grade-card__icon" style="color:white;font-weight:bold;">Α</div>'),
        ('<div class="grade-card__icon">🚀</div>', '<div class="grade-card__icon" style="color:white;font-weight:bold;">Β</div>'),
        ('<div class="grade-card__icon">🧠</div>', '<div class="grade-card__icon" style="color:white;font-weight:bold;">Γ</div>'),
        ('<div class="grade-card__icon">🎯</div>', '<div class="grade-card__icon" style="color:white;font-weight:bold;">Δ</div>'),
        ('<div class="grade-card__icon">🦋</div>', '<div class="grade-card__icon" style="color:white;font-weight:bold;">Ε</div>'),
        ('<div class="grade-card__icon">🏆</div>', '<div class="grade-card__icon" style="color:white;font-weight:bold;">ΣΤ</div>'),
    ],
    'ekpaideftika-paixnidia/a-dimotikou/index.html': [],  # already clean
    'ekpaideftika-paixnidia/b-dimotikou/index.html': [
        ('<span class="section__label">🚀 Β΄ Δημοτικού</span>', '<span class="section__label">Β΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/g-dimotikou/index.html': [
        ('<span class="section__label">🧠 Γ΄ Δημοτικού</span>', '<span class="section__label">Γ΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/a-dimotikou/glossa/index.html': [
        ('<span class="section__label">📖 Γλώσσα – Α΄ Δημοτικού</span>', '<span class="section__label">Γλώσσα – Α΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/b-dimotikou/glossa/index.html': [
        ('<span class="section__label">📖 Γλώσσα – Β΄ Δημοτικού</span>', '<span class="section__label">Γλώσσα – Β΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/g-dimotikou/glossa/index.html': [
        ('<span class="section__label">📖 Γλώσσα – Γ΄ Δημοτικού</span>', '<span class="section__label">Γλώσσα – Γ΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/d-dimotikou/glossa/index.html': [
        ('<span class="section__label">📖 Γλώσσα – Δ΄ Δημοτικού</span>', '<span class="section__label">Γλώσσα – Δ΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/e-dimotikou/glossa/index.html': [
        ('<span class="section__label">📖 Γλώσσα – Ε΄ Δημοτικού</span>', '<span class="section__label">Γλώσσα – Ε΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/st-dimotikou/glossa/index.html': [
        ('<span class="section__label">📖 Γλώσσα – ΣΤ΄ Δημοτικού</span>', '<span class="section__label">Γλώσσα – ΣΤ΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/a-dimotikou/glossa/orthografia/index.html': [
        ('<span class="section__label">✏️ Ορθογραφία – Α΄ Δημοτικού</span>', '<span class="section__label">Ορθογραφία – Α΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/b-dimotikou/glossa/orthografia/index.html': [
        ('<span class="section__label">✏️ Ορθογραφία – Β΄ Δημοτικού</span>', '<span class="section__label">Ορθογραφία – Β΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/a-dimotikou/mathimatika/index.html': [
        ('<span class="section__label">🔢 Μαθηματικά – Α΄ Δημοτικού</span>', '<span class="section__label">Μαθηματικά – Α΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/b-dimotikou/mathimatika/index.html': [
        ('<span class="section__label">🔢 Μαθηματικά – Β΄ Δημοτικού</span>', '<span class="section__label">Μαθηματικά – Β΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/g-dimotikou/mathimatika/index.html': [
        ('<span class="section__label">🔢 Μαθηματικά – Γ΄ Δημοτικού</span>', '<span class="section__label">Μαθηματικά – Γ΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/d-dimotikou/mathimatika/index.html': [
        ('<span class="section__label">🔢 Μαθηματικά – Δ΄ Δημοτικού</span>', '<span class="section__label">Μαθηματικά – Δ΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/e-dimotikou/mathimatika/index.html': [
        ('<span class="section__label">🔢 Μαθηματικά – Ε΄ Δημοτικού</span>', '<span class="section__label">Μαθηματικά – Ε΄ Δημοτικού</span>'),
    ],
    'ekpaideftika-paixnidia/st-dimotikou/mathimatika/index.html': [
        ('<span class="section__label">🔢 Μαθηματικά – ΣΤ΄ Δημοτικού</span>', '<span class="section__label">Μαθηματικά – ΣΤ΄ Δημοτικού</span>'),
    ],
}

updated = 0
for fpath, replacements in REPLACEMENTS.items():
    if not replacements:
        continue
    with open(fpath, encoding='utf-8') as f:
        html = f.read()
    changed = False
    for old, new in replacements:
        if old in html:
            html = html.replace(old, new)
            changed = True
        else:
            print(f'  WARN: not found in {fpath}: {old[:60]}')
    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Updated: {fpath}')
        updated += 1

print(f'\nTotal: {updated} files updated')
