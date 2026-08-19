import sys
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8791/weather-day.html"
out = sys.argv[2] if len(sys.argv) > 2 else "test_out.png"
width = int(sys.argv[3]) if len(sys.argv) > 3 else 640
height = int(sys.argv[4]) if len(sys.argv) > 4 else 1440
bg = sys.argv[5] if len(sys.argv) > 5 else None

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": width, "height": height})
    page.on("console", lambda msg: print("CONSOLE:", msg.text))
    page.on("pageerror", lambda exc: print("PAGEERROR:", exc))
    page.goto(url, timeout=15000)
    if bg:
        page.evaluate(f"document.body.style.background = '{bg}'")
    page.wait_for_timeout(5000)
    page.screenshot(path=out)
    browser.close()
print(f"Wrote {out} at {width}x{height}")
