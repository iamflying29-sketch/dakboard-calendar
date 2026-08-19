#!/usr/bin/env python3
"""
Build static calendar HTML files from the iCloud ICS feed.
Outputs day.html and night.html into the docs/ directory for GitHub Pages.
Run by GitHub Actions daily at midnight Pacific.
"""
import os
import urllib.request
from datetime import datetime, date, timedelta
from calendar import monthrange

ICS_URL = (
    "https://p162-caldav.icloud.com/published/2/"
    "MTE1NjMxNzg1MTExNTYzMfegQlS6W9NY8_0S3H1-zqo1DUrFW82CqRLbbdMA7Q8p"
)

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


def build_html(theme, today, month_events, year, month):
    day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    _, num_days = monthrange(year, month)

    first_date = date(year, month, 1)
    start_col = (first_date.weekday() + 1) % 7  # Sun=0
    flat = [0] * start_col + list(range(1, num_days + 1))
    while len(flat) % 7 != 0:
        flat.append(0)
    weeks = [flat[i:i + 7] for i in range(0, len(flat), 7)]
    nr = len(weeks)

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

    dow = "".join(f'<div class="d">{n}</div>' for n in day_names)

    cells = ""
    for week in weeks:
        for ci, dn in enumerate(week):
            if dn == 0:
                cells += '<div class="c e"></div>'
                continue
            is_today = dn == today.day
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
            cells += f'<div class="{cls}{xc}">{ns}{ev}</div>'

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
.g{{flex:1;min-height:0;display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat({nr},1fr)}}
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
</style></head><body>
<div class="w">
<div class="h"><b>{today.strftime("%B")}</b> <span>{today.year}</span></div>
<div class="dr">{dow}</div>
<div class="g">{cells}</div>
</div>
</body></html>"""


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    today = date.today()
    year, month = today.year, today.month

    print(f"Fetching iCloud ICS feed...")
    try:
        ics_text = fetch_ics()
        all_events = parse_ics_events(ics_text)
        month_events = get_month_events(all_events, year, month)
        print(f"  Parsed {len(all_events)} events, {len(month_events)} days with events this month")
    except Exception as e:
        print(f"  WARNING: ICS fetch failed ({e}), building with no events")
        month_events = {}

    for theme in ("day", "night"):
        html = build_html(theme, today, month_events, year, month)
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
