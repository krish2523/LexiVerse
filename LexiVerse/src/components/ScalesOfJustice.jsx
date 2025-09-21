import React, { useRef, Suspense, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

function GLBModel(props) {
  const modelRef = useRef();
  const [loadError, setLoadError] = useState(false);

  // Call the hook directly. It will suspend (throw a Promise) while loading and
  // React Suspense will show the fallback. Do NOT wrap useGLTF in try/catch —
  // catching the thrown Promise breaks Suspense and leads to confusing console
  // messages like 'Promise [[PromiseResult]]: undefined'.
  const gltf = useGLTF("/scales_of_justice.glb");
  const scene = gltf ? gltf.scene : null;

  // Add rotation animation (always call useFrame)
  useFrame(() => {
    if (modelRef.current && !loadError) {
      modelRef.current.rotation.y += 0.008;
    }
  });

  // Ensure materials are properly set with marble white color
  React.useEffect(() => {
    if (scene && !loadError) {
      try {
        scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              // Apply a high-contrast silver and gold color scheme
              child.material = child.material.clone();
              child.material.color.setHex(0xd4af37); // Gold color
              child.material.roughness = 0.1;
              child.material.metalness = 1.0;
              child.material.transparent = false;
              child.material.opacity = 1.0;
              child.material.needsUpdate = true;
            }
          }
        });
      } catch (error) {
        console.warn("Error processing materials:", error);
        setLoadError(true);
        if (props.onError) {
          props.onError(error);
        }
      }
    }
  }, [scene, loadError, props]);

  if (loadError || !scene) {
    // Return a simple fallback instead of null
    return (
      <mesh {...props} ref={modelRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>
    );
  }

  try {
    return <primitive ref={modelRef} object={scene.clone()} {...props} />;
  } catch (error) {
    console.warn("Error rendering primitive:", error);
    setLoadError(true);
    if (props.onError) {
      props.onError(error);
    }
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
    <group ref={modelRef} {...props}>
      {/* Base */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial
          color="#3b3182"
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Stand */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 2, 16]} />
        <meshStandardMaterial
          color="#2a245c"
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Cross Beam */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.5, 0.12, 0.12]} />
        <meshStandardMaterial
          color="#a7a1ff"
          roughness={0.1}
          metalness={1.0}
          transparent
          opacity={0.9}
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
