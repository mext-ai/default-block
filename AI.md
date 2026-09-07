# Working on a Mexty game block

This block is a **game host**: its code is structure, its props are the game.

- The props schema is `src/props.schema.json` (generated from `@mexty/engine-schema`). It is
  committed on purpose: the platform stores it as the block's props schema instead of inferring one,
  so never delete or hand-edit it. Regenerate it when you upgrade `@mexty/engine-schema`.
- To change the game — assets, characters, quests, triggers, texts — **save a new props variant**
  (`save_block_props`). Do not hardcode content in code.
- Assets: an entry in `assets` takes either a direct file URL or a **catalog reference**,
  `"ref": "asset:<id>"`. Prefer the catalog (`list_engine_assets`, or the picker in the props
  editor): the catalog carries the model's scale, whether it is rigged and its clip names, so a
  definition can say `clips: { walk: … }` only when it needs to override them. A `scale` or `clips`
  written in the definition always wins over the catalog.
- To add behaviour, prefer a **primitive block** (template `engine-primitive`) referenced from
  `primitives` as `{ "blockId": "<id>" }`. Primitives bundled here can be registered on `GameHost`
  as `localPrimitives` and referenced as `{ "local": "<name>" }`.
- Never edit `src/App.tsx`, `src/index.tsx`, `src/bootstrap.tsx`, `webpack.config.js` or
  `src/engine/federation.ts`: they are the federation contract. `src/index.tsx` must stay a dynamic
  import — the engine profile shares React and three as non-eager singletons.
- Analytics: `src/utils/blockTracker.ts` is passed to `GameHost` as `tracker`; quests and completion
  are reported automatically. Do not call it yourself for game events.
