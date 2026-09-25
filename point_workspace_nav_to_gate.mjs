// Το κουμπί «Learning Fast Workspace» της navbar δείχνει πλέον στη σελίδα κωδικού
// (workspace-access/), όχι απευθείας στην εφαρμογή. Σχετικό prefix ανά βάθος φακέλου. Idempotent.
import fs from 'node:fs';
import path from 'node:path';
const OLD = 'href="https://learning-fast1.github.io/workspace/" class="nav-workspace"';
let n = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) {
      const s = fs.readFileSync(p, 'utf8');
      if (!s.includes(OLD)) continue;
      const depth = path.relative('.', path.dirname(p)).split(path.sep).filter(Boolean).length;
      const prefix = '../'.repeat(depth);
      fs.writeFileSync(p, s.replace(OLD, `href="${prefix}workspace-access/index.html" class="nav-workspace"`));
      n++;
    }
  }
})('.');
console.log('updated', n);
