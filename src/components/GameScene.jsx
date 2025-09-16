// src/components/GameScene.jsx
// Expected level prop structure:
// {
//   ballStart: { x, y, z },
//   holePosition: { x, y, z },
//   holeRadius: number,
//   par: number,
//   terrain: { 
//     width, height, 
//     slopes: [{ x, z, width, height, elevation }], 
//     obstacles: [{ type:'tree', x, z, scale }] 
//   },
//   glbPath: string (optional)
// }
//
// NOTE: Add CSS touch-action: none to canvas wrapper for smooth mobile dragging
// Tuning constants: maxPower (12), goalSpeedThreshold (1.6), ballRadius (0.2)
// For physics heightfield later: recommend converting plane to heightfield or baking simplified colliders

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useBox, useSphere, usePlane } from '@react-three/cannon';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

/* -------------------- GolfBall Component -------------------- */
function GolfBall({ position, onPositionUpdate, onSpeedUpdate, ballApiRef }) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.2], // ballRadius = 0.2
    linearDamping: 0.4,
    angularDamping: 0.4,
    material: { friction: 0.3, restitution: 0.2 }
  }));

  const posRef = useRef([position[0], position[1], position[2]]);
  const velRef = useRef([0, 0, 0]);
  const draggingRef = useRef(false);
  const dragStartRef = useRef(null);
  const aimRef = useRef(null);
  const { camera, raycaster, gl } = useThree();

  // Expose API to parent
  useEffect(() => {
    if (ballApiRef) ballApiRef.current = api;
  }, [api, ballApiRef]);

  // Subscribe to physics updates
  useEffect(() => {
    const unsubPos = api.position.subscribe((p) => {
      posRef.current = p;
      onPositionUpdate({ x: p[0], y: p[1], z: p[2] });
    });
    const unsubVel = api.velocity.subscribe((v) => {
      velRef.current = v;
      const speed = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
      onSpeedUpdate(speed);
    });
    return () => {
      unsubPos();
      unsubVel();
    };
  }, [api, onPositionUpdate, onSpeedUpdate]);

  // Get world position from raycasting to the ground plane
  const getWorldPosition = (clientX, clientY) => {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera({ x, y }, camera);
    
    // Create a large invisible plane for raycasting
    const planeGeom = new THREE.PlaneGeometry(200, 200);
    planeGeom.rotateX(-Math.PI / 2);
    const planeMesh = new THREE.Mesh(planeGeom);
    planeMesh.position.set(0, 0, 0);
    
    const intersects = raycaster.intersectObject(planeMesh);
    
    if (intersects.length > 0) {
      return intersects[0].point;
    }
    
    // Fallback: intersect with y=0 plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersect);
    
    return intersect;
  };

  // Mouse/touch input handlers
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    const handlePointerDown = (event) => {
      const [vx, vy, vz] = velRef.current;
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
      
      if (speed < 0.08) {
        event.preventDefault();
        event.stopPropagation();
        
        const worldPos = getWorldPosition(event.clientX, event.clientY);
        if (worldPos) {
          draggingRef.current = true;
          dragStartRef.current = { x: worldPos.x, z: worldPos.z };
          canvas.setPointerCapture(event.pointerId);
        }
      }
    };

    const handlePointerMove = (event) => {
      if (!draggingRef.current || !dragStartRef.current) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const worldPos = getWorldPosition(event.clientX, event.clientY);
      if (worldPos) {
        const dir = new THREE.Vector3(
          worldPos.x - dragStartRef.current.x,
          0,
          worldPos.z - dragStartRef.current.z
        );
        // Only update if drag is meaningful
        if (dir.length() > 0.05) {
          aimRef.current = dir;
        }
      }
    };

    const handlePointerUp = (event) => {
      if (!draggingRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      
      if (aimRef.current && aimRef.current.length() > 0.1) {
        const dir = aimRef.current;
        const distance = Math.min(dir.length(), 4.0);
        const maxPower = 15; // Tunable: max shot power
        const power = (distance / 4.0) * maxPower;

        // REVERSE LOGIC: drag back/left = shoot forward/right
        // Invert the direction vector
        const shot = dir.clone().normalize().multiplyScalar(-power);
        
        // Apply impulse instead of setting velocity directly
        api.applyImpulse([shot.x, 1, shot.z], [0, 0, 0]);
      }

      draggingRef.current = false;
      aimRef.current = null;
      dragStartRef.current = null;
      
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);  
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [camera, raycaster, api, gl]);

  return (
    <group>
      <mesh ref={ref} castShadow receiveShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Aim indicator */}
      {aimRef.current && draggingRef.current && (
        <group position={[posRef.current[0], posRef.current[1] + 0.5, posRef.current[2]]}>
          {/* Aim line - shows shot direction */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([
                  0, 0, 0,
                  aimRef.current.x * -0.5, 0, aimRef.current.z * -0.5
                ])}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff4444" />
          </line>
          
          {/* Aim arrow - shows where ball will go (opposite of drag) */}
          <mesh 
            position={[aimRef.current.x * -0.5, 0, aimRef.current.z * -0.5]}
            rotation={[0, Math.atan2(aimRef.current.x, aimRef.current.z), 0]}
          >
            <coneGeometry args={[0.08, 0.6, 8]} />
            <meshBasicMaterial color="#ff4444" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* -------------------- Ground Plane -------------------- */
function GroundPlane() {
  const [ref] = usePlane(() => ({
    type: 'Static',
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.4, restitution: 0.1 }
  }));

  return (
    <mesh ref={ref} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshLambertMaterial color="#4ade80" />
    </mesh>
  );
}

/* -------------------- ProceduralTerrain -------------------- */
function ProceduralTerrain({ level }) {
  const geometry = useMemo(() => {
    const { terrain } = level;
    const width = terrain.width || 30;
    const height = terrain.height || 30;
    const geo = new THREE.PlaneGeometry(width, height, 128, 128);
    const positions = geo.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      let terrainHeight = 0;
      
      // Apply slope influences with smoother falloff
      terrain.slopes?.forEach((slope) => {
        const dx = x - slope.x;
        const dz = z - slope.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const maxDist = Math.max(slope.width, slope.height) * 0.7;
        const influence = Math.max(0, Math.pow(1 - distance / maxDist, 2));
        terrainHeight += slope.elevation * influence;
      });
      
      // Add subtle noise for natural variation
      const noiseScale = 0.1;
      const noiseFreq = 0.05;
      terrainHeight += Math.sin(x * noiseFreq) * Math.cos(z * noiseFreq) * noiseScale;
      terrainHeight += (Math.random() - 0.5) * 0.05;
      
      positions[i + 2] = terrainHeight;
    }
    
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [level]);

  return (
    <mesh 
      geometry={geometry} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0.02, 0]}
      receiveShadow
    >
      <meshLambertMaterial 
        color="#2d5a2d" 
        vertexColors={false}
      />
    </mesh>
  );
}

