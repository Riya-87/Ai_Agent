import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Interactive 3D Centerpieces displayed on the Marble Podium:
 * - Neural Core (Autonomous Agent)
 * - Quantum Lattice (Compute & Logic)
 * - Web Intelligence Globe (Tavily & Wikipedia)
 * - Cyber Matrix (Multi-Tool Dispatcher)
 */
export function AgentCenterpiece({
  modelType = 'neural',
  isThinking = false,
  activeTool = null,
}) {
  const groupRef = useRef();
  const innerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const particlesRef = useRef();

  // Particle positions for orbiting particle halo
  const particleCount = 140;
  const [particlesPos, particlesInit] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const init = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.4 + Math.random() * 0.9;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      init[i * 3] = pos[i * 3];
      init[i * 3 + 1] = pos[i * 3 + 1];
      init[i * 3 + 2] = pos[i * 3 + 2];
    }
    return [pos, init];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speed = isThinking ? 2.8 : 1.0;

    // Floating bobbing motion on the podium
    if (groupRef.current) {
      groupRef.current.position.y = 1.25 + Math.sin(t * 1.5) * 0.08;
      groupRef.current.rotation.y = t * 0.25 * speed;
    }

    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.4 * speed;
      innerRef.current.rotation.z = t * 0.3 * speed;
      const pulse = isThinking ? (1 + Math.sin(t * 8) * 0.15) : 1;
      innerRef.current.scale.set(pulse, pulse, pulse);
    }

    // Rings rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.8) * 0.2;
      ring1Ref.current.rotation.y = t * 0.5 * speed;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -Math.PI / 4 + Math.cos(t * 0.7) * 0.2;
      ring2Ref.current.rotation.z = -t * 0.6 * speed;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = Math.PI / 2 + Math.sin(t * 0.6) * 0.15;
      ring3Ref.current.rotation.x = t * 0.45 * speed;
    }

    // Particles pulse
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const wave = Math.sin(t * 3 + i * 0.2) * (isThinking ? 0.35 : 0.1);
        positions[idx] = particlesInit[idx] * (1 + wave);
        positions[idx + 1] = particlesInit[idx + 1] * (1 + wave);
        positions[idx + 2] = particlesInit[idx + 2] * (1 + wave);
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Emissive color based on active tool or thinking state
  const emissiveColor = useMemo(() => {
    if (activeTool === 'Wikipedia') return '#00f2fe';
    if (activeTool === 'Tavily Search') return '#3a86ff';
    if (activeTool === 'Add' || activeTool === 'Multiply') return '#f72585';
    if (isThinking) return '#00f2fe';
    return '#4361ee';
  }, [activeTool, isThinking]);

  return (
    <group ref={groupRef} position={[0, 1.25, 0]}>
      {/* 1. Core Models */}
      {modelType === 'neural' && (
        <group>
          {/* Inner Glowing Crystal Core */}
          <mesh ref={innerRef}>
            <octahedronGeometry args={[0.65, 0]} />
            <meshStandardMaterial
              color="#00f2fe"
              emissive={emissiveColor}
              emissiveIntensity={isThinking ? 1.5 : 0.6}
              roughness={0.1}
              metalness={0.9}
              wireframe={false}
            />
          </mesh>

          {/* Outer Wireframe Icosahedron */}
          <mesh>
            <icosahedronGeometry args={[1.05, 1]} />
            <meshStandardMaterial
              color="#4361ee"
              wireframe
              transparent
              opacity={0.5}
              emissive="#3a86ff"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      )}

      {modelType === 'quantum' && (
        <group>
          {/* Central Quantum Cube */}
          <mesh ref={innerRef}>
            <boxGeometry args={[0.75, 0.75, 0.75]} />
            <meshStandardMaterial
              color="#7928ca"
              emissive="#7928ca"
              emissiveIntensity={isThinking ? 1.6 : 0.7}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Wireframe outer cage */}
          <mesh>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial
              color="#00f2fe"
              wireframe
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}

      {modelType === 'intelligence' && (
        <group>
          {/* Glowing Sphere Core */}
          <mesh ref={innerRef}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshStandardMaterial
              color="#3a86ff"
              emissive={emissiveColor}
              emissiveIntensity={isThinking ? 1.8 : 0.7}
              roughness={0.15}
              metalness={0.85}
            />
          </mesh>

          {/* Wireframe Globe Coordinates */}
          <mesh>
            <sphereGeometry args={[1.05, 18, 18]} />
            <meshStandardMaterial
              color="#00f2fe"
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      )}

      {modelType === 'matrix' && (
        <group>
          {/* Torus Knot Core */}
          <mesh ref={innerRef}>
            <torusKnotGeometry args={[0.5, 0.16, 64, 16]} />
            <meshStandardMaterial
              color="#d97746"
              emissive="#d97746"
              emissiveIntensity={isThinking ? 1.8 : 0.6}
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>

          <mesh>
            <dodecahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial
              color="#4361ee"
              wireframe
              transparent
              opacity={0.45}
            />
          </mesh>
        </group>
      )}

      {/* 2. Gyroscopic Orbiting Energy Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.35, 0.022, 16, 64]} />
        <meshStandardMaterial
          color="#00f2fe"
          emissive="#00f2fe"
          emissiveIntensity={isThinking ? 1.4 : 0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.5, 0.018, 16, 64]} />
        <meshStandardMaterial
          color="#d97746"
          emissive="#d97746"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.65, 0.015, 16, 64]} />
        <meshStandardMaterial
          color="#4361ee"
          emissive="#4361ee"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Orbiting Particle Cloud */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlesPos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color={isThinking ? '#00f2fe' : '#8da9fc'}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 4. Podium Floor Glow Projection */}
      <mesh position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial
          color={emissiveColor}
          transparent
          opacity={isThinking ? 0.35 : 0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
