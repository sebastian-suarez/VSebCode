// F05-spill.mjs — raster spill check: no emblem ink may fall outside the folder silhouette
// (closed body, or the open variant's front flap + back tab). Renders each icon and the bare
// canon base at 256px and compares alpha coverage pixel by pixel.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { chromium } from './F05-shot.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const ids = process.argv.slice(2);
const S = 256;
const load = (f) => readFileSync(join(OUT, f), 'utf8');
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');

const jobs = [];
for (const id of ids) {
	for (const [v, suffix] of [['closed', ''], ['open', '-open']]) {
		const icon = load(`${id}${suffix}.svg`);
		const base = load(`folder${suffix}.svg`);
		jobs.push({ label: `${id}${suffix}`, icon: b64(icon), base: b64(base) });
	}
}

const page = join(tmpdir(), `f05-spill-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset=utf-8><body><pre id=o>PENDING</pre><script>
const J = ${JSON.stringify(jobs)}, S = ${S};
const c = document.createElement('canvas'); c.width = c.height = S;
const g = c.getContext('2d', { willReadFrequently: true });
const draw = async (b64) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/svg+xml;base64,' + b64; });
  g.clearRect(0,0,S,S); g.drawImage(img,0,0,S,S);
  return g.getImageData(0,0,S,S).data;
};
(async () => {
  const out = [];
  for (const j of J) {
    const a = await draw(j.base), b = await draw(j.icon);
    let spill = 0, worst = 0;
    for (let i = 3; i < b.length; i += 4) {
      if (b[i] > 24 && a[i] < 8) { spill++; if (b[i] > worst) worst = b[i]; }
    }
    out.push(j.label + '\\t' + spill + '\\t' + worst);
  }
  document.getElementById('o').textContent = 'RESULT\\n' + out.join('\\n') + '\\nEND';
})();
</script>`);
const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox',
	'--allow-file-access-from-files', '--virtual-time-budget=20000', '--dump-dom', 'file://' + page],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 180000 });
const m = /RESULT\n([\s\S]*?)\nEND/.exec(dom.replace(/&#10;/g, '\n'));
if (!m) { console.error(dom.slice(0, 800)); throw new Error('no result'); }
let bad = 0;
for (const line of m[1].split('\n')) {
	const [label, spill, worst] = line.split('\t');
	if (+spill > 0) { bad++; console.log(`SPILL ${label}: ${spill}/${S * S} px outside the silhouette (max alpha ${worst})`); }
}
console.log(`${m[1].split('\n').length} variants checked at ${S}px, ${bad} with spill`);
