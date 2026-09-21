import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const API_BASE = 'https://api.elevenlabs.io/v1';

/** Voice "Rachel" — a public ElevenLabs voice, safe default. */
export const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
export const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';
export const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128';

export class ElevenLabsError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ElevenLabsError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Minimal .env loader so the project stays dependency-free.
 * Real environment variables always win over the file.
 */
export function loadEnv(path = '.env') {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function apiKey() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new ElevenLabsError(
      'ELEVENLABS_API_KEY is not set. Copy .env.example to .env and add your key.',
      0,
      null
    );
  }
  return key;
}

async function request(path, { method = 'GET', body, headers = {}, binary = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'xi-api-key': apiKey(), ...headers },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed?.detail?.message ?? parsed?.detail ?? text;
      if (typeof detail === 'object') detail = JSON.stringify(detail);
    } catch {
      // keep the raw body
    }
    throw new ElevenLabsError(
      `${method} ${path} failed with ${res.status}: ${detail || res.statusText}`,
      res.status,
      text
    );
  }

  if (binary) return Buffer.from(await res.arrayBuffer());
  return res.json();
}

/** All voices available to the account, including custom/cloned ones. */
export function listVoices() {
  return request('/voices');
}

/** Models the account can use, with the languages each one supports. */
export function listModels() {
  return request('/models');
}

/** Character quota and plan info — useful before a large batch. */
export function getSubscription() {
  return request('/user/subscription');
}

/**
 * Turn text into speech. Resolves to an audio Buffer in `outputFormat`.
 */
export function textToSpeech({
  text,
  voiceId = DEFAULT_VOICE_ID,
  modelId = DEFAULT_MODEL_ID,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  voiceSettings,
} = {}) {
  if (!text) throw new ElevenLabsError('textToSpeech requires `text`.', 0, null);

  const payload = { text, model_id: modelId };
  if (voiceSettings) payload.voice_settings = voiceSettings;

  return request(
    `/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(outputFormat)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(payload),
      binary: true,
    }
  );
}

/** Transcribe an audio or video file. */
export async function speechToText({ filePath, modelId = 'scribe_v1', languageCode } = {}) {
  if (!filePath) throw new ElevenLabsError('speechToText requires `filePath`.', 0, null);

  const form = new FormData();
  form.append('file', new Blob([await readFile(filePath)]), basename(filePath));
  form.append('model_id', modelId);
  if (languageCode) form.append('language_code', languageCode);

  return request('/speech-to-text', { method: 'POST', body: form });
}
