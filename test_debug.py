from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 640, "height": 400})
    page.on("console", lambda msg: print("CONSOLE:", msg.text))
    page.goto("http://localhost:8791/weather-night.html?v=7", timeout=15000)
    page.wait_for_timeout(4000)
    info = page.evaluate("""() => {
        const cs = getComputedStyle(document.documentElement);
        return {
            skyTop: cs.getPropertyValue('--sky-top'),
            skyMid: cs.getPropertyValue('--sky-mid'),
            skyBottom: cs.getPropertyValue('--sky-bottom'),
            now: new Date().toString(),
            frac: window.fxEngine ? window.fxEngine.sunFrac : null,
            elev: window.fxEngine ? window.fxEngine.sunElevation : null,
        };
    }""")
    print(info)
    browser.close()
