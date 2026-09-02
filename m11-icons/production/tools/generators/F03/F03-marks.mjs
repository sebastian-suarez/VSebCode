// F03-marks.mjs — the 45 folder emblems of slice F03, authored in the 0-10 R9a field.
//
// Every entry: { id, label, fill, source, emblem, draw(c) } or { …, letter } for the
// six typographic marks. Fills obey the R9 tone law — always darker than the tan
// #BF9354; a brand hue only where the concept earns one, darkened to sit under the plate.

const rev = (a) => a.slice().reverse();
const NEUTRAL = '#4E545B';

export const MARKS = [

// ---- F ---------------------------------------------------------------------

{
	id: 'firestore', label: 'Firestore', fill: '#8A6018',
	source: 'file/firestore.svg #E0A23C → darkened (tone law)',
	emblem: 'Firebase flame (file/firestore.svg’s 3-layer stack reads as plain bars at 8.20)',
	reused: 'file/firebase.svg',
	draw: (c) => c.path(`M 5.3 0 C 7.18 2.26 8.76 4.06 8.76 6.09
		C 8.76 8.27 7.03 10 5 10 C 2.97 10 1.24 8.27 1.24 6.09
		C 1.24 4.51 1.99 3.08 3.12 2.18 C 3.08 3.84 3.5 4.81 4.25 5.34
		C 5.23 4.29 5.6 2.26 5.3 0 Z`)
},
{
	id: 'flow', label: 'Flow', fill: NEUTRAL,
	source: 'no brand hue earned → neutral',
	emblem: 'bent flow arrow (file/flow.svg, redrawn to the R9a floors)',
	reused: 'file/flow.svg',
	draw: (c) => c.rect(0.4, 5.4, 2.2, 4.2) + c.rect(0.4, 3.4, 5.8, 2.2)
		+ c.poly([[5.6, 0.6], [9.8, 4.5], [5.6, 8.4]])
},
{
	id: 'flutter', label: 'Flutter', fill: '#12507F',
	source: 'brand #02569B → deepened (tone law)',
	emblem: 'Flutter blade + folded chevron (file/flutter.svg)',
	reused: 'file/flutter.svg',
	draw: (c) => c.poly([[9.46, 0], [6.49, 0], [0.29, 6.2], [3.26, 6.2]])
		+ c.poly([[9.46, 4.71], [6.82, 7.36], [9.46, 10], [4.5, 10], [1.86, 7.36], [4.5, 4.71]])
},
{
	id: 'forgejo', label: 'Forgejo', fill: NEUTRAL,
	source: 'no brand hue earned (git red is taken by the core git folder) → neutral',
	emblem: 'anvil (the forge)',
	draw: (c) => c.poly([[0.2, 2.4], [2, 1.6], [9.6, 1.6], [9.6, 3.6], [6.4, 3.6], [6.4, 6.2],
		[9, 6.2], [9, 8.6], [1, 8.6], [1, 6.2], [3.6, 6.2], [3.6, 3.6], [1.6, 3.6]])
},
{
	id: 'form', label: 'Form', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'clipboard with a filled field and a short button',
	draw: (c) => c.rrect(0.9, 1.5, 8.2, 7.9, 1.2) + c.rrect(3.2, 0.4, 3.6, 2.1, 0.7)
		+ c.rrect(2.4, 4, 5.2, 1.4, 0.3, 0) + c.rrect(2.4, 6.7, 3.2, 1.4, 0.3, 0)
},
{
	id: 'frontcommerce', label: 'Frontcommerce', fill: NEUTRAL,
	source: 'no brand hue in the inventory → neutral',
	emblem: 'shopping cart',
	draw: (c) => c.poly([[0.2, 0.6], [2.9, 0.6], [2.9, 2.2], [1.8, 2.2], [1.8, 6.7], [0.2, 6.7]])
		+ c.poly([[2.2, 2.6], [9.8, 2.6], [8.6, 6.7], [3.4, 6.7]])
		+ c.circle(3.5, 8.5, 1.1) + c.circle(8, 8.5, 1.1)
},
{
	id: 'functions', label: 'Functions', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'λ (lambda)',
	letter: { text: 'λ', inkH: 9.2 }
},
{
	id: 'gamemaker', label: 'GameMaker', fill: NEUTRAL,
	source: 'no brand hue in the inventory → neutral',
	emblem: 'gamepad (grips, d-pad counter, button counter)',
	draw: (c) => c.rrect(0.2, 1.8, 9.6, 5, 2) + c.rrect(0.4, 5.6, 2.9, 3.8, 1.4)
		+ c.rrect(6.7, 5.6, 2.9, 3.8, 1.4)
		+ c.poly(rev([[1.95, 2.7], [3.45, 2.7], [3.45, 3.45], [4.2, 3.45], [4.2, 4.95],
			[3.45, 4.95], [3.45, 5.7], [1.95, 5.7], [1.95, 4.95], [1.2, 4.95], [1.2, 3.45], [1.95, 3.45]]))
		+ c.circle(7.4, 4.2, 1.3, 0)
},
{
	id: 'gcp', label: 'Google Cloud', fill: '#1F63A8',
	source: 'brand Google blue #1A73E8 → darkened (tone law)',
	emblem: 'hollow cloud',
	draw: (c) => c.rrect(0.3, 4, 9.4, 5.6, 2.8) + c.circle(4.2, 3.2, 3.2)
		+ c.rrect(2.2, 5.7, 5.6, 2.4, 1.2, 0) + c.circle(4.2, 4.8, 1.6, 0)
},
{
	id: 'gemini', label: 'Gemini', fill: '#4A4A9E',
	source: 'brand Gemini blue-violet → darkened (tone law)',
	emblem: 'four-point spark',
	draw: (c) => c.path(`M 5 .2 Q 5.7 4.3 9.8 5 Q 5.7 5.7 5 9.8 Q 4.3 5.7 .2 5 Q 4.3 4.3 5 .2 Z`)
},
{
	id: 'gemini-ai', label: 'Gemini AI', fill: '#4A4A9E',
	source: 'brand Gemini blue-violet → darkened (R3 family with gemini)',
	emblem: 'four-point spark + small spark',
	draw: (c) => c.path(`M 5.9 2.1 Q 6.45 5.45 9.8 6 Q 6.45 6.55 5.9 9.9 Q 5.35 6.55 2 6 Q 5.35 5.45 5.9 2.1 Z`)
		+ c.path(`M 2.1 .2 Q 2.4 1.8 4 2.1 Q 2.4 2.4 2.1 4 Q 1.8 2.4 .2 2.1 Q 1.8 1.8 2.1 .2 Z`)
},
{
	id: 'generator', label: 'Generators', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'regeneration arrow (open ring + head)',
	draw: (c) => c.arcBand(5, 5.2, 4.2, 2.2, 100, 60)
		+ c.poly([[4.79, 4.02], [4.1, 0.08], [2.86, 2.82]])
},
{
	id: 'gh-workflows', label: 'GitHub Workflows', fill: '#2F6FB0',
	source: 'brand Actions blue #4E93D6 → darkened (tone law); mark from file/github-actions-workflow.svg',
	emblem: 'Actions ring + play head',
	reused: 'file/github-actions-workflow.svg',
	draw: (c) => c.arcBand(5, 5, 4.6, 2.6, 102, 28) + c.poly([[9.95, 1.9], [8.92, 5.69], [6.8, 3.88]])
},
{
	id: 'gitea', label: 'Gitea', fill: '#4A7A1E',
	source: 'brand #609926 → darkened (tone law)',
	emblem: 'tea mug (the Gitea cup)',
	draw: (c) => c.rrect(0.5, 1.6, 6.4, 7.8, 1.1) + c.rrect(6.5, 3.4, 3.1, 3.6, 1.5)
		+ c.poly(rev([[1.6, 3], [5.8, 3], [5.8, 4.3], [1.6, 4.3]]))
},
{
	id: 'gitea-workflows', label: 'Gitea Workflows', fill: '#4A7A1E',
	source: 'brand Gitea #609926 → darkened (R3 family with gh-workflows: same mark, own hue)',
	emblem: 'Actions ring + play head',
	reused: 'file/github-actions-workflow.svg',
	draw: (c) => c.arcBand(5, 5, 4.6, 2.6, 102, 28) + c.poly([[9.95, 1.9], [8.92, 5.69], [6.8, 3.88]])
},
{
	id: 'global', label: 'Global', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'wireframe globe (ring + equator + meridian)',
	draw: (c) => c.circle(5, 5, 4.8) + c.circle(5, 5, 2.8, 0)
		+ c.rect(0.2, 4.1, 9.6, 1.8) + c.rect(4.15, 0.2, 1.7, 9.6)
},
{
	id: 'godot', label: 'Godot', fill: '#2E7EA8',
	source: 'brand #478CBF → darkened (tone law)',
	emblem: 'Godot robot head',
	draw: (c) => c.rrect(0.7, 1.2, 8.6, 6.2, 1.6)
		+ c.poly([[1.6, 7.2], [3.4, 7.2], [2.5, 9.3]]) + c.poly([[6.6, 7.2], [8.4, 7.2], [7.5, 9.3]])
		+ c.circle(3.1, 4.2, 1.2, 0) + c.circle(6.9, 4.2, 1.2, 0)
},
{
	id: 'grok', label: 'Grok', fill: '#2F3338',
	source: 'brand xAI near-black → lifted just enough to stay under the tan',
	emblem: 'xAI parallel slashes (file/grok.svg, widened to the R9a floors)',
	reused: 'file/grok.svg',
	draw: (c) => c.poly([[5.65, 0], [8.55, 0], [3.07, 10], [0.17, 10]])
		+ c.poly([[7.6, 5.32], [10, 5.32], [7.1, 10], [4.7, 10]])
},
{
	id: 'grunt', label: 'Grunt', fill: NEUTRAL,
	source: 'brand amber collides with the tan plate → neutral',
	emblem: 'mallet (task runner)',
	draw: (c) => c.rrect(0.4, 0.6, 6.6, 2.9, 1) + c.bar(3.6, 3.4, 7.6, 9, 2.3)
},
{
	id: 'guard', label: 'Guard', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'shield',
	draw: (c) => c.path(`M 5 .4 L 9.5 2.1 L 9.5 5.4 C 9.5 8 7.5 9.2 5 9.9
		C 2.5 9.2 .5 8 .5 5.4 L .5 2.1 Z`)
},
{
	id: 'gulp', label: 'Gulp', fill: '#8E3A3B',
	source: 'brand gulp red #CF4647 → darkened (tone law)',
	emblem: 'cup with a straw',
	draw: (c) => c.bar(6.4, 3.6, 9.2, 1.2, 1.9)
		+ c.poly([[1.2, 3.2], [8.8, 3.2], [7.5, 9.7], [2.5, 9.7]])
		+ c.poly(rev([[1.95, 4.6], [8.05, 4.6], [7.9, 5.9], [2.1, 5.9]]))
},
{
	id: 'haxelib', label: 'Haxelib', fill: '#9A5312',
	source: 'brand Haxe orange #EA8220 → darkened (tone law)',
	emblem: 'Haxe four-blade pinwheel (file/haxe.svg)',
	reused: 'file/haxe.svg',
	draw: (c) => c.poly([[5, 4.36], [0.65, 0], [9.35, 0]]) + c.poly([[5.65, 5], [10, 0.65], [10, 9.35]])
		+ c.poly([[5, 5.65], [9.35, 10], [0.65, 10]]) + c.poly([[4.36, 5], [0, 9.35], [0, 0.65]])
},
{
	id: 'helper', label: 'Helpers', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: '? (help)',
	letter: { text: '?', inkH: 9.2 }
},
{
	id: 'histoire', label: 'Histoire', fill: '#7E3A5A',
	source: 'file/histoire.svg #C4608F → darkened (tone law)',
	emblem: 'Histoire petal + tail (file/histoire.svg)',
	reused: 'file/histoire.svg',
	draw: (c) => c.path(`M 9.49 0 C 9.64 4.44 7.02 8.02 2.9 8.89
		C 2.02 4.76 5.12 .87 9.49 0 Z`)
		+ c.poly([[2.9, 7.54], [4.56, 9.21], [0.36, 10]])
},

// ---- H – J -----------------------------------------------------------------

{
	id: 'home', label: 'Home', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'house with a door counter',
	draw: (c) => c.poly([[5, 0.6], [9.8, 5], [0.2, 5]]) + c.rect(1.4, 5, 7.2, 4.4)
		+ c.poly(rev([[3.9, 6.6], [6.1, 6.6], [6.1, 9.4], [3.9, 9.4]]))
},
{
	id: 'husky', label: 'Husky', fill: NEUTRAL,
	source: 'no brand hue in the inventory → neutral',
	emblem: 'husky head',
	draw: (c) => c.poly([[0.5, 0.3], [3.5, 0.3], [3.5, 3.4]]) + c.poly([[9.5, 0.3], [6.5, 3.4], [6.5, 0.3]])
		+ c.rrect(0.9, 2.2, 8.2, 7.4, 2.4)
		+ c.circle(3.2, 5, 1.1, 0) + c.circle(6.8, 5, 1.1, 0)
		+ c.poly(rev([[3.9, 7.3], [6.1, 7.3], [6.1, 8.7], [3.9, 8.7]]))
},
{
	id: 'idea', label: 'Idea', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'lightbulb',
	draw: (c) => c.circle(5, 3.7, 3.4) + c.poly([[3.2, 5.9], [6.8, 5.9], [6.6, 7.2], [3.4, 7.2]])
		+ c.rrect(3.4, 7, 3.2, 2.5, 0.7)
},
{
	id: 'import', label: 'Import', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'arrow into a bracket',
	draw: (c) => c.rect(7.4, 0.6, 2.2, 8.8) + c.rect(5.6, 0.6, 1.8, 2) + c.rect(5.6, 7.4, 1.8, 2)
		+ c.rect(0.4, 3.9, 3.2, 2.2) + c.poly([[3.6, 2.9], [6.2, 5], [3.6, 7.1]])
},
{
	id: 'include', label: 'Includes', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'partial: an L-block and the piece that completes it',
	draw: (c) => c.poly([[0.4, 0.6], [9.6, 0.6], [9.6, 4], [5, 4], [5, 9.4], [0.4, 9.4]])
		+ c.rect(6.3, 5.3, 3.3, 4.1)
},
{
	id: 'input', label: 'Input', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'text field with a caret',
	draw: (c) => c.rrect(0.4, 2.4, 9.2, 5.2, 1.2)
		+ c.poly(rev([[2.2, 4], [3.5, 4], [3.5, 6], [2.2, 6]]))
		+ c.poly(rev([[4.8, 4.4], [8.4, 4.4], [8.4, 5.6], [4.8, 5.6]]))
},
{
	id: 'instructions', label: 'Instructions', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'bulleted steps (file/instructions.svg’s pennants read as a bare S-bend at 8.20)',
	draw: (c) => [0.9, 4.1, 7.3].map((y, i) =>
		c.rect(0.4, y, 1.8, 1.8) + c.rect(3.4, y, i === 2 ? 4 : 6.2, 1.8)).join('')
},
{
	id: 'intellij', label: 'Intellij', fill: '#3A3F45',
	source: 'brand JetBrains near-black → lifted just enough to stay under the tan',
	emblem: 'IJ',
	letter: { text: 'IJ', inkH: 6.9 }
},
{
	id: 'interceptor', label: 'Interceptor', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'funnel (requests intercepted)',
	draw: (c) => c.poly([[0.4, 0.6], [9.6, 0.6], [9.6, 2], [6.1, 5.6], [6.1, 9.6],
		[3.9, 8.4], [3.9, 5.6], [0.4, 2]])
},
{
	id: 'interface', label: 'Interface', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'UML provided-interface lollipop',
	draw: (c) => c.rect(0.4, 1.6, 2.1, 6.8) + c.rect(2.5, 4, 3.4, 2) + c.circle(7.6, 5, 1.9)
},
{
	id: 'interfaces', label: 'Interfaces', fill: NEUTRAL,
	source: 'no brand → neutral (R3 family with interface: a pair of lollipops)',
	emblem: 'two UML lollipops',
	draw: (c) => c.rect(0.5, 1.6, 3.7, 1.8) + c.circle(6.6, 2.5, 1.8)
		+ c.rect(0.5, 6.6, 3.7, 1.8) + c.circle(6.6, 7.5, 1.8)
},
{
	id: 'ios', label: 'iOS', fill: NEUTRAL,
	source: 'no brand hue in the inventory (Apple grey) → neutral',
	emblem: 'apple',
	draw: (c) => c.path(`M 5 3.5 C 3.5 1.9 1 2.7 .7 5 C .4 7.3 2.2 9.8 3.6 9.8
		C 4.3 9.8 4.6 9.3 5 9.3 C 5.4 9.3 5.7 9.8 6.4 9.8 C 7.8 9.8 9.6 7.3 9.3 5
		C 9 2.7 6.5 1.9 5 3.5 Z`)
		+ c.path(`M 5.2 3.2 C 5.2 1.6 6.4 .3 7.8 .3 C 7.8 1.9 6.6 3.2 5.2 3.2 Z`)
},
{
	id: 'javascript', label: 'Javascript', fill: '#7E6A0C',
	source: 'brand JS #E8D44D → darkened (tone law)',
	emblem: 'JS',
	letter: { text: 'JS', inkH: 6.3 }
},
{
	id: 'jinja', label: 'Jinja', fill: NEUTRAL,
	source: 'brand maroon collides with the core git folder → neutral',
	emblem: '{ } template braces',
	draw: (c) => {
		const brace = [[4.2, 0.6], [2.2, 0.6], [1.4, 1.6], [1.4, 3.9], [0.3, 5], [1.4, 6.1],
			[1.4, 8.4], [2.2, 9.4], [4.2, 9.4], [4.2, 7.4], [3.4, 7.4], [3.4, 5.6], [2.2, 5],
			[3.4, 4.4], [3.4, 2.6], [4.2, 2.6]];
		return c.poly(brace) + c.poly(brace.map(([x, y]) => [10 - x, y]));
	}
},
{
	id: 'job', label: 'Jobs', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'clock (scheduled work)',
	draw: (c) => c.circle(5, 5, 4.4)
		+ c.poly(rev([[4.35, 1.9], [5.55, 1.9], [5.55, 4.4], [8.1, 4.4], [8.1, 5.6], [4.35, 5.6]]))
},
{
	id: 'junie', label: 'Junie', fill: NEUTRAL,
	source: 'no published brand hue that survives the tone law → neutral',
	emblem: 'J',
	letter: { text: 'J', inkH: 9 }
},

// ---- K – L -----------------------------------------------------------------

{
	id: 'keys', label: 'Keys', fill: NEUTRAL,
	source: 'no brand → neutral (file/key.svg gold is lighter than the tan)',
	emblem: 'key (file/key.svg mark, redrawn to the R9a floors)',
	reused: 'file/key.svg',
	draw: (c) => c.circle(3.15, 5, 3.05) + c.circle(3.15, 5, 1.02, 0)
		+ c.rect(4.2, 3.85, 5.7, 2.3) + c.rect(5.8, 6.15, 1.4, 1.7) + c.rect(8.4, 6.15, 1.4, 2.7)
},
{
	id: 'kiro', label: 'Kiro', fill: '#6B3F8E',
	source: 'brand violet → darkened (tone law)',
	emblem: 'K',
	letter: { text: 'K', inkH: 8.8 }
},
{
	id: 'kubernetes', label: 'Kubernetes', fill: '#2F4BA0',
	source: 'brand #326CE5 → darkened (tone law)',
	emblem: 'heptagonal helm ring',
	draw: (c) => c.ngon(5, 5, 4.7, 7, 90) + c.circle(5, 5, 1.95, 0)
},
{
	id: 'kusto', label: 'Kusto', fill: NEUTRAL,
	source: 'brand azure collides with the slice’s gcp/godot blues → neutral',
	emblem: 'magnifier (KQL query)',
	draw: (c) => c.circle(4, 4, 3.6) + c.bar(6.2, 6.2, 9, 9, 2.2) + c.circle(4, 4, 1.6, 0)
},
{
	id: 'lefthook', label: 'Lefthook', fill: NEUTRAL,
	source: 'no brand → neutral',
	emblem: 'left hook (an arrow that drops in and turns hard left)',
	draw: (c) => c.rect(7.2, 0.6, 2.2, 5.8) + c.rect(2.6, 4.2, 6.8, 2.2)
		+ c.poly([[0.2, 5.3], [3, 2.6], [3, 8]])
}

];
