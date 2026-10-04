(function (root) {
  'use strict';
  var DAY = 86400000;
  function dn(y, m, d) { var t = new Date(0); t.setUTCFullYear(y, m - 1, d); t.setUTCHours(0, 0, 0, 0); return Math.round(t.getTime() / DAY); } // days since 1970-01-01
  function ymd(n) { var t = new Date(n * DAY); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; }
  function wd(n) { return ((n % 7) + 7 + 3) % 7 + 1; } // 1 = Monday .. 7 = Sunday (1970-01-01 was a Thursday = 4)
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function isoOf(n) {
    // The week belongs to the year of its Thursday (Wikipedia: week 01 is the week with the first Thursday of the year).
    var thu = n - (wd(n) - 4), y = ymd(thu).y, jan1 = dn(y, 1, 1);
    return { year: y, week: Math.floor((thu - jan1) / 7) + 1, weekday: wd(n) };
  }
  function isoWeeksInYear(y) { return isoOf(dn(y, 12, 28)).week; } // 28 December is always in the last week
  // Generic rule used by Java WeekFields and CLDR: weeks start on firstDay (1 = Mon .. 7 = Sun); week 1 is the first week with at least minDays days in the year.
  function generic(n, firstDay, minDays) {
    var y = ymd(n).y, res = null;
    [y + 1, y, y - 1].some(function (yy) {
      var jan1 = dn(yy, 1, 1), off = (wd(jan1) - firstDay + 7) % 7, start = jan1 - off; // first day of the week holding Jan 1
      var w1 = (7 - off) >= minDays ? start : start + 7;
      if (n >= w1) { res = { year: yy, week: Math.floor((n - w1) / 7) + 1 }; return true; } return false;
    });
    return res;
  }
  // strftime style: days before the first Sunday (%U) or Monday (%W) of the year are in week 0
  function strftimeWeek(n, mondayFirst) {
    var y = ymd(n).y, yday = n - dn(y, 1, 1), w = wd(n) % 7; // Sunday = 0
    if (mondayFirst) w = (w + 6) % 7;
    return Math.floor((yday + 7 - w) / 7);
  }
  function fromISO(isoYear, week, weekday) {
    if (week < 1 || week > isoWeeksInYear(isoYear)) return { error: 'ISO year ' + isoYear + ' has ' + isoWeeksInYear(isoYear) + ' weeks, so week ' + week + ' does not exist.' };
    if (weekday < 1 || weekday > 7) return { error: 'Weekday must be 1 (Monday) to 7 (Sunday).' };
    var jan4 = dn(isoYear, 1, 4), mon1 = jan4 - (wd(jan4) - 1); // Monday of week 1 (4 January is always in week 1)
    var n = mon1 + (week - 1) * 7 + (weekday - 1); return { n: n, date: ymd(n) };
  }
  var NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  function analyze(y, m, d) {
    if (!(m >= 1 && m <= 12) || !(d >= 1 && d <= 31)) return null; var t = ymd(dn(y, m, d)); if (t.y !== y || t.m !== m || t.d !== d) return null;
    var n = dn(y, m, d), iso = isoOf(n), us = generic(n, 7, 1), sat = generic(n, 6, 1);
    return { n: n, weekday: wd(n), weekdayName: NAMES[wd(n)], iso: iso, us: us, sat: sat, U: strftimeWeek(n, false), W: strftimeWeek(n, true), yday: n - dn(y, 1, 1) + 1, isoWeeksInYear: isoWeeksInYear(iso.year),
      weekRange: { mon: ymd(n - (wd(n) - 1)), sun: ymd(n + (7 - wd(n))) } };
  }
  var api = { dn: dn, ymd: ymd, wd: wd, isoOf: isoOf, isoWeeksInYear: isoWeeksInYear, generic: generic, strftimeWeek: strftimeWeek, fromISO: fromISO, analyze: analyze, NAMES: NAMES, isLeap: isLeap };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.WeekWhy = api;
})(typeof window !== 'undefined' ? window : this);
