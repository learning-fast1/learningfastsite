# Throwaway script: adds the new "Εκπαιδευτικά Βιβλία" navbar dropdown
# (with its "Ατζέντα" subcategory) to every page's navbar, right before
# "Επικοινωνία". Run with `node add_ekpaideftika_vivlia_nav.mjs` (Node
# port of this, since python3 isn't available in this environment) or
# adapt to python3 elsewhere. Kept as .py to match repo convention.
#
# Logic: for each *.html file, find the navbar's
# `<li><a href="{prefix}epikoinonia/index.html">Επικοινωνία</a></li>`
# (the FIRST occurrence in the file — the footer has an identical one
# later, which must NOT be touched) and insert the new dropdown <li>
# right before it, reusing the same {prefix} so relative paths are
# automatically correct at any folder depth.