/* -------------------- SlopeCollider -------------------- */
function SlopeCollider({ x = 0, z = 0, width = 1, height = 1, elevation = 0.5 }) {
  const yPos = elevation * 0.5;
  const boxHeight = Math.abs(elevation) + 0.2;
  
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [x, yPos, z],
    args: [width, boxHeight * 0.5, height],
    material: { friction: 0.4, restitution: 0.1 }
  }));

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[width, boxHeight * 0.5, height]} />
    </mesh>
  );
}

/* -------------------- Goal Component -------------------- */
function Goal({ position = [0, 0, 0], radius = 0.4, onGoal, ballPosRef, ballSpeed }) {
  const triggeredRef = useRef(false);
  
  useFrame(() => {
    if (!ballPosRef?.current || triggeredRef.current) return;
    
    const ball = ballPosRef.current;
    const goalPos = new THREE.Vector3(position[0], position[1], position[2]);
    const ballPos = new THREE.Vector3(ball.x, ball.y, ball.z);
    const distance = goalPos.distanceTo(ballPos);
    
    const goalSpeedThreshold = 1.6; // Tunable: speed threshold for goal detection
    if (distance <= radius && ballSpeed < goalSpeedThreshold) {
      triggeredRef.current = true;
      onGoal();
    }
  });

  return (
    <group position={position}>
      {/* Hole */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, radius, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Hole depth */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.2, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      
      {/* Flag pole */}
      <mesh position={[radius + 0.3, 1, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 2, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Flag */}
      <mesh position={[radius + 0.55, 1.7, 0]} castShadow>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#ff0000" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* -------------------- Tree Component -------------------- */
function Tree({ position = [0, 0, 0], scale = 1 }) {
  const [trunkRef] = useBox(() => ({
    type: 'Static',
    position: [position[0], position[1] + 1 * scale, position[2]],
    args: [0.3 * scale, 2 * scale, 0.3 * scale],
    material: { friction: 0.6, restitution: 0.1 }
  }));

  return (
    <group position={position} scale={scale}>
      <mesh ref={trunkRef} position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.8, 8, 6]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  );
}

/* -------------------- Camera Controller -------------------- */
function CameraController({ ballPosition, ballSpeed }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!ballPosition) return;

    // Dynamic camera positioning based on ball speed
    const baseDistance = ballSpeed > 1 ? 18 : 10;
    const baseHeight = ballSpeed > 1 ? 12 : 6;
    
    // Smooth target positioning
    targetPos.current.set(
      ballPosition.x - baseDistance * 0.4,
      ballPosition.y + baseHeight,
      ballPosition.z - baseDistance * 0.3
    );
    
    // Smooth camera movement
    currentPos.current.copy(camera.position);
    currentPos.current.lerp(targetPos.current, 0.08);
    camera.position.copy(currentPos.current);
    
    // Look at ball with slight offset
    camera.lookAt(ballPosition.x, ballPosition.y + 1, ballPosition.z);
  });

  return null;
}

