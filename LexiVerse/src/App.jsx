import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScalesOfJustice } from './components/ScalesOfJustice';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    // The main container for the entire page.
    // The `relative` class is essential for positioning children.
    <div className="relative w-screen h-screen bg-gray-900">

      {/* 3D CANVAS - BACKGROUND */}
      {/* We use absolute positioning and z-index 0 to lock it to the back. */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Canvas>
          {/* Lights are crucial for the model to be visible */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -5, -10]} intensity={1.5} />
          
          <Suspense fallback={null}>
            <ScalesOfJustice />
          </Suspense>
        </Canvas>
      </div>

      {/* DASHBOARD UI - FOREGROUND */}
      {/* We use relative positioning and z-index 10 to pull it to the front. */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <Dashboard />
      </div>

    </div>
  );
}
export default App;
