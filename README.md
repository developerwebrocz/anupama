# ElevenLabs API — Anupama Hospitals

Zero-dependency Node.js integration for the [ElevenLabs](https://elevenlabs.io/) API.
Text-to-speech, speech-to-text, voice listing and quota checks, usable as a CLI or
imported as a module. Requires Node 18+ (uses built-in `fetch`).

## 1. Get your API key

1. Sign in at <https://elevenlabs.io/>
2. Click your profile icon (bottom-left) → **API Keys**
3. **Create API Key**, name it (e.g. `anupama-server`), copy it — it is shown **once**
4. Keys start with `sk_`

## 2. Configure

```bash
cp .env.example .env
```

Edit `.env` and paste the key:

```
ELEVENLABS_API_KEY=sk_your_real_key_here
```

`.env` is gitignored — never commit the key. If one leaks, revoke it in the
ElevenLabs dashboard and create a new one.

## 3. Verify it works

```bash
node src/cli.js quota
```

Shows your plan and remaining characters. If you get a 401, the key is wrong.

## CLI

```bash
node src/cli.js voices                  # list voices with their ids
node src/cli.js models                  # list models and supported languages
node src/cli.js quota                   # characters used / remaining

# text to speech
node src/cli.js tts "Welcome to Anupama Hospitals." --out welcome.mp3

# pick a voice and model
node src/cli.js tts "നമസ്കാരം" --voice <voice-id> --model eleven_multilingual_v2 --out ml.mp3

# speech to text
node src/cli.js stt recording.mp3 --lang ml
```

Run `node src/cli.js` with no arguments for the full option list.

### tts options

| Flag | Default | Notes |
|---|---|---|
| `--voice` | `21m00Tcm4TlvDq8ikWAM` | Voice id — get yours from `voices` |
| `--model` | `eleven_multilingual_v2` | `eleven_flash_v2_5` is cheaper and faster |
| `--format` | `mp3_44100_128` | e.g. `mp3_22050_32`, `pcm_16000` |
| `--out` | `out.mp3` | Output path |

## Use as a module

```js
import { writeFile } from 'node:fs/promises';
import { loadEnv, textToSpeech, listVoices } from './src/client.js';

loadEnv();

const audio = await textToSpeech({
  text: 'Your appointment is confirmed for tomorrow at 10 AM.',
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  modelId: 'eleven_multilingual_v2',
});

await writeFile('confirmation.mp3', audio);
```

Available exports from `src/client.js`:

- `loadEnv(path?)` — reads `.env`; real env vars take precedence
- `listVoices()` / `listModels()` / `getSubscription()`
- `textToSpeech({ text, voiceId, modelId, outputFormat, voiceSettings })` → `Buffer`
- `speechToText({ filePath, modelId, languageCode })` → `{ text, ... }`
- `ElevenLabsError` — thrown on any non-2xx response, carries `.status` and `.body`

## Notes

- **Cost is per character**, counted on the request, not the output length. Check
  `quota` before batching a lot of text.
- **Malayalam / Hindi / Tamil** need a multilingual model — `eleven_multilingual_v2`
  or `eleven_flash_v2_5`. Run `models` to confirm what your plan covers.
- **Network egress**: `api.elevenlabs.io` must be reachable. Sandboxed CI
  environments often block it and return `403 Host not in allowlist`.
- Keep the key server-side. Never ship it to a browser or embed it in WordPress
  theme files — anything client-side exposes it.
