import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';

type AvatarState = {
  dress: string;
  shoes: string;
  accessories: string;
  skinColor: string;
};

function GLTFModel({ avatar, url }: { avatar: AvatarState; url: string }) {
  // Expect a model at provided url with meshes named roughly: Skin, Dress, Shoes, Accessories
  const { scene } = useGLTF(url, true);

  // Apply simple material overrides by name (best-effort; harmless if names don't match)
  useMemo(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        const name = (obj.name || '').toLowerCase();
        if (name.includes('skin')) {
          obj.material.color?.set(avatar.skinColor);
        }
        if (name.includes('dress') || name.includes('top') || name.includes('shirt') || name.includes('hoodie')) {
          // set a color per dress type
          const color = avatar.dress === 'hoodie' ? '#3b82f6' : avatar.dress === 't-shirt' ? '#ef4444' : '#6b7280';
          obj.material.color?.set(color);
        }
        if (name.includes('shoe') || name.includes('shoes') || name.includes('boot')) {
          obj.material.color?.set(avatar.shoes === 'boots' ? '#4b5563' : '#ffffff');
        }
        if (name.includes('glasses') || name.includes('headband') || name.includes('accessory')) {
          obj.visible = avatar.accessories !== 'none';
        }
      }
    });
  }, [scene, avatar]);

  return <primitive object={scene} />;
}

function FallbackAvatar({ avatar }: { avatar: AvatarState }) {
  // Minimal stylized fallback using primitives if GLTF not present
  return (
    <group position={[0, -1.0, 0]}>
      {/* Head */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color={avatar.skinColor} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.18, 1.05, 0.52]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.18, 1.05, 0.52]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {/* Body (dress) */}
      <mesh position={[0, 0.0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 1.4, 32]} />
        <meshStandardMaterial color={avatar.dress === 'hoodie' ? '#3b82f6' : avatar.dress === 't-shirt' ? '#ef4444' : '#6b7280'} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.65, 0.4, 0]}>
        <boxGeometry args={[0.3, 0.9, 0.3]} />
        <meshStandardMaterial color={avatar.skinColor} />
      </mesh>
      <mesh position={[0.65, 0.4, 0]}>
        <boxGeometry args={[0.3, 0.9, 0.3]} />
        <meshStandardMaterial color={avatar.skinColor} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.22, -0.9, 0.2]}>
        <boxGeometry args={[0.32, 0.18, 0.55]} />
        <meshStandardMaterial color={avatar.shoes === 'boots' ? '#4b5563' : '#ffffff'} />
      </mesh>
      <mesh position={[0.22, -0.9, 0.2]}>
        <boxGeometry args={[0.32, 0.18, 0.55]} />
        <meshStandardMaterial color={avatar.shoes === 'boots' ? '#4b5563' : '#ffffff'} />
      </mesh>
      {/* Accessory (glasses) */}
      {avatar.accessories === 'glasses' && (
        <mesh position={[0, 1.0, 0.5]}>
          <torusGeometry args={[0.25, 0.04, 16, 100]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      )}
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
    </group>
  );
}

export default function Avatar3D({ avatar }: { avatar: AvatarState }) {

  return (
    <div className="w-full h-96 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl">
      <Canvas camera={{ position: [0, 1.2, 6], fov: 50 }} shadows>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.4} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        <Environment preset="city" />
        {/* Always render the stylized fallback avatar (no external model) */}
        <FallbackAvatar avatar={avatar} />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}
