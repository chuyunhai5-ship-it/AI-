# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable prototype decisions

- Visual source of truth: the second generated concept, saved at `public/assets/selected-design.png`.
- Product framing: a desktop-first H5 classroom demo of a five-round AI quiz.
- Core loop: Li Bai generates a question, the learner selects A/B, an AI judging teacher returns a verdict and explanation.
- Build the stable Mock-data version first; keep the AI/voice boundaries replaceable.
- Preserve the dual-character command-center layout and the blue/white/orange classroom visual language.
- Include a discreet teaching-demo toggle that reveals how `body1 → post → choice → body2 → post` maps to the visible game state.
- Maintain a 50-question Li Bai poetry bank and sample 5 unique questions at the start of every new run to simulate AI-return randomness.
