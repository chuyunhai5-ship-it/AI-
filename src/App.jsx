import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowCounterClockwise,
  Check,
  CheckCircle,
  Clock,
  Code,
  GraduationCap,
  Play,
  SlidersHorizontal,
  SpeakerHigh,
  Sparkle,
  Trophy,
  XCircle,
} from "@phosphor-icons/react";

const QUESTIONS = [
  {
    prompt: "“举头望明月”的下一句是？",
    options: ["低头思故乡", "疑是地上霜"],
    answer: 0,
    explanation: "这两句出自李白的《静夜思》：举头望明月，低头思故乡。",
  },
  {
    prompt: "“桃花潭水深千尺”的下一句是？",
    options: ["唯见长江天际流", "不及汪伦送我情"],
    answer: 1,
    explanation: "这是《赠汪伦》中的名句，用千尺潭水衬托朋友之间的深厚情谊。",
  },
  {
    prompt: "“飞流直下三千尺”的下一句是？",
    options: ["疑是银河落九天", "低头思故乡"],
    answer: 0,
    explanation: "这两句出自《望庐山瀑布》，把瀑布想象成从九天落下的银河。",
  },
  {
    prompt: "《静夜思》的作者是谁？",
    options: ["杜甫", "李白"],
    answer: 1,
    explanation: "《静夜思》是李白的代表作，写出了月夜里的思乡之情。",
  },
  {
    prompt: "“两岸猿声啼不住”的下一句是？",
    options: ["轻舟已过万重山", "孤帆一片日边来"],
    answer: 0,
    explanation: "这两句出自《早发白帝城》，表现小舟顺流而下的轻快。",
  },
];

const CODE_LINES = [
  { key: "setup", text: 'map<string, string> body1 = { "system": "你是李白出题官..." };' },
  { key: "question", text: "string question = post(url, body1);" },
  { key: "choice", text: "string answer = choice();" },
  { key: "judge", text: 'map<string, string> body2 = { "system": "你是判题老师..." };' },
  { key: "feedback", text: "string result = post(url, body2);" },
  { key: "loop", text: "for (int i = 0; i < 5; i++) { ... }" },
];

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function Stepper({ phase }) {
  const active = phase === "answering" ? 2 : phase === "judging" || phase === "feedback" ? 3 : 1;
  const steps = [
    { number: 1, label: "李白出题" },
    { number: 2, label: "我来选择" },
    { number: 3, label: "AI判题" },
  ];

  return (
    <nav className="stepper" aria-label="闯关步骤">
      {steps.map((step, index) => (
        <div className="step-group" key={step.number}>
          <div className={`step ${active === step.number ? "is-active" : ""} ${active > step.number ? "is-done" : ""}`}>
            <span className="step-number">{active > step.number ? <Check weight="bold" /> : step.number}</span>
            <span>{step.label}</span>
          </div>
          {index < steps.length - 1 && <ArrowRight className="step-arrow" weight="bold" />}
        </div>
      ))}
    </nav>
  );
}

function CharacterPanel({ type, phase, feedback }) {
  const isHost = type === "host";
  const isWorking = isHost ? phase === "loading" : phase === "judging";
  const isResult = !isHost && phase === "feedback";

  return (
    <aside className={`character-panel ${isHost ? "host-panel" : "judge-panel"}`}>
      <div className="character-label">
        {isHost ? <Sparkle weight="fill" /> : <GraduationCap weight="fill" />}
        {isHost ? "李白 AI 主持" : "AI 判题老师"}
      </div>
      <div className="character-stage">
        <img
          className={isHost ? "li-bai-image" : "judge-image"}
          src={isHost ? "/assets/li-bai.png" : "/assets/ai-judge.png"}
          alt={isHost ? "李白AI主持人" : "AI判题老师"}
        />
      </div>
      <div className={`status-box ${isWorking ? "is-working" : ""} ${isResult ? "is-result" : ""}`}>
        <div className="status-title">
          {isWorking ? <span className="status-spinner" aria-hidden="true" /> : <Clock weight="bold" />}
          {isHost
            ? phase === "loading"
              ? "正在生成诗词题目"
              : "本关题目已准备好"
            : phase === "judging"
              ? "正在认真批改"
              : phase === "feedback"
                ? feedback?.correct
                  ? "判题完成：回答正确"
                  : "判题完成：继续加油"
                : "判题老师等待中"}
        </div>
        <p>
          {isHost
            ? phase === "loading"
              ? "李白正在整理诗句"
              : "等你选择答案"
            : phase === "judging"
              ? "正在核对题目和你的选择"
              : phase === "feedback"
                ? "解析已经送达"
                : "你提交后将立即判题"}
        </p>
      </div>
    </aside>
  );
}

