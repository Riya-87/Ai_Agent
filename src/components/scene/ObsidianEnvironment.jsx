import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Obsidian Void Environment & Studio Lighting
 * Matching the deep black backdrop and cyber neon highlights from the reference image.
 */
export function ObsidianEnvironment({ isThinking = false, lightingTheme = 'cyber' }) {
  const spotRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (spotRef.current) {
      spotRef.current.intensity = isThinking
        ? 3.6 + Math.sin(t * 8) * 0.5
        : 2.8;
    }
  });

  return (
    <>
      {/* 1. Deep Obsidian Void Background & Fog */}
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 12, 30]} />

      {/* 2. Soft Ambient Lighting */}
      <ambientLight intensity={0.4} color="#151224" />

      {/* 3. Top Key Spotlight hitting the catwalk & coins */}
      <spotLight
        ref={spotRef}
        position={[2, 12, 4]}
        target-position={[2, 2, 0]}
        intensity={2.8}
        angle={Math.PI / 4.5}
        penumbra={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* 4. Violet Neon Rim Light for specular edges on coins & track */}
      <pointLight
        position={[-4, 4, -3]}
        intensity={2.2}
        distance={12}
        color="#c026d3"
      />

      {/* 5. Cool Cyan Fill Light */}
      <directionalLight
        position={[-6, 6, 6]}
        intensity={0.35}
        color="#38bdf8"
      />

      {/* 6. Dark Ground Plane with subtle reflection */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.68, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#040407"
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>
    </>
  );
}
