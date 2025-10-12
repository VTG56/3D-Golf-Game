import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Text } from "@react-three/drei";
import { Vector3, Matrix4, Quaternion } from "three";
import { useParams, useNavigate } from "react-router-dom";
import levels, { calculateStars, getNextLevel } from "../utils/levels";
import EndOfRound from "../components/EndOfRound";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import CameraController from "../components/CameraController";

function Windmill({ obs }) {
  const bladesRef = React.useRef();

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += (obs.speed || 1) * delta; // spin around hub
    }
  });

  return (
    <group>
      {/* Pole */}
      <mesh position={[obs.x, (obs.height || 3) / 2, obs.z]}>
        <cylinderGeometry args={[0.1, 0.1, obs.height || 3, 16]} />
        <meshStandardMaterial color="brown" />
      </mesh>

      {/* Blades group */}
      <group ref={bladesRef} position={[obs.x, obs.height || 3, obs.z]}>
        {/* Hub (center circle) */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>

        {/* Blades */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, angle]} position={[0, 0, 0]}>
            <boxGeometry args={[obs.bladeLength || 2, obs.bladeWidth || 0.2, 0.2]} />
            <meshStandardMaterial color="white" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function FollowBallCamera({
  ballPosition,
  ballVelocity,
  holePosition,
  isSettingDirection,
  directionAngle,
  userInteractingRef,
}) {
  const { controls, camera, gl } = useThree();
  const initialized = React.useRef(false);

  useFrame(() => {
    if (!controls) return;

    const speed = ballVelocity.length();

    // --- 1. Initial alignment (only ONCE when game starts or resets) ---
    if (!initialized.current) {
      const dir = new Vector3().subVectors(holePosition, ballPosition).normalize();
      const camPos = ballPosition.clone().add(dir.clone().multiplyScalar(-8)).setY(ballPosition.y + 5);

      camera.position.copy(camPos);
      camera.lookAt(holePosition);

      controls.target.copy(holePosition);
      controls.update();

      initialized.current = true; // âœ… only once at start/reset
    }

    // --- 2. Follow the ball while it is moving ---
    // --- 2. Follow the ball while it is moving ---
    if (speed > 0.05 && !userInteractingRef.current && !isSettingDirection) {
      // Instead of zooming out, keep a fixed offset behind the ball
      const fixedDistance = 8; // ðŸ‘ˆ set your preferred distance
      const direction = new Vector3();
      camera.getWorldDirection(direction);
      const newPos = ballPosition.clone().sub(direction.multiplyScalar(fixedDistance));

      camera.position.lerp(newPos, 0.05);
      controls.target.lerp(ballPosition, 0.1);
      controls.update();
    }

  });

  // --- 3. Handle direction setting mode (DO NOT snap to hole here) ---
  useEffect(() => {
    if (isSettingDirection) {
      const dir = new Vector3(Math.cos(directionAngle), 0, -Math.sin(directionAngle)).normalize();
      const camPos = ballPosition.clone().add(dir.clone().multiplyScalar(-8)).setY(ballPosition.y + 5);

      camera.position.copy(camPos);
      camera.lookAt(ballPosition.clone().add(dir.clone().multiplyScalar(10)));
      controls.target.copy(ballPosition);
      controls.update();
    }
    // ðŸš¨ Notice: no goal alignment here!
  }, [isSettingDirection, directionAngle, ballPosition.x, ballPosition.y, ballPosition.z]);

  // --- 4. Reset initial alignment ONLY when ball resets ---
  useEffect(() => {
    initialized.current = false;
  }, [ballPosition.x, ballPosition.y, ballPosition.z]);

  return null;
}

// Helper function to transform a point by rotation
function rotatePoint(point, center, rotationY) {
  const translated = point.clone().sub(center);
  const rotated = new Vector3(
    translated.x * Math.cos(-rotationY) - translated.z * Math.sin(-rotationY),
    translated.y,
    translated.x * Math.sin(-rotationY) + translated.z * Math.cos(-rotationY)
  );
  return rotated.add(center);
}

// Helper function to rotate a vector by Y axis
function rotateVector(vector, angleY) {
  return new Vector3(
    vector.x * Math.cos(angleY) - vector.z * Math.sin(angleY),
    vector.y,
    vector.x * Math.sin(angleY) + vector.z * Math.cos(angleY)
  );
}

// ---------------- Golf Ball ----------------
function GolfBall({ position, velocity, onPositionChange, isMoving, setIsMoving, obstacles, resetBall, level }) {
  const ballRef = React.useRef();
  const ballRadius = 0.1;

  useFrame((_, delta) => {
    if (!ballRef.current || !isMoving) return;

    // Apply physics first
    velocity.multiplyScalar(0.98); // friction
    velocity.y -= 9.8 * delta * 0.1; // gravity

    // Calculate new position
    const newPos = position.clone().add(velocity.clone().multiplyScalar(delta));

    // --- Out of bounds check ---
    let outOfBounds = false;

    if (level.terrain?.radius) {
      // Circular terrain
      const dist = Math.sqrt(newPos.x ** 2 + newPos.z ** 2);
      if (dist > level.terrain.radius) {
        outOfBounds = true;
      }
    } else {
      // Rectangular terrain
      const halfW = (level.terrain.width || 20) / 2;
      const halfH = (level.terrain.height || 20) / 2;
      if (Math.abs(newPos.x) > halfW || Math.abs(newPos.z) > halfH) {
        outOfBounds = true;
      }
    }

    if (outOfBounds) {
      resetBall();
      return;
    }

    // --- Enhanced Collision Detection with Obstacles ---
    obstacles?.forEach((obs) => {
      const obstacleCenter = new Vector3(obs.x, 0, obs.z);
      const rotationY = obs.rotation ? obs.rotation[1] : 0;

      // --- ROCK, BARREL, PILLAR (spherical/cylindrical collision) ---
      if (obs.type === "rock" || obs.type === "barrel" || obs.type === "pillar") {
        const radius = 0.4 * (obs.scale || 1);
        const distVec = newPos.clone().sub(obstacleCenter);
        distVec.y = 0; // Only check XZ plane
        const dist = distVec.length();

        if (dist < radius + ballRadius) {
          // Calculate collision normal
          const normal = distVec.normalize();
          
          // Reflect velocity
          const dot = velocity.dot(normal);
          velocity.sub(normal.multiplyScalar(2 * dot));
          velocity.multiplyScalar(0.7); // Energy loss
          
          // Push ball outside
          const pushDistance = (radius + ballRadius) - dist;
          newPos.add(normal.multiplyScalar(pushDistance));
        }
      }

      // --- TREE (thin trunk collision) ---
      if (obs.type === "tree") {
        const trunkRadius = 0.1 * (obs.scale || 1);
        const distVec = new Vector3(newPos.x - obs.x, 0, newPos.z - obs.z);
        const dist = distVec.length();

        if (dist < trunkRadius + ballRadius) {
          const normal = distVec.normalize();
          
          // Reflect velocity
          const dot = velocity.dot(normal);
          velocity.sub(normal.multiplyScalar(2 * dot));
          velocity.multiplyScalar(0.75);
          
          // Push ball outside
          const pushDistance = (trunkRadius + ballRadius) - dist;
          newPos.add(normal.multiplyScalar(pushDistance));
        }
      }

      // --- BARRIER (box collision with rotation support) ---
      if (obs.type === "barrier") {
        const halfW = (obs.width || 2) / 2;
        const halfH = (obs.height || 0.5) / 2;
        const halfT = (obs.thickness || 0.2) / 2;

        // Transform ball position to obstacle's local space
        const localBallPos = rotatePoint(newPos, obstacleCenter, rotationY);
        const localVel = rotateVector(velocity, rotationY);

        const dx = localBallPos.x - obs.x;
        const dy = localBallPos.y;
        const dz = localBallPos.z - obs.z;

        // Check if within bounding box
        if (Math.abs(dx) < halfW + ballRadius && 
            Math.abs(dz) < halfT + ballRadius && 
            dy > -halfH && dy < halfH + ballRadius) {
          
          // Find the closest face
          const penetrationX = halfW + ballRadius - Math.abs(dx);
          const penetrationZ = halfT + ballRadius - Math.abs(dz);
          
          let normal;
          if (penetrationX < penetrationZ) {
            // Collision with left/right face
            normal = new Vector3(Math.sign(dx), 0, 0);
            localBallPos.x = obs.x + Math.sign(dx) * (halfW + ballRadius);
          } else {
            // Collision with front/back face
            normal = new Vector3(0, 0, Math.sign(dz));
            localBallPos.z = obs.z + Math.sign(dz) * (halfT + ballRadius);
          }
          
          // Reflect velocity in local space
          const dot = localVel.dot(normal);
          localVel.sub(normal.multiplyScalar(2 * dot));
          
          // Transform back to world space
          newPos.copy(rotatePoint(localBallPos, obstacleCenter, -rotationY));
          velocity.copy(rotateVector(localVel, -rotationY)).multiplyScalar(0.7);
        }
      }

      // --- PLANK (larger rectangular surface with rotation) ---
      if (obs.type === "plank") {
        const halfW = (obs.width || 6) / 2;
        const halfH = (obs.height || 0.2) / 2;
        const halfT = (obs.thickness || 1) / 2;

        // Transform to local space
        const localBallPos = rotatePoint(newPos, obstacleCenter, rotationY);
        const localVel = rotateVector(velocity, rotationY);

        const dx = localBallPos.x - obs.x;
        const dy = localBallPos.y;
        const dz = localBallPos.z - obs.z;

        if (Math.abs(dx) < halfW + ballRadius && 
            Math.abs(dz) < halfT + ballRadius && 
            dy > -halfH && dy < halfH + ballRadius) {
          
          const penetrationX = halfW + ballRadius - Math.abs(dx);
          const penetrationZ = halfT + ballRadius - Math.abs(dz);
          
          let normal;
          if (penetrationX < penetrationZ) {
            normal = new Vector3(Math.sign(dx), 0, 0);
            localBallPos.x = obs.x + Math.sign(dx) * (halfW + ballRadius);
          } else {
            normal = new Vector3(0, 0, Math.sign(dz));
            localBallPos.z = obs.z + Math.sign(dz) * (halfT + ballRadius);
          }
          
          // Reflect velocity
          const dot = localVel.dot(normal);
          localVel.sub(normal.multiplyScalar(2 * dot));
          
          // Transform back to world space
          newPos.copy(rotatePoint(localBallPos, obstacleCenter, -rotationY));
          velocity.copy(rotateVector(localVel, -rotationY)).multiplyScalar(0.75);
        }
      }

      // --- SAND (friction zone) ---
      if (obs.type === "sand") {
        const halfW = (obs.width || 2) / 2;
        const halfD = (obs.depth || 2) / 2;
        
        if (Math.abs(newPos.x - obs.x) < halfW && 
            Math.abs(newPos.z - obs.z) < halfD) {
          velocity.multiplyScalar(0.85); // Heavy friction
        }
      }

      // --- TUNNEL (hollow passage) ---
      if (obs.type === "tunnel") {
        const halfWidth = (obs.width || 2) / 2;
        const halfDepth = (obs.depth || 3) / 2;
        const height = obs.height || 1.5;
        const wallThickness = 0.2;

        const dx = newPos.x - obs.x;
        const dy = newPos.y;
        const dz = newPos.z - obs.z;

        // Check if inside tunnel bounds
        if (Math.abs(dx) < halfWidth + ballRadius && 
            Math.abs(dz) < halfDepth + ballRadius) {
          
          // Side walls
          if (Math.abs(dx) > halfWidth - wallThickness) {
            const normal = new Vector3(Math.sign(dx), 0, 0);
            const dot = velocity.dot(normal);
            velocity.sub(normal.multiplyScalar(2 * dot)).multiplyScalar(0.8);
            newPos.x = obs.x + Math.sign(dx) * (halfWidth - wallThickness - ballRadius);
          }
          
          // Ceiling
          if (dy > height - ballRadius && dy < height + wallThickness) {
            velocity.y = -Math.abs(velocity.y) * 0.7;
            newPos.y = height - ballRadius;
          }
        }
      }

      // --- WINDMILL (dynamic rotating obstacle) ---
      if (obs.type === "windmill") {
        const time = performance.now() / 1000;
        const bladeAngle = time * (obs.speed || 1);
        const bladeLength = obs.bladeLength || 2;
        const bladeWidth = obs.bladeWidth || 0.2;
        const bladeHeight = obs.height || 3;

        // Check if ball is at blade height
        if (Math.abs(newPos.y - bladeHeight) < 0.3) {
          // Transform to blade's rotating coordinate system
          const relX = newPos.x - obs.x;
          const relZ = newPos.z - obs.z;
          
          // Check each blade (4 blades at 90-degree intervals)
          for (let i = 0; i < 4; i++) {
            const angle = bladeAngle + (i * Math.PI / 2);
            
            // Blade direction vector
            const bladeDir = new Vector3(Math.cos(angle), 0, Math.sin(angle));
            
            // Project ball position onto blade
            const ballVec = new Vector3(relX, 0, relZ);
            const projection = ballVec.dot(bladeDir);
            
            // Check if within blade length
            if (Math.abs(projection) < bladeLength / 2) {
              // Calculate perpendicular distance to blade
              const perpVec = ballVec.clone().sub(bladeDir.clone().multiplyScalar(projection));
              const perpDist = perpVec.length();
              
              // Check if close enough to blade
              if (perpDist < bladeWidth / 2 + ballRadius) {
                // Calculate impact force based on blade rotation
                const bladeVelocity = new Vector3(-Math.sin(angle), 0, Math.cos(angle));
                bladeVelocity.multiplyScalar(obs.speed * 3);
                
                // Transfer momentum to ball
                velocity.add(bladeVelocity);
                
                // Push ball away from blade
                if (perpDist > 0.01) {
                  const pushDir = perpVec.normalize();
                  newPos.add(pushDir.multiplyScalar((bladeWidth / 2 + ballRadius) - perpDist));
                }
              }
            }
          }
        }
      }
    });

    // --- Ground collision ---
    if (newPos.y <= ballRadius) {
      newPos.y = ballRadius;
      velocity.y = Math.abs(velocity.y) * 0.6; // Bounce with energy loss
      velocity.x *= 0.9; // Rolling friction
      velocity.z *= 0.9;
    }

    // --- Stop ball if moving too slowly ---
    if (velocity.length() < 0.1) {
      setIsMoving(false);
      velocity.set(0, 0, 0);
    }

    onPositionChange(newPos);
  });

  return (
    <mesh ref={ballRef} position={position}>
      <sphereGeometry args={[ballRadius, 16, 16]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

function CameraControls() {
  const { camera } = useThree();
  const speed = 0.2;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "w") {
        camera.position.z -= speed;
      }
      if (e.key === "s") {
        camera.position.z += speed;
      }
      if (e.key === "a") {
        camera.position.x -= speed;
      }
      if (e.key === "d") {
        camera.position.x += speed;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera]);

  return null;
}

// ---------------- Golf Course ----------------
function GolfCourse({ level }) {
  return (
    <group>
      {/* Base ground */}
      {level.terrain?.radius ? (
        // Circular
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <circleGeometry args={[level.terrain.radius, 64]} />
          <meshStandardMaterial color="#2d5a2d" />
        </mesh>
      ) : (
        // Rectangular
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[level.terrain.width || 20, 0.1, level.terrain.height || 20]} />
          <meshStandardMaterial color="#2d5a2d" />
        </mesh>
      )}

      {/* Hole */}
      <mesh
        position={[level.holePosition.x, level.holePosition.y, level.holePosition.z]}
        receiveShadow
      >
        <cylinderGeometry args={[level.holeRadius, level.holeRadius, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Flag */}
      <group position={[level.holePosition.x, 0, level.holePosition.z]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.3, 1.7, 0]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial color="#ff0000" side={2} />
        </mesh>
      </group>

      {/* Obstacles */}
      {level.terrain?.obstacles?.map((obs, i) => (
        <group
          key={i}
          position={[obs.x, 0, obs.z]}
          rotation={obs.rotation || [0, 0, 0]}
          scale={[obs.scale || 1, obs.scale || 1, obs.scale || 1]}>
          {/* Tree */}
          {obs.type === "tree" && (
            <>
              {/* Trunk */}
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 1]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              {/* Leaves */}
              <mesh position={[0, 1.2, 0]}>
                <coneGeometry args={[0.6, 1.2, 8]} />
                <meshStandardMaterial color="green" />
              </mesh>
            </>
          )}
          {obs.type === "windmill" && <Windmill obs={obs} />}

          {/* Rock */}
          {obs.type === "rock" && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="gray" />
            </mesh>
          )}

          {/* Barrier / Strip */}
          {obs.type === "barrier" && (
            <mesh position={[0, (obs.height || 0.5) / 2, 0]}>
              <boxGeometry args={[obs.width || 2, obs.height || 0.5, obs.thickness || 0.2]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          )}
          {/* Barrel */}
          {obs.type === "barrel" && (
            <group>
              {/* Barrel body */}
              <mesh position={[0, 0.5, 0]} scale={[obs.scale || 1, obs.scale || 1, obs.scale || 1]}>
                <cylinderGeometry args={[0.4, 0.4, 1, 16]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
              {/* Barrel rings */}
              <mesh position={[0, 0.2, 0]} scale={[obs.scale || 1, 1, obs.scale || 1]}>
                <torusGeometry args={[0.4, 0.05, 8, 16]} />
                <meshStandardMaterial color="black" />
              </mesh>
              <mesh position={[0, 0.8, 0]} scale={[obs.scale || 1, 1, obs.scale || 1]}>
                <torusGeometry args={[0.4, 0.05, 8, 16]} />
                <meshStandardMaterial color="black" />
              </mesh>
            </group>
          )}

          {/* Sand Pit */}
          {obs.type === "sand" && (
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[obs.width || 2, 0.02, obs.depth || 2]} />
              <meshStandardMaterial color="#B39B6D" />
            </mesh>
          )}
          {/* Plank */}
          {obs.type === "plank" && (
            <mesh position={[0, (obs.height || 0.2) / 2, 0]} rotation={obs.rotation || [0, 0, 0]}>
              <boxGeometry args={[obs.width || 6, obs.height || 0.2, obs.thickness || 1]} />
              <meshStandardMaterial color="#8B5A2B" />  {/* brown plank */}
            </mesh>
          )}

          {/* Tunnel */}
          {obs.type === "tunnel" && (
            <group>
              {/* Tunnel base (arch sides) */}
              <mesh position={[0, obs.height / 2 || 0.75, -(obs.depth || 3) / 2]}>
                <boxGeometry args={[obs.width || 2, obs.height || 1.5, 0.2]} />
                <meshStandardMaterial color="gray" />
              </mesh>
              <mesh position={[0, obs.height / 2 || 0.75, (obs.depth || 3) / 2]}>
                <boxGeometry args={[obs.width || 2, obs.height || 1.5, 0.2]} />
                <meshStandardMaterial color="gray" />
              </mesh>

              {/* Top of tunnel */}
              <mesh position={[0, obs.height || 1.5, 0]}>
                <boxGeometry args={[obs.width || 2, 0.2, obs.depth || 3]} />
                <meshStandardMaterial color="gray" />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// ---------------- Power Meter ----------------
function PowerMeter({ power, maxPower }) {
  return (
    <div className="absolute bottom-20 left-4 bg-black/50 p-4 rounded-lg">
      <div className="text-white font-game mb-2">Power</div>
      <div className="w-4 h-32 bg-gray-700 rounded flex flex-col justify-end">
        <div
          className="w-full bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded transition-all duration-100"
          style={{ height: `${(power / maxPower) * 100}%` }}
        />
      </div>
      <div className="text-white font-game text-sm mt-1">{Math.round(power)}</div>
    </div>
  );
}

// ---------------- Main Game ----------------
function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setProgress, getGuestId, initializeGuest } = useProgress();

  const level = levels.find((lvl) => lvl.id === parseInt(levelId));
  if (!level) return <div>Invalid level</div>;

  const [gameStarted, setGameStarted] = useState(true);
  const [ballPosition, setBallPosition] = useState(new Vector3(level.ballStart.x, level.ballStart.y, level.ballStart.z));
  const [ballVelocity, setBallVelocity] = useState(new Vector3(0, 0, 0));
  const [isMoving, setIsMoving] = useState(false);
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [shots, setShots] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const userInteractingRef = React.useRef(false);

  // NEW: Direction states
  const [isSettingDirection, setIsSettingDirection] = useState(false);
  const [directionAngle, setDirectionAngle] = useState(0); // radians

  const maxPower = 15;
  const resetBall = () => {
    setBallPosition(new Vector3(level.ballStart.x, level.ballStart.y, level.ballStart.z));
    setBallVelocity(new Vector3(0, 0, 0));
    setIsMoving(false);
    setShots((s) => s + 1); // penalty stroke
  };
  
  // Start timer
  useEffect(() => {
    if (gameStarted) setStartTime(Date.now());
  }, [gameStarted]);

  // Power charging (oscillates between 0 â†” maxPower)
  useEffect(() => {
    if (!isCharging) return;
    let direction = 1; // 1 = charging up, -1 = charging down

    const interval = setInterval(() => {
      setPower((prev) => {
        let next = prev + direction * 0.5;

        if (next >= maxPower) {
          next = maxPower;
          direction = -1; // start going down
        }
        if (next <= 0) {
          next = 0;
          direction = 1; // start going up
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isCharging, maxPower]);

  // Win detection + progress saving
  useEffect(() => {
    const hole = new Vector3(level.holePosition.x, level.holePosition.y, level.holePosition.z);
  
    if (ballPosition.distanceTo(hole) < level.holeRadius && !isMoving && !gameWon) {
      setGameWon(true);
  
      // Calculate results
      const time = Math.floor((Date.now() - startTime) / 1000);
      const stars = calculateStars(shots, level.par);
      setTimeTaken(time);
      setStarsEarned(stars);
  
      // Save progress asynchronously
      (async () => {
        try {
          if (user && !user.isAnonymous) {
            // Logged-in user â€“ save to Firestore
            const updated = await setProgress({
              uid: user.uid,
              levelId: level.id.toString(),
              strokes: shots,
              stars,
              timeTaken: time,
            });
            console.log("âœ… Saved progress (auth):", updated);
          } else {
            // Guest user â€“ save to localStorage
            let guestId = getGuestId();
            if (!guestId) {
              guestId = await initializeGuest();
            }
  
            const updated = await setProgress({
              guestId,
              levelId: level.id.toString(),
              strokes: shots,
              stars,
              timeTaken: time,
            });
            console.log("âœ… Saved progress (guest):", updated);
          }
        } catch (err) {
          console.error("âŒ Failed to save progress:", err);
        } finally {
          // Show End-of-Round screen after save completes
          setTimeout(() => setShowEndScreen(true), 600);
        }
      })();
    }
  }, [ballPosition, isMoving, gameWon, level, shots, startTime, user, setProgress, getGuestId, initializeGuest]);

  // --- Direction toggle ---
  const toggleDirectionMode = () => {
    setIsSettingDirection((prev) => !prev);
  };

  // --- Handle arrow keys while setting direction ---
  useEffect(() => {
    if (!isSettingDirection) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setDirectionAngle((a) => a + 0.1);
      }
      if (e.key === "ArrowRight") {
        setDirectionAngle((a) => a - 0.1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingDirection]);

  // --- Shooting ---
  const handleMouseDown = () => {
    if (isMoving || gameWon) return;
    setIsCharging(true);
    setPower(0);
  };

  const handleMouseUp = () => {
    if (!isCharging || isMoving || gameWon) return;
    setIsCharging(false);

    // use chosen direction vector
    const dir = new Vector3(Math.cos(directionAngle), 0, -Math.sin(directionAngle));

    const shotVelocity = dir.multiplyScalar(power * 1.5);
    shotVelocity.y = power * 0.1;

    setBallVelocity(shotVelocity);
    setIsMoving(true);
    setShots((s) => s + 1);
    setPower(0);
  };

  const resetGame = () => {
    setBallPosition(new Vector3(level.ballStart.x, level.ballStart.y, level.ballStart.z));
    setBallVelocity(new Vector3(0, 0, 0));
    setIsMoving(false);
    setPower(0);
    setIsCharging(false);
    setShots(0);
    setGameWon(false);
    setShowEndScreen(false);
    setStarsEarned(0);
    setTimeTaken(0);
    setStartTime(Date.now());
  };

  // Navigation
  const handleNextLevel = () => {
    const next = getNextLevel(level.id);
    if (next) {
      navigate(`/game/${next.id}`);
      window.location.reload();
    } else {
      navigate("/levels");
    }
  };

  const handleBackToLevels = () => {
    navigate("/levels");
  };

  if (!gameStarted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-400">
        <div className="text-center">
          <Canvas className="w-full h-64 mb-8">
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Text font="/fonts/Geist_Bold.json" size={2} height={0.2} position={[-6, 0, 0]}>
              MINI GOLF
              <meshStandardMaterial color="#4a7c4a" />
            </Text>
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
          <button
            onClick={() => setGameStarted(true)}
            className="bg-blue-600 font-game hover:bg-blue-700 text-white px-8 py-4 text-xl rounded-lg"
          >
            PLAY
          </button>
        </div>
      </div>
    );
  }

  if (showEndScreen) {
    return (
      <EndOfRound
        strokes={shots}
        starsEarned={starsEarned}
        timeTaken={timeTaken}
        par={level.par}
        onNextLevel={handleNextLevel}
        onBackToLevels={handleBackToLevels}
      />
    );
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <GolfCourse level={level} />
          <FollowBallCamera
            ballPosition={ballPosition}
            ballVelocity={ballVelocity}
            holePosition={new Vector3(level.holePosition.x, level.holePosition.y, level.holePosition.z)}
            isSettingDirection={isSettingDirection}
            directionAngle={directionAngle}
            userInteractingRef={userInteractingRef}
          />

          <GolfBall
            position={ballPosition}
            velocity={ballVelocity}
            onPositionChange={setBallPosition}
            isMoving={isMoving}
            setIsMoving={setIsMoving}
            obstacles={level.terrain?.obstacles}
            resetBall={resetBall}
            level={level}
          />

          {/* Direction / Power Arrow */}
          {(isSettingDirection || isCharging) && !isMoving && !gameWon && (
            <group
              position={[ballPosition.x, ballPosition.y + 0.1, ballPosition.z]}
              rotation={[0, directionAngle, 0]} // rotate based on chosen angle
            >
              {/* Shaft */}
              <mesh
                position={[
                  isCharging ? (power / maxPower) : 0.5, // grow with power if charging, else fixed
                  0,
                  0
                ]}
              >
                <boxGeometry
                  args={[
                    isCharging ? (power / maxPower) * 2 : 1, // dynamic length if charging
                    0.02,
                    0.05
                  ]}
                />
                <meshStandardMaterial color="red" />
              </mesh>

              {/* Arrow head */}
              <mesh
                position={[
                  isCharging ? (power / maxPower) * 2.2 : 1.1,
                  0,
                  0
                ]}
                rotation={[0, 0, -Math.PI / 2]}
              >
                <coneGeometry args={[0.15, 0.3, 8]} />
                <meshStandardMaterial color="red" />
              </mesh>
            </group>
          )}

          <Environment preset="sunset" />
        </Suspense>
        <CameraControls />
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          minDistance={2}
          maxDistance={60}
          enableDamping
          dampingFactor={0.07}
          maxPolarAngle={Math.PI / 2.2}
          enabled={true}
        />
      </Canvas>

      {/* UI */}
      <div className="absolute font-game top-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <div>Shots: {shots}</div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={resetGame}
          className="px-4 py-2 font-game bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Reset
        </button>
        <button
          onClick={toggleDirectionMode}
          className={`px-4 py-2 ${isSettingDirection ? "bg-yellow-500" : "bg-blue-500"} text-white font-game rounded-lg`}
        >
          {isSettingDirection ? "Confirm Direction" : "Set Direction"}
        </button>
      </div>

      {!gameWon && (
        <>
          <PowerMeter power={power} maxPower={maxPower} />
          <div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white p-4 rounded-lg cursor-pointer select-none font-game"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isMoving ? "Ball Moving..." : "Hold to Charge Shot"}
          </div>
        </>
      )}

      <div className="absolute bottom-4 right-4 font-game bg-black/50 text-white p-2 rounded text-sm">
        {isSettingDirection ? "â† â†’ to adjust direction" : "Drag to rotate camera â€¢ Mouse wheel to zoom"}
      </div>
    </div>
  );
}

export default Game;