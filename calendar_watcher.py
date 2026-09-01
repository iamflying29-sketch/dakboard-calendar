import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import build

POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", "300"))
PAGE_DELAY = int(os.environ.get("PAGE_DELAY", "120"))
NO_PUSH = os.environ.get("NO_PUSH", "").lower() in ("1", "true", "yes")

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.environ.get(
    "STATE_FILE",
    str(Path.home() / ".dakboard_calendar_watcher_state.json"),
)


def log(msg):
    now = time.strftime("%Y-%m-%d %H:%M:%S %Z")
    print(f"[{now}] {msg}", flush=True)


def load_last_hash():
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f).get("ics_hash", "")
    except Exception:
        return ""


def save_last_hash(h):
    try:
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump({"ics_hash": h}, f)
    except Exception as e:
        log(f"Could not save state: {e}")


def ics_hash():
    try:
        text = build.fetch_ics()
        events = build.parse_ics_events(text)
        signature = "".join(
            json.dumps(ev, sort_keys=True)
            for ev in sorted(events, key=lambda x: (x["start"], x["summary"]))
        )
        return hashlib.sha256(signature.encode("utf-8")).hexdigest()
    except Exception as e:
        log(f"ICS fetch/parse failed: {e}")
        return None


def run_build():
    log("Building calendar...")
    try:
        build.main()
        return True
    except Exception as e:
        log(f"build.py failed: {e}")
        return False


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
        log("NO_PUSH set; skipping commit/push")
        return True

    log("Committing docs/...")
    subprocess.run(["git", "add", "docs/"], cwd=REPO_ROOT, timeout=30)
    r = subprocess.run(
        [
            "git",
            "-c",
            "user.name=DAKboard Calendar Watcher",
            "-c",
            "user.email=watcher@local",
            "commit",
            "-m",
            "Auto-refresh calendar",
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


def run_refresh():
    log("Running refresh_calendar.py...")
    r = subprocess.run(
        [sys.executable, "refresh_calendar.py"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=60,
    )
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    return r.returncode == 0


def main():
    log("Calendar watcher started")
    log(f"POLL_INTERVAL={POLL_INTERVAL}s, PAGE_DELAY={PAGE_DELAY}s, NO_PUSH={NO_PUSH}")
    last = load_last_hash()

    while True:
        try:
            current = ics_hash()
            if current is None:
                time.sleep(POLL_INTERVAL)
                continue

            if current != last:
                log("iCloud calendar changed (add or delete detected)")
                if run_build() and docs_changed():
                    if commit_and_push():
                        run_refresh()
                last = current
                save_last_hash(current)
            else:
                log("No iCloud calendar changes; sleeping")

            time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            log("Stopped by user")
            break
        except Exception as e:
            log(f"Error: {e}")
            time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
