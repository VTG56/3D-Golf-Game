import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useHeightfield } from '@react-three/cannon';
import * as THREE from 'three';

export default function Terrain({ level }) {
  const meshRef = useRef();
  const { terrain } = level;
  
  // Mobile-optimized subdivision (32x32 for good performance)
  const subdivisions = 32;
  const width = terrain.width || 20;
  const height = terrain.height || 20;

  // Generate heightfield data and geometry
  const { heightData, geometry } = useMemo(() => {
    // Create heightfield matrix for physics (subdivisions + 1)
    const heightMatrix = [];
    const tempHeightData = [];
    
    // Initialize flat terrain
    for (let i = 0; i <= subdivisions; i++) {
      heightMatrix[i] = [];
      for (let j = 0; j <= subdivisions; j++) {
        heightMatrix[i][j] = 0;
      }
    }

    // Create plane geometry with subdivisions
    const geom = new THREE.PlaneGeometry(width, height, subdivisions, subdivisions);
    const vertices = geom.attributes.position.array;
    
    // Apply slopes to heightfield and vertices
    if (terrain.slopes) {
      terrain.slopes.forEach(slope => {
        const slopeCenterX = slope.x;
        const slopeCenterZ = slope.z;
        const slopeWidth = slope.width || 2;
        const slopeHeight = slope.height || 2;
        const elevation = slope.elevation || 1;

        // Apply slope to heightfield matrix
        for (let i = 0; i <= subdivisions; i++) {
          for (let j = 0; j <= subdivisions; j++) {
            const x = (i / subdivisions - 0.5) * width;
            const z = (j / subdivisions - 0.5) * height;
            
            const distX = Math.abs(x - slopeCenterX);
            const distZ = Math.abs(z - slopeCenterZ);
            
            if (distX <= slopeWidth / 2 && distZ <= slopeHeight / 2) {
              const factorX = 1 - (distX / (slopeWidth / 2));
              const factorZ = 1 - (distZ / (slopeHeight / 2));
              const heightInfluence = Math.sin(factorX * Math.PI) * Math.sin(factorZ * Math.PI) * elevation;
              heightMatrix[i][j] += heightInfluence;
            }
          }
        }

        // Apply slope to geometry vertices
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const z = vertices[i + 1];
          
          const distX = Math.abs(x - slopeCenterX);
          const distZ = Math.abs(z - slopeCenterZ);
          
          if (distX <= slopeWidth / 2 && distZ <= slopeHeight / 2) {
            const factorX = 1 - (distX / (slopeWidth / 2));
            const factorZ = 1 - (distZ / (slopeHeight / 2));
            const heightInfluence = Math.sin(factorX * Math.PI) * Math.sin(factorZ * Math.PI) * elevation;
            vertices[i + 2] += heightInfluence; // Y coordinate
          }
        }
      });
    }

    // Add lightweight noise for natural variation
    const noiseScale = 0.1;
    const noiseStrength = 0.05;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      
      // Simple pseudo-random noise based on position
      const noise = (Math.sin(x * noiseScale) * Math.cos(z * noiseScale) + 
                     Math.sin(x * noiseScale * 2.1) * Math.cos(z * noiseScale * 1.9)) * noiseStrength;
      vertices[i + 2] += noise;
      
      // Update heightfield matrix with noise
      const heightfieldX = Math.floor(((x + width / 2) / width) * subdivisions);
      const heightfieldZ = Math.floor(((z + height / 2) / height) * subdivisions);
      
      if (heightfieldX >= 0 && heightfieldX <= subdivisions && 
          heightfieldZ >= 0 && heightfieldZ <= subdivisions) {
        heightMatrix[heightfieldX][heightfieldZ] += noise;
      }
    }

    // Update geometry attributes
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals(); // Smooth shading

    // Convert heightfield matrix to flat array for cannon-es
    for (let i = 0; i <= subdivisions; i++) {
      for (let j = 0; j <= subdivisions; j++) {
        tempHeightData.push(heightMatrix[i][j]);
      }
    }

    return {
      heightData: tempHeightData,
      geometry: geom
    };
  }, [terrain, width, height, subdivisions]);

  // Physics collider using heightfield
  const [ref] = useHeightfield(() => ({
    args: [
      heightData,
      {
        heightDataSideSize: subdivisions + 1,
        heightDataVertSize: subdivisions + 1,
        elementSize: width / subdivisions
      }
    ],
    rotation: [-Math.PI / 2, 0, 0], // Rotate to match Three.js plane orientation
    position: [0, 0, 0],
    type: 'Static'
  }));

  return (
    <group>
      {/* Main terrain mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]} // Rotate plane to be horizontal
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color="#4a7c59" // Grass green color
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Physics heightfield collider (invisible) */}
      <mesh ref={ref} visible={false}>
        <planeGeometry args={[width, height, subdivisions, subdivisions]} />
      </mesh>

      {/* Render obstacles if any */}
      {terrain.obstacles && terrain.obstacles.map((obstacle, index) => (
        <Obstacle 
          key={index}
          obstacle={obstacle}
          index={index}
        />
      ))}
    </group>
  );
}

// Simple obstacle component
function Obstacle({ obstacle, index }) {
  const scale = obstacle.scale || 1;
  
  // Different obstacle types
  const renderObstacle = () => {
    switch (obstacle.type) {
      case 'rock':
        return (
          <mesh
            position={[obstacle.x, 0.3 * scale, obstacle.z]}
            scale={[scale, scale, scale]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[0.3]} />
            <meshStandardMaterial color="#666666" roughness={0.9} />
          </mesh>
        );
        
      case 'tree':
        return (
          <group position={[obstacle.x, 0, obstacle.z]} scale={[scale, scale, scale]}>
            {/* Tree trunk */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 1]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 1.2, 0]} castShadow>
              <sphereGeometry args={[0.8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
        
      case 'bush':
        return (
          <mesh
            position={[obstacle.x, 0.2 * scale, obstacle.z]}
            scale={[scale, scale * 0.6, scale]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[0.4, 8, 6]} />
            <meshStandardMaterial color="#32CD32" roughness={0.8} />
          </mesh>
        );
        
      default:
        // Default cube obstacle
        return (
          <mesh
            position={[obstacle.x, 0.25 * scale, obstacle.z]}
            scale={[scale, scale, scale]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#CD853F" />
          </mesh>
        );
    }
  };

  return renderObstacle();
}