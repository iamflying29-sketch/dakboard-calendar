#!/usr/bin/env python3
"""
Build static calendar HTML files from the iCloud ICS feed.
Outputs day.html and night.html into the docs/ directory for GitHub Pages.
Each page carries this month AND next month plus a small script that flips
the visible month and the "today" highlight at exactly local midnight, so the
display never depends on when a rebuild happens to run. Rebuilds are
triggered by iCloud changes, a 00:00 Pacific Cloud Scheduler job, and the
GitHub cron backstop.
"""
import json
import os
import urllib.request
from datetime import datetime, date, timedelta
from calendar import monthrange
from zoneinfo import ZoneInfo

ICS_URL = (
    "https://p162-caldav.icloud.com/published/2/"
    "MTE1NjMxNzg1MTExNTYzMfegQlS6W9NY8_0S3H1-zqo1DUrFW82CqRLbbdMA7Q8p"
)

# All date math is pinned to Tiburon's local timezone. date.today() would use
# the GitHub Actions runner's UTC clock instead, which is 7-8 hours ahead of
# Pacific time. Since UTC crosses midnight (and rolls to the "next" calendar
# day) while it's still afternoon/evening in Tiburon, a naive date.today()
# call made during that window -- or a run that's delayed past that window,
# which GitHub Actions cron frequently is -- bakes in TOMORROW's date as
# "today" for the rest of the Pacific day. Always compute "today" in
# America/Los_Angeles instead.
LOCAL_TZ = ZoneInfo("America/Los_Angeles")


def today_local():
    return datetime.now(LOCAL_TZ).date()

OUT_DIR = os.path.join(os.path.dirname(__file__), "docs")


