// F01-spill.mjs — does any emblem paint outside the folder silhouette?
// Rasterises base-only and base+emblem at 128x128 in the Playwright chromium and
// compares alpha masks: any pixel with alpha in the full icon but not in the base
// is ink outside the silhouette (or off the open flap).
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const FOLDER = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const S = 128;
const files = process.argv.slice(2);
const base = { closed: readFileSync(join(FOLDER, 'folder.svg'), 'utf8'), open: readFileSync(join(FOLDER, 'folder-open.svg'), 'utf8') };

const entries = [];
for (const f of files) {
	const id = basename(f, '.svg');
	entries.push({ label: id, src: readFileSync(join(FOLDER, f), 'utf8') });
	entries.push({ label: `${id}::base`, src: id.endsWith('-open') ? base.open : base.closed });
}

function chromium() {
	const c = join(homedir(), 'Library/Caches/ms-playwright');
	for (const b of readdirSync(c).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
		const m = join(c, b, 'chrome-mac-arm64');
		for (const app of readdirSync(m).filter(x => x.endsWith('.app'))) {
			const bin = join(m, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error('no chromium');
}

const payload = entries.map(e => ({ label: e.label, uri: 'data:image/svg+xml;base64,' + Buffer.from(e.src, 'utf8').toString('base64') }));
const page = join(tmpdir(), `F01-spill-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><pre id="o">P</pre><script>
const I=${JSON.stringify(payload)},S=${S};
const c=document.createElement('canvas');c.width=S;c.height=S;
const g=c.getContext('2d',{willReadFrequently:true});
(async()=>{const out={};
for(const it of I){const im=new Image();
 await new Promise((r,j)=>{im.onload=r;im.onerror=()=>j(new Error(it.label));im.src=it.uri;});
 g.clearRect(0,0,S,S);g.drawImage(im,0,0,S,S);
 const d=g.getImageData(0,0,S,S).data;const a=[];for(let i=3;i<d.length;i+=4)a.push(d[i]);
 out[it.label]=a;}
document.getElementById('o').textContent='R='+JSON.stringify(out);})().catch(e=>{document.getElementById('o').textContent='E='+e.message;});
</script>`);
const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=20000', '--window-size=400,300', '--dump-dom', `file://${page}`],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 });
rmSync(page, { force: true });
const m = /<pre id="o">([\s\S]*?)<\/pre>/.exec(dom);
if (!m[1].startsWith('R=')) { throw new Error(m[1].slice(0, 200)); }
const raw = JSON.parse(m[1].slice(2));

let bad = 0;
for (const f of files) {
	const id = basename(f, '.svg');
	const icon = raw[id], b = raw[`${id}::base`];
	let spill = 0, worst = 0;
	for (let i = 0; i < icon.length; i++) {
		// alpha present in the icon but not in the base = ink outside the silhouette
		const d = icon[i] - b[i];
		if (d > 8) { spill++; worst = Math.max(worst, d); }
	}
	const px = (spill / (S * S) * 256).toFixed(2);   // equivalent 16x16 px
	if (spill) { bad++; console.log(`SPILL ${id}: ${spill}/${S * S} subpixels (${px} px at 16), worst alpha +${worst}`); }
	else { console.log(`clean  ${id}`); }
}
console.log(`\n${files.length} checked, ${bad} with ink outside the silhouette`);
process.exit(bad ? 1 : 0);
