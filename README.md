# WeekWhy

Shows the week number of a date under ISO 8601, US (Sunday start, week 1 holds Jan 1), Saturday-start, and strftime %U / %W rules, warns when the ISO week-year differs from the calendar year, and converts ISO year-week-day back to a date.

Open `app.html` (static, client-side). Run `node test-engine.js` (needs python3) for the checks.

## Sources
- ISO week date rules from https://en.wikipedia.org/wiki/ISO_week_date (fetched; the week 1 / Thursday definition, the long-year definitions and the 28 December rule were read there). The ISO 8601 standard itself is paywalled and was not read.
- The US and Saturday-start rules follow the Java/CLDR style "first day of week plus minimal days" model. The US rule is stated in the same Wikipedia article. Which countries use the Saturday rule was not verified beyond that article's note.
- Not covered: locale-specific week data (CLDR) beyond these presets.

## Checks (567417 comparisons, all passing)
- Every date 1900-2200, years 1-120 and 9880-9999 vs Python `isocalendar()` and `strftime` %U %W %V %G.
- The generic (Monday, minimal days 4) rule equals ISO on all of those dates.
- Weeks in every year 1-9999 vs Python (week of 28 December), and vs the Wikipedia long-year definition (Jan 1 or Dec 31 is a Thursday).
- 20000 random ISO year-week-day to date conversions, including invalid week 53 and 54, vs `date.fromisocalendar`.
- US and Saturday-start week numbers have no independent oracle here; they come from the same generic rule that is verified for ISO.
