import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { StylizedAvatar } from './StylizedAvatar';
import { UserProfile } from '../App';

interface Avatar3DProps {
  avatar: UserProfile['avatar'];
}

export function Avatar3D({ avatar }: Avatar3DProps) {
  return (
    <div className="w-full h-96 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Suspense fallback={null}>
          <group position={[0, -1.5, 0]}>
            <StylizedAvatar avatar={avatar} />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2.5} />
      </Canvas>
    </div>
  );
}
