'use strict';
var W = require('./engine.js'), cp = require('child_process');
var checks = 0, fails = 0;
function eq(a, b, m) { checks++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; if (fails < 25) console.log('FAIL', m, JSON.stringify(a), '!=', JSON.stringify(b)); } }
function run(input) { return JSON.parse(cp.execFileSync('python3', ['oracle.py'], { input: JSON.stringify(input), maxBuffer: 1 << 29, cwd: __dirname }).toString()); }
// 1. Worked facts from the Wikipedia ISO week date article (fetched): 1 Jan Fri = W53 of the previous year, Dec 31 Thursday = W53, long years
var a = W.analyze(2010, 1, 1); eq([a.iso.year, a.iso.week], [2009, 53], '2010-01-01 is 2009-W53');
a = W.analyze(2008, 12, 29); eq([a.iso.year, a.iso.week], [2009, 1], '2008-12-29 is 2009-W01');
a = W.analyze(2026, 1, 1); eq([a.iso.year, a.iso.week, a.weekdayName], [2026, 1, 'Thursday'], '2026-01-01');
a = W.analyze(2025, 12, 29); eq([a.iso.year, a.iso.week], [2026, 1], '2025-12-29 is 2026-W01');
eq(W.isoWeeksInYear(2009), 53, '2009 long'); eq(W.isoWeeksInYear(2015), 53, '2015 long'); eq(W.isoWeeksInYear(2020), 53, '2020 long'); eq(W.isoWeeksInYear(2021), 52, '2021 short');
var jan1Thu = 0; for (var y = 1; y <= 9999; y++) { var longDef = W.wd(W.dn(y, 1, 1)) === 4 || W.wd(W.dn(y, 12, 31)) === 4; eq(W.isoWeeksInYear(y) === 53, longDef, 'long-year definition ' + y); }
eq(W.fromISO(2021, 53, 1).error !== undefined, true, '2021 has no week 53');
// 2. All dates 1900-2200 vs Python (isocalendar, strftime %U %W %V %G)
var o = run([{ k: 'dates', y0: 1900, y1: 2200 }])[0], i = 0, n0 = W.dn(1900, 1, 1);
for (i = 0; i < o.length; i++) { var n = n0 + i, t = W.ymd(n), r = W.analyze(t.y, t.m, t.d), p = o[i];
  eq([r.iso.year, r.iso.week, r.weekday], [p[0], p[1], p[2]], 'isocalendar ' + t.y + '-' + t.m + '-' + t.d); eq([r.U, r.W], [p[3], p[4]], 'strftime %U %W ' + t.y + '-' + t.m + '-' + t.d); eq([r.iso.week, r.iso.year], [p[5], p[6]], 'strftime %V %G'); eq(W.generic(n, 1, 4), { year: p[0], week: p[1] }, 'generic Monday/4 equals ISO ' + t.y + '-' + t.m + '-' + t.d); }
var datesN = o.length;
// 3. Weeks per year 1..9999 and wide year ranges
var yrs = run([{ k: 'years', y0: 1, y1: 9999 }])[0]; yrs.forEach(function (w, j) { eq(W.isoWeeksInYear(j + 1), w, 'weeks in year ' + (j + 1)); });
var wide = run([{ k: 'dates', y0: 1, y1: 120 }, { k: 'dates', y0: 9880, y1: 9999 }]); var spans = [[1, 120], [9880, 9999]];
wide.forEach(function (arr, si) { var base = W.dn(spans[si][0], 1, 1); arr.forEach(function (p, j) { var t = W.ymd(base + j), r = W.analyze(t.y, t.m, t.d); eq([r.iso.year, r.iso.week, r.weekday], [p[0], p[1], p[2]], 'wide ' + t.y + '-' + t.m + '-' + t.d); }); });
// 4. ISO week to date vs date.fromisocalendar, including invalid weeks
var seed = 3; function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
var list = []; for (i = 0; i < 20000; i++) list.push([1 + Math.floor(rnd() * 9998), 1 + Math.floor(rnd() * 54), 1 + Math.floor(rnd() * 7)]);
var fo = run([{ k: 'from', list: list }])[0];
list.forEach(function (t, j) { var r = W.fromISO(t[0], t[1], t[2]); eq(r.error ? 'ERR' : [r.date.y, r.date.m, r.date.d], fo[j], 'fromISO ' + t.join('-')); });
console.log('all dates 1900-2200 (' + datesN + ') and 1-120, 9880-9999 vs Python isocalendar and strftime; weeks in every year 1-9999; 20000 ISO week-to-date conversions incl. invalid weeks vs date.fromisocalendar');
console.log(checks + ' checks, ' + fails + ' failures'); process.exit(fails ? 1 : 0);