def fetch_ics():
    req = urllib.request.Request(ICS_URL, headers={"User-Agent": "DAKboard-Cal/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_ics_events(ics_text):
    events = []
    blocks = ics_text.split("BEGIN:VEVENT")
    for block in blocks[1:]:
        end_idx = block.find("END:VEVENT")
        if end_idx >= 0:
            block = block[:end_idx]
        summary = ""
        dtstart = None
        dtend = None
        for line in block.split("\n"):
            line = line.strip()
            if line.startswith("SUMMARY:"):
                summary = line[8:].strip()
            elif line.startswith("DTSTART"):
                val = line.split(":")[-1].strip()
                if len(val) == 8:
                    try:
                        dtstart = datetime.strptime(val, "%Y%m%d").date()
                    except ValueError:
                        pass
                elif "T" in val:
                    try:
                        dtstart = datetime.strptime(val[:15], "%Y%m%dT%H%M%S").date()
                    except ValueError:
                        pass
            elif line.startswith("DTEND"):
                val = line.split(":")[-1].strip()
                if len(val) == 8:
                    try:
                        dtend = datetime.strptime(val, "%Y%m%d").date()
                    except ValueError:
                        pass
                elif "T" in val:
                    try:
                        dtend = datetime.strptime(val[:15], "%Y%m%dT%H%M%S").date()
                    except ValueError:
                        pass
        if summary and dtstart:
            events.append({
                "summary": summary,
                "start": dtstart.isoformat(),
                "end": dtend.isoformat() if dtend else dtstart.isoformat(),
            })
    return events


def get_month_events(events, year, month):
    first_day = date(year, month, 1)
    _, last = monthrange(year, month)
    last_day = date(year, month, last)
    month_events = {}
    for ev in events:
        ev_start = date.fromisoformat(ev["start"])
        ev_end = date.fromisoformat(ev["end"])
        if ev_end > ev_start:
            ev_end -= timedelta(days=1)
        if ev_start > last_day or ev_end < first_day:
            continue
        d = max(ev_start, first_day)
        end = min(ev_end, last_day)
        while d <= end:
            month_events.setdefault(d.day, []).append(ev["summary"])
            d += timedelta(days=1)
    return month_events


def next_month(year, month):
    return (year + 1, 1) if month == 12 else (year, month + 1)


def midnight_ms(d):
    """UTC epoch ms of local midnight (America/Los_Angeles) starting date d."""
    return int(datetime(d.year, d.month, d.day, tzinfo=LOCAL_TZ).timestamp() * 1000)


def month_panel(today, month_events, year, month, visible):
    """One month's header + weekday row + grid. Only the panel for today's
    month is visible and carries the baked "today" highlight; the others are
    pre-rendered for the client-side midnight flip."""
    day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    _, num_days = monthrange(year, month)

    first_date = date(year, month, 1)
    start_col = (first_date.weekday() + 1) % 7  # Sun=0
    flat = [0] * start_col + list(range(1, num_days + 1))
    while len(flat) % 7 != 0:
        flat.append(0)
    weeks = [flat[i:i + 7] for i in range(0, len(flat), 7)]
    nr = len(weeks)
    is_this_month = (today.year, today.month) == (year, month)

    dow = "".join(f'<div class="d">{n}</div>' for n in day_names)

    cells = ""
    for week in weeks:
        for ci, dn in enumerate(week):
            if dn == 0:
                cells += '<div class="c e"></div>'
                continue
            is_today = is_this_month and dn == today.day
            cls = "c t" if is_today else "c"
            ev = ""
            if dn in month_events:
                for en in month_events[dn][:2]:
                    esc = en.replace("&", "&amp;").replace("<", "&lt;")
                    ev += f'<div class="ev">{esc}</div>'
                if len(month_events[dn]) > 2:
                    ev += f'<div class="em">+{len(month_events[dn]) - 2}</div>'
            ns = (f'<span class="n nt">{dn}</span>' if is_today
                  else f'<span class="n">{dn}</span>')
            xc = " su" if ci == 0 else (" sa" if ci == 6 else "")
            cells += f'<div class="{cls}{xc}" data-day="{dn}">{ns}{ev}</div>'

    style = "" if visible else ' style="display:none"'
    return (f'<div class="w" data-ym="{year}-{month}" data-title="{first_date.strftime("%B %Y")}"{style}>\n'
            f'<div class="h"><b>{first_date.strftime("%B")}</b> <span>{year}</span></div>\n'
            f'<div class="dr">{dow}</div>\n'
            f'<div class="g" style="grid-template-rows:repeat({nr},1fr)">{cells}</div>\n'
            f'</div>')


# Midnight flip, ES5 only (the DAKboard WebView is old: no let/const/arrow/
# template literals/classList/forEach/find/Intl here). B = [utcMs, y, m, d]
# for every America/Los_Angeles midnight in the baked range, computed at build
# time with zoneinfo (DST-correct); the last row is an end sentinel.
# Date.getTime() is UTC-based, so the device's own time zone is irrelevant.
# A timer is aimed at the next midnight (+20 ms) but never sleeps more than
# 30 s, and a separate 30 s interval re-checks, so sleep/drift self-corrects.
FLIP_SCRIPT = r"""<script>
(function () {
  var B = __TABLE__;
  var CHECK_MS = 30000, EARLY_PAD_MS = 20, timer = null, shown = '';
  function hasC(el, c) { return (' ' + el.className + ' ').indexOf(' ' + c + ' ') >= 0; }
  function setC(el, c, on) {
    if (!el) return;
    var h = hasC(el, c);
    if (on && !h) { el.className = el.className + ' ' + c; }
    else if (!on && h) { el.className = (' ' + el.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, ''); }
  }
  function show(y, m, d) {
    var key = y + '-' + m + '-' + d;
    if (key === shown) return;
    var ps = document.querySelectorAll('.w[data-ym]'), target = null, i, j, cs, n, on;
    for (i = 0; i < ps.length; i++) { if (ps[i].getAttribute('data-ym') === y + '-' + m) target = ps[i]; }
    if (!target) return;
    for (i = 0; i < ps.length; i++) {
      ps[i].style.display = (ps[i] === target) ? '' : 'none';
      cs = ps[i].querySelectorAll('.c[data-day]');
      for (j = 0; j < cs.length; j++) {
        on = (ps[i] === target) && cs[j].getAttribute('data-day') === String(d);
        setC(cs[j], 't', on);
        n = cs[j].querySelector('.n');
        setC(n, 'nt', on);
      }
    }
    document.body.setAttribute('data-year', String(y));
    document.body.setAttribute('data-month', String(m));
    if (target.getAttribute('data-title')) document.title = target.getAttribute('data-title');
    shown = key;
  }
  function tick() {
    var now = new Date().getTime(), wait = CHECK_MS, i;
    try {
      for (i = B.length - 2; i >= 0; i--) { if (now >= B[i][0]) break; }
      if (i >= 0 && now < B[B.length - 1][0]) {
        show(B[i][1], B[i][2], B[i][3]);
        wait = B[i + 1][0] - now + EARLY_PAD_MS;
      } else if (i < 0) {
        wait = B[0][0] - now + EARLY_PAD_MS;
      }
    } catch (e) { /* keep the baked page as-is */ }
    if (!(wait > 0)) wait = EARLY_PAD_MS;
    if (wait > CHECK_MS) wait = CHECK_MS;
    if (timer) clearTimeout(timer);
    timer = setTimeout(tick, wait);
  }
  tick();
  setInterval(tick, CHECK_MS);
  if (document.addEventListener) document.addEventListener('visibilitychange', tick, false);
  if (window.addEventListener) { window.addEventListener('focus', tick, false); window.addEventListener('pageshow', tick, false); }
})();
</script>"""


def build_html(theme, today, months):
    """months: [(year, month, month_events), ...]; the first entry is today's
    month (visible), the rest are pre-rendered for the midnight flip."""

    # Theme palette
    if theme == "night":
        bg = "transparent"
        tp = "#f59e0b"; tm = "#92400e"
        tbg = "#78350f"; tt = "#fef3c7"
        eb = "rgba(245,158,11,0.1)"; ebd = "#b45309"
        hb = "#b45309"; gb = "#1a1a1a"
        dc = "#f59e0b"
        sun_c = "#ef4444"; sat_c = "#60a5fa"
    else:  # day / Spa White
        bg = "transparent"
        tp = "#1e293b"; tm = "#94a3b8"
        tbg = "#0f172a"; tt = "#ffffff"
        eb = "#f1f5f9"; ebd = "#64748b"
        hb = "#e2e8f0"; gb = "#f1f5f9"
        dc = "#3b82f6"
        sun_c = "#dc2626"; sat_c = "#2563eb"

    panels = "\n".join(
        month_panel(today, ev, y, m, visible=(i == 0))
        for i, (y, m, ev) in enumerate(months))

    # Day-boundary table for FLIP_SCRIPT: every local midnight from the 1st of
    # the first baked month through the midnight after the last baked day.
    d = date(months[0][0], months[0][1], 1)
    ly, lm = months[-1][0], months[-1][1]
    end = date(ly, lm, monthrange(ly, lm)[1]) + timedelta(days=1)
    rows = []
    while d < end:
        rows.append([midnight_ms(d), d.year, d.month, d.day])
        d += timedelta(days=1)
    rows.append([midnight_ms(end), 0, 0, 0])
    script = FLIP_SCRIPT.replace("__TABLE__", json.dumps(rows, separators=(",", ":")))

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{today.strftime("%B %Y")}</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:100%;height:100%;background:{bg};
font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Helvetica,Arial,sans-serif;
-webkit-font-smoothing:antialiased;overflow:hidden}}
.w{{width:100%;height:100%;display:flex;flex-direction:column}}
.h{{display:flex;align-items:baseline;padding:16px 18px 10px;gap:10px;flex-shrink:0}}
.h b{{font-size:48px;font-weight:700;color:{tp};letter-spacing:-.4px}}
.h span{{font-size:48px;font-weight:300;color:{tm}}}
.dr{{display:grid;grid-template-columns:repeat(7,1fr);flex-shrink:0;border-bottom:3px solid {hb}}}
.d{{font-size:24px;font-weight:700;color:{tm};text-transform:uppercase;letter-spacing:1px;text-align:center;padding:10px 0}}
.g{{flex:1;min-height:0;display:grid;grid-template-columns:repeat(7,1fr)}}
.c{{padding:6px 8px 4px;border-right:1px solid {gb};border-bottom:1px solid {gb};overflow:hidden;min-height:0}}
.c:nth-child(7n){{border-right:none}}
.c.e{{opacity:.2}}
.n{{display:block;font-size:32px;font-weight:600;color:{tp};text-align:right;line-height:1;padding:3px 5px 5px 0}}
.nt{{display:inline-flex;align-items:center;justify-content:center;min-width:48px;height:48px;border-radius:50%;
background:{tbg};color:{tt}!important;font-weight:700;font-size:28px;float:right;padding:0 8px}}
.ev{{font-size:22px;font-weight:600;color:{tp};background:{eb};border-left:5px solid {ebd};
border-radius:5px;padding:4px 8px;margin-top:4px;white-space:normal;word-break:break-word;overflow:hidden;line-height:1.3}}
.em{{font-size:18px;font-weight:700;color:{dc};padding:2px 6px;margin-top:2px}}
.su .n{{color:{sun_c}}}.sa .n{{color:{sat_c}}}.e .n{{color:{tm}}}.nt{{color:{tt}!important}}
</style></head><body data-year="{today.year}" data-month="{today.month}">
{panels}
{script}
</body></html>"""


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    today = today_local()
    year, month = today.year, today.month
    # This month + next month, so the page can flip itself at local midnight
    # on the last day of the month without waiting for a rebuild.
    ym = [(year, month), next_month(year, month)]

    print(f"Fetching iCloud ICS feed...")
    try:
        ics_text = fetch_ics()
        all_events = parse_ics_events(ics_text)
        months = [(y, m, get_month_events(all_events, y, m)) for (y, m) in ym]
        print(f"  Parsed {len(all_events)} events, {len(months[0][2])} days with events this month, "
              f"{len(months[1][2])} next month")
    except Exception as e:
        print(f"  WARNING: ICS fetch failed ({e}), building with no events")
        months = [(y, m, {}) for (y, m) in ym]

    for theme in ("day", "night"):
        html = build_html(theme, today, months)
        path = os.path.join(OUT_DIR, f"{theme}.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  Wrote {path} ({len(html)} bytes)")

    # Index page that redirects to day
    idx = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=day.html"></head></html>'
    with open(os.path.join(OUT_DIR, "index.html"), "w") as f:
        f.write(idx)

    print("Done!")


if __name__ == "__main__":
    main()
