const ts = require('typescript');
const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const exports_ = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/streak.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: exports_, Date, Set });
const calc = exports_.calculateStreak;
const day = n => `2026-11-${String(n).padStart(2, '0')}`;
const range = (a, b) => Array.from({length:b-a+1},(_,i)=>day(a+i));
let state = calc([], day(2));
assert.equal(state.current, 0); assert.equal(state.freezes, 2);
state = calc([day(2)], day(3));
assert.equal(state.current, 1); assert.equal(state.freezes, 2); // today not spent
state = calc([day(2)], day(4));
assert.equal(state.current, 1); assert.equal(state.freezes, 1); assert.equal(state.frozenDates[0], day(3));
state = calc([day(2), day(4)], day(4));
assert.equal(state.current, 2); assert.equal(state.best, 2); assert.equal(state.freezes, 1);
state = calc([day(2)], day(5));
assert.equal(state.current, 1); assert.equal(state.freezes, 0);
state = calc([day(2)], day(6));
assert.equal(state.current, 0); assert.equal(state.best, 1);
state = calc([day(2), day(6)], day(6));
assert.equal(state.current, 1); assert.equal(state.freezes, 0);
state = calc([day(2), ...range(4,9)], day(9));
assert.equal(state.current, 7); assert.equal(state.freezes, 2); // earned seventh practice day
state = calc(range(2,22), day(22));
assert.equal(state.freezes, 2); assert.equal(state.refillProgress, 0);
state = calc(['2026-10-30', day(2)], day(2));
assert.equal(state.current, 1); assert.equal(state.freezes, 2); // no retroactive freezes
state = calc(['2026-10-31', day(1)], day(3));
assert.equal(state.current, 2); assert.equal(state.freezes, 1); // protects existing series from launch
state = calc([day(2), day(2), day(20), '2026-02-30', 'bad'], day(2));
assert.equal(state.current, 1); assert.equal(state.refillProgress, 1);
state = calc(['2026-12-31','2027-01-02'], '2027-01-02');
assert.equal(state.current, 2); assert.equal(state.freezes, 1); // year boundary
state = calc(['2027-03-13','2027-03-15'], '2027-03-15');
assert.equal(state.current, 2); assert.equal(state.freezes, 1); // DST calendar days
assert.equal(JSON.stringify(calc([day(4),day(2)],day(4))),JSON.stringify(calc([day(2),day(4)],day(4))));
console.log('PASS: live day, automatic freezes, exhaustion, restart, refill/cap, launch boundary, deduplication, future dates, year/DST, deterministic sync.');
