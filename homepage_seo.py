import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', encoding='utf-8') as f:
    html = f.read()

# 1. Update title
html = html.replace(
    '<title>Εκπαιδευτικά Βιβλία, Σημειώσεις & Σχολικά Βοηθήματα | Learning Fast</title>',
    '<title>Εκπαιδευτικά Παιχνίδια & Υλικό για Δημοτικό | Learning Fast</title>'
)

# 2. Update meta description
html = html.replace(
    'content="Βιβλία, σημειώσεις εξετάσεων και εκπαιδευτικό υλικό για μαθητές, γονείς και εκπαιδευτικούς. Εκπαιδευτικά παιχνίδια για όλες τις τάξεις δημοτικού."',
    'content="Δωρεάν εκπαιδευτικά παιχνίδια για διαδραστικό πίνακα και υπολογιστή. Εκπαιδευτικό υλικό για Α΄ έως ΣΤ΄ Δημοτικού: γραμματική, ορθογραφία ασκήσεις, μαθηματικά. Υλικό για εκπαιδευτικούς και γονείς."'
)

# 3. Update hero subtitle
html = html.replace(
    'Βιβλία, παιχνίδια και υλικό για κάθε τάξη —\n        σχεδιασμένα να κάνουν τη μάθηση διασκεδαστική και αποτελεσματική.',
    'Δωρεάν <strong>εκπαιδευτικά παιχνίδια</strong> και <strong>εκπαιδευτικό υλικό</strong> για κάθε τάξη δημοτικού —\n        κατάλληλα για εκπαιδευτικούς, γονείς και μαθητές.'
)

# 4. Add <style> block before </head>
NEW_CSS = """  <style>
    .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.5rem; max-width:1000px; margin:2rem auto 0; }
    .feature-card { background:var(--surface); border-radius:var(--radius); padding:1.8rem 1.5rem; box-shadow:var(--shadow); }
    .feature-card__icon { font-size:2rem; margin-bottom:.8rem; display:block; }
    .feature-card h3 { font-size:1.05rem; font-weight:800; color:var(--text); margin-bottom:.5rem; }
    .feature-card p { font-size:.9rem; color:var(--muted); line-height:1.6; margin:0; }
    .homepage-faq { max-width:720px; margin:4rem auto 2rem; }
    .homepage-faq .faq__title { font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:1.5rem; text-align:center; }
    .homepage-faq .faq__item { background:var(--surface); border-radius:var(--radius); padding:1.4rem 1.8rem; margin-bottom:1rem; box-shadow:var(--shadow); }
    .homepage-faq .faq__q { font-weight:700; color:var(--text); margin-bottom:.5rem; font-size:1rem; }
    .homepage-faq .faq__a { color:var(--muted); font-size:.95rem; line-height:1.6; margin:0; }
  </style>
</head>"""
html = html.replace('</head>', NEW_CSS)

# 5. Add "Τι Προσφέρουμε" + FAQ section before </main>
NEW_SECTIONS = """
    <!-- ===== WHAT WE OFFER ===== -->
    <section>
      <div class="section__header">
        <span class="section__label">🎓 Τι Προσφέρουμε</span>
        <h2 class="section__title">Εκπαιδευτικό Υλικό για Κάθε Τάξη</h2>
        <p class="section__subtitle">Δωρεάν παιχνίδια, ασκήσεις και υλικό για Α΄ έως ΣΤ΄ Δημοτικού</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-card__icon">🖥️</span>
          <h3>Παιχνίδια Διαδραστικού Πίνακα</h3>
          <p>Εκπαιδευτικά παιχνίδια κατάλληλα για διαδραστικό πίνακα — ιδανικά για χρήση στην τάξη χωρίς εγκατάσταση.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">📝</span>
          <h3>Γραμματική & Ορθογραφία</h3>
          <p>Ουσιαστικά, επίθετα, ρήματα, άρθρα, χρόνοι ρημάτων. Ορθογραφία ασκήσεις και εκπαιδευτικές ασκήσεις για κάθε ενότητα.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">🔢</span>
          <h3>Μαθηματικά</h3>
          <p>Μαθηματικά προβλήματα, πράξεις και εξάσκηση στην προπαίδεια. Πολλαπλασιασμοί για όλες τις τάξεις δημοτικού.</p>
        </div>
        <div class="feature-card">
          <span class="feature-card__icon">📚</span>
          <h3>Υλικό για Εκπαιδευτικούς</h3>
          <p>Υλικό για Α΄, Β΄, Γ΄, Δ΄, Ε΄ και ΣΤ΄ Δημοτικού έτοιμο για χρήση στην τάξη ή στο σπίτι.</p>
        </div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <div class="homepage-faq">
      <h2 class="faq__title">Συχνές ερωτήσεις</h2>
      <div class="faq__item">
        <p class="faq__q">Λειτουργούν τα παιχνίδια σε διαδραστικό πίνακα;</p>
        <p class="faq__a">Ναι! Όλα τα εκπαιδευτικά παιχνίδια του Learning Fast λειτουργούν σε διαδραστικούς πίνακες και είναι ιδανικά για χρήση στην τάξη — απευθείας από τον browser, χωρίς εγκατάσταση.</p>
      </div>
      <div class="faq__item">
        <p class="faq__q">Σε ποιες τάξεις απευθύνεται το υλικό;</p>
        <p class="faq__a">Καλύπτουμε Α΄ έως ΣΤ΄ Δημοτικού και Γυμνάσιο με παιχνίδια, ασκήσεις και εκπαιδευτικό υλικό για γλώσσα και μαθηματικά.</p>
      </div>
      <div class="faq__item">
        <p class="faq__q">Τι θέματα γλώσσας καλύπτει το Learning Fast;</p>
        <p class="faq__a">Γραμματική (ουσιαστικά, επίθετα, ρήματα, άρθρα, χρόνοι ρημάτων), ορθογραφία ασκήσεις, τελικό -ν, παραγωγή και κατανόηση γραπτού λόγου.</p>
      </div>
      <div class="faq__item">
        <p class="faq__q">Το εκπαιδευτικό υλικό είναι δωρεάν;</p>
        <p class="faq__a">Ναι, όλα τα παιχνίδια και το εκπαιδευτικό υλικό είναι εντελώς δωρεάν — χωρίς εγγραφή και χωρίς χρέωση.</p>
      </div>
    </div>

  </main>"""

html = html.replace('\n  </main>', NEW_SECTIONS)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated: index.html')
