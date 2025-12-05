import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

type AvatarSlots = {
  top?: string;
  hair?: string;
  footwear?: string;
};

type Props = {
  avatar: AvatarSlots;
};

function BaseAvatar() {
  const { scene } = useGLTF('/models/BASE_AVATAR.glb', true);
  return <primitive object={scene} />;
}

function ModularAccessory({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(`/models/${modelPath}`, true);
  return <primitive object={scene} position={[0, 0, 0]} />;
}

export function AvatarDisplay({ avatar }: Props) {
  return (
    <div className="w-full h-80 rounded-lg border border-white/10">
      <Canvas camera={{ position: [0, 1.2, 4.5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[8, 12, 10]} angle={0.35} penumbra={1} intensity={1.2} />
        <Suspense fallback={null}>
          <BaseAvatar />
          {avatar.top && <ModularAccessory modelPath={`${avatar.top}.glb`} />}
          {avatar.hair && <ModularAccessory modelPath={`${avatar.hair}.glb`} />}
          {avatar.footwear && <ModularAccessory modelPath={`${avatar.footwear}.glb`} />}
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
