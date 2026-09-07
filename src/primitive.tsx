import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useAnimationController, useEntity, useInteractable, type PrimitiveProps } from "@mexty/engine";
import manifest from "./manifest.json";

/**
 * Chest — a primitive block.
 *
 * A game host mounts this for every entity whose primitive alias points at
 * this block. It receives the entity record, registers itself so the action
 * interpreter can drive it (here: an animation port whose `open` / `close`
 * clips are procedural — the lid swings on a hinge), and makes the entity
 * interactable so a nearby player pressing E emits `entity:interact`. What
 * happens next (the lid opening, a key being given, a quest advancing) is the
 * game definition's business, not this file's.
 */
export { manifest };

interface ChestProps {
  prompt?: string;
  radius?: number;
  color?: string;
  trimColor?: string;
  size?: number;
}

const OPEN_ANGLE = -1.9;

export default function Chest({ entity }: PrimitiveProps) {
  const { objectRef } = useEntity(entity.id);
  const p = entity.props as ChestProps;
  useInteractable(entity.id, { radius: p.radius ?? 2.5, prompt: p.prompt ?? "open the chest", enabled: entity.enabled });

  const lid = useRef<Group>(null);
  const angle = useRef(entity.state === "open" ? OPEN_ANGLE : 0);
  const target = useRef(angle.current);
  const settle = useRef<(() => void) | null>(null);

  useFrame((_, dt) => {
    const a = angle.current;
    const t = target.current;
    if (Math.abs(a - t) < 0.01) {
      if (a !== t) {
        angle.current = t;
        if (lid.current) lid.current.rotation.x = t;
      }
      settle.current?.();
      settle.current = null;
      return;
    }
    angle.current = a + (t - a) * Math.min(1, dt * 6);
    if (lid.current) lid.current.rotation.x = angle.current;
  });

  const swingTo = (value: number) =>
    new Promise<void>((resolve) => {
      target.current = value;
      settle.current = resolve;
    });

  useAnimationController(entity.id, {
    actions: {},
    names: [],
    procedural: { open: () => swingTo(OPEN_ANGLE), close: () => swingTo(0) },
  });

  const color = p.color ?? "#8b5a2b";
  const trim = p.trimColor ?? "#d4af37";
  const open = entity.state === "open";
  const { position, rotation } = entity.transform;

  return (
    <group ref={objectRef} position={position} rotation={rotation} scale={p.size ?? 1}>
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[1.2, 0.7, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.72, 0.82]} />
          <meshStandardMaterial color={trim} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <group ref={lid} position={[0, 0.7, -0.4]} rotation={[angle.current, 0, 0]}>
        <mesh castShadow position={[0, 0.15, 0.4]}>
          <boxGeometry args={[1.24, 0.3, 0.84]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.16, 0.83]}>
          <boxGeometry args={[0.2, 0.2, 0.06]} />
          <meshStandardMaterial color={trim} metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {open ? (
        <pointLight position={[0, 0.6, 0]} intensity={2.5} distance={3} color="#ffd27a" />
      ) : null}
    </group>
  );
}
