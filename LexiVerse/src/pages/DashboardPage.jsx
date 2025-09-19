import React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import ScalesOfJustice from "../components/ScalesOfJustice";
import IntelligentSummary from "../components/IntelligentSummary";
import RagChatbot from "../components/RagChatbot";

export default function DashboardPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3a5f 0%, #2c5f2d 50%, #1e3a5f 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      >
        <Canvas
          camera={{ position: [0, 5, 10], fov: 45 }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <ScalesOfJustice />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
          <Environment preset="studio" />
        </Canvas>
      </div>

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "20px",
          display: "flex",
          gap: "20px",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IntelligentSummary />
        <RagChatbot />
      </div>
    </div>
  );
}