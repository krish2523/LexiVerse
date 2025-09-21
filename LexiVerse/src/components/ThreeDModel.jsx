import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScalesOfJustice } from "./ScalesOfJustice";

// Standalone ThreeDModel copied from Dashboard.jsx for reuse without touching Dashboard.jsx
export const ThreeDModel = React.memo(({ modelError, setModelError }) => {
  if (modelError) {
    return (
      <div
        style={{
          width: "100px",
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "50%",
          border: "2px solid rgba(59, 130, 246, 0.3)",
        }}
      >
        <span style={{ fontSize: "24px" }}>⚖️</span>
      </div>
    );
  }

  try {
    return (
      <div style={{ width: "100px", height: "100px" }}>
        <Canvas
          camera={{ position: [0, 0, 2], fov: 50 }}
          onError={() => {
            console.warn("Canvas error occurred");
            setModelError(true);
          }}
        >
          <ambientLight intensity={2.5} />
          <directionalLight position={[3, 3, 3]} intensity={2} />
          <pointLight position={[0, 1, 2]} intensity={3} color="#e0dffc" />
          <Suspense
            fallback={null}
            onError={() => {
              console.warn("Suspense error in 3D model");
              setModelError(true);
            }}
          >
            <ScalesOfJustice
              scale={0.3}
              position={[0, -0.5, 0]}
              onError={() => setModelError(true)}
            />
          </Suspense>
        </Canvas>
      </div>
    );
  } catch (error) {
    console.warn("3D Model error:", error);
    setModelError(true);
    return (
      <div
        style={{
          width: "100px",
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "50%",
          border: "2px solid rgba(59, 130, 246, 0.3)",
        }}
      >
        <span style={{ fontSize: "24px" }}>⚖️</span>
      </div>
    );
  }
});

export default ThreeDModel;
