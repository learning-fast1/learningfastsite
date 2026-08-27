import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const EXCLUDE_DIR = path.join(root, 'ekpaideftika-paixnidia', 'a-dimotikou', 'mathimatika', 'diairesi');

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
let changed = 0, alreadyPresent = 0, skippedNoMatch = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  if (content.includes('tetradio-epikoinonias/index.html')) { alreadyPresent++; continue; }

  const re = /<li><a href="([^"]*)ekpaideftika-vivlia\/atzenta\/index\.html">Ατζέντα<\/a><\/li>/;
  const match = content.match(re);
  if (!match) { skippedNoMatch++; continue; }

  const prefix = match[1];
  const replacement =
`${match[0]}
            <li><a href="${prefix}ekpaideftika-vivlia/tetradio-epikoinonias/index.html">Τετράδιο Επικοινωνίας</a></li>`;

  const updated = content.replace(re, replacement);
  fs.writeFileSync(file, updated, 'utf8');
  changed++;
}

console.log(`Updated ${changed} files. Already present: ${alreadyPresent}. Skipped (no match): ${skippedNoMatch}. Total scanned: ${files.length}.`);
