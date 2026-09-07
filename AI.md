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
- `src/manifest.json` declares kind, props schema, states, emitted/listened events. Keep
  `src/props.schema.json` equal to `manifest.propsSchema` (it is what the store shows).
- `src/block.tsx` is only the standalone preview shown in the store (`{ "local": "Chest" }`).
- Never edit `src/App.tsx`, `src/index.tsx`, `webpack.config.js`; `src/index.tsx` must stay a
  dynamic import — the engine profile shares React, three and `@mexty/engine` as non-eager singletons
  with the game host, which is what lets this primitive live inside the host's scene.
