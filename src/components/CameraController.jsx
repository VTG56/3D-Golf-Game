// src/components/CameraController.jsx
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

export default function CameraController({
  ballPosition,
  goalPosition,
  isAiming,
  isMoving,
  gameStarted
}) {
  const { camera } = useThree();
  const currentOffset = useRef(new THREE.Vector3(0, 5, -8)); // default offset behind ball
  const [isZoomedOut, setIsZoomedOut] = useState(true);

  useFrame(() => {
    if (!gameStarted) {
      // 🎬 Starting cinematic view (show ball + goal)
      const midpoint = new THREE.Vector3()
        .addVectors(ballPosition, goalPosition)
        .multiplyScalar(0.5);
      camera.position.lerp(
        new THREE.Vector3(midpoint.x, 12, midpoint.z + 10),
        0.05
      );
      camera.lookAt(midpoint);
      return;
    }

    // 🟢 During movement → follow ball smoothly
    if (isMoving) {
      setIsZoomedOut(false);
      const target = new THREE.Vector3()
        .copy(ballPosition)
        .add(currentOffset.current);
      camera.position.lerp(target, 0.1);
      camera.lookAt(ballPosition);
      return;
    }

    // 🏁 When ball stops → show both ball + hole
    if (!isMoving && !isAiming && !isZoomedOut) {
      const midpoint = new THREE.Vector3()
        .addVectors(ballPosition, goalPosition)
        .multiplyScalar(0.5);
      camera.position.lerp(
        new THREE.Vector3(midpoint.x, 10, midpoint.z + 12),
        0.08
      );
      camera.lookAt(midpoint);
      if (camera.position.distanceTo(midpoint) < 0.5) {
        setIsZoomedOut(true);
      }
      return;
    }

    // 🎯 When aiming again → lock behind ball, keep same zoom
    if (isAiming && !isMoving) {
      const target = new THREE.Vector3()
        .copy(ballPosition)
        .add(currentOffset.current);
      camera.position.lerp(target, 0.08);
      camera.lookAt(ballPosition);
    }
  });

  return null;
}
