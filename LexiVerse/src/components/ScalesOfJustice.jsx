import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function ScalesOfJustice(props) {
  // This hook loads your new GLB file from the /public folder
  const { nodes, materials } = useGLTF("/scales_of_justice.glb");
  const modelRef = useRef();

  // This hook runs on every frame to create the animation
  useFrame(() => {
    if (modelRef.current) {
      // Slow, subtle, non-distracting rotation
      modelRef.current.rotation.y += 0.002;
    }
  });

 return (
   <group
     ref={modelRef}
     {...props}
     dispose={null}
     scale={2.5}
     position={[0, -1.5, 0]}
   >
     <mesh
       castShadow
       receiveShadow
       geometry={nodes.Object_2?.geometry}
       material={materials.Default}
     />
   </group>
 );
}

// Preload the model for a smoother loading experience
useGLTF.preload("/scales_of_justice.glb");
