import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createProceduralGridTexture } from '../../utils/proceduralGrid';

/**
 * 3D Elevated Curved Geometric Lattice Catwalk Track
 * Faithfully recreating the black diamond-patterned catwalk from the reference image.
 */
export function GeometricTrack() {
  const gridTexture = useMemo(() => createProceduralGridTexture(1024, 1024), []);

  // Curved track shape (sweep arc across top-right of scene)
  const trackGeometry = useMemo(() => {
    const innerRadius = 5.2;
    const outerRadius = 7.4;
    const thickness = 0.18;
    const startAngle = Math.PI * 0.15;
    const sweepAngle = Math.PI * 0.95;
    const segments = 64;

    const shape = new THREE.Shape();
    for (let i = 0; i <= segments; i++) {
      const theta = startAngle + (i / segments) * sweepAngle;
      const x = Math.cos(theta) * outerRadius;
      const y = Math.sin(theta) * outerRadius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    for (let i = segments; i >= 0; i--) {
      const theta = startAngle + (i / segments) * sweepAngle;
      const x = Math.cos(theta) * innerRadius;
      const y = Math.sin(theta) * innerRadius;
      shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  // Sleek outer and inner guard rails
  const outerRailGeo = useMemo(() => {
    return new THREE.TorusGeometry(7.42, 0.045, 16, 64, Math.PI * 0.95);
  }, []);

  const innerRailGeo = useMemo(() => {
    return new THREE.TorusGeometry(5.18, 0.045, 16, 64, Math.PI * 0.95);
  }, []);

  return (
    <group position={[1.2, 1.4, -1.8]} rotation={[-0.22, 0.18, -0.15]}>
      {/* 1. Main Diamond Grid Catwalk Surface */}
      <mesh geometry={trackGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          map={gridTexture}
          bumpMap={gridTexture}
          bumpScale={0.03}
          roughness={0.25}
          metalness={0.85}
          color="#12121e"
        />
      </mesh>

      {/* 2. Outer Guard Rail */}
      <mesh
        geometry={outerRailGeo}
        position={[0, 0.16, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI * 0.15]}
      >
        <meshStandardMaterial
          color="#333348"
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      {/* 3. Inner Guard Rail */}
      <mesh
        geometry={innerRailGeo}
        position={[0, 0.16, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI * 0.15]}
      >
        <meshStandardMaterial
          color="#333348"
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      {/* 4. Subtle Purple Under-glow on Catwalk Bottom */}
      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI * 0.15]}
      >
        <ringGeometry args={[5.2, 7.4, 48, 1, 0, Math.PI * 0.95]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
