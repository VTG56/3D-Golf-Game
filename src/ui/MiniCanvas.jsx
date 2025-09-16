import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Balllike() {
  return (
    <mesh castShadow position={[0, 0.2, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

export default function MiniCanvas() {
  return (
    <div style={{ width: 300, height: 200 }}>
      <Canvas camera={{ position: [0, 0.8, 2], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} />
        <Suspense fallback={null}>
          <Balllike />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
