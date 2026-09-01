import hashlib
import json
import os
import subprocess
import sys
import time

import build
import requests

API_KEY = os.environ.get("DAKBOARD_API_KEY")
PAGE_DELAY = int(os.environ.get("PAGE_DELAY", "120"))
NO_PUSH = os.environ.get("NO_PUSH", "").lower() in ("1", "true", "yes")

BASE = "https://dakboard.com/api/2"
DAY_SCREEN = "scr_8ef733798d74"
NIGHT_SCREEN = "scr_f7c6eb565c43"
DAY_CAL = "blk_6a841cc205341e180831b2d1"
NIGHT_CAL = "blk_6a84237fb42221550753b113"
URL_BASE = "https://iamflying29-sketch.github.io/dakboard-calendar"

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))


def log(msg):
    now = time.strftime("%Y-%m-%d %H:%M:%S %Z")
    print(f"[{now}] {msg}", flush=True)


def docs_changed():
    r = subprocess.run(
        ["git", "status", "--porcelain", "--", "docs/"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=30,
    )
    return bool(r.stdout.strip())


def commit_and_push():
    if NO_PUSH:
        log("NO_PUSH set; skipping git commit/push")
        return True

    log("Committing docs/...")
    subprocess.run(["git", "add", "docs/"], cwd=REPO_ROOT, timeout=30)
    r = subprocess.run(
        [
            "git",
            "-c",
            "user.name=DAKboard Calendar Refresh",
            "-c",
            "user.email=refresh@local",
            "commit",
            "-m",
            "Calendar refresh",
        ],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=30,
    )
    if r.returncode != 0:
        log(f"git commit failed: {r.stderr}")
        return False

    log("Pushing to origin...")
    r = subprocess.run(
        ["git", "push"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=60,
    )
    if r.returncode != 0:
        log(f"git push failed: {r.stderr}")
        return False

    log(f"Pushed. Waiting {PAGE_DELAY}s for GitHub Pages...")
    time.sleep(PAGE_DELAY)
    return True


def refresh_dakboard():
    if not API_KEY:
        raise SystemExit("DAKBOARD_API_KEY not set")

    v = str(int(time.time()))
    for name, screen, block, html in [
        ("Day", DAY_SCREEN, DAY_CAL, "day.html"),
        ("Night", NIGHT_SCREEN, NIGHT_CAL, "night.html"),
    ]:
        new_url = f"{URL_BASE}/{html}?v={v}"
        resp = requests.put(
            f"{BASE}/screens/{screen}/blocks/{block}?api_key={API_KEY}",
            data={"url": new_url},
            timeout=30,
        )
        log(f"{name} ({screen}/{block}): {resp.status_code} => {new_url}")


def main():
    log("Rebuilding calendar...")
    build.main()

    if docs_changed():
        commit_and_push()
    else:
        log("docs/ unchanged; skipping commit/push")

    log("Refreshing DAKboard calendar widgets...")
    refresh_dakboard()


if __name__ == "__main__":
    main()
