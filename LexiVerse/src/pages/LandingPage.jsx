import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ScalesOfJustice } from "../components/ScalesOfJustice";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <header className="landing-header">
          <img src="/src/assets/Logo.png" alt="LexiVerse Logo" className="logo" />
          <h1>LexiVerse</h1>
        </header>
        <main className="landing-main">
          <div className="text-content">
            <h2>Unlock the Power of Legal AI</h2>
            <p>
              LexiVerse is a cutting-edge platform that leverages generative AI to
              analyze, summarize, and chat with your legal documents. From
              complex contracts to lengthy court filings, get the insights you
              need in seconds.
            </p>
            <h3>Future Endeavors</h3>
            <ul>
              <li>Automated contract drafting and review.</li>
              <li>AI-powered case law and precedent analysis.</li>
              <li>Integration with legal practice management tools.</li>
              <li>AI-Powered Court Hearing Transcription and Summarization.</li>
            </ul>
            <Link to="/dashboard">
              <motion.button
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Launch App
              </motion.button>
            </Link>
          </div>
          <div className="model-container">
            <Suspense fallback={<div>Loading 3D Model...</div>}>
              <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={2.5} />
                <directionalLight position={[3, 3, 3]} intensity={2} />
                <pointLight position={[0, 1, 2]} intensity={3} color="#e0dffc" />
                <ScalesOfJustice scale={0.35} position={[0, -0.5, 0]} />
              </Canvas>
            </Suspense>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default LandingPage;
