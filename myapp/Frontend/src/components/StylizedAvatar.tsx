/// <reference types="@react-three/fiber" />
import React from 'react';
import { Group } from 'three';
import { UserProfile } from '../App';

interface StylizedAvatarProps {
  avatar: UserProfile['avatar'];
}

// High-poly, smooth torso with a modern sweater look
function Torso({ top }: { top: string }) {
  const colors: { [key: string]: string } = {
    'hoodie': '#5A9BD5',
    't-shirt': '#E8647C',
    'jacket': '#3D3D3D',
    'varsity-jacket': '#8B4513',
    'patterned-sweater': '#BDB76B',
  };
  return (
    <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.7, 1, 2.5, 64]} />
      <meshStandardMaterial 
        color={colors[top] || '#5A9BD5'} 
        roughness={0.7} 
        metalness={0.1}
      />
    </mesh>
  );
}

// Smooth, stylized hair with volume
function Hair({ style }: { style: string }) {
  const hairMaterial = <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />;
  
  switch (style) {
    case 'long-wavy':
      return (
        <group>
          <mesh position={[0, 0.6, 0]} castShadow>{/* Base shape */}
            <sphereGeometry args={[1.1, 64, 64, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
            {hairMaterial}
          </mesh>
          <mesh position={[0, -0.5, 0]} castShadow>{/* Lower volume */}
            <cylinderGeometry args={[1.1, 1.2, 1.5, 64]} />
            {hairMaterial}
          </mesh>
        </group>
      );
    // Other hair styles can be refined here...
    default: // short-modern
      return (
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[1.05, 64, 64]} />
          {hairMaterial}
        </mesh>
      );
  }
}

// Large, expressive eyes with depth and reflections
function Eyes({ style }: { style: string }) {
    return (
        <group>
            {/* Eye Sockets */}
            <mesh position={[-0.35, 0.25, 0.8]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color="#111" roughness={0.1} />
            </mesh>
            <mesh position={[0.35, 0.25, 0.8]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color="#111" roughness={0.1} />
            </mesh>
            {/* Irises */}
            <mesh position={[-0.35, 0.25, 0.88]}>
                <sphereGeometry args={[0.18, 32, 32]} />
                <meshStandardMaterial color="royalblue" roughness={0.2} metalness={0.5} />
            </mesh>
            <mesh position={[0.35, 0.25, 0.88]}>
                <sphereGeometry args={[0.18, 32, 32]} />
                <meshStandardMaterial color="royalblue" roughness={0.2} metalness={0.5} />
            </mesh>
            {/* Pupils */}
            <mesh position={[-0.35, 0.25, 0.95]}>
                <sphereGeometry args={[0.09, 32, 32]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.35, 0.25, 0.95]}>
                <sphereGeometry args={[0.09, 32, 32]} />
                <meshStandardMaterial color="black" />
            </mesh>
            {/* Highlights */}
            <mesh position={[-0.4, 0.35, 1.0]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color="white" />
            </mesh>
            <mesh position={[0.3, 0.35, 1.0]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color="white" />
            </mesh>
        </group>
    );
}

// Smooth, high-poly head with soft skin material
function Head({ skinTone, eyes }: { skinTone: string, eyes: string }) {
    const colors: { [key: string]: string } = {
        'light': '#FCD5B4',
        'medium': '#E1B899',
        'dark': '#A0755B'
    };
  return (
    <group>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
            color={colors[skinTone] || '#FCD5B4'} 
            roughness={0.6} 
            metalness={0.0}
        />
      </mesh>
      <Eyes style={eyes} />
    </group>
  );
}

function Accessories({ items }: { items: string[] }) {
    return (
        <group>
            {/* BCI Headset - new futuristic accessory */}
            {items.includes('bci-headset') && (
                <group>
                    <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.1]}>
                        <torusGeometry args={[1.06, 0.03, 16, 100]} />
                        <meshStandardMaterial color="white" emissive="cyan" emissiveIntensity={1.5} roughness={0.1} metalness={0.8} />
                    </mesh>
                     <mesh position={[0.8, 0.9, 0.7]} >
                        <boxGeometry args={[0.1, 0.1, 0.3]} />
                        <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={2} />
                    </mesh>
                </group>
            )}
            {/* Other accessories can be refined here... */}
        </group>
    )
}

// The complete avatar model
export function StylizedAvatar({ avatar }: StylizedAvatarProps) {
  return (
    <group rotation={[0, Math.PI, 0]} scale={1.2}>
      <Head skinTone={avatar.skinTone} eyes={avatar.eyes} />
      <Hair style={avatar.hair} />
      <Torso top={avatar.top} />
      <Accessories items={avatar.accessories} />
    </group>
  );
}
