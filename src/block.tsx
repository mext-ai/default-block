import React from "react";
import { GameHost } from "@mexty/engine";
import type { GameDefinition } from "@mexty/engine-schema";
import BlockTracker from "./utils/blockTracker";
import Chest from "./primitive";
import { resolveAssets } from "./engine/catalog";

/**
 * A primitive block is still a normal block in the store, so its props are a
 * game definition like a game host's (see src/props.schema.json) — a small game
 * rendered around the primitive, which the definition references as
 * `{ "local": "Chest" }`. Save a variant to change that preview; without one
 * the default below plays. A game host never uses this file: it mounts the
 * `./Primitive` export for its own entities, with the props declared in
 * src/manifest.json.
 */
type BlockProps = Partial<GameDefinition>;

const tracker = new BlockTracker();

/** The preview played when no props variant is saved. */
export const defaultPreview: GameDefinition = {
  schemaVersion: 1,
  meta: { title: "Chest preview", description: "Walk up to the chest and press E." },
  settings: { physics: "rapier", background: "#0b1020", ambientLight: 0.7 },
  assets: {},
  primitives: {
    Character: { builtin: "character" },
    Ground: { builtin: "ground" },
    Sky: { builtin: "sky" },
    Sun: { builtin: "light" },
    Chest: { local: "Chest" },
  },
  player: { entityId: "hero", camera: "third-person", speed: 4, spawn: [0, 1, 5] },
  scene: {
    entities: [
      { id: "sky", primitive: "Sky" },
      { id: "sun", primitive: "Sun", transform: { position: [8, 12, 6] } },
      { id: "ground", primitive: "Ground", props: { size: 40, color: "#3b7a3b" } },
      { id: "hero", primitive: "Character", tags: ["player"] },
      {
        id: "chest",
        primitive: "Chest",
        transform: { position: [0, 0, -4], rotation: [0, 0.3, 0] },
        state: "closed",
        props: { prompt: "open the chest", radius: 2.5, color: "#8b5a2b", trimColor: "#d4af37", size: 1 },
      },
    ],
  },
  quests: [
    {
      id: "q",
      title: "Try the chest",
      autoStart: true,
      objectives: [{ id: "open", type: "interact", target: "chest", text: "Open the chest", reward: { score: 1 } }],
    },
  ],
  triggers: [
    {
      id: "open",
      on: { event: "entity:interact", source: "chest" },
      if: [{ entityState: { target: "chest", state: "closed" } }],
      do: [
        { type: "playAnimation", target: "chest", clip: "open" },
        { type: "setState", target: "chest", state: "open" },
      ],
      once: true,
    },
  ],
  hud: { objectives: true, score: false, interactPrompt: true, controlsHint: "WASD to move · E to interact" },
  completion: { when: "allQuests", successText: "It opens!" },
};

const hasDefinition = (props: BlockProps) => Boolean(props && Object.keys(props).length > 0);

export const Block: React.FC<BlockProps> = (props) => (
  <GameHost
    definition={hasDefinition(props) ? props : defaultPreview}
    tracker={tracker}
    localPrimitives={{ Chest }}
    resolveAssets={resolveAssets}
    style={{ width: "100vw", height: "100vh" }}
  />
);
