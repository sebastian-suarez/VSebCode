// probe.mjs — dense 64/32/16 grid of the batch-2 icons, for eyeballing during authoring.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const IDS = process.argv.slice(2).length ? process.argv.slice(2) : [
	'font', 'pdf', 'xml', 'python', 'go', 'swift', 'c', 'cpp', 'java', 'vue', 'license', 'readme',
	'editorconfig', 'eslint', 'prettier', 'tsconfig', 'vite', 'tailwind', 'text', 'csharp',
	'php', 'ruby', 'kotlin', 'dartlang'];

const cells = IDS.map(id => {
	const src = readFileSync(join(ROOT, 'svg/file', `${id}.svg`), 'utf8');
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	const s = (n) => `<svg width="${n}" height="${n}" viewBox="0 0 16 16">${inner}</svg>`;
	return `<div class="c"><div class="big">${s(72)}</div><div class="sm">${s(32)}${s(22)}${s(16)}</div><div class="n">${id}</div></div>`;
}).join('');

const html = `<style>
body{margin:0;background:#121314;color:#8A9092;font:11px ui-monospace,Menlo,monospace}
.g{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:12px}
.c{background:#191A1B;border:1px solid #2A2D2E;border-radius:6px;padding:8px 4px;text-align:center}
.big{height:76px;display:flex;align-items:center;justify-content:center}
.sm{display:flex;align-items:flex-end;justify-content:center;gap:8px;height:36px}
.n{margin-top:6px}
</style><div class="g">${cells}</div>`;

const file = join(tmpdir(), 'm11-probe2.html');
writeFileSync(file, html);

const cache = join(homedir(), 'Library/Caches/ms-playwright');
const build = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
	.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])[0];
const macos = join(cache, build, 'chrome-mac-arm64');
const app = readdirSync(macos).find(f => f.endsWith('.app'));
const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));

const out = process.env.PROBE_OUT || join(tmpdir(), 'm11-probe2.png');
const rows = Math.ceil(IDS.length / 6);
execFileSync(bin, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=4000',
	'--force-device-scale-factor=2', '--default-background-color=121314ff',
	`--window-size=1100,${rows * 152 + 30}`, `--screenshot=${out}`, `file://${file}`],
	{ stdio: ['ignore', 'ignore', 'ignore'] });
rmSync(file, { force: true });
console.log(out, existsSync(out));
