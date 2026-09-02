// A10 part 3 — madge … nyc
import { write, letters, circle, ellipse, rrect, rect, poly, plate, capsule, arcBand, badgeLetters, glyphLetters } from './a10-lib.mjs';

const out = [];
const emit = (id, inner) => out.push([id, write(id, inner)]);

// 36 madge — SILHOUETTE dependency fan
emit('madge',
	`<path fill="#6E93C9" d="${capsule(4.4, 7.6, 11.6, 4.5, .62)}${capsule(4.4, 8.4, 11.6, 11.5, .62)}` +
	`${circle(3.2, 8, 1.9)}${circle(12.8, 4.2, 1.9)}${circle(12.8, 11.8, 1.9)}"/>`);

// 37 mailing — SILHOUETTE envelope
emit('mailing',
	`<path fill="#C4644E" fill-rule="evenodd" d="${rrect(1.4, 3.2, 13.2, 9.6, 1.3)}` +
	`${poly([1.6, 3.9, 8, 9, 14.4, 3.9, 14.4, 5.5, 8, 10.6, 1.6, 5.5])}"/>`);

// 38 manifest — SILHOUETTE clipboard
emit('manifest',
	`<path fill="#A0968A" fill-rule="evenodd" d="${rrect(2.6, 2.6, 10.8, 11, 1.4)}${rrect(5.8, 1.4, 4.4, 2.6, .9)}` +
	`${rrect(6.7, 2, 2.6, 1.5, .55)}` +
	`${rect(5.2, 6, 5.6, 1)}${rect(5.2, 8, 5.6, 1)}${rect(5.2, 10, 5.6, 1)}"/>`);

// 39 markdoc-config — GLYPH {% (Markdoc tag syntax)
emit('markdoc-config', plate('#5FC0B0') + badgeLetters('Md', { width: 9.4, fill: '#12403A' }));

// 40 markdownlint — BADGE ML on a light plate (markdown band, value-separated)
emit('markdownlint', plate('#89B0C2') + badgeLetters('ML', { width: 9.4, fill: '#16333F' }));

// 41 markdownlint-ignore — BADGE MLi, the dim sibling (R3 family with markdownlint)
emit('markdownlint-ignore', plate('#5F7E8C') + badgeLetters('MLi', { width: 10.8, fill: '#FFFFFF', spacing: -0.02 }));

// 42 markuplint — GLYPH M between drawn chevrons (R1 geometry + §5 letter)
emit('markuplint',
	`<path fill="#40A866" d="${poly([4.4, 4.2, 4.4, 5.9, 2.6, 8, 4.4, 10.1, 4.4, 11.8, 1.2, 8])}` +
	`${poly([11.6, 4.2, 11.6, 5.9, 13.4, 8, 11.6, 10.1, 11.6, 11.8, 14.8, 8])}"/>` +
	letters({ text: 'M', cap: 6.6, cx: 8, cy: 8, fill: '#40A866' }));

// 43 mcp — SILHOUETTE plug (Model Context Protocol)
emit('mcp',
	`<path fill="#C4805E" d="${rect(5.6, 2.2, 1.7, 4.6)}${rect(8.7, 2.2, 1.7, 4.6)}` +
	`${rrect(3.4, 6.2, 9.2, 5.4, 1.3)}${capsule(8, 11.4, 8, 14.2, .8)}"/>`);

// 44 mdxlint — BADGE MDX, dimmed mdx plate (R3 family with core mdx)
emit('mdxlint', plate('#5A4E8C') + badgeLetters('MDX', { width: 11, fill: '#FFFFFF', spacing: -0.02 }));

// 45 mikro-orm — GLYPH two interlocking rings (object ↔ relational)
emit('mikro-orm',
	`<path fill="#5566CE" fill-rule="evenodd" d="${circle(5.3, 8, 3.6)}${circle(5.3, 8, 2.25, 0)}"/>` +
	`<path fill="#5566CE" fill-rule="evenodd" d="${circle(10.7, 8, 3.6)}${circle(10.7, 8, 2.25, 0)}"/>`);

// 46 minecraft-fabric — SILHOUETTE thread spool
emit('minecraft-fabric',
	`<path fill="#B99A6E" fill-rule="evenodd" d="${rrect(2.4, 2, 11.2, 2.4, .8)}${rrect(2.4, 11.6, 11.2, 2.4, .8)}` +
	`${rect(5.2, 4.4, 5.6, 7.2)}${rect(5.2, 6.5, 5.6, .9)}${rect(5.2, 8.6, 5.6, .9)}"/>`);

// 47 mise — SILHOUETTE chef's knife (mise en place)
emit('mise',
	`<path fill="#57A76E" d="M12.3 1.8C13.3 6.5 11 10.5 6.6 12.4L3.5 9.3Z` +
	`${capsule(4.9, 10.7, 2.2, 13.4, 1.15)}"/>`);

