import assert from "node:assert/strict";
import test from "node:test";

import { QUESTION_BANK, ROUND_COUNT, sampleQuestions } from "../src/questions.js";

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
    assert.ok(question.explanation.length > 0);
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
