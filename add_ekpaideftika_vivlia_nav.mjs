import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const EXCLUDE_DIR = path.join(root, 'ekpaideftika-paixnidia', 'a-dimotikou', 'mathimatika', 'diairesi');
const SKIP_FILES = new Set([
  path.join(root, 'ekpaideftika-vivlia', 'index.html'),
  path.join(root, 'ekpaideftika-vivlia', 'atzenta', 'index.html'),
]);

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (full.startsWith(EXCLUDE_DIR)) continue;
    if (entry.isDirectory()) {
      if (entry.name === '.git') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(root, []);
let changed = 0, skippedNoMatch = 0;

for (const file of files) {
  if (SKIP_FILES.has(file)) continue;
  const content = fs.readFileSync(file, 'utf8');

  const re = /<li><a href="([^"]*)epikoinonia\/index\.html">Επικοινωνία<\/a><\/li>/;
  const match = content.match(re);
  if (!match) { skippedNoMatch++; continue; }

  const prefix = match[1];
  const replacement =
`<li class="has-dropdown"><a href="${prefix}ekpaideftika-vivlia/index.html">Εκπαιδευτικά Βιβλία</a>
          <ul class="dropdown">
            <li><a href="${prefix}ekpaideftika-vivlia/atzenta/index.html">Ατζέντα</a></li>
          </ul>
        </li>
        <li><a href="${prefix}epikoinonia/index.html">Επικοινωνία</a></li>`;

  // Only the FIRST occurrence (navbar) — .replace without /g replaces just that one.
  const updated = content.replace(re, replacement);
  fs.writeFileSync(file, updated, 'utf8');
  changed++;
}

console.log(`Updated ${changed} files. Skipped (no match): ${skippedNoMatch}. Total scanned: ${files.length}.`);
