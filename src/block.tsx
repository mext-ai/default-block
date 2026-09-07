import React from "react";
import { GameHost } from "@mexty/engine";
import type { GameDefinition } from "@mexty/engine-schema";
import BlockTracker from "./utils/blockTracker";
import Chest from "./primitive";

/**
 * Standalone preview of the primitive, so it is still a normal block in the
 * store: a tiny game with one of these chests in it. A game host never uses
 * this; it mounts `./Primitive` for its own entities.
 */
type BlockProps = { prompt?: string; radius?: number; color?: string; trimColor?: string; size?: number };

const tracker = new BlockTracker();

const previewDefinition = (props: BlockProps): GameDefinition => ({
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
      { id: "chest", primitive: "Chest", transform: { position: [0, 0, -4], rotation: [0, 0.3, 0] }, state: "closed", props: { ...props } },
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
});

export const Block: React.FC<BlockProps> = (props) => (
  <GameHost definition={previewDefinition(props)} tracker={tracker} localPrimitives={{ Chest }} style={{ width: "100vw", height: "100vh" }} />
);
