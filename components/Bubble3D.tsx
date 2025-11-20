// @ts-nocheck
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const SoapBubble = ({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Random offset for wobble
  const offset = useMemo(() => Math.random() * 100, []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * speed;
      // Gentle floating movement is handled by <Float>, we add wobble here
      // Scale wobble to simulate surface tension elasticity
      const s = scale + Math.sin(t * 2 + offset) * 0.02 * scale;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
      <meshPhysicalMaterial
        roughness={0}
        metalness={0.1}
        transmission={0.95} // Glass-like
        thickness={2} // Refraction
        clearcoat={1}
        clearcoatRoughness={0}
        ior={1.33} // Water IOR
        iridescence={1}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 800]} // Soap film thickness range in nm
        color="#ffffff"
        transparent
        opacity={1}
        side={THREE.DoubleSide}
      />
    </Sphere>
  );
};

export const BubbleHeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <Environment preset="warehouse" />
        
        {/* Main Group of Bubbles */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.5, 0.5]}>
           <SoapBubble position={[0, 0, 0]} scale={2.2} />
        </Float>

        <Float speed={3} rotationIntensity={1} floatIntensity={1.5} floatingRange={[-1, 1]}>
           <SoapBubble position={[-3.5, 2, -2]} scale={1.2} speed={1.2} />
           <SoapBubble position={[3.5, -1.5, -3]} scale={1.5} speed={0.8} />
           <SoapBubble position={[-2, -3, -1]} scale={0.8} speed={1.5} />
           <SoapBubble position={[2.5, 2.5, -2]} scale={1.0} speed={1.1} />
        </Float>
        
        {/* Distant background bubbles */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            <SoapBubble position={[-5, 0, -10]} scale={3} />
            <SoapBubble position={[6, 4, -12]} scale={2} />
        </Float>

      </Canvas>
    </div>
  );
};