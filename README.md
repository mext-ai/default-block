# Mexty engine — game host template

A block whose props are a game definition, rendered by [`@mexty/engine`](https://github.com/mext-ai/engine).

- `src/block.tsx` — `export const Block` mounts `GameHost` with the definition, the tracker and the
  federation loader for remote primitives.
- `src/props.schema.json` — the definition's JSON Schema, committed so the platform stores it as the
  block's props schema (no LLM inference).
- `src/engine/federation.ts` — loads primitive blocks into this bundle's share scope and resolves
  them through `GET /api/engine/primitives/resolve`.
- `package.json` → `"mexty": { "profile": "engine", "role": "game-host" }` selects the platform's
  engine build profile (shared 3D stack, `./Block` + `./Component` exposes).

Develop locally with `npm install && npm run dev` (mounts the chest demo definition).
The platform build never executes `webpack.config.js`; it mirrors the platform's engine profile
for a local `npm run build`.
