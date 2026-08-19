import sys
from playwright.sync_api import sync_playwright

conditions = ["clear-day", "clear-night", "partly-cloudy-day", "partly-cloudy-night",
              "overcast", "fog", "rain", "rain-heavy", "snow", "snow-heavy",
              "thunderstorm", "thunderstorm-hail", "freezing-rain", "snow-grains",
              "drizzle", "rain-showers", "snow-showers"]

# (label, frac, elevation) to sample different times of day/night
sun_states = [
    ("noon", 0.5, 1.0),
    ("midmorning", 0.25, 0.7),
    ("nearsunset", 0.95, 0.15),
    ("dusk", 0.05, -0.1),
    ("midnight", 0.5, -1.0),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 640, "height": 500})
    page.goto("http://localhost:8791/weather-day.html", timeout=15000)
    page.wait_for_timeout(3000)
    for c in conditions:
        page.evaluate(f"window.fxEngine.setCondition('{c}')")
        page.evaluate("window.fxEngine.setSunState(0.4, 0.75)")
        page.wait_for_timeout(900)
        page.screenshot(path=f"C:/Users/Shadow/Documents/DAKboard Guest Bathroom Project/fx_{c}.png")
        print(f"captured {c}")

    for label, frac, elev in sun_states:
        page.evaluate("window.fxEngine.setCondition('clear-day')" if elev >= 0 else "window.fxEngine.setCondition('clear-night')")
        page.evaluate(f"window.fxEngine.setSunState({frac}, {elev})")
        page.wait_for_timeout(900)
        page.screenshot(path=f"C:/Users/Shadow/Documents/DAKboard Guest Bathroom Project/sun_{label}.png")
        print(f"captured sun state {label}")
    browser.close()
