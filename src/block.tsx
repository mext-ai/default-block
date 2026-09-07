import React from "react";
import { GameHost } from "@mexty/engine";
import type { GameDefinition } from "@mexty/engine-schema";
import BlockTracker from "./utils/blockTracker";
import { loadRemote, resolvePrimitive } from "./engine/federation";

/**
 * A Mexty game.
 *
 * This block has no content of its own: its props ARE the game definition
 * (see src/props.schema.json — assets, primitives, player, scene, quests,
 * triggers, HUD, completion). Change the game by saving a new props variant,
 * not by editing code. New behaviour comes from primitive blocks referenced
 * in `primitives`, or from local primitives bundled next to this file.
 */
type BlockProps = GameDefinition;

const tracker = new BlockTracker();

export const Block: React.FC<BlockProps> = (props) => (
  <GameHost
    definition={props}
    tracker={tracker}
    loadRemote={loadRemote}
    resolvePrimitive={resolvePrimitive}
    style={{ width: "100vw", height: "100vh" }}
  />
);
