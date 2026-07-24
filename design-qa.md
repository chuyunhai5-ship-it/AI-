# AI 问答大闯关 — Design QA

## Source truth

- Current feedback source: `qa/source-feedback-readability-1644x838.png`
- Source viewport and pixel size: 1644 × 838 px, 1× density
- Target state: desktop classroom view, correct-answer feedback visible
- Product requirement: a child should understand the judging result, correct answer, and explanation from a normal classroom viewing distance.
- Original selected visual: `public/assets/selected-design.png`

## Implementation evidence

- Final correct-answer state: `qa/readable-feedback-correct-final-1644x838.png`
- Final wrong-answer state: `qa/readable-feedback-final-1644x838.png`
- Full-view comparison: `qa/source-vs-readable-feedback-correct-final.png`
- Focused feedback comparison: `qa/focused-feedback-readability-comparison.png`
- Responsive evidence:
  - `qa/readable-feedback-wrong-1280x720-final.png`
  - `qa/readable-feedback-mobile-390x844-v2.png`
- Comparison viewport: 1644 × 838 CSS px, 1644 × 838 image px, 1× density.
- The source and implementation use the same component state. Question copy differs because the app samples five questions randomly from the 50-question bank.

## Comparison findings

### Typography and information hierarchy

- Passed: the feedback card now has three visible layers only—judging result, correct answer, and question explanation.
- Passed: key feedback text is 14–20 px with 1.55 line height instead of the previous 10–12 px four-row treatment.
- Passed: the verdict and correct answer are visually scannable before the learner reads the longer explanation.
- Passed: “朗读反馈” is a visible text control on the main desktop layout, so audio support is discoverable.
- Passed: the removed “答案核对” and “学习建议” rows remain available in the feedback data and speech content without competing for visual space.

### Layout and spacing

- Passed: the larger feedback card still fits the central task panel at 1644 × 838 and 1280 × 720 without covering the primary CTA.
- Passed: the answer options, feedback, and “进入下一关” action retain a clear top-to-bottom reading order.
- Passed: the 390 × 844 layout has no horizontal overflow and uses expected vertical scrolling.

### Color, imagery, and content

- Passed: correct and wrong states keep their green/red semantic colors with readable contrast against pale surfaces.
- Passed: the Li Bai host, AI judge, Chinese-mountain background, and the blue/white/orange classroom language remain unchanged.
- Passed: the visible feedback no longer repeats the learner's selected answer; it emphasizes the correct answer and a concise verified explanation.

### Interaction and responsive checks

- Passed: start, correct answer, wrong answer, next round, and five-round progress states were exercised in the in-app browser.
- Passed: the feedback speaker control remains available and has an accessible label.
- Passed: 1644 × 838, 1280 × 720, and 390 × 844 were visually inspected.
- Passed: the browser console returned no errors or warnings.

## Iteration history

1. Identified a P1 classroom-readability problem: four dense rows rendered the important feedback at approximately 10–12 px.
2. Reduced the visible content to three layers and increased type size, spacing, and CTA prominence.
3. Found a P1 mobile regression where the heading grid forced the verdict into a narrow vertical column.
4. Reworked the mobile heading into a two-column layout and re-captured the responsive evidence.
5. Re-tested correct and wrong states at desktop and mobile sizes.

## Severity summary

- P0: none
- P1: none remaining
- P2: none requiring correction
- Accepted responsive adaptation: the desktop “朗读反馈” label becomes an icon-only control at narrower desktop widths to preserve the card's text space.

final result: passed
