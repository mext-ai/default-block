# Mexty engine — primitive template

A block that a game host can mount inside its scene through Module Federation.

- `src/primitive.tsx` — the primitive (default export) and its `manifest`; exposed as `./Primitive`.
- `src/manifest.json` — kind, props schema, states, events; the platform stores `propsSchema` as the
  block's props schema and the manifest on `Block.engine`.
- `src/block.tsx` — a standalone preview (`./Block` / `./Component`) so the primitive is still a
  normal, previewable store block.
- `package.json` → `"mexty": { "profile": "engine", "role": "primitive" }`.

Reference it from a game definition: `"primitives": { "Chest": { "blockId": "<this block id>" } }`.
