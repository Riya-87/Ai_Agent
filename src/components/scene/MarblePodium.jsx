import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createProceduralMarbleTexture } from '../../utils/proceduralMarble';

/**
 * 3D Marble Studio Podium component matching reference image:
 * - Circular white veined marble pedestal
 * - Semicircular elevated marble back tier
 * - Metallic terracotta/copper curved accent ribbon on the right end
 * - Subtle inner glow and floor reflection rings
 */
export function MarblePodium({ lightingTheme = 'studio' }) {
  // Generate high-res procedural marble texture
  const marbleTexture = useMemo(() => createProceduralMarbleTexture(1024, 1024), []);
  const marbleBump = useMemo(() => {
    const tex = marbleTexture.clone();
    tex.needsUpdate = true;
    return tex;
  }, [marbleTexture]);

  // Procedural Curved Back Wall Geometry
  const curvedWallGeometry = useMemo(() => {
    // Semicircular arc from ~140 deg to 360 deg
    const innerRadius = 3.65;
    const outerRadius = 4.3;
    const height = 0.85;
    const startAngle = Math.PI * 0.72; // ~130 deg
    const angleLength = Math.PI * 1.05; // ~190 deg arc
    const segments = 48;

    const shape = new THREE.Shape();
    // Generate arc cross section
    for (let i = 0; i <= segments; i++) {
      const theta = startAngle + (i / segments) * angleLength;
      const x = Math.cos(theta) * outerRadius;
      const y = Math.sin(theta) * outerRadius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    for (let i = segments; i >= 0; i--) {
      const theta = startAngle + (i / segments) * angleLength;
      const x = Math.cos(theta) * innerRadius;
      const y = Math.sin(theta) * innerRadius;
      shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelOffset: 0,
      bevelSegments: 4,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  // Copper Ribbon Accent Geometry (wrapping around right terminus of the curved back wall)
  const copperRibbonGeometry = useMemo(() => {
    const radius = 4.34;
    const startAngle = Math.PI * 1.73; // right end of arc
    const sweepAngle = Math.PI * 0.16; // wraps around the right tip
    const height = 0.96;
    const thickness = 0.08;
    const segments = 24;

    const shape = new THREE.Shape();
    for (let i = 0; i <= segments; i++) {
      const theta = startAngle + (i / segments) * sweepAngle;
      const x = Math.cos(theta) * (radius + thickness);
      const y = Math.sin(theta) * (radius + thickness);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    for (let i = segments; i >= 0; i--) {
      const theta = startAngle + (i / segments) * sweepAngle;
      const x = Math.cos(theta) * (radius - thickness);
      const y = Math.sin(theta) * (radius - thickness);
      shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  return (
    <group position={[0, -0.2, 0]}>
      {/* 1. Main Circular Marble Pedestal */}
      <group position={[0, 0.22, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[3.45, 3.5, 0.44, 64]} />
          <meshStandardMaterial
            map={marbleTexture}
            bumpMap={marbleBump}
            bumpScale={0.015}
            roughness={0.18}
            metalness={0.05}
            color="#ffffff"
          />
        </mesh>

        {/* Subtle Bevel Ring around top perimeter of pedestal */}
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.46, 64]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* 2. Elevated Semicircular Marble Back Tier */}
      <mesh
        geometry={curvedWallGeometry}
        position={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={marbleTexture}
          bumpMap={marbleBump}
          bumpScale={0.012}
          roughness={0.22}
          metalness={0.04}
          color="#ffffff"
        />
      </mesh>

      {/* 3. Metallic Copper/Terracotta Curved Ribbon Accent */}
      <mesh
        geometry={copperRibbonGeometry}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#d97746"
          roughness={0.25}
          metalness={0.88}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* 4. Floor Inner Ambient Glow Seam under the back curved tier */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.55, 3.75, 48, 1, Math.PI * 0.72, Math.PI * 1.05]} />
        <meshBasicMaterial
          color="#4361ee"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Concentric Shadow/Detail Floor Rings */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.8, 3.84, 64]} />
        <meshBasicMaterial
          color="#06091e"
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 4.63, 64]} />
        <meshBasicMaterial
          color="#1e295f"
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}
