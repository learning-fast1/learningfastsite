// Μετακινεί το «Learning Fast Workspace» από την navbar στο footer (τελευταίο link, απλό
// κείμενο όπως τα υπόλοιπα) ώστε να το βλέπουν όσο λιγότεροι γίνεται. Idempotent.
import fs from 'node:fs';
import path from 'node:path';

const NAV_LI = /[ \t]*<li class="navbar__workspace">[^\n]*<\/li>\r?\n?/g;
const FOOTER_LAST = /(<li><a href="((?:\.\.\/)*)oroi-xrisis\/index\.html">Όροι και προϋποθέσεις<\/a><\/li>)(\s*<\/ul>)/;

let removed = 0, added = 0, already = 0;
const footerNoMatch = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.html') || p.includes('workspace-access')) continue;
    let s = fs.readFileSync(p, 'utf8');
    const orig = s;
    if (NAV_LI.test(s)) { s = s.replace(NAV_LI, ''); removed++; }
    NAV_LI.lastIndex = 0;
    if (s.includes('footer__links')) {
      if (s.includes('workspace-access/index.html')) already++;
      else if (FOOTER_LAST.test(s)) {
        s = s.replace(FOOTER_LAST, (_, li, prefix, tail) =>
          `${li}\n      <li><a href="${prefix}workspace-access/index.html" target="_blank" rel="noopener">Learning Fast Workspace</a></li>${tail}`);
        added++;
      } else footerNoMatch.push(p);
    }
    if (s !== orig) fs.writeFileSync(p, s);
  }
})('.');
console.log({ removedFromNavbar: removed, addedToFooter: added, alreadyInFooter: already });
console.log('Footer present but NOT updated:', footerNoMatch);
