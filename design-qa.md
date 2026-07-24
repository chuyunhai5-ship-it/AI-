# 趣 C 第一课 H5 Demo — Design QA

## Source truth

- Selected visual: `public/assets/selected-design.png`
- Source size: 1487 × 1058 px
- Target state: 第 3 关、步骤 2「我来选择」、A 选项已选中
- Core visual contract: 左侧李白主持、中部题目与 A/B 选项、右侧 AI 判题老师；蓝白主色、橙色主按钮、浅色国风背景、顶部三步流程。

## Implementation evidence

- Desktop screenshot: `qa/implementation-round3.png`
- Side-by-side comparison: `qa/source-vs-implementation.png`
- Comparison viewport: 1280 × 720 px, 1× density
- The source image was proportionally resized and center-cropped to the same 1280 × 720 comparison frame.
- Additional responsive evidence:
  - `qa/tablet-start.png`
  - `qa/tablet-game.png`
  - `qa/mobile-start.png`
  - `qa/mobile-game.png`
  - `qa/result.png`

## Comparison findings

### Layout and spacing

- Passed: The same three-column reading order, character-role grouping, central answer card, top stepper, round counter, and bottom progress control are present.
- Passed: The implementation preserves the source hierarchy at a shorter 16:9 classroom screen ratio without clipping the question or primary CTA.
- Accepted responsive adaptation: Side character panels are slightly narrower and their characters slightly smaller than the normalized source. This keeps the full interaction visible at 1280 × 720 and avoids horizontal scrolling.

### Typography

- Passed: Display headings, question text, answer labels, and supporting copy have clear size and weight separation.
- Passed: Chinese copy does not truncate or collide in the tested desktop, tablet, and mobile frames.

### Color, surfaces, and states

- Passed: Blue/white/orange palette, purple AI-judge identity, soft borders, rounded cards, disabled state, selected state, correct state, wrong state, and shadows match the selected visual intent.
- Passed: The selected answer is visibly distinct through blue fill, border, and focus ring; the submit button changes from disabled gray to active orange.

### Image and icon fidelity

- Passed: The Li Bai host, AI judge robot, and pale Chinese-mountain background are real raster assets with correct transparency and no visible masking halos.
- Passed: UI icons use one consistent Phosphor icon family; no emoji, CSS art, inline SVG substitutes, or placeholder avatars are used.

### Content and behavior

- Passed: Five questions are playable with mixed A/B correct-answer positions.
- Passed: Loading, answering, judging, correct feedback, wrong feedback, next round, completion, score, and replay states were exercised in the in-app browser.
- Passed: “重听题目” invokes browser speech synthesis.
- Passed: “教研演示” opens a code drawer and highlights the line corresponding to the current program phase.
- Passed: Browser console returned no errors or warnings after the full flow.

### Responsiveness and accessibility

- Passed: 1280 × 720 desktop, 820 × 1180 tablet, and 390 × 844 mobile viewports have no horizontal overflow.
- Passed: Core controls use semantic buttons, the stepper has an accessible navigation label, the voice control has an accessible name, and character images include alt text.
- Passed: Focus-visible styling and reduced-motion handling are implemented.
- Passed: Mobile controls retain practical tap sizes; the content scrolls vertically where needed.

## Iteration history

1. Implemented the selected three-column visual with generated role assets and a matching background.
2. Added the complete five-round state machine, scoring, replay, speech, and teaching-code drawer.
3. Tested correct and incorrect answers, judging transitions, completion, replay, responsive frames, and console output.
4. Changed the question set from an all-A answer pattern to an A/B mix, then rebuilt and regression-tested the updated flow.
5. Re-captured the final round-3 selected state and compared it side by side with the selected visual.

## Severity summary

- P0: none
- P1: none
- P2: none requiring correction
- Accepted adaptation: character-panel width and character scale were reduced at 16:9 to preserve the complete task path.

final result: passed
