const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');
const start = source.indexOf('function projectCardLayout(');
const end = source.indexOf('\nfunction layoutProjectGrid(', start);
const context = {};
vm.runInNewContext(source.slice(start, end), context);
const pack = context.projectCardLayout;
test('a 9:16 upload allows the next photo to fill the short column', () => {
 const items = [9/16, 9/16, 9/16, 16/9, 16/9].map(ratio => ({ratio}));
 const {cards} = pack(items, 1056, 2, 16);
 assert.equal(cards[2].height, 520*16/9);
 assert.equal(cards[3].top, cards[2].top);
 assert.equal(cards[4].left, 536);
 assert.equal(cards[4].top, cards[3].top+cards[3].height+16);
});
test('new uploads of different ratios never overlap', () => {
 const items = Array.from({length:40}, (_,i) => ({ratio:[9/16,1,4/5,16/9,2/3][i%5], fullWidth:i%7===0}));
 const {cards} = pack(items, 1056, 2, 16);
 cards.forEach((a,i) => cards.slice(i+1).forEach(b => {
  assert.ok(a.left+a.width <= b.left+0.001 || b.left+b.width <= a.left+0.001 || a.top+a.height <= b.top+0.001 || b.top+b.height <= a.top+0.001);
 }));
});
test('mobile keeps 9:16 and stacks cards with a 12px gap', () => {
 const {cards} = pack([{ratio:9/16},{ratio:16/9}],350,1,12);
 assert.equal(cards[0].height,350*16/9);
 assert.equal(cards[1].top,cards[0].height+12);
 assert.equal(cards[1].width,350);
});
