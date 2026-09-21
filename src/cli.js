#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import {
  loadEnv,
  listVoices,
  listModels,
  getSubscription,
  textToSpeech,
  speechToText,
  ElevenLabsError,
  DEFAULT_VOICE_ID,
  DEFAULT_MODEL_ID,
  DEFAULT_OUTPUT_FORMAT,
} from './client.js';

loadEnv();

const USAGE = `
ElevenLabs CLI — Anupama Hospitals

  node src/cli.js voices                       List voices on the account
  node src/cli.js models                       List models and supported languages
  node src/cli.js quota                        Show character quota for this billing period
  node src/cli.js tts "<text>" [options]       Text to speech
  node src/cli.js stt <audio-file> [options]   Speech to text

tts options
  --voice <id>      Voice id           (default: ${DEFAULT_VOICE_ID})
  --model <id>      Model id           (default: ${DEFAULT_MODEL_ID})
  --format <fmt>    Output format      (default: ${DEFAULT_OUTPUT_FORMAT})
  --out <path>      Output file        (default: out.mp3)

stt options
  --model <id>      Model id           (default: scribe_v1)
  --lang <code>     Language hint, e.g. ml, hi, en

Examples
  node src/cli.js voices
  node src/cli.js tts "Welcome to Anupama Hospitals." --out welcome.mp3
  node src/cli.js stt recording.mp3 --lang ml
`;

/** Parse `--flag value` pairs, returning the leftover positional args too. */
function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const name = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[name] = true;
      } else {
        flags[name] = next;
        i++;
      }
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { flags, positional } = parseArgs(rest);

  switch (command) {
    case 'voices': {
      const { voices } = await listVoices();
      for (const voice of voices) {
        const labels = Object.values(voice.labels ?? {}).join(', ');
        console.log(`${voice.voice_id}  ${voice.name}${labels ? `  (${labels})` : ''}`);
      }
      console.log(`\n${voices.length} voice(s).`);
      break;
    }

    case 'models': {
      const models = await listModels();
      for (const model of models) {
        const languages = (model.languages ?? []).map((l) => l.language_id).join(' ');
        console.log(`${model.model_id}  ${model.name}`);
        if (languages) console.log(`    languages: ${languages}`);
      }
      break;
    }

    case 'quota': {
      const sub = await getSubscription();
      const used = sub.character_count ?? 0;
      const limit = sub.character_limit ?? 0;
      const remaining = Math.max(limit - used, 0);
      console.log(`Plan:       ${sub.tier ?? 'unknown'}`);
      console.log(`Characters: ${used.toLocaleString()} / ${limit.toLocaleString()} used`);
      console.log(`Remaining:  ${remaining.toLocaleString()}`);
      if (sub.next_character_count_reset_unix) {
        const reset = new Date(sub.next_character_count_reset_unix * 1000);
        console.log(`Resets:     ${reset.toISOString()}`);
      }
      break;
    }

    case 'tts': {
      const text = positional.join(' ');
      if (!text) {
        console.error('Nothing to speak. Pass the text as the first argument.');
        process.exitCode = 1;
        return;
      }
      const out = typeof flags.out === 'string' ? flags.out : 'out.mp3';
      const audio = await textToSpeech({
        text,
        voiceId: typeof flags.voice === 'string' ? flags.voice : undefined,
        modelId: typeof flags.model === 'string' ? flags.model : undefined,
        outputFormat: typeof flags.format === 'string' ? flags.format : undefined,
      });
      await writeFile(out, audio);
      console.log(`Wrote ${out} (${(audio.length / 1024).toFixed(1)} KB)`);
      break;
    }

    case 'stt': {
      const [filePath] = positional;
      if (!filePath) {
        console.error('No audio file given.');
        process.exitCode = 1;
        return;
      }
      const result = await speechToText({
        filePath,
        modelId: typeof flags.model === 'string' ? flags.model : undefined,
        languageCode: typeof flags.lang === 'string' ? flags.lang : undefined,
      });
      console.log(result.text ?? JSON.stringify(result, null, 2));
      break;
    }

    default:
      console.log(USAGE.trim());
      if (command) process.exitCode = 1;
  }
}

main().catch((error) => {
  if (error instanceof ElevenLabsError) {
    console.error(`Error: ${error.message}`);
    if (error.status === 401) console.error('Check that ELEVENLABS_API_KEY in .env is correct.');
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
