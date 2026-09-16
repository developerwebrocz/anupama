"""Generate the 20 VMCRM voiceover MP3s with ElevenLabs.

Usage:
    export ELEVENLABS_API_KEY=...   # your ElevenLabs API key
    python3 generate_elevenlabs.py [voice-name]   # default voice name: Chey

Reads scripts/NN_Name.txt and writes VMCRM_VO/NN_Name.mp3.
Requires: pip install requests
"""
import os
import sys
import time

import requests

API = "https://api.elevenlabs.io/v1"
KEY = os.environ.get("ELEVENLABS_API_KEY")
if not KEY:
    sys.exit("Set ELEVENLABS_API_KEY first.")
HEADERS = {"xi-api-key": KEY}

VOICE_NAME = sys.argv[1] if len(sys.argv) > 1 else "Chey"

# Find the voice by name (covers personal/cloned and default voices)
resp = requests.get(f"{API}/voices", headers=HEADERS, timeout=30)
resp.raise_for_status()
voices = resp.json()["voices"]
match = [v for v in voices if v["name"].strip().lower() == VOICE_NAME.lower()]
if not match:
    names = ", ".join(sorted(v["name"] for v in voices))
    sys.exit(f"No voice named {VOICE_NAME!r} in this account. Available: {names}")
voice_id = match[0]["voice_id"]
print(f"Using voice {match[0]['name']} ({voice_id})")

base = os.path.dirname(os.path.abspath(__file__))
out_dir = os.path.join(base, "VMCRM_VO")
os.makedirs(out_dir, exist_ok=True)

scripts = sorted(f for f in os.listdir(os.path.join(base, "scripts")) if f.endswith(".txt"))
for fname in scripts:
    name = fname[:-4]
    out_path = os.path.join(out_dir, f"{name}.mp3")
    if os.path.exists(out_path):
        print(f"skip {name}.mp3 (exists)")
        continue
    text = open(os.path.join(base, "scripts", fname)).read().strip()
    body = {
        "text": text,
        # eleven_v3 supports Telugu natively; scripts are Telugu-script +
        # English code-mixed for native-speaker pronunciation
        "model_id": "eleven_v3",
    }
    r = requests.post(
        f"{API}/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        headers=HEADERS, json=body, timeout=300,
    )
    if r.status_code >= 400:
        sys.exit(f"{name}: HTTP {r.status_code}: {r.text[:500]}")
    with open(out_path, "wb") as f:
        f.write(r.content)
    print(f"{name}.mp3  {len(r.content) / 1024:.0f} KB")
    time.sleep(0.5)

print("Done ->", out_dir)
