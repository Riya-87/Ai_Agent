import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ObsidianEnvironment } from './ObsidianEnvironment';
import { GeometricTrack } from './GeometricTrack';
import { AgentCoins } from './AgentCoins';
import { NeonPortalPedestal } from './NeonPortalPedestal';

/**
 * Camera Controller for smooth camera transitions
 */
function CameraRig({ cameraPreset = 'studio' }) {
  const controlsRef = useRef();

  const presets = {
    studio: { pos: [-2.2, 2.8, 9.2], target: [1.2, 1.2, 0] },
    coins: { pos: [2.5, 3.2, 3.8], target: [2.6, 2.3, -0.9] },
    portal: { pos: [3.2, 2.8, 6.5], target: [3.2, -0.65, 3.2] },
    cinematic: { pos: [-6.5, 3.5, 7.0], target: [1.5, 1.5, 0] },
    top: { pos: [1.0, 11.0, 2.5], target: [1.2, 0.5, 0] },
  };

  const currentConfig = presets[cameraPreset] || presets.studio;
  const targetPos = useRef(new THREE.Vector3(...currentConfig.pos));
  const targetLook = useRef(new THREE.Vector3(...currentConfig.target));

  useEffect(() => {
    targetPos.current.set(...currentConfig.pos);
    targetLook.current.set(...currentConfig.target);
  }, [cameraPreset]);

  useFrame(({ camera }) => {
    camera.position.lerp(targetPos.current, 0.05);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3.0}
      maxDistance={18}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minPolarAngle={Math.PI / 8}
    />
  );
}

export function SceneCanvas({
  selectedModel = 'neural',
  onSelectModel,
  isThinking = false,
  activeTool = null,
  lightingTheme = 'cyber',
  cameraPreset = 'studio',
}) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      <Canvas
        shadows
        camera={{ position: [-2.2, 2.8, 9.2], fov: 42 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 2]}
      >
        <CameraRig cameraPreset={cameraPreset} />

        {/* 1. Obsidian Void Background & Neon Lighting */}
        <ObsidianEnvironment
          isThinking={isThinking}
          lightingTheme={lightingTheme}
        />

        {/* 2. Elevated Curved Geometric Diamond-Grid Catwalk */}
        <GeometricTrack />

        {/* 3. Floating Metallic Agent Tokens along Track */}
        <AgentCoins
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
          isThinking={isThinking}
        />

        {/* 4. Glowing Liquid Neon Magenta Floor Portal Pedestal */}
        <NeonPortalPedestal
          isThinking={isThinking}
          activeTool={activeTool}
        />
      </Canvas>
    </div>
  );
}
