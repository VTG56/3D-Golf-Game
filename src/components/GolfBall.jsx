// src/components/GolfBall.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import * as THREE from 'three';

/**
 * GolfBall
 * Props:
 *  - position: [x,y,z] (starting position)
 *  - onPositionUpdate: fn({x,y,z})
 *  - onSpeedUpdate: fn(speedNumber)
 *  - onStroke: fn()
 *  - ballRef: React ref to expose cannon api (optional)
 *
 * Notes:
 *  - This component uses an invisible Interaction Plane to capture pointer/touch drags reliably.
 *  - Use gl.domElement.setPointerCapture / releasePointerCapture for stable capture.
 */

export default function GolfBall({
  position = [0, 0.2, 0],
  onPositionUpdate,
  onSpeedUpdate,
  onStroke,
  ballRef,
}) {
  // Cannon sphere body
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [0.2], // radius
    position: [position[0], position[1] + 0.2, position[2]],
    linearDamping: 0.6,
    angularDamping: 0.6,
    // material options in cannon can be set via contactMaterial in world config;
    // we will fine tune speed damping in useFrame to keep predictable behavior across browsers.
  }));

  // Expose api to parent
  useEffect(() => {
    if (ballRef) ballRef.current = api;
  }, [api, ballRef]);

  // Refs & state
  const posRef = useRef({ x: position[0], y: position[1] + 0.2, z: position[2] });
  const velRef = useRef([0, 0, 0]);
  const speedRef = useRef(0);
  const wasMovingRef = useRef(false);

  // For dragging
  const draggingRef = useRef(false);
  const dragStartRef = useRef(null); // THREE.Vector3
  const dragCurrentRef = useRef(null); // THREE.Vector3
  const [showAim, setShowAim] = useState(false);

  // three context
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Interaction plane ref (large invisible plane used to get world point under pointer)
  const planeRef = useRef();

  // Constants (tweak if needed)
  const BALL_RADIUS = 0.2;
  const MAX_POWER = 15; // units
  const POWER_MULTIPLIER = 8; // maps drag distance -> power
  const MIN_DRAG_DISTANCE = 0.04; // in world units
  const GOAL_UPWARD_V = 0.9; // small upward component

  // Subscribe to physics updates (position & velocity)
  useEffect(() => {
    const unsubPos = api.position.subscribe((p) => {
      posRef.current = { x: p[0], y: p[1], z: p[2] };
      if (onPositionUpdate) onPositionUpdate({ x: p[0], y: p[1], z: p[2] });
    });
    const unsubVel = api.velocity.subscribe((v) => {
      velRef.current = v;
      const speed = Math.hypot(v[0], v[1], v[2]);
      speedRef.current = speed;
      if (onSpeedUpdate) onSpeedUpdate(speed);
    });
    return () => {
      unsubPos();
      unsubVel();
    };
  }, [api, onPositionUpdate, onSpeedUpdate]);

  // Damping / stop logic (run every frame)
  useFrame(() => {
    const v = velRef.current;
    const speed = speedRef.current;

    // Stroke detection: detect transition from still -> moving (this is optional, but parent expects onStroke when shot applied, so we call onStroke at release)
    wasMovingRef.current = speed > 0.12;

    // Apply gentle damping by scaling velocity (not absolute zero unless very small)
    if (speed > 0.01) {
      let factor = 0.99;
      if (speed < 0.15) factor = 0.9;
      api.velocity.set(v[0] * factor, v[1] * 0.985, v[2] * factor);
    } else if (speed > 0) {
      // stop tiny jitter
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
    }
  });

  // Helper: convert client coords -> point on plane at ball height
  const clientToWorldOnPlane = (clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x, y }, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -posRef.current.y);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    return intersection;
  };

  // Pointer event handlers on the Interaction Plane
  const onPointerDownPlane = (e) => {
    // Only start drag if ball is nearly still
    if (speedRef.current < 0.12) {
      e.stopPropagation();
      draggingRef.current = true;
      // prefer event.point if available (r3f pointer event provides it)
      const worldPoint = e.point ? new THREE.Vector3(e.point.x, e.point.y, e.point.z) : clientToWorldOnPlane(e.clientX, e.clientY);
      dragStartRef.current = worldPoint.clone();
      dragCurrentRef.current = worldPoint.clone();
      setShowAim(true);

      // Capture pointer on the canvas DOM element (helps on some browsers)
      try {
        if (typeof e.pointerId !== 'undefined' && gl?.domElement?.setPointerCapture) {
          gl.domElement.setPointerCapture(e.pointerId);
        }
      } catch (err) {
        // ignore if not supported
      }
    }
  };

  const onPointerMovePlane = (e) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    const worldPoint = e.point ? new THREE.Vector3(e.point.x, e.point.y, e.point.z) : clientToWorldOnPlane(e.clientX, e.clientY);
    dragCurrentRef.current = worldPoint.clone();
  };

  const finishDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setShowAim(false);

    // release pointer capture
    try {
      if (typeof e.pointerId !== 'undefined' && gl?.domElement?.releasePointerCapture) {
        gl.domElement.releasePointerCapture(e.pointerId);
      }
    } catch (err) {
      // ignore
    }

    const start = dragStartRef.current;
    const end = dragCurrentRef.current;
    if (!start || !end) return;

    const dx = start.x - end.x;
    const dz = start.z - end.z;
    const dragDist = Math.hypot(dx, dz);
    if (dragDist < MIN_DRAG_DISTANCE) {
      // too small, do nothing
      dragStartRef.current = null;
      dragCurrentRef.current = null;
      return;
    }

    // compute direction (normalized) and power
    const dir = new THREE.Vector3(dx / dragDist, 0, dz / dragDist);
    const power = Math.min(dragDist * POWER_MULTIPLIER, MAX_POWER);

    // apply impulse/velocity once
    // We do velocity.set for deterministic behaviour across platforms
    api.velocity.set(dir.x * power, GOAL_UPWARD_V, dir.z * power);

    // trigger stroke counter in parent
    if (onStroke) onStroke();

    dragStartRef.current = null;
    dragCurrentRef.current = null;
  };

  // Touch wrapper (convert touches to pointer-like handling)
  const onTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      const t = e.touches[0];
      // create a synthetic event shape with clientX/Y and pointerId
      onPointerDownPlane({ clientX: t.clientX, clientY: t.clientY, pointerId: t.identifier, point: null, stopPropagation: () => e.stopPropagation() });
    }
  };
  const onTouchMove = (e) => {
    if (e.touches && e.touches.length === 1) {
      const t = e.touches[0];
      onPointerMovePlane({ clientX: t.clientX, clientY: t.clientY, pointerId: t.identifier, point: null, stopPropagation: () => e.stopPropagation() });
    }
  };
  const onTouchEnd = (e) => {
    // use changedTouches
    const t = e.changedTouches && e.changedTouches[0];
    finishDrag({ pointerId: t?.identifier });
  };

  // Aim visuals (computed from dragStart & dragCurrent)
  const aimInfo = (() => {
    if (!showAim || !dragStartRef.current || !dragCurrentRef.current) return null;
    const start = dragStartRef.current;
    const cur = dragCurrentRef.current;
    const vx = start.x - cur.x;
    const vz = start.z - cur.z;
    const len = Math.hypot(vx, vz);
    if (len < MIN_DRAG_DISTANCE) return null;
    const norm = { x: vx / len, z: vz / len };
    const power = Math.min(len * POWER_MULTIPLIER, MAX_POWER);
    return { norm, len, power };
  })();

  // Render: - invisible large plane for input (centered on ball xz)
  //         - ball mesh (ref from useSphere)
  //         - aim visuals (cone + line)
  return (
    <group>
      {/* Interaction plane: big, invisible, always at ball height to capture pointer/touch.
          Size is large to make dragging easy on mobile. */}
      <mesh
        ref={planeRef}
        position={[posRef.current.x, posRef.current.y + 0.001, posRef.current.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={onPointerDownPlane}
        onPointerMove={onPointerMovePlane}
        onPointerUp={(e) => { finishDrag(e); }}
        onPointerCancel={(e) => { finishDrag(e); }}
        onTouchStart={(e) => onTouchStart(e)}
        onTouchMove={(e) => onTouchMove(e)}
        onTouchEnd={(e) => onTouchEnd(e)}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* The physical golf ball (mesh is synchronized with the cannon body via ref) */}
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        name="golf-ball"
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.03} />
      </mesh>

      {/* Aim visuals (cone + power bar) */}
      {aimInfo && (
        <group position={[posRef.current.x, posRef.current.y + 0.4, posRef.current.z]}>
          {/* Arrow/cone placed behind ball in drag direction */}
          <mesh
            position={[ -aimInfo.norm.x * (0.5 + aimInfo.power * 0.05), 0, -aimInfo.norm.z * (0.5 + aimInfo.power * 0.05) ]}
            rotation={[ -Math.PI / 2, 0, Math.atan2(aimInfo.norm.x, aimInfo.norm.z) ]}
          >
            <coneGeometry args={[0.12, 0.6, 8]} />
            <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.2} />
          </mesh>

          {/* Power cylinder in front of the cone, length proportional to power */}
          <mesh
            position={[ -aimInfo.norm.x * (aimInfo.power * 0.06) / 2, -0.08, -aimInfo.norm.z * (aimInfo.power * 0.06) / 2 ]}
            rotation={[Math.PI / 2, 0, Math.atan2(aimInfo.norm.x, aimInfo.norm.z)]}
          >
            <cylinderGeometry args={[0.03, 0.03, Math.max(0.1, aimInfo.power * 0.06), 8]} />
            <meshStandardMaterial color="#ffd54f" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
}
