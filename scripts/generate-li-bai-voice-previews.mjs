import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(import.meta.dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
const round = process.argv[2] || "1";
const outputDir = path.join(
  projectRoot,
  "outputs",
  round === "1"
    ? "li-bai-voice-previews"
    : `li-bai-voice-previews-round${round}`,
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
const targetModel = env.DASHSCOPE_TTS_MODEL?.trim() || "cosyvoice-v3.5-plus";

if (!apiKey) {
  throw new Error("DASHSCOPE_API_KEY is missing from .env.local");
}

if (!apiHost?.startsWith("https://")) {
  throw new Error("DASHSCOPE_API_HOST must be an HTTPS URL");
}

const previewText =
  "少年，你可知道，峨眉山月半轮秋的下一句是什么？诗不只是背出来的，还要听见它的节奏。";

const candidateSets = {
  1: [
    {
      key: "a-clear-free",
      name: "清朗洒脱型",
      prompt:
        "青年男性，约二十八岁，中音偏低，音色清朗温润，带有自由洒脱的诗人气质。普通话标准，吐字清晰，语速中等略慢，表达自然、有抑扬顿挫。亲切风趣、有智慧感，朗诵古诗时有适度的情感张力。避免新闻播音腔，避免过度戏剧化，避免苍老，适合为八至十二岁儿童讲解古诗词。",
    },
    {
      key: "b-warm-wise",
      name: "温润儒雅型",
      prompt:
        "青年男性，约三十岁，中低音，音色温润、儒雅、从容，像一位善于启发孩子的古代诗人老师。普通话标准，咬字清楚，语速平稳略慢，语气亲切而不幼稚，讲题时有耐心和智慧感，诗句处带自然韵律。避免严肃训诫感，避免播音腔，避免苍老，适合少儿古诗词课堂。",
    },
    {
      key: "c-bold-magnetic",
      name: "豪迈磁性型",
      prompt:
        "青年男性，约三十二岁，中低音，声音有磁性、有力量但不粗重，带有豪迈开阔、率真洒脱的诗人气质。普通话标准，吐字清晰，语速中等，句尾干净，朗诵时节奏鲜明、情绪饱满，讲题时依然亲切自然。避免舞台腔，避免吼叫，避免过度低沉，适合为八至十二岁儿童主持古诗问答闯关。",
    },
  ],
  2: [
    {
      key: "a-bright-youth",
      name: "清越少年型",
      prompt:
        "年轻男性，约二十四至二十七岁，中音偏高，声音明亮、清越、轻盈，像迎着山风说话的青年诗人。气息通透，吐字清楚，语速中等略快，声音里有自然笑意和少年意气，句子节奏灵动，尾音舒展但不拖沓。不要中低音，不要浑厚磁性，不要成熟叔音，不要播音腔，适合八至十二岁儿童的古诗问答。",
    },
    {
      key: "b-wind-free",
      name: "乘风洒脱型",
      prompt:
        "年轻男性，约二十六岁，清朗明亮的中音，声音轻快、自在、率真，带有随口吟诗般的洒脱感。普通话清晰，语速自然略快，停顿自由，重音有趣，像一位边游历边给孩子出题的青年诗人，语气亲切又有一点顽皮。避免稳重教师腔，避免低沉，避免过分温柔，避免舞台朗诵腔。",
    },
    {
      key: "c-moon-poet",
      name: "月下诗人型",
      prompt:
        "年轻男性，约二十七岁，中音偏亮，音色清澈、俊朗、有空气感但不虚弱。说话从容而不稳重，带有浪漫想象和自由不羁的气质，诗句处自然扬起，像月下即兴吟诗；讲题时有笑意、有感染力。吐字清楚，语速中等，避免低沉磁性，避免新闻播报感，避免老成，避免刻意表演。",
    },
  ],
};

const candidates = candidateSets[round];
if (!candidates) {
  throw new Error(`Unknown preview round: ${round}`);
}

await mkdir(outputDir, { recursive: true });

const manifest = [];
for (const [index, candidate] of candidates.entries()) {
  const response = await fetch(
    `${apiHost}/api/v1/services/audio/tts/customization`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "voice-enrollment",
        input: {
          action: "create_voice",
          target_model: targetModel,
          voice_prompt: candidate.prompt,
          preview_text: previewText,
          prefix: `lb${round}${index + 1}`,
          language_hints: ["zh"],
        },
        parameters: {
          sample_rate: 24000,
          response_format: "wav",
        },
      }),
    },
  );

  const result = await response.json();
  if (!response.ok) {
    const message =
      result?.message || result?.code || `HTTP ${response.status}`;
    throw new Error(`Candidate ${index + 1} failed: ${message}`);
  }

  const audioBase64 = result?.output?.preview_audio?.data;
  const voiceId = result?.output?.voice_id;
  if (!audioBase64 || !voiceId) {
    throw new Error(`Candidate ${index + 1} returned incomplete output`);
  }

  const filename = `${index + 1}-${candidate.key}.wav`;
  const audio = Buffer.from(audioBase64, "base64");
  await writeFile(path.join(outputDir, filename), audio);

  manifest.push({
    number: index + 1,
    name: candidate.name,
    voiceId,
    targetModel,
    previewText,
    prompt: candidate.prompt,
    filename,
    bytes: audio.length,
    requestId: result.request_id,
  });

  console.log(`Generated candidate ${index + 1}: ${candidate.name}`);
}

await writeFile(
  path.join(outputDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Saved ${manifest.length} previews to ${outputDir}`);