function TeachingDrawer({ open, phase, onClose }) {
  const activeKey =
    phase === "loading"
      ? "question"
      : phase === "answering"
        ? "choice"
        : phase === "judging"
          ? "judge"
          : phase === "feedback"
            ? "feedback"
            : "loop";

  return (
    <aside className={`teaching-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="teaching-head">
        <div>
          <span className="eyebrow">教研演示</span>
          <h2>代码正在控制哪一步？</h2>
        </div>
        <button type="button" className="text-button" onClick={onClose}>收起</button>
      </div>
      <div className="code-map">
        {CODE_LINES.map((line) => (
          <code className={activeKey === line.key ? "is-active" : ""} key={line.key}>
            {line.text}
          </code>
        ))}
      </div>
      <p className="teaching-note">同一套 map + post 骨架，分别让李白出题、让判题老师批改；for 负责重复 5 关。</p>
    </aside>
  );
}

function StartScreen({ onStart }) {
  return (
    <section className="start-screen">
      <div className="start-copy">
        <span className="eyebrow">趣 C · AI 编程第一课</span>
        <h1>李白诗词问答大闯关</h1>
        <p>李白负责出题，AI判题老师负责批改。准备好连续挑战五关了吗？</p>
        <div className="start-settings">
          <span><SlidersHorizontal weight="bold" />主题：古诗词</span>
          <span><GraduationCap weight="bold" />判题风格：鼓励型</span>
          <span><Trophy weight="bold" />关卡：5关</span>
        </div>
        <button type="button" className="primary-button start-button" onClick={onStart}>
          <Play weight="fill" />
          开始闯关
        </button>
      </div>
      <div className="start-characters">
        <img src="/assets/li-bai.png" alt="李白AI主持人" />
        <img src="/assets/ai-judge.png" alt="AI判题老师" />
      </div>
    </section>
  );
}

function ResultScreen({ score, onReplay }) {
  const title = score === 5 ? "诗词闯关王" : score >= 3 ? "诗词小侠客" : "诗词探索者";
  return (
    <section className="result-screen">
      <div className="result-icon"><Trophy weight="fill" /></div>
      <span className="eyebrow">五关挑战完成</span>
      <h1>{title}</h1>
      <p className="result-score"><strong>{score}</strong><span>/ 5</span></p>
      <p>你让李白AI连续出题，又请AI判题老师完成了每一轮批改。</p>
      <div className="result-proof">
        <span>两个 AI 职责</span>
        <span>两次 post</span>
        <span>一个 for 循环</span>
      </div>
      <button type="button" className="primary-button" onClick={onReplay}>
        <ArrowCounterClockwise weight="bold" />
        再闯一次
      </button>
    </section>
  );
}

export function App() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [teachingOpen, setTeachingOpen] = useState(false);

  const question = QUESTIONS[round];
  const progress = useMemo(() => `${round + 1} / ${QUESTIONS.length}`, [round]);

  useEffect(() => {
    if (!started || phase !== "loading") return undefined;
    const timer = window.setTimeout(() => {
      setPhase("answering");
    }, 750);
    return () => window.clearTimeout(timer);
  }, [started, round, phase]);

  function startGame() {
    setRound(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setPhase("loading");
    setStarted(true);
  }

  function submitAnswer() {
    if (selected === null || phase !== "answering") return;
    setPhase("judging");
    window.setTimeout(() => {
      const correct = selected === question.answer;
      if (correct) setScore((value) => value + 1);
      setFeedback({
        correct,
        title: correct ? "回答正确！" : "这一题差一点",
        explanation: question.explanation,
      });
      setPhase("feedback");
    }, 900);
  }

  function nextRound() {
    if (round === QUESTIONS.length - 1) {
      setPhase("complete");
      return;
    }
    setRound((value) => value + 1);
    setSelected(null);
    setFeedback(null);
    setPhase("loading");
  }

  if (!started) {
    return (
      <main className="app-shell">
        <StartScreen onStart={startGame} />
      </main>
    );
  }

  if (phase === "complete") {
    return (
      <main className="app-shell">
        <ResultScreen score={score} onReplay={startGame} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-kicker">趣 C · AI 编程</span>
          <h1>AI问答大闯关</h1>
        </div>
        <Stepper phase={phase} />
        <div className="round-chip">
          <span>第 <strong>{round + 1}</strong> 关</span>
          <span className="round-divider" />
          <span>{progress}</span>
        </div>
      </header>

      <section className="game-grid">
        <CharacterPanel type="host" phase={phase} feedback={feedback} />

        <section className="question-panel">
          <button
            className="speaker-button"
            type="button"
            onClick={() => speak(question.prompt)}
            aria-label="重听题目"
            title="重听题目"
          >
            <SpeakerHigh weight="fill" />
          </button>

          <div className="question-content">
            <span className="question-kicker">
              {phase === "loading" ? "李白正在出题" : "请选择你的答案"}
            </span>
            <h2>{phase === "loading" ? "正在生成本关诗词题目……" : question.prompt}</h2>
          </div>

          <div className={`options ${phase === "loading" ? "is-loading" : ""}`}>
            {question.options.map((option, index) => {
              const isSelected = selected === index;
              const showResult = phase === "feedback";
              const isCorrect = question.answer === index;
              const isWrongSelection = showResult && isSelected && !isCorrect;
              return (
                <button
                  type="button"
                  className={`option ${isSelected ? "is-selected" : ""} ${showResult && isCorrect ? "is-correct" : ""} ${isWrongSelection ? "is-wrong" : ""}`}
                  key={option}
                  disabled={phase !== "answering"}
                  onClick={() => setSelected(index)}
                >
                  <span className="option-letter">{index === 0 ? "A" : "B"}</span>
                  <span className="option-text">{option}</span>
                  {showResult && isCorrect && <CheckCircle className="option-result" weight="fill" />}
                  {isWrongSelection && <XCircle className="option-result" weight="fill" />}
                </button>
              );
            })}
          </div>

          {phase === "feedback" ? (
            <div className={`feedback-panel ${feedback.correct ? "is-correct" : "is-wrong"}`}>
              <div className="feedback-copy">
                {feedback.correct ? <CheckCircle weight="fill" /> : <XCircle weight="fill" />}
                <div>
                  <strong>{feedback.title}</strong>
                  <p>{feedback.explanation}</p>
                </div>
              </div>
              <button type="button" className="primary-button compact" onClick={nextRound}>
                {round === QUESTIONS.length - 1 ? "查看通关结果" : "进入下一关"}
                <ArrowRight weight="bold" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="primary-button submit-button"
              disabled={selected === null || phase !== "answering"}
              onClick={submitAnswer}
            >
              {phase === "judging" ? <span className="button-spinner" aria-hidden="true" /> : null}
              {phase === "judging" ? "AI正在判题" : "提交答案"}
              {phase !== "judging" && <ArrowRight weight="bold" />}
            </button>
          )}
        </section>

        <CharacterPanel type="judge" phase={phase} feedback={feedback} />
      </section>

      <footer className="bottom-tools">
        <div className="round-dots" aria-label={`当前第${round + 1}关，共${QUESTIONS.length}关`}>
          {QUESTIONS.map((_, index) => (
            <span
              key={index}
              className={`${index < round ? "is-done" : ""} ${index === round ? "is-active" : ""}`}
            >
              {index < round ? <Check weight="bold" /> : index + 1}
            </span>
          ))}
        </div>
        <button
          type="button"
          className={`teaching-toggle ${teachingOpen ? "is-active" : ""}`}
          onClick={() => setTeachingOpen((value) => !value)}
        >
          <Code weight="bold" />
          教研演示
        </button>
      </footer>

      <TeachingDrawer open={teachingOpen} phase={phase} onClose={() => setTeachingOpen(false)} />
    </main>
  );
}
