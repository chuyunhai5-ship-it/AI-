import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
const manifestPath = path.join(
  projectRoot,
  "outputs",
  "li-bai-voice-previews-round2",
  "manifest.json",
);
const outputDir = path.join(
  projectRoot,
  "outputs",
  "li-bai-performance-preview",
);

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

const env = parseEnv(await readFile(envPath, "utf8"));
const apiKey = env.DASHSCOPE_API_KEY?.trim();
const apiHost = env.DASHSCOPE_API_HOST?.trim();
const candidates = JSON.parse(await readFile(manifestPath, "utf8"));
const selected = candidates.find((candidate) => candidate.number === 2);
const profileName = process.argv[2] || "refined";

if (!apiKey || !apiHost || !selected?.voiceId) {
  throw new Error("Missing API configuration or selected voice");
}

const profiles = {
  refined: {
    text: "少年，且听好了！峨眉山月半轮秋的下一句是什么？哈哈，莫急，先听一听诗里的月光与江水。",
    instruction:
      "年轻诗人，意气飞扬，语速轻快，带自然笑意。不要朗诵腔，像诗句第一次脱口而出，洒脱有运动感。",
    filename: "li-bai-5-performance-refined.wav",
  },
  cinematic: {
    text: "少年，且听好了！峨眉山月半轮秋的下一句是什么？哈哈，莫急，先听一听诗里的月光与江水。",
    instruction:
      "青年游侠诗人，能量很高，悲喜说来就来。语速明快，笑意爽朗，像第一次吟出诗句，不要朗诵腔。",
    filename: "li-bai-5-performance-cinematic.wav",
  },
};

const profile = profiles[profileName];
if (!profile) {
  throw new Error(`Unknown performance profile: ${profileName}`);
}

const response = await fetch(
  `${apiHost}/api/v1/services/audio/tts/SpeechSynthesizer`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selected.targetModel,
      input: {
        text: profile.text,
        voice: selected.voiceId,
        format: "wav",
        sample_rate: 24000,
        instruction: profile.instruction,
      },
    }),
  },
);

const result = await response.json();
if (!response.ok) {
  const message = result?.message || result?.code || `HTTP ${response.status}`;
  throw new Error(`Speech synthesis failed: ${message}`);
}

let audio;
if (result?.output?.audio?.data) {
  audio = Buffer.from(result.output.audio.data, "base64");
} else if (result?.output?.audio?.url) {
  const audioResponse = await fetch(result.output.audio.url);
  if (!audioResponse.ok) {
    throw new Error(`Audio download failed: HTTP ${audioResponse.status}`);
  }
  audio = Buffer.from(await audioResponse.arrayBuffer());
} else {
  throw new Error("Speech synthesis returned no audio");
}

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, profile.filename), audio);
await writeFile(
  path.join(outputDir, `manifest-${profileName}.json`),
  `${JSON.stringify(
    {
      selectedVoice: selected.name,
      voiceId: selected.voiceId,
      targetModel: selected.targetModel,
      profile: profileName,
      text: profile.text,
      instruction: profile.instruction,
      filename: profile.filename,
      bytes: audio.length,
      requestId: result.request_id,
    },
    null,
    2,
  )}\n`,
);

console.log(`Generated refined performance preview (${audio.length} bytes)`);
