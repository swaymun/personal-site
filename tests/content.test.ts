import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=(page:string)=>readFileSync(`dist/${page?`${page}/`:''}index.html`,'utf8');
test('built Home preserves the name, biography and text navigation',()=>{const s=html('');assert.match(s,/<h1>Saimun Shahee<\/h1>/);assert.ok(s.includes('software engineer at Meta'));for(const page of ['work','movies','music','games','writing','links'])assert.ok(s.includes(`href="/${page}/"`));});
test('Work preserves project and education; every text page has a heading and no script',()=>{const s=html('work');assert.ok(s.includes('https://github.com/swaymun/system-design-excalidraws'));assert.ok(s.includes('Penn State'));for(const page of ['','work','movies','music','games','writing','links']){assert.match(html(page),/<h1>/);assert.doesNotMatch(html(page),/<script/);}});
test('device routes load their controller but do not preload games or audio',()=>{for(const page of ['gba','psp','ipod','3ds','switch']){const s=html(page);assert.match(s,/<script/);assert.doesNotMatch(s,/<(?:audio|video)/);assert.doesNotMatch(s,/<link[^>]*modulepreload/);}});
