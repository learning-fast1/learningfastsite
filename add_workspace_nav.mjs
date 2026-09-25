// Προσθέτει το κουμπί «Learning Fast Workspace» στο τέλος της navbar (μετά την Επικοινωνία)
// σε όλες τις σελίδες. Αγγίζει ΜΟΝΟ την navbar (το <li> της Επικοινωνίας που ακολουθείται
// από </ul></nav>), όχι το footer. Idempotent.
import fs from 'node:fs';
import path from 'node:path';

const MARK = 'nav-workspace';
const RE = /(<li><a href="(?:\.\.\/)*epikoinonia\/index\.html"(?: class="active")?>Επικοινωνία<\/a><\/li>)(\s*<\/ul>\s*<\/nav>)/g;
const LI = '\n        <li class="navbar__workspace"><a href="https://learning-fast1.github.io/workspace/" class="nav-workspace" target="_blank" rel="noopener"><span class="nav-workspace__brand">Learning Fast </span>Workspace</a></li>';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

let changed = 0, skipped = 0;
const navNoMatch = [];
for (const f of walk('.')) {
  const src = fs.readFileSync(f, 'utf8');
  if (src.includes(MARK)) { skipped++; continue; }
  if (!src.includes('navbar__links')) continue;
  let n = 0;
  const out = src.replace(RE, (_, li, tail) => { n++; return li + LI + tail; });
  if (n === 1) { fs.writeFileSync(f, out); changed++; }
  else navNoMatch.push(`${f} (matches=${n})`);
}
console.log({ changed, skipped });
console.log('Has navbar but NOT updated:', navNoMatch);
