const CORRECT_TITLES = [
  "回答正确，匹配成功！",
  "判断完成，这一题答对了！",
  "诗句衔接正确，真不错！",
];

const WRONG_TITLES = [
  "判断完成，这一题需要修正",
  "很接近了，再核对一次",
  "这次没有匹配上，继续加油",
];

const CORRECT_TIPS = [
  "把上下两句连起来朗读一遍，会记得更牢。",
  "你已经准确接上诗句，可以试着说出它的篇名。",
  "继续保持，留意诗句中的画面和节奏。",
];

const WRONG_TIPS = [
  "先读题干，再把正确答案接在后面完整朗读一遍。",
  "可以抓住上下句的画面联系，帮助排除干扰项。",
  "别急着记单句，把相邻两句作为一组会更容易。",
];

function assertRandomValue(value) {
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("random() must return a number from 0 (inclusive) to 1 (exclusive)");
  }
}

function pick(items, random) {
  const value = random();
  assertRandomValue(value);
  return items[Math.floor(value * items.length)];
}

function optionLabel(index) {
  return String.fromCharCode(65 + index);
}

export function buildJudgeFeedback(question, selected, random = Math.random) {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    throw new TypeError("question must contain at least two options");
  }
  if (!Number.isInteger(question.answer) || !question.options[question.answer]) {
    throw new TypeError("question must contain a valid answer index");
  }
  if (typeof question.explanation !== "string" || !question.explanation.trim()) {
    throw new TypeError("question must contain a non-empty explanation");
  }
  if (!Number.isInteger(selected) || !question.options[selected]) {
    throw new RangeError("selected must be a valid option index");
  }

  const correct = selected === question.answer;
  const selectedAnswer = `${optionLabel(selected)}「${question.options[selected]}」`;
  const correctAnswer = `${optionLabel(question.answer)}「${question.options[question.answer]}」`;
  const title = pick(correct ? CORRECT_TITLES : WRONG_TITLES, random);
  const coach = pick(correct ? CORRECT_TIPS : WRONG_TIPS, random);
  const verdict = correct
    ? `你选择了 ${selectedAnswer}，与标准答案一致。`
    : `你选择了 ${selectedAnswer}，标准答案是 ${correctAnswer}。`;

  return {
    correct,
    label: "AI 判题反馈",
    title,
    verdict,
    answerReview: `正确答案：${correctAnswer}`,
    explanation: question.explanation.trim(),
    coach,
    speechText: `${title}。${verdict}题目解析：${question.explanation.trim()}学习建议：${coach}`,
  };
}
