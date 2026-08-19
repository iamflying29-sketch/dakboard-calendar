from playwright.sync_api import sync_playwright

conditions = [
    "tornado", "hurricane", "tropical-storm", "derecho", "squall",
    "blizzard", "ice-storm", "sandstorm", "dust-storm", "volcanic-ash",
    "wildfire-smoke", "haze", "smog", "aurora", "eclipse", "rainbow"
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 640, "height": 500})
    page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]:", msg.text))
    page.on("pageerror", lambda exc: print("PAGEERROR:", exc))
    page.goto("http://localhost:8791/weather-day.html", timeout=15000)
    page.wait_for_timeout(3000)
    for c in conditions:
        page.evaluate(f"window.fxEngine.setCondition('{c}')")
        page.wait_for_timeout(1200)
        page.screenshot(path=f"C:/Users/Shadow/Documents/DAKboard Guest Bathroom Project/fx_{c}.png")
        print(f"captured {c}")
    browser.close()
