import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { QUESTION_BANK, ROUND_COUNT, sampleQuestions } from "../src/questions.js";
import { buildJudgeFeedback } from "../src/judgeFeedback.js";

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test("question bank contains 50 valid and unique questions", () => {
  assert.equal(QUESTION_BANK.length, 50);
  assert.equal(new Set(QUESTION_BANK.map((question) => question.id)).size, 50);
  assert.equal(new Set(QUESTION_BANK.map((question) => question.prompt)).size, 50);
  assert.equal(QUESTION_BANK.filter((question) => question.answer === 0).length, 25);
  assert.equal(QUESTION_BANK.filter((question) => question.answer === 1).length, 25);

  for (const question of QUESTION_BANK) {
    assert.match(question.id, /^q\d{2}$/);
    assert.equal(question.options.length, 2);
    assert.ok(question.answer === 0 || question.answer === 1);
    assert.ok(question.options[question.answer].length > 0);
    assert.equal(typeof question.explanation, "string");
    assert.ok(question.explanation.trim().length >= 16);
    assert.match(question.explanation, /^出自李白《.+》：/);
  }
});

test("every question produces complete AI feedback for correct and wrong answers", () => {
  for (const question of QUESTION_BANK) {
    const correctFeedback = buildJudgeFeedback(question, question.answer, () => 0);
    const wrongAnswer = question.answer === 0 ? 1 : 0;
    const wrongFeedback = buildJudgeFeedback(question, wrongAnswer, () => 0.99);

    assert.equal(correctFeedback.correct, true);
    assert.equal(wrongFeedback.correct, false);

    for (const feedback of [correctFeedback, wrongFeedback]) {
      assert.equal(feedback.label, "AI 判题反馈");
      assert.ok(feedback.title.length > 0);
      assert.ok(feedback.verdict.length > 0);
      assert.match(feedback.answerReview, /^正确答案：[AB]「.+」$/);
      assert.equal(feedback.explanation, question.explanation);
      assert.ok(feedback.coach.length > 0);
      assert.match(feedback.speechText, /题目解析：.+学习建议：/);
    }
  }
});

test("each round samples five questions without repetition", () => {
  const sampled = sampleQuestions(ROUND_COUNT, seededRandom(20260724));
  assert.equal(sampled.length, 5);
  assert.equal(new Set(sampled.map((question) => question.id)).size, 5);
});

test("different random seeds produce different five-question rounds", () => {
  const first = sampleQuestions(ROUND_COUNT, seededRandom(1)).map((question) => question.id);
  const second = sampleQuestions(ROUND_COUNT, seededRandom(2)).map((question) => question.id);
  assert.notDeepEqual(first, second);
});

test("sampling never mutates the original question bank", () => {
  const originalOrder = QUESTION_BANK.map((question) => question.id);
  sampleQuestions(ROUND_COUNT, seededRandom(99));
  assert.deepEqual(QUESTION_BANK.map((question) => question.id), originalOrder);
});

test("every question has a generated Li Bai MP3", async () => {
  for (const question of QUESTION_BANK) {
    const audioUrl = new URL(
      `../public/audio/li-bai/questions/${question.id}.mp3`,
      import.meta.url,
    );
    const audio = await readFile(audioUrl);
    assert.ok(audio.length > 20_000, `${question.id} audio is unexpectedly small`);
    assert.equal(audio.subarray(0, 3).toString("ascii"), "ID3");
  }
});
