import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Glowing Liquid Neon Magenta Floor Portal Pedestal
 * Recreating the glowing neon portal pad in the lower-right foreground from the reference image.
 */
export function NeonPortalPedestal({ isThinking = false, activeTool = null }) {
  const liquidMeshRef = useRef();
  const innerRingRef = useRef();
  const pointLightRef = useRef();

  // Create an organic wavy polygon shape for the liquid neon pool
  const baseShape = useMemo(() => {
    const shape = new THREE.Shape();
    const segments = 64;
    const radius = 1.4;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      // Initial smooth radius
      const r = radius;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    return new THREE.ShapeGeometry(shape, 32);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speed = isThinking ? 3.5 : 1.2;

    // Organic wavy liquid vertex displacement
    if (liquidMeshRef.current) {
      const pos = liquidMeshRef.current.geometry.attributes.position;
      const count = pos.count;
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        if (dist > 0.1) {
          const angle = Math.atan2(y, x);
          // 4-lobe organic wave + dynamic ripple
          const wave = Math.sin(angle * 5 + t * speed) * 0.08 + Math.cos(angle * 3 - t * 2) * 0.05;
          const newDist = 1.35 + wave;
          pos.setX(i, Math.cos(angle) * Math.min(dist, newDist));
          pos.setY(i, Math.sin(angle) * Math.min(dist, newDist));
        }
      }
      pos.needsUpdate = true;
    }

    // Concentric inner neon ring pulse
    if (innerRingRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.02;
      innerRingRef.current.scale.set(scale, scale, 1);
    }

    // Upward point light pulse
    if (pointLightRef.current) {
      pointLightRef.current.intensity = isThinking
        ? 4.5 + Math.sin(t * 8) * 0.8
        : 3.2 + Math.sin(t * 2) * 0.3;
    }
  });

  const glowColor = useMemo(() => {
    if (activeTool === 'Wikipedia') return '#a855f7';
    if (activeTool === 'Tavily Search') return '#38bdf8';
    if (activeTool === 'Add' || activeTool === 'Multiply') return '#f59e0b';
    return '#d946ef'; // Magenta neon from reference image
  }, [activeTool]);

  return (
    <group position={[3.2, -0.65, 3.2]} rotation={[-Math.PI / 2, 0, 0.2]}>
      {/* 1. Base Outer Dark Metallic Platform Disc */}
      <mesh position={[0, 0, -0.04]} receiveShadow>
        <circleGeometry args={[2.0, 64]} />
        <meshStandardMaterial
          color="#0d0d18"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Outer Thin Metallic Bevel Ring */}
      <mesh position={[0, 0, -0.02]}>
        <ringGeometry args={[1.92, 1.98, 64]} />
        <meshStandardMaterial
          color="#2e2e48"
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      {/* 3. Outer Neon Halo Rim Ring */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[1.75, 1.82, 64]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* 4. Secondary Concentric Neon Accent Ring */}
      <mesh ref={innerRingRef} position={[0, 0, 0.02]}>
        <ringGeometry args={[1.48, 1.54, 64]} />
        <meshBasicMaterial
          color="#f472b6"
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 5. Glowing Liquid Neon Core Pool (Organic Animated Center) */}
      <mesh ref={liquidMeshRef} geometry={baseShape} position={[0, 0, 0.03]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive={glowColor}
          emissiveIntensity={isThinking ? 2.5 : 1.8}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* 6. Soft Ambient Magenta Bloom Disc */}
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 7. Upward Neon Point Light Casting onto the Catwalk & Scene */}
      <pointLight
        ref={pointLightRef}
        position={[0, 0, 0.6]}
        distance={7.5}
        intensity={3.2}
        color={glowColor}
      />
    </group>
  );
}
