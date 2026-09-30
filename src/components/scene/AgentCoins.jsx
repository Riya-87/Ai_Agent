import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Individual Metallic Agent Coin on the Track
 */
function SingleCoin({
  position,
  rotation = [0, 0, 0],
  emblem = 'neural',
  isSelected = false,
  onClick,
  isThinking = false,
}) {
  const coinRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coinRef.current) {
      // Gentle floating bob
      const bob = Math.sin(t * 2 + position[0]) * 0.05;
      coinRef.current.position.y = position[1] + bob;

      // Subtle slow rotation or fast spin when thinking / selected
      if (isSelected || isThinking) {
        coinRef.current.rotation.y += 0.035;
      } else if (hovered) {
        coinRef.current.rotation.y += 0.02;
      } else {
        coinRef.current.rotation.y = rotation[1] + Math.sin(t * 0.8) * 0.15;
      }
    }
  });

  const emblemColors = {
    neural: { rim: '#d946ef', emissive: '#c026d3', label: 'AI' },
    web: { rim: '#38bdf8', emissive: '#0284c7', label: 'WEB' },
    wiki: { rim: '#a855f7', emissive: '#7e22ce', label: 'WIKI' },
    math: { rim: '#f59e0b', emissive: '#d97706', label: 'MATH' },
  }[emblem] || { rim: '#d946ef', emissive: '#c026d3', label: 'AI' };

  return (
    <group
      ref={coinRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Main Coin Body (Thick Metallic Cylinder) */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.18, 48]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#252538' : '#141420'}
          roughness={0.12}
          metalness={0.95}
        />
      </mesh>

      {/* 2. Shiny Beveled Metallic Outer Rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.94, 0.045, 16, 48]} />
        <meshStandardMaterial
          color={isSelected ? emblemColors.rim : '#5a5a78'}
          emissive={isSelected ? emblemColors.emissive : '#000000'}
          emissiveIntensity={isSelected ? 0.8 : 0}
          roughness={0.1}
          metalness={0.98}
        />
      </mesh>

      {/* 3. Embossed Center Emblem (Pyramid / Diamond / Crest) */}
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial
          color={emblemColors.rim}
          emissive={emblemColors.emissive}
          emissiveIntensity={isSelected || isThinking ? 1.4 : 0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      <mesh position={[0, 0, -0.1]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial
          color={emblemColors.rim}
          emissive={emblemColors.emissive}
          emissiveIntensity={isSelected || isThinking ? 1.4 : 0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 4. Selection Aura Ring */}
      {isSelected && (
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 1.1, 32]} />
          <meshBasicMaterial
            color={emblemColors.rim}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Multiple Agent Coins along the Elevated Catwalk
 */
export function AgentCoins({
  selectedModel = 'neural',
  onSelectModel,
  isThinking = false,
}) {
  const coins = [
    {
      id: 'neural',
      pos: [2.6, 2.3, -0.9],
      rot: [0, -0.35, 0],
      emblem: 'neural',
      name: 'Nexus AI Core',
    },
    {
      id: 'intelligence',
      pos: [5.2, 2.7, -2.1],
      rot: [0, -0.75, 0],
      emblem: 'web',
      name: 'Tavily Web Agent',
    },
    {
      id: 'wiki',
      pos: [0.1, 1.9, -0.2],
      rot: [0, 0.1, 0],
      emblem: 'wiki',
      name: 'Wikipedia Knowledge',
    },
    {
      id: 'matrix',
      pos: [-2.2, 1.6, 0.4],
      rot: [0, 0.45, 0],
      emblem: 'math',
      name: 'Precision Math Core',
    },
  ];

  return (
    <group>
      {coins.map((coin) => (
        <SingleCoin
          key={coin.id}
          position={coin.pos}
          rotation={coin.rot}
          emblem={coin.emblem}
          isSelected={selectedModel === coin.id}
          isThinking={isThinking && selectedModel === coin.id}
          onClick={() => onSelectModel && onSelectModel(coin.id)}
        />
      ))}
    </group>
  );
}
