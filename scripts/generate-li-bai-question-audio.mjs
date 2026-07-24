import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { QUESTION_BANK } from "../src/questions.js";

const projectRoot = path.resolve(import.meta.dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
const voiceManifestPath = path.join(
  projectRoot,
  "outputs",
  "li-bai-voice-previews-round2",
  "manifest.json",
);
const outputDir = path.join(
  projectRoot,
  "public",
  "audio",
  "li-bai",
  "questions",
);
const manifestDir = path.join(
  projectRoot,
  "outputs",
  "li-bai-question-audio",
);

const performanceInstruction =
  "年轻诗人，意气飞扬，语速轻快，带自然笑意。不要朗诵腔，像诗句第一次脱口而出，洒脱有运动感。";

function parseEnv(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return separator === -1
          ? [line, ""]
          : [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

async function requestAudio({ apiHost, apiKey, model, voice, text }) {
  const response = await fetch(
    `${apiHost}/api/v1/services/audio/tts/SpeechSynthesizer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: {
          text,
          voice,
          format: "mp3",
          sample_rate: 24000,
          instruction: performanceInstruction,
        },
      }),
    },
  );

  const result = await response.json();
  if (!response.ok) {
    const message = result?.message || result?.code || `HTTP ${response.status}`;
    throw new Error(`Speech synthesis failed: ${message}`);
  }

  if (result?.output?.audio?.data) {
    return {
      audio: Buffer.from(result.output.audio.data, "base64"),
      requestId: result.request_id,
    };
  }

  const audioUrl = result?.output?.audio?.url;
  if (!audioUrl) {
    throw new Error("Speech synthesis returned no audio");
  }

  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Audio download failed: HTTP ${audioResponse.status}`);
  }

  return {
    audio: Buffer.from(await audioResponse.arrayBuffer()),
    requestId: result.request_id,
  };
}

const env = parseEnv(await readFile(envPath, "utf8"));
const apiKey = env.DASHSCOPE_API_KEY?.trim();
const apiHost = env.DASHSCOPE_API_HOST?.trim();
const voiceCandidates = JSON.parse(await readFile(voiceManifestPath, "utf8"));
const selectedVoice = voiceCandidates.find((candidate) => candidate.number === 2);

if (!apiKey || !apiHost || !selectedVoice?.voiceId) {
  throw new Error("Missing API configuration or selected voice");
}

await mkdir(outputDir, { recursive: true });

const manifest = new Array(QUESTION_BANK.length);
let cursor = 0;

async function worker() {
  while (cursor < QUESTION_BANK.length) {
    const index = cursor;
    cursor += 1;
    const question = QUESTION_BANK[index];
    const { audio, requestId } = await requestAudio({
      apiHost,
      apiKey,
      model: selectedVoice.targetModel,
      voice: selectedVoice.voiceId,
      text: question.prompt,
    });

    const filename = `${question.id}.mp3`;
    await writeFile(path.join(outputDir, filename), audio);
    manifest[index] = {
      id: question.id,
      prompt: question.prompt,
      filename,
      bytes: audio.length,
      requestId,
    };
    console.log(
      `Generated ${String(index + 1).padStart(2, "0")}/${QUESTION_BANK.length}: ${question.id}`,
    );
  }
}

await Promise.all([worker(), worker(), worker()]);

await mkdir(manifestDir, { recursive: true });
await writeFile(
  path.join(manifestDir, "manifest.json"),
  `${JSON.stringify(
    {
      model: selectedVoice.targetModel,
      voiceName: selectedVoice.name,
      voiceId: selectedVoice.voiceId,
      performanceInstruction,
      count: manifest.length,
      questions: manifest,
    },
    null,
    2,
  )}\n`,
);

console.log(`Saved ${manifest.length} question audio files to ${outputDir}`);
