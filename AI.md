# Working on a Mexty primitive block

This block is an **engine primitive**: a React Three Fiber component a game host mounts for each
entity whose `primitives` alias points at this block (`{ "blockId": "<this block>" }`).

- `src/primitive.tsx` is the primitive: `export default function Primitive({ entity })` plus
  `export { manifest }`. It receives the entity record from the definition (`entity.transform`,
  `entity.state`, `entity.tags`, `entity.props`) and uses `@mexty/engine` hooks:
  `useEntity` (register your root object), `useInteractable` (emit `entity:interact`), `useTrigger`
  (emit `trigger:enter/exit`), `useAnimationController` (expose semantic clips such as `open`,
  `attack`, `idle` — from a GLB via `useAsset` + `GltfModel`, or procedural), `useEngineStore` /
  `useEngineEvent` to read game state and events.
- Never decide game consequences here: emit events and expose clips/states; the game definition's
  triggers and quests decide what happens. Every learner-facing string comes from `entity.props`.
- `src/manifest.json` declares what a game host needs to know: kind, the schema of `entity.props`
  for this primitive, states, emitted/listened events. The platform records it on the block after
  each build and serves it to hosts. Keep it in step with `src/primitive.tsx`.
- **Props are a game definition.** Like a game host, this block's props (`src/props.schema.json`,
  generated from `@mexty/engine-schema`, committed on purpose — never delete or hand-edit it) are a
  whole game: the store preview is a small game with this primitive in it, referenced as
  `{ "local": "Chest" }`. `src/block.tsx` plays `defaultPreview` when no props variant is saved; to
  change the preview, save a props variant (`save_block_props`), do not hardcode content.
- Never edit `src/App.tsx`, `src/index.tsx`, `webpack.config.js`; `src/index.tsx` must stay a
  dynamic import — the engine profile shares React, three and `@mexty/engine` as non-eager singletons
  with the game host, which is what lets this primitive live inside the host's scene.
