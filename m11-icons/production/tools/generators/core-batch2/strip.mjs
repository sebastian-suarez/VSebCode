// strip.mjs — the mixed explorer listing (batch 2 + batch 1) at tree-row scale.
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const ROWS = [
	['readme', 'README.md'], ['license', 'LICENSE'], ['markdown', 'CHANGELOG.md'],
	['editorconfig', '.editorconfig'], ['eslint', '.eslintrc.json'], ['prettier', '.prettierrc'],
	['tsconfig', 'tsconfig.json'], ['vite', 'vite.config.ts'], ['tailwind', 'tailwind.config.js'],
	['next', 'next.config.js'], ['json', 'package.json'], ['node', '.nvmrc'],
	['npm', '.npmrc'], ['lock', 'pnpm-lock.yaml'], ['dotenv', '.env'],
	['yaml', 'ci.yml'], ['docker', 'Dockerfile'], ['git', '.gitignore'], ['shell', 'build.sh'],
	['typescript', 'index.ts'], ['reactts', 'App.tsx'], ['js', 'app.js'], ['vue', 'App.vue'],
	['css', 'styles.css'], ['sass', 'main.scss'], ['html', 'index.html'], ['svg', 'logo.svg'],
	['image', 'hero.png'], ['font', 'Inter-Bold.ttf'], ['pdf', 'spec.pdf'], ['text', 'notes.txt'],
	['xml', 'pom.xml'], ['sql', 'schema.sql'], ['prisma', 'schema.prisma'],
	['python', 'manage.py'], ['go', 'main.go'], ['java', 'Main.java'], ['kotlin', 'Main.kt'],
	['c', 'parser.c'], ['cpp', 'engine.cpp'], ['csharp', 'Program.cs'], ['php', 'index.php'],
	['ruby', 'Gemfile'], ['rust', 'main.rs'], ['toml', 'Cargo.toml'], ['swift', 'App.swift'],
	['dartlang', 'main.dart']
];

const sym = new Map();
for (const [id] of ROWS) {
	if (sym.has(id)) { continue; }
	const src = readFileSync(join(ROOT, `${id}.svg`), 'utf8');
	sym.set(id, src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''));
}
const defs = `<svg width="0" height="0" style="position:absolute"><defs>${
	[...sym].map(([id, inner]) => `<symbol id="s-${id}" viewBox="0 0 16 16">${inner}</symbol>`).join('')
}</defs></svg>`;

const col = (from, to) => `<div class="t">${ROWS.slice(from, to).map(([id, label]) =>
	`<div class="r"><svg width="16" height="16"><use href="#s-${id}"/></svg><span>${label}</span></div>`).join('')}</div>`;

const html = `<style>
body{margin:0;background:#1E1E1E;font:13px -apple-system,system-ui,sans-serif}
.w{display:flex;gap:0;padding:10px}
.t{width:250px}
.r{display:flex;align-items:center;gap:8px;height:22px;padding:0 14px}
.r span{color:#CCC;white-space:nowrap}
</style>${defs}<div class="w">${col(0, 16)}${col(16, 32)}${col(32, 47)}</div>`;

const file = join(tmpdir(), 'm11-strip.html');
writeFileSync(file, html);
const cache = join(homedir(), 'Library/Caches/ms-playwright');
const build = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])[0];
const macos = join(cache, build, 'chrome-mac-arm64');
const app = readdirSync(macos).find(f => f.endsWith('.app'));
const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
const out = process.env.OUT || join(tmpdir(), 'm11-strip.png');
execFileSync(bin, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=4000', '--force-device-scale-factor=3',
	'--default-background-color=1e1e1eff', '--window-size=770,378', `--screenshot=${out}`, `file://${file}`],
	{ stdio: ['ignore', 'ignore', 'ignore'] });
rmSync(file, { force: true });
console.log(out);
