import json, sys
from datetime import date, timedelta
req = json.load(sys.stdin)
out = []
for c in req:
    k = c['k']
    if k == 'dates':
        r = []
        d = date(c['y0'], 1, 1); end = date(c['y1'], 12, 31)
        while d <= end:
            iy, iw, idow = d.isocalendar()
            r.append([iy, iw, idow, int(d.strftime('%U')), int(d.strftime('%W')), int(d.strftime('%V')), int(d.strftime('%G'))])
            if d == end: break
            d += timedelta(days=1)
        out.append(r)
    elif k == 'years':
        out.append([date(y, 12, 28).isocalendar()[1] for y in range(c['y0'], c['y1'] + 1)])
    elif k == 'from':
        r = []
        for t in c['list']:
            try:
                d = date.fromisocalendar(t[0], t[1], t[2]); r.append([d.year, d.month, d.day])
            except Exception:
                r.append('ERR')
        out.append(r)
json.dump(out, sys.stdout)
