// @ts-nocheck
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text, OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Play, RotateCcw, AlertCircle, Square, Triangle, Maximize2, Minimize2, Sun, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SHARED UTILS ---
const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-serif font-bold transition-all ${
      active 
        ? 'bg-white text-blue-900 border-t-2 border-blue-500 shadow-[0_4px_0_white]' 
        : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

// --- EXPERIMENT 1: MECHANICS (Young-Laplace) ---

const SURFACE_TENSION = 50;
const FLOW_RATE_CONSTANT = 0.0005;

const Bubble3D = ({ radius, position, label, pressure }: any) => {
  return (
    <group position={position}>
      <Sphere args={[1, 64, 64]} scale={Math.max(0.1, radius)}>
         <meshPhysicalMaterial
            roughness={0}
            transmission={0.9}
            thickness={1.5}
            ior={1.33}
            iridescence={1}
            iridescenceThicknessRange={[200, 600]}
            color={radius < 0.2 ? "#ffaaaa" : "#ffffff"}
            transparent
         />
      </Sphere>
      <Text position={[0, Math.max(0.1, radius) + 0.8, 0]} fontSize={0.3} color="#333" anchorY="bottom">
        {label}
      </Text>
      <Text position={[0, Math.max(0.1, radius) + 0.4, 0]} fontSize={0.2} color="#666" anchorY="bottom">
        {`r = ${radius.toFixed(2)}`}
      </Text>
      <Text position={[0, Math.max(0.1, radius) + 0.15, 0]} fontSize={0.2} color="#0066cc" anchorY="bottom">
        {`P = ${pressure.toFixed(1)}`}
      </Text>
    </group>
  );
};

const Pipe = ({ isOpen }: { isOpen: boolean }) => (
    <group rotation={[0, 0, Math.PI / 2]}>
        <Cylinder args={[0.15, 0.15, 4, 32]} material-color="#ddd" material-transparent material-opacity={0.5}>
            <meshStandardMaterial color="#e5e7eb" transparent opacity={0.8} metalness={0.5} roughness={0.2} />
        </Cylinder>
        <group position={[0, 1, 0]}>
            <Cylinder args={[0.25, 0.25, 0.5, 16]} rotation={[0, 0, 0]}>
                <meshStandardMaterial color={isOpen ? "#4ade80" : "#f87171"} />
            </Cylinder>
            <Text position={[0, 0, 0.4]} fontSize={0.2} color="white">
                {isOpen ? "OPEN" : "SHUT"}
            </Text>
        </group>
    </group>
);

const AirFlowParticles = ({ isOpen, direction }: { isOpen: boolean, direction: 'left' | 'right' | 'none' }) => {
    const particles = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!particles.current || !isOpen || direction === 'none') return;
        particles.current.children.forEach((p, i) => {
             const speed = direction === 'right' ? 2 : -2;
             p.position.x = (p.position.x + speed * 0.02);
             if (p.position.x > 2) p.position.x = -2;
             if (p.position.x < -2) p.position.x = 2;
             p.scale.setScalar(Math.sin(state.clock.elapsedTime * 5 + i) * 0.05 + 0.05);
        });
    });
    return (
        <group ref={particles} visible={isOpen && direction !== 'none'}>
            {[...Array(10)].map((_, i) => (
                <mesh key={i} position={[(i - 5) * 0.4, 0, 0]}>
                    <sphereGeometry args={[0.05]} />
                    <meshBasicMaterial color="#aaa" />
                </mesh>
            ))}
        </group>
    )
};

