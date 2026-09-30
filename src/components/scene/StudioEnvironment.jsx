import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Studio Lighting & Environment matching the uploaded reference image:
 * - Rich royal cobalt blue atmosphere
 * - Focused overhead key spotlight on the marble platform
 * - Electric blue rim & edge lights highlighting the back tier
 * - Subtle ground reflection and soft contact shadow
 */
export function StudioEnvironment({ lightingTheme = 'studio', isThinking = false }) {
  const spotLightRef = useRef();
  const rimLightRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (spotLightRef.current) {
      if (isThinking) {
        spotLightRef.current.intensity = 3.2 + Math.sin(t * 8) * 0.6;
      } else {
        spotLightRef.current.intensity = 2.8;
      }
    }
  });

  // Color configurations based on lightingTheme
  const themeColors = {
    studio: {
      ambient: '#141e52',
      spot: '#ffffff',
      rim: '#3a86ff',
      copperRim: '#fca311',
      bg: '#0a0e29',
    },
    cyber: {
      ambient: '#0b1338',
      spot: '#00f2fe',
      rim: '#7928ca',
      copperRim: '#ff007f',
      bg: '#050716',
    },
    warm: {
      ambient: '#2b1b3d',
      spot: '#fff3d1',
      rim: '#e07a5f',
      copperRim: '#f2cc8f',
      bg: '#120d24',
    }
  }[lightingTheme] || {
    ambient: '#141e52',
    spot: '#ffffff',
    rim: '#3a86ff',
    copperRim: '#fca311',
    bg: '#0a0e29',
  };

  return (
    <>
      {/* Deep Rich Cobalt Blue Studio Background Color */}
      <color attach="background" args={[themeColors.bg]} />
      <fog attach="fog" args={[themeColors.bg, 14, 30]} />

      {/* 1. Ambient Lighting */}
      <ambientLight intensity={0.7} color={themeColors.ambient} />

      {/* 2. Focused Overhead Key Spotlight hitting the center marble podium */}
      <spotLight
        ref={spotLightRef}
        position={[0, 10, 2]}
        target-position={[0, 0, 0]}
        intensity={2.8}
        angle={Math.PI / 5.2}
        penumbra={0.7}
        color={themeColors.spot}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* 3. Electric Blue Back Rim Light (creates the blue glow on the curved marble tier) */}
      <pointLight
        ref={rimLightRef}
        position={[0, 1.2, -3.8]}
        intensity={isThinking ? 4.5 : 2.6}
        distance={9}
        color={themeColors.rim}
      />

      {/* 4. Warm Accent Light illuminating the Copper Ribbon */}
      <pointLight
        position={[3.8, 0.8, 1.5]}
        intensity={1.8}
        distance={6}
        color={themeColors.copperRim}
      />

      {/* 5. Left Fill Light */}
      <directionalLight
        position={[-8, 6, 5]}
        intensity={0.4}
        color="#8da9fc"
      />

      {/* 6. Studio Floor Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.21, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#090d26"
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>

      {/* 7. Curved Studio Cyclorama Backdrop */}
      <mesh position={[0, 6, -12]}>
        <planeGeometry args={[50, 24]} />
        <meshBasicMaterial color={themeColors.bg} />
      </mesh>
    </>
  );
}
