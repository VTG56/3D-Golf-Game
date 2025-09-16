import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Cloud, Sphere, Box } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Golf Ball Component
function GolfBall({ position = [0, 2, 0] }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial color="white" roughness={0.1} metalness={0.1} />
    </mesh>
  );
}

// Tree Component
function Tree({ position, scale = 1 }) {
  const trunkRef = useRef();
  const leavesRef = useRef();
  
  useFrame((state) => {
    const wind = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    if (leavesRef.current) {
      leavesRef.current.rotation.z = wind * 0.1;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh ref={trunkRef} position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Leaves */}
      <mesh ref={leavesRef} position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

// Golf Course Terrain
function GolfTerrain() {
  const meshRef = useRef();
  
  // Create a more interesting terrain with some height variation
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 32, 32);
    const positions = geo.attributes.position.array;
    
    // Add some height variation
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += Math.random() * 0.5 - 0.25;
    }
    
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -1, 0]}
      receiveShadow
    >
      <meshStandardMaterial 
        color="#4ade80" 
        roughness={0.8} 
        metalness={0.1}
      />
    </mesh>
  );
}

// Rotating World Background
function RotatingWorld() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Far background sphere */}
      <Sphere args={[100]} scale={[-1, 1, 1]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Distant mountains/hills */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          args={[8, 6, 3]}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 40,
            1,
            Math.sin((i / 8) * Math.PI * 2) * 40
          ]}
        >
          <meshStandardMaterial color="#4ade80" opacity={0.6} transparent />
        </Box>
      ))}
    </group>
  );
}

// Floating Clouds
function FloatingClouds() {
  return (
    <>
      <Cloud
        opacity={0.5}
        speed={0.2}
        width={10}
        depth={1.5}
        segments={20}
        position={[15, 8, -10]}
        color="#ffffff"
      />
      <Cloud
        opacity={0.3}
        speed={0.3}
        width={8}
        depth={1}
        segments={15}
        position={[-20, 12, -15]}
        color="#ffffff"
      />
      <Cloud
        opacity={0.4}
        speed={0.1}
        width={12}
        depth={2}
        segments={25}
        position={[5, 10, -25]}
        color="#ffffff"
      />
    </>
  );
}

// Main Three.js Scene Component
export default function ThreeScene({ className = "" }) {
  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#4ade80" />
        
        {/* Sky */}
        <Sky
          sunPosition={[10, 20, 5]}
          inclination={0.6}
          azimuth={0.25}
          distance={1000}
          turbidity={8}
        />
        
        {/* 3D Elements */}
        <RotatingWorld />
        <GolfTerrain />
        <GolfBall />
        <FloatingClouds />
        
        {/* Trees scattered around */}
        <Tree position={[8, -1, -5]} scale={0.8} />
        <Tree position={[-6, -1, -8]} scale={1.2} />
        <Tree position={[12, -1, 3]} scale={0.9} />
        <Tree position={[-10, -1, 5]} scale={1.1} />
        <Tree position={[3, -1, -12]} scale={0.7} />
        
        {/* Camera Controls - disabled for landing page, can be enabled for interactive scenes */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}