const MechanicsExperiment = () => {
  const [r1, setR1] = useState(1.2);
  const [r2, setR2] = useState(0.8);
  const [valveOpen, setValveOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const stateRef = useRef({ v1: 0, v2: 0 });

  useEffect(() => {
     if (!animating) {
        const vol1 = (4/3) * Math.PI * Math.pow(r1, 3);
        const vol2 = (4/3) * Math.PI * Math.pow(r2, 3);
        stateRef.current = { v1: vol1, v2: vol2 };
     }
  }, [r1, r2, animating]);

  useEffect(() => {
    let rafId: number;
    const step = () => {
        if (valveOpen) {
            setAnimating(true);
            const { v1, v2 } = stateRef.current;
            const safeV1 = Math.max(0.0001, v1);
            const safeV2 = Math.max(0.0001, v2);

            const curR1 = Math.pow((3 * safeV1) / (4 * Math.PI), 1/3);
            const curR2 = Math.pow((3 * safeV2) / (4 * Math.PI), 1/3);

            if (curR1 < 0.2 || curR2 < 0.2) {
                setValveOpen(false); 
                setAnimating(false);
                return;
            }

            const p1 = (2 * SURFACE_TENSION) / curR1;
            const p2 = (2 * SURFACE_TENSION) / curR2;
            const flow = (p1 - p2) * FLOW_RATE_CONSTANT;

            let newV1 = v1 - flow;
            let newV2 = v2 + flow;

            stateRef.current = { v1: newV1, v2: newV2 };
            setR1(Math.pow((3 * Math.max(0.0001, newV1)) / (4 * Math.PI), 1/3));
            setR2(Math.pow((3 * Math.max(0.0001, newV2)) / (4 * Math.PI), 1/3));
            
            rafId = requestAnimationFrame(step);
        } else {
            setAnimating(false);
        }
    };

    if (valveOpen) rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [valveOpen]);

  const p1 = (2 * SURFACE_TENSION) / Math.max(0.1, r1);
  const p2 = (2 * SURFACE_TENSION) / Math.max(0.1, r2);
  const flowDir = Math.abs(r1 - r2) < 0.01 ? 'none' : (r1 < r2 ? 'right' : 'left');

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
       <div className="relative w-full lg:w-2/3 h-[400px] lg:h-auto bg-gradient-to-b from-blue-50 to-white rounded-xl overflow-hidden">
         <Canvas camera={{ position: [0, 2, 6], fov: 40 }}>
            <ambientLight intensity={1} />
            <spotLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />
            <group position={[0, -0.5, 0]}>
                <Bubble3D radius={r1} position={[-2.2, 0, 0]} label="Bubble A" pressure={p1} />
                <Bubble3D radius={r2} position={[2.2, 0, 0]} label="Bubble B" pressure={p2} />
                <Pipe isOpen={valveOpen} />
                <AirFlowParticles isOpen={valveOpen} direction={flowDir} />
            </group>
            <OrbitControls enableZoom={false} minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
         </Canvas>
      </div>
      
      <div className="w-full lg:w-1/3 flex flex-col justify-center p-4">
          <h3 className="font-serif text-xl text-stone-900 mb-4">實驗一：連通泡泡</h3>
          <div className="space-y-6 mb-8">
            <div>
                <div className="flex justify-between text-sm font-medium mb-2"><span>Bubble A Radius</span><span className="text-blue-600">{r1.toFixed(2)}</span></div>
                <input type="range" min="0.3" max="2.0" step="0.1" value={r1} onChange={(e) => { setValveOpen(false); setR1(parseFloat(e.target.value)); }} disabled={valveOpen} className="w-full accent-blue-500" />
            </div>
            <div>
                <div className="flex justify-between text-sm font-medium mb-2"><span>Bubble B Radius</span><span className="text-blue-600">{r2.toFixed(2)}</span></div>
                <input type="range" min="0.3" max="2.0" step="0.1" value={r2} onChange={(e) => { setValveOpen(false); setR2(parseFloat(e.target.value)); }} disabled={valveOpen} className="w-full accent-blue-500" />
            </div>
         </div>
         <button onClick={() => setValveOpen(!valveOpen)} className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${valveOpen ? 'bg-stone-200 text-stone-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {valveOpen ? 'Simulating...' : <><Play size={16} /> Open Valve</>}
         </button>
         <button onClick={() => {setValveOpen(false); setR1(1.2); setR2(0.8);}} className="mt-2 w-full py-2 text-stone-500 hover:text-stone-800 flex items-center justify-center gap-2"><RotateCcw size={14}/> Reset</button>
      </div>
    </div>
  );
}

// --- EXPERIMENT 2: GEOMETRY (Plateau's Problem) ---

const GeometryExperiment = () => {
    const [mode, setMode] = useState<'direct' | 'soap'>('soap');

    // Coordinates for a square layout
    // Size 200x200 centered
    const size = 200;
    const p = {
        tl: { x: 50, y: 50 },
        tr: { x: 250, y: 50 },
        bl: { x: 50, y: 250 },
        br: { x: 250, y: 250 }
    };

    // Calculations
    // Direct: Diagonals. Length = 2 * sqrt(2) * side
    // Soap: Steiner Tree (Honeycomb). Length = side * (1 + sqrt(3))
    // We scale visual by pixels but display units
    const sideLength = 1.0; // Unit square
    const lenDirect = 2 * Math.sqrt(2) * sideLength; // ~2.828
    const lenSoap = sideLength * (1 + Math.sqrt(3)); // ~2.732
    
    // Visual points for soap film inner junctions (approx for 120 deg)
    // Height of triangle with base 100 and angles 30-30-120 is 100 * tan(30) = 57.7
    const h = 100 * Math.tan(Math.PI / 6); 
    const s1 = { x: 100, y: 50 + h }; // Left junction (shifted for visual square, logic adapted)
    // Actually for a square, junctions are on the midline.
    // Midline x = 150. 
    // Vertical distance from top/bottom is side/2 - (side/2)/sqrt(3) ??
    // Let's just use the visual coordinates for 120 deg
    // The angle relative to horizontal must be 30 deg or 150 deg.
    
    // Correct Steiner points for square:
    // x = 150 +/- ? No, for vertical setup (like Fig 6 in PDF)
    // Points are (50,50), (250,50), (50,250), (250,250)
    // Steiner points are at x=150. y = 50 + 100/sqrt(3) and y = 250 - 100/sqrt(3)
    const offset = 100 / Math.sqrt(3); // ~57.7
    const sp1 = { x: 150, y: 50 + offset };
    const sp2 = { x: 150, y: 250 - offset };

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full items-center">
            <div className="w-full lg:w-2/3 h-[400px] bg-[#F9F8F4] rounded-xl border border-stone-200 relative flex items-center justify-center overflow-hidden">
                <svg width="300" height="300" viewBox="0 0 300 300">
                    {/* Grid */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ddd" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="300" height="300" fill="url(#grid)" />

                    {/* Lines */}
                    {mode === 'direct' ? (
                        <g stroke="#94a3b8" strokeWidth="4" strokeLinecap="round">
                            <line x1={p.tl.x} y1={p.tl.y} x2={p.br.x} y2={p.br.y} />
                            <line x1={p.tr.x} y1={p.tr.y} x2={p.bl.x} y2={p.bl.y} />
                            {/* Angle Label (90deg) */}
                            <circle cx="150" cy="150" r="20" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4"/>
                        </g>
                    ) : (
                        <g stroke="#3b82f6" strokeWidth="6" strokeLinecap="round">
                             {/* Top Y */}
                             <line x1={p.tl.x} y1={p.tl.y} x2={sp1.x} y2={sp1.y} />
                             <line x1={p.tr.x} y1={p.tr.y} x2={sp1.x} y2={sp1.y} />
                             {/* Middle */}
                             <line x1={sp1.x} y1={sp1.y} x2={sp2.x} y2={sp2.y} />
                             {/* Bottom Y */}
                             <line x1={p.bl.x} y1={p.bl.y} x2={sp2.x} y2={sp2.y} />
                             <line x1={p.br.x} y1={p.br.y} x2={sp2.x} y2={sp2.y} />
                             
                             {/* 120 deg indicators */}
                             <path d={`M ${sp1.x} ${sp1.y+20} A 20 20 0 0 0 ${sp1.x+18} ${sp1.y+10}`} fill="none" stroke="white" strokeWidth="2"/>
                        </g>
                    )}

                    {/* Points */}
                    {[p.tl, p.tr, p.bl, p.br].map((pt, i) => (
                        <circle key={i} cx={pt.x} cy={pt.y} r="8" fill="#1c1917" />
                    ))}
                    
                    {/* Steiner Points (only in soap mode) */}
                    {mode === 'soap' && (
                        <>
                            <circle cx={sp1.x} cy={sp1.y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
                            <circle cx={sp2.x} cy={sp2.y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
                            <text x={sp1.x + 10} y={sp1.y} className="text-xs font-sans" fill="#3b82f6">120°</text>
                        </>
                    )}
                </svg>
            </div>

            <div className="w-full lg:w-1/3 flex flex-col justify-center p-4">
                <h3 className="font-serif text-xl text-stone-900 mb-4">實驗二：幾何結構</h3>
                <p className="text-sm text-stone-500 mb-6">
                    普拉圖問題 (Plateau's Problem)：尋找連接這些點的最小總長度。自然界傾向於最小能量狀態。
                </p>

                <div className="flex gap-2 mb-6">
                    <button onClick={() => setMode('direct')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${mode === 'direct' ? 'border-stone-800 bg-stone-100' : 'border-stone-200'}`}>
                        <div className="flex justify-center mb-2"><Maximize2 /></div>
                        <div className="text-xs font-bold text-center uppercase">Direct (X)</div>
                    </button>
                    <button onClick={() => setMode('soap')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${mode === 'soap' ? 'border-blue-500 bg-blue-50' : 'border-stone-200'}`}>
                        <div className="flex justify-center mb-2 text-blue-500"><Minimize2 /></div>
                        <div className="text-xs font-bold text-center uppercase text-blue-600">Soap Film</div>
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Total Path Length</div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-serif text-stone-800">
                            {mode === 'direct' ? lenDirect.toFixed(3) : lenSoap.toFixed(3)}
                        </span>
                        <span className="text-sm text-stone-500 mb-1">units</span>
                    </div>
                    <div className="mt-2 text-xs text-stone-500">
                        {mode === 'soap' ? 
                            <span className="text-green-600 font-bold">✓ Minimal Surface (Energy Efficient)</span> : 
                            <span>Standard geometric center</span>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- EXPERIMENT 3: OPTICS (Interference) ---

const interferenceColor = (thickness: number) => {
    // Simplified approximation of Newton's Series colors for soap film
    // Thickness in nm.
    // 0-10 nm: Black (Destructive)
    // 10-50 nm: Silver/White
    // 50-150 nm: Yellow/Gold
    // 150-250 nm: Blue/Purple
    // ... repeating orders
    
    const t = Math.max(0, thickness);
    if (t < 30) return `rgb(20, 20, 20)`; // Black film
    if (t < 120) return `rgb(240, 240, 250)`; // Silvery white
    if (t < 250) return `rgb(255, 220, 100)`; // Gold/Yellow
    if (t < 350) return `rgb(200, 50, 255)`; // Purple
    if (t < 450) return `rgb(50, 100, 255)`; // Blue
    if (t < 550) return `rgb(50, 255, 150)`; // Green
    if (t < 650) return `rgb(255, 255, 50)`; // Yellow (2nd order)
    if (t < 800) return `rgb(255, 100, 100)`; // Red/Pink
    return `rgb(100, 200, 200)`; // High order mix
};

const OpticsExperiment = () => {
    const [thickness, setThickness] = useState(400); // nm
    const color = interferenceColor(thickness);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            <div className="w-full lg:w-2/3 h-[400px] bg-stone-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                 {/* Simulated Film View */}
                 <div className="absolute inset-0 flex">
                    {/* Left: Cross Section Diagram */}
                    <div className="w-1/2 h-full border-r border-stone-700 p-8 relative">
                         <div className="text-stone-400 text-xs uppercase mb-4 tracking-widest">Film Cross-Section</div>
                         
                         {/* The Film */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 bg-blue-400/20 border-y border-blue-300/50 transition-all duration-300" style={{ height: `${Math.max(2, thickness / 5)}px` }}>
                            {/* Light Paths */}
                            <svg className="absolute inset-0 overflow-visible w-full h-full pointer-events-none">
                                {/* Incident Ray */}
                                <path d="M -20 -50 L 10 0" stroke="yellow" strokeWidth="2" markerEnd="url(#arrow)" />
                                {/* Reflected Ray 1 (Surface) */}
                                <path d="M 10 0 L 40 -50" stroke="yellow" strokeWidth="2" strokeOpacity="0.8" strokeDasharray="4 4" />
                                {/* Refracted Ray */}
                                <path d={`M 10 0 L 20 ${Math.max(2, thickness/5)}`} stroke="yellow" strokeWidth="2" strokeOpacity="0.5" />
                                {/* Reflected Ray 2 (Bottom) */}
                                <path d={`M 20 ${Math.max(2, thickness/5)} L 50 -50`} stroke="yellow" strokeWidth="2" strokeOpacity="0.6" />
                            </svg>
                         </div>
                         
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                             <div className="h-8 border-l border-t border-stone-500 w-2"></div>
                             <span className="text-xs text-stone-300 font-mono">{thickness}nm</span>
                             <div className="h-8 border-l border-b border-stone-500 w-2"></div>
                         </div>
                    </div>

                    {/* Right: Visual Color Result */}
                    <div className="w-1/2 h-full flex flex-col items-center justify-center p-8 relative">
                        <div className="text-stone-400 text-xs uppercase mb-8 tracking-widest">Observed Color</div>
                        <div 
                            className="w-48 h-48 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-colors duration-200 relative"
                            style={{ backgroundColor: color, boxShadow: `0 0 30px ${color}` }}
                        >
                            {/* Specular highlight for bubble look */}
                            <div className="absolute top-8 left-8 w-16 h-8 bg-white/40 rounded-[50%] blur-md rotate-[-45deg]"></div>
                        </div>
                        {thickness < 30 && (
                            <div className="mt-4 text-red-400 text-xs font-bold uppercase animate-pulse">
                                Black Film (Fragile!)
                            </div>
                        )}
                    </div>
                 </div>
            </div>

            <div className="w-full lg:w-1/3 flex flex-col justify-center p-4">
                <h3 className="font-serif text-xl text-stone-900 mb-4">實驗三：干涉色彩</h3>
                <p className="text-sm text-stone-500 mb-6">
                    泡膜的顏色並非來自色素，而是光在薄膜上下表面反射後產生的干涉現象。厚度決定了哪些顏色的光被增強或抵消。
                </p>

                <div className="mb-8">
                    <label className="flex justify-between text-sm font-medium mb-2">
                        <span>Film Thickness ($d$)</span>
                        <span className="font-mono text-blue-600">{thickness} nm</span>
                    </label>
                    <input 
                        type="range" min="0" max="1000" step="10"
                        value={thickness} 
                        onChange={(e) => setThickness(parseInt(e.target.value))}
                        className="w-full accent-purple-500 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                    {/* Color Spectrum Guide */}
                    <div className="w-full h-3 mt-2 rounded-full bg-gradient-to-r from-gray-900 via-white to-red-500 opacity-80"></div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                    <div className="flex gap-2">
                        <Sun size={16} className="shrink-0" />
                        <div>
                            {thickness < 30 ? 
                                "當膜厚極薄 (<30nm) 時，光程差導致破壞性干涉，泡泡呈現黑色（Black Film），即將破裂。" :
                                thickness < 150 ? 
                                "薄膜呈現銀白色或金色。" :
                                "隨著厚度增加，顏色會依序呈現紫、藍、綠、黃、紅的循環變化。"
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- MAIN LAB CONTAINER ---

export const BubbleScienceLab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mechanics' | 'geometry' | 'optics'>('mechanics');

    return (
        <div className="flex flex-col bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden min-h-[600px]">
            {/* Tabs Header */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-8 pt-4 gap-2 overflow-x-auto">
                <TabButton 
                    active={activeTab === 'mechanics'} 
                    onClick={() => setActiveTab('mechanics')} 
                    icon={Play} 
                    label="泡膜力學" 
                />
                <TabButton 
                    active={activeTab === 'geometry'} 
                    onClick={() => setActiveTab('geometry')} 
                    icon={Square} 
                    label="幾何結構" 
                />
                <TabButton 
                    active={activeTab === 'optics'} 
                    onClick={() => setActiveTab('optics')} 
                    icon={Eye} 
                    label="光學干涉" 
                />
            </div>

            {/* Content Area */}
            <div className="p-6 lg:p-8 flex-1 bg-white">
                <AnimatePresence mode="wait">
                    {activeTab === 'mechanics' && (
                        <motion.div key="mech" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                            <MechanicsExperiment />
                        </motion.div>
                    )}
                    {activeTab === 'geometry' && (
                        <motion.div key="geom" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                            <GeometryExperiment />
                        </motion.div>
                    )}
                    {activeTab === 'optics' && (
                        <motion.div key="opt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                            <OpticsExperiment />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Export the main component as default or named
export { BubbleScienceLab as BubbleMechanicsLab }; 
