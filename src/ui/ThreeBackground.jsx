import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

function FloatingTorus() {
  return (
    <mesh rotation={[0.8, 0.6, 0]}>
      <torusGeometry args={[1.2, 0.25, 24, 100]} />
      <meshStandardMaterial roughness={0.2} metalness={0.9} />
    </mesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="three-bg">
      <Canvas
        shadows
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        camera={{ position: [0, 1.5, 4], fov: 50 }}
        frameloop="demand" // reduces CPU—use requestRender when needed
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <FloatingTorus />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}
