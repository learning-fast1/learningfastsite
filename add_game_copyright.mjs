// Προσθέτει «© 2026 Learning Fast...» κάτω στο κέντρο της ΑΡΧΙΚΗΣ οθόνης
// κάθε παιχνιδιού. Μπαίνει ως πρώτο παιδί του στοιχείου της αρχικής οθόνης
// με position:fixed -- όταν το παιχνίδι κρύβει την αρχική οθόνη, κρύβεται
// μαζί της και το κείμενο, οπότε δεν εμφανίζεται πάνω στο παιχνίδι.
// Idempotent: παραλείπει αρχεία που το έχουν ήδη.
// (RAN και Φωνολογική Επίγνωση φτιάχνουν την αρχική τους με JS -- εκεί
// προστέθηκε απευθείας στον κώδικά τους.)
import { readFileSync, writeFileSync } from 'node:fs';

const TEXT = '© 2026 Learning Fast. Όλα τα δικαιώματα διατηρούνται.';
const STYLE =
  'position:fixed;left:50%;bottom:10px;transform:translateX(-50%);max-width:calc(100% - 24px);margin:0;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.85);color:#444;font:13px/1.4 system-ui,-apple-system,&quot;Segoe UI&quot;,sans-serif;text-align:center;z-index:9999;pointer-events:none;';
const SNIPPET = `<p class="lf-copyright" style="${STYLE}">${TEXT}</p>`;

// αρχείο -> id του στοιχείου της αρχικής οθόνης
const GAMES = {
  'eidiki-ekpaideysi/leitourgikos-logos/ta-zoakia/paixnidi/index.html': 'home-screen',
  'ekpaideftika-paixnidia/a-dimotikou/glossa/orthografia/orthografia-game/paixnidi/index.html': 'start-screen',
  'ekpaideftika-paixnidia/a-dimotikou/mathimatika/mathimatikespraxis/paixnidi/index.html': 'operation-selection-screen',
  'ekpaideftika-paixnidia/a-dimotikou/mathimatika/pollaplasiasmoiAdimotikou/paixnidi/index.html': 'menu-screen',
  'ekpaideftika-paixnidia/b-dimotikou/mathimatika/diairesi/paixnidi/index.html': 'screen-home',
  'ekpaideftika-paixnidia/d-dimotikou/mathimatika/diairesi/paixnidi/index.html': 'screen-home',
  'ekpaideftika-paixnidia/g-dimotikou/mathimatika/diairesi/paixnidi/index.html': 'screen-home',
  'ekpaideftika-paixnidia/d-dimotikou/glossa/orthografiamegalwn/paixnidi/index.html': 'screen-menu',
  'ekpaideftika-paixnidia/d-dimotikou/glossa/telikon/paixnidi/index.html': 'welcomeScreen',
  'ekpaideftika-paixnidia/e-dimotikou/mathimatika/klasmata/paixnidi/index.html': 'screen-main-menu',
  'ekpaideftika-paixnidia/g-dimotikou/mathimatika/pollaplasiasmoi/paixnidi/index.html': 'map-screen',
};

let changed = 0;
for (const [file, id] of Object.entries(GAMES)) {
  const html = readFileSync(file, 'utf8');
  if (html.includes('lf-copyright')) {
    console.log(`skip (already there): ${file}`);
    continue;
  }
  const openTag = new RegExp(`<[a-zA-Z]+\\b[^>]*\\bid="${id}"[^>]*>`);
  const match = html.match(openTag);
  if (!match) {
    console.error(`NOT FOUND #${id} in ${file}`);
    process.exitCode = 1;
    continue;
  }
  const at = match.index + match[0].length;
  writeFileSync(file, html.slice(0, at) + '\n        ' + SNIPPET + html.slice(at));
  changed++;
  console.log(`added: ${file} (#${id})`);
}
console.log(`${changed} file(s) changed`);
