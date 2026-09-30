import functions_framework
import hashlib
import json
import os
import requests
from google.cloud import storage
from google.api_core.exceptions import NotFound

ICS_URL = os.environ.get("ICS_URL")
BUCKET = os.environ.get("BUCKET")
REPO = os.environ.get("REPO", "iamflying29-sketch/dakboard-calendar")
WORKFLOW_ID = os.environ.get("WORKFLOW_ID", "calendar.yml")
GH_TOKEN = os.environ.get("GH_TOKEN")
STATE_FILE = "watcher_state.json"


def log(msg):
    print(msg, flush=True)


def dispatch():
    url = f"https://api.github.com/repos/{REPO}/actions/workflows/{WORKFLOW_ID}/dispatches"
    r = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {GH_TOKEN}",
            "Accept": "application/vnd.github+json",
        },
        json={"ref": "main"},
        timeout=30,
    )
    log(f"GitHub response: {r.status_code} {r.text}")
    return r


@functions_framework.cloud_event
def on_poll(event):
    if not all([ICS_URL, BUCKET, GH_TOKEN]):
        log("Missing required environment variable(s)")
        return

    # The 00:00 America/Los_Angeles Cloud Scheduler job ("calendar-midnight-
    # rebuild") publishes with attribute force=1: rebuild unconditionally as a
    # backstop to the page's own client-side midnight flip. No hash/state work.
    try:
        attrs = (event.data or {}).get("message", {}).get("attributes") or {}
    except Exception:
        attrs = {}
    if attrs.get("force") == "1":
        log("Forced midnight rebuild; triggering GitHub Actions build")
        dispatch()
        return

    try:
        ics = requests.get(ICS_URL, timeout=60).text
    except Exception as e:
        log(f"ICS fetch failed: {e}")
        return

    h = hashlib.sha256(ics.encode("utf-8")).hexdigest()

    client = storage.Client()
    bucket = client.bucket(BUCKET)
    blob = bucket.blob(STATE_FILE)

    try:
        last = json.loads(blob.download_as_text()).get("hash", "")
    except NotFound:
        last = ""

    if h == last:
        log("No calendar change")
        return

    log("Calendar changed; triggering GitHub Actions build")
    r = dispatch()

    if r.status_code == 204:
        blob.upload_from_string(json.dumps({"hash": h}))
        log("State updated")
    else:
        log("GitHub dispatch failed; not updating state")