/* -------------------- Main GameScene Component -------------------- */
export default function GameScene({ level, onComplete }) {
  const validatedLevel = useMemo(() => {
    if (!level) {
      return {
        ballStart: { x: 0, y: 1, z: -8 },
        holePosition: { x: 0, y: 0, z: 8 },
        holeRadius: 0.6,
        par: 3,
        terrain: {
          width: 30,
          height: 30,
          slopes: [
            { x: 0, z: 0, width: 8, height: 8, elevation: 1 },
            { x: 0, z: 4, width: 6, height: 6, elevation: -0.5 }
          ],
          obstacles: [
            { type: 'tree', x: -3, z: 2, scale: 1 },
            { type: 'tree', x: 4, z: -1, scale: 0.8 }
          ]
        }
      };
    }
    
    return {
      ...level,
      terrain: {
        width: 30,
        height: 30,
        slopes: [],
        obstacles: [],
        ...level.terrain
      }
    };
  }, [level]);

  const ballApiRef = useRef(null);
  const ballPosRef = useRef({ 
    x: validatedLevel.ballStart.x, 
    y: validatedLevel.ballStart.y, 
    z: validatedLevel.ballStart.z 
  });
  const [ballSpeed, setBallSpeed] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  const handlePositionUpdate = (position) => {
    ballPosRef.current = position;
  };

  const handleSpeedUpdate = (speed) => {
    const wasMoving = ballSpeed > 0.15;
    const isMoving = speed > 0.15;
    setBallSpeed(speed);
    
    if (!wasMoving && isMoving) {
      if (!gameStarted) {
        setGameStarted(true);
        setStartTime(Date.now());
      }
      setStrokes(prev => prev + 1);
    }
  };

  const handleGoal = () => {
    if (gameCompleted) return;
    setGameCompleted(true);
    
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    let starsEarned = 0;
    if (strokes <= validatedLevel.par - 2) starsEarned = 3;
    else if (strokes <= validatedLevel.par - 1) starsEarned = 2;
    else if (strokes <= validatedLevel.par + 1) starsEarned = 1;
    
    onComplete({
      strokes,
      starsEarned,
      timeTaken,
      par: validatedLevel.par
    });
  };

  return (
    <Canvas 
      shadows 
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      camera={{ 
        position: [
          validatedLevel.ballStart.x - 10, 
          validatedLevel.ballStart.y + 8, 
          validatedLevel.ballStart.z - 8
        ], 
        fov: 60 
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[30, 30, 10]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      <Sky sunPosition={[20, 20, 10]} />
      <Environment preset="park" />

      <Physics 
        gravity={[0, -18, 0]} 
        iterations={10} 
        broadphase="SAP" 
        allowSleep={true}
      >
        <GroundPlane />
        <ProceduralTerrain level={validatedLevel} />

        {validatedLevel.terrain.slopes?.map((slope, index) => (
          <SlopeCollider
            key={`slope-${index}`}
            x={slope.x}
            z={slope.z}
            width={slope.width}
            height={slope.height}
            elevation={slope.elevation}
          />
        ))}

        {validatedLevel.terrain.obstacles?.map((obstacle, index) => {
          if (obstacle.type === 'tree') {
            return (
              <Tree
                key={`tree-${index}`}
                position={[obstacle.x, 0, obstacle.z]}
                scale={obstacle.scale || 1}
              />
            );
          }
          return null;
        })}

        <GolfBall
          position={[
            validatedLevel.ballStart.x,
            validatedLevel.ballStart.y,
            validatedLevel.ballStart.z
          ]}
          onPositionUpdate={handlePositionUpdate}
          onSpeedUpdate={handleSpeedUpdate}
          ballApiRef={ballApiRef}
        />

        <Goal
          position={[
            validatedLevel.holePosition.x,
            validatedLevel.holePosition.y,
            validatedLevel.holePosition.z
          ]}
          radius={validatedLevel.holeRadius}
          onGoal={handleGoal}
          ballPosRef={ballPosRef}
          ballSpeed={ballSpeed}
        />
      </Physics>

      <CameraController 
        ballPosition={ballPosRef.current} 
        ballSpeed={ballSpeed} 
      />
      
      <OrbitControls 
        enabled={ballSpeed < 0.15 && !gameCompleted} 
        enablePan={false}
        maxDistance={30}
        minDistance={5}
        maxPolarAngle={Math.PI * 0.4}
        minPolarAngle={Math.PI * 0.1}
      />
    </Canvas>
  );
}