// 48 mondoo — SILHOUETTE scan frame (security scanning)
emit('mondoo',
	`<path fill="#6E5FD0" d="${rect(1.6, 1.6, 4.8, 1.5)}${rect(1.6, 1.6, 1.5, 4.8)}` +
	`${rect(9.6, 1.6, 4.8, 1.5)}${rect(12.9, 1.6, 1.5, 4.8)}` +
	`${rect(1.6, 12.9, 4.8, 1.5)}${rect(1.6, 9.6, 1.5, 4.8)}` +
	`${rect(9.6, 12.9, 4.8, 1.5)}${rect(12.9, 9.6, 1.5, 4.8)}` +
	`${rect(3.2, 7.25, 9.6, 1.5)}"/>`);

// 49 monotone — BADGE mtn (Monotone VCS), neutral lane
emit('monotone', plate('#6E6E72') + badgeLetters('mtn', { width: 10.8, fill: '#FFFFFF', band: 'x' }));

// 50 moon — SILHOUETTE crescent (moonrepo)
emit('moon',
	`<path fill="#A79BE8" fill-rule="evenodd" d="${circle(8, 8, 6.3)}${circle(10.5, 6.3, 5.3, 0)}"/>`);

// 51 motif — SILHOUETTE nested diamonds
emit('motif',
	`<path fill="#A88AC4" fill-rule="evenodd" d="${poly([8, 1.4, 14.6, 8, 8, 14.6, 1.4, 8])}` +
	`${poly([8, 4.6, 11.4, 8, 8, 11.4, 4.6, 8])}"/>` +
	`<path fill="#A88AC4" d="${poly([8, 6.3, 9.7, 8, 8, 9.7, 6.3, 8])}"/>`);

// 52 mypy — SILHOUETTE comb (python blue)
emit('mypy',
	`<path fill="#3F7EAE" d="${rrect(1.6, 3, 12.8, 3.1, .8)}` +
	`${rect(2.6, 6.1, 1.6, 6.5)}${rect(5, 6.1, 1.6, 6.5)}${rect(7.4, 6.1, 1.6, 6.5)}` +
	`${rect(9.8, 6.1, 1.6, 6.5)}${rect(12.2, 6.1, 1.6, 6.5)}"/>`);

// 53 ndst — BADGE ND
emit('ndst', plate('#94CDD1') + badgeLetters('ND', { width: 9.4, fill: '#123B3E' }));

// 54 ngrx-entity — BADGE Ng (NgRx entity state)
emit('ngrx-entity', plate('#B598D8') + badgeLetters('Ng', { width: 9.4, fill: '#33255C' }));

// 55 nodemon — BADGE nm on the node green (node-family rhyme, R3)
emit('nodemon', plate('#5FA04E') + badgeLetters('nm', { width: 9.6, fill: '#FFFFFF', band: 'x' }));

// 56 npmpackagejsonlint — BADGE PJL
emit('npmpackagejsonlint', plate('#7A2A3E') + badgeLetters('PJL', { width: 11, fill: '#FFFFFF', spacing: -0.02 }));

// 57 nsri — GLYPH hash (node subresource integrity)
emit('nsri', glyphLetters('#', { width: 10.2, fill: '#469E38' }));

// 58 nsri-integrity — SILHOUETTE integrity manifest page (R3 family with nsri)
emit('nsri-integrity',
	`<path fill="#469E38" fill-rule="evenodd" d="M4.1 1.6h5.3l3.5 3.5v8.1a1.2 1.2 0 0 1-1.2 1.2H4.1` +
	`a1.2 1.2 0 0 1-1.2-1.2V2.8a1.2 1.2 0 0 1 1.2-1.2Z` +
	`${glyphLetters('#', { width: 6, cy: 9, fill: '' }).replace(/^<path[^>]*d="/, '').replace(/"\/>$/, '')}"/>`);

// 59 nuget — SILHOUETTE package cube
emit('nuget',
	`<path fill="#3E6EA8" fill-rule="evenodd" d="${poly([8, 1.8, 14.2, 5.4, 14.2, 10.6, 8, 14.2, 1.8, 10.6, 1.8, 5.4])}` +
	`${capsule(8, 8.9, 8, 14.2, .38)}${capsule(8, 8.9, 1.8, 5.4, .38)}${capsule(8, 8.9, 14.2, 5.4, .38)}"/>`);

// 60 nyc — SILHOUETTE umbrella (code coverage / Istanbul)
emit('nyc',
	`<path fill="#C74A4A" d="M1.4 9A6.6 6.6 0 0 1 14.6 9Q12.95 7.7 11.3 9Q9.65 7.7 8 9Q6.35 7.7 4.7 9Q3.05 7.7 1.4 9Z` +
	`${rect(7.4, 9, 1.3, 3.5)}${arcBand(6.85, 12.4, .55, 1.85, 0, 180)}"/>`);

for (const [id, bytes] of out) { console.log(String(bytes).padStart(5), id); }
