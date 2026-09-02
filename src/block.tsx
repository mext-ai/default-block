import React, { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, Environment, Text, Html } from "@react-three/drei";
import { EffectComposer, Bloom, LUT } from "@react-three/postprocessing";
import * as THREE from "three";

interface BlockProps {
  title?: string;
  description?: string;
  modelPath?: string;
  autoRotate?: boolean;
  playAnimations?: boolean;
  cameraPosition?: [number, number, number];
}

function CubeCascadeModel({ modelPath = "https://content.mext.app/block/mexty-m.glb", playAnimations = true, ...props }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, group);
  
  useEffect(() => {
    if (actions && names.length > 0 && playAnimations) {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.reset();
          action.play();
          action.setLoop(THREE.LoopRepeat, Infinity);
        }
      });
    }
    
    return () => {
      if (actions && names.length > 0) {
        names.forEach((name) => {
          const action = actions[name];
          if (action) {
            console.log(`Stopping animation: ${name}`);
            action.stop();
          }
        });
      }
    };
  }, [actions, names, playAnimations]);
  
  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
}

function Scene({ autoRotate = true, playAnimations = true }: { autoRotate: boolean, playAnimations?: boolean }) {
  return (
    <>
      {/* Ambient light so textures are always visible */}
      <ambientLight intensity={0.6} />
      {/* Key directional light from top-right front */}
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      {/* Fill light from the left */}
      <directionalLight position={[-4, 4, -4]} intensity={0.5} />
      {/* Rim / back light for depth */}
      <pointLight position={[0, -6, -6]} intensity={0.75} color="#88aaff" />
      {/* HDR environment for reflections and subtle image-based lighting */}
      <Environment preset="studio" />
      <EffectComposer>
        <Bloom mipmapBlur levels={9} intensity={2} luminanceThreshold={0.2} luminanceSmoothing={1} />
      </EffectComposer>
      <Suspense fallback={null}>
        <CubeCascadeModel position={[0, 0, 0]} playAnimations={playAnimations} />
      </Suspense>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        minDistance={2}
        maxDistance={15}
      />
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

export const Block: React.FC<BlockProps> = ({ 
  autoRotate = true,
  playAnimations = true,
  cameraPosition = [2, 0, 2]
}) => {
  return (
    <div className="relative w-screen h-screen">
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <Suspense fallback={
          <Html center>
            <LoadingSpinner />
          </Html>
        }>
          <Scene 
            autoRotate={autoRotate}
            playAnimations={playAnimations}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
