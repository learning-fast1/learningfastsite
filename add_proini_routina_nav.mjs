// Throwaway script: adds the new "Πρωινή Ρουτίνα" navbar dropdown entry
// (right after "Ταχεία Κατονομασία (RAN)", inside the existing Ειδική
// Εκπαίδευση dropdown) to every page's navbar. Run with
// `node add_proini_routina_nav.mjs`. Idempotent: skips any file that
// already mentions "Πρωινή Ρουτίνα".
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
let changed = 0, skippedNoMatch = 0, skippedAlready = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('Πρωινή Ρουτίνα')) { skippedAlready++; continue; }

  const re = /<li><a href="([^"]*)ran-onomasia\/index\.html">Ταχεία Κατονομασία \(RAN\)<\/a><\/li>/;
  const match = content.match(re);
  if (!match) { skippedNoMatch++; continue; }

  const prefix = match[1];
  const replacement = `${match[0]}\n            <li><a href="${prefix}proini-routina/index.html">Πρωινή Ρουτίνα</a></li>`;

  const updated = content.replace(re, replacement);
  fs.writeFileSync(file, updated, 'utf8');
  changed++;
}

console.log(`Updated ${changed} files. Skipped (already present): ${skippedAlready}. Skipped (no match): ${skippedNoMatch}. Total scanned: ${files.length}.`);
