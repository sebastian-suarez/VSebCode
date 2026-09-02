#!/usr/bin/env node
// F03-gen-contact.mjs — emit production/contact-F03.mjs with the slice roster baked in.
import { readFileSync, writeFileSync } from 'node:fs';
import { MARKS } from './F03-marks.mjs';

const TREE = {
	firestore: 'firestore', flow: 'flow-typed', flutter: 'flutter', forgejo: 'forgejo',
	form: 'forms', frontcommerce: '.front-commerce', functions: 'functions',
	gamemaker: 'gamemaker', gcp: 'gcp', gemini: '.gemini', 'gemini-ai': 'gemini-ai',
	generator: 'generated', 'gh-workflows': 'workflows', gitea: 'gitea',
	'gitea-workflows': 'workflows', global: 'global', godot: '.godot', grok: '.grok',
	grunt: 'grunt', guard: 'guards', gulp: 'gulp-tasks', haxelib: '.haxelib',
	helper: 'helpers', histoire: '.histoire', home: 'landing', husky: '.husky',
	idea: '.idea', import: 'imports', include: 'includes', input: 'inputs',
	instructions: 'instructions', intellij: 'idea', interceptor: 'interceptors',
	interface: 'interface', interfaces: 'interfaces', ios: 'ios',
	javascript: 'javascript', jinja: 'jinja2', job: 'jobs', junie: '.junie',
	keys: 'secrets', kiro: '.kiro', kubernetes: 'kubernetes', kusto: 'kusto',
	lefthook: 'lefthook'
};

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const roster = MARKS.map(m =>
	`\t[${q(m.id)}, ${q(TREE[m.id])}, ${q(m.emblem)}, ${q(m.fill)}, ${q(m.source)}]`).join(',\n');

const tpl = readFileSync(new URL('./F03-contact-template.mjs', import.meta.url), 'utf8');
const out = tpl.replace('/*__ROSTER__*/', '\n' + roster + '\n');
writeFileSync('/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/contact-F03.mjs', out, 'utf8');
console.log(`contact-F03.mjs written — ${MARKS.length} concepts`);
