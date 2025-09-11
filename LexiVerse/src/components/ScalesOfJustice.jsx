import React, { useRef, Suspense, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

function GLBModel(props) {
  const modelRef = useRef();

  try {
    const { scene } = useGLTF("/scales_of_justice.glb");

    // Add rotation animation
    useFrame(() => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.008;
      }
    });

    // Ensure materials are properly set with marble white color
    React.useEffect(() => {
      if (scene) {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              // Apply black and bronze color to all materials with increased opacity
              child.material = child.material.clone();
              child.material.color.setHex(0x2d1810); // Dark bronze/black color
              child.material.roughness = 0.3;
              child.material.metalness = 0.8;
              child.material.transparent = true;
              child.material.opacity = 0.7; // Increased opacity for better visibility
              child.material.needsUpdate = true;
            }
          }
        });
      }
    }, [scene]);

    return (
      <primitive
        ref={modelRef}
        object={scene.clone()}
        {...props}
        scale={1.2}
        position={[4, -2.5, -3]}
      />
    );
  } catch (error) {
    console.warn("GLB model failed to load:", error);
    return null;
  }
}

function FallbackModel(props) {
  const modelRef = useRef();

  // Add rotation animation
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={modelRef} {...props} scale={1.2} position={[4, -2.5, -3]}>
      {/* Base */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial
          color="#2D1810"
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Stand */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 2, 16]} />
        <meshStandardMaterial
          color="#1A0F08"
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Cross Beam */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.5, 0.12, 0.12]} />
        <meshStandardMaterial
          color="#CD7F32"
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Left Scale */}
      <group position={[-1.2, 0.6, 0]}>
        {/* Chain */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial
            color="#1A0F08"
            roughness={0.4}
            metalness={0.7}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Plate */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 0.08, 32]} />
          <meshStandardMaterial
            color="#CD7F32"
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Right Scale */}
      <group position={[1.2, 0.6, 0]}>
        {/* Chain */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial
            color="#1A0F08"
            roughness={0.4}
            metalness={0.7}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Plate */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.5, 0.4, 0.08, 32]} />
          <meshStandardMaterial
            color="#CD7F32"
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </group>
  );
}

export function ScalesOfJustice(props) {
  const [useGLB, setUseGLB] = useState(true);

  if (useGLB) {
    return (
      <Suspense fallback={<FallbackModel {...props} />}>
        <GLBModel {...props} onError={() => setUseGLB(false)} />
      </Suspense>
    );
  }

  return <FallbackModel {...props} />;
}

// Preload the model
useGLTF.preload("/scales_of_justice.glb");
