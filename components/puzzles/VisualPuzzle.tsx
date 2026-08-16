"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair, MapPin, Copy, Loader2, Plane } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";
import { clsx } from "clsx";
import confetti from "canvas-confetti";

interface StageData {
    id: number;
    hint: string;
    x: number;
    y: number;
    memoryText: string;
}

const STAGES: StageData[] = [
  {
    id: 1,
    hint: "STEP 1: Locate the Origin Point.",
    x: 52, y: 35, // Approx coordinates
    memoryText: "Location 1 - [DATE]. The place we met.",
  },
  {
    id: 2,
    hint: "STEP 2: Locate the second encounter.",
    x: 47, y: 34, 
    memoryText: "Location 2. A special memory.",
  },
  {
    id: 3,
    hint: "STEP 3: Our recent mission.",
    x: 28, y: 41, 
    memoryText: "Location 3. Another significant event.",
  }
];

export default function VisualPuzzle() {
  const { setView, solveClue } = useGame();
  const { playTargetLocked, playSuccess, playDeploy, playClick } = useSpySound(); // Add playClick
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);
  const [acquisitionProgress, setAcquisitionProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  interface FoundPoint {
     id: number;
     x: number;
     y: number;
     label: string;
  }
  
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [foundPoints, setFoundPoints] = useState<FoundPoint[]>([]);
  const [showMemory, setShowMemory] = useState<StageData | null>(null);
  const [showReward, setShowReward] = useState(false);
  
  const TOLERANCE = 2; 
  const REWARD_CODE = "CODE-PART-3";

  const currentTarget = STAGES[currentStageIndex];
  const isMissionComplete = foundPoints.length === STAGES.length;

  // Acquisition Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHoveringTarget && !isLocked && !showMemory && !isMissionComplete) {
        interval = setInterval(() => {
            setAcquisitionProgress(prev => {
                const next = prev + 2;
                if (next >= 100) {
                    clearInterval(interval);
                    setIsLocked(true);
                    playTargetLocked();
                    return 100;
                }
                return next; 
            });
        }, 50); 
    } else {
        setAcquisitionProgress(0);
    }

    return () => clearInterval(interval);
  }, [isHoveringTarget, isLocked, showMemory, isMissionComplete, playTargetLocked]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showMemory || isMissionComplete || !containerRef.current || !currentTarget) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePos({ x, y });

    const dist = Math.sqrt(Math.pow(x - currentTarget.x, 2) + Math.pow(y - currentTarget.y, 2));
    if (dist < TOLERANCE) {
        setIsHoveringTarget(true);
    } else {
        setIsHoveringTarget(false);
        setIsLocked(false);
        setAcquisitionProgress(0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked && !showMemory && !isMissionComplete && currentTarget && containerRef.current) {
        
        // Calculate exact click position to ensure zero lag
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;

        // Success Logic
        const newPoint = {
            id: currentTarget.id,
            x: clickX,
            y: clickY,
            label: currentTarget.id === 1 ? "LOCATION 1" : currentTarget.id === 2 ? "LOCATION 2" : "LOCATION 3" 
        };
        setFoundPoints(prev => [...prev, newPoint]);
        setShowMemory(currentTarget);
        setIsLocked(false);
        setIsHoveringTarget(false);
        setAcquisitionProgress(0);
        
        // Sound
        if (currentStageIndex === STAGES.length - 1) {
            playDeploy(); // Final sound
        } else {
            playSuccess(); // Stage success
        }

        // Delay before next stage
        setTimeout(() => {
            setShowMemory(null);
            
            if (currentStageIndex < STAGES.length - 1) {
                setCurrentStageIndex(prev => prev + 1);
            } else {
                // Final Win
                triggerWin();
            }
        }, 3000);
    }
  };

  const triggerWin = () => {
      confetti({
        particleCount: 150,
        spread: 100,
        colors: ['#22c55e', '#a855f7'] 
      });
      setShowReward(true);
      solveClue("visual", REWARD_CODE);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 font-mono max-w-6xl mx-auto h-screen overflow-hidden">
       
       {/* Memory Popup */}
       <AnimatePresence>
           {showMemory && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
               >
                   <div className="bg-black/90 border-2 border-purple-500 p-8 max-w-lg text-center shadow-[0_0_50px_rgba(168,85,247,0.5)] rounded-xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-purple-500/10" />
                       <Plane className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                       <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Memory Recovered</h3>
                       <p className="text-purple-300 font-mono text-lg">{showMemory.memoryText}</p>
                       <div className="mt-4 w-full h-1 bg-purple-900 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 3, ease: "linear" }}
                              className="h-full bg-purple-500"
                           />
                       </div>
                   </div>
               </motion.div>
           )}
       </AnimatePresence>

       {/* Reward Modal (Final) */}
       <AnimatePresence>
         {showReward && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
                <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="bg-zinc-900 border-2 border-green-500 p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.3)] relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
                   <h2 className="text-3xl font-bold text-green-500 mb-2">TARGET IDENTIFIED</h2>
                   <p className="text-zinc-400 text-sm uppercase tracking-widest mb-6">Location Data Secured</p>
                   
                   <div className="bg-black p-4 border border-zinc-700 mb-6 relative group cursor-pointer"
                        onClick={() => navigator.clipboard.writeText(REWARD_CODE)}
                   >
                       <p className="text-xs text-zinc-500 uppercase mb-1">Passkey Fragment #3</p>
                       <div className="text-3xl font-mono font-bold text-white tracking-[0.2em] flex items-center justify-center gap-2">
                           {REWARD_CODE}
                           <Copy className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                       </div>
                   </div>

                   <button 
                      onClick={() => {
                          playClick();
                          setView('dashboard');
                      }}
                      className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-widest transition-all"
                   >
                      Return to Dashboard
                   </button>
                </motion.div>
            </div>
         )}
       </AnimatePresence>

       {/* Header */}
       <header className="flex justify-between items-center mb-4 border-b border-purple-500/30 pb-4 shrink-0">
          <button 
             onMouseEnter={() => playClick()}
             onClick={() => { playClick(); setView('dashboard'); }}
             className="flex items-center text-purple-500 hover:text-purple-400 uppercase tracking-widest text-xs font-bold gap-2 group"
          >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             Abort Recon
          </button>
          <div className="text-right">
             <h1 className="text-xl font-bold tracking-widest text-purple-500">CASE C: TRIANGULATION</h1>
             <p className="text-sm md:text-base font-bold text-green-500 uppercase animate-pulse">
                 {currentTarget ? currentTarget.hint : "Mission Complete"}
             </p>
          </div>
       </header>

       <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full max-h-[80vh]">
          
          {/* Instructions Overlay */}
          {!showMemory && !showReward && !isHoveringTarget && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 px-6 py-2 rounded-full border border-purple-500/30 backdrop-blur-sm pointer-events-none transition-all">
                  <p className="text-xs uppercase tracking-widest text-purple-300 flex items-center gap-2">
                     <Crosshair className="w-4 h-4" /> 
                     Scan Sector for Signal #{currentStageIndex + 1}
                  </p>
              </div>
          )}

          {/* Image Container */}
          <div 
             ref={containerRef}
             onMouseMove={handleMouseMove}
             onClick={handleClick}
             className="relative w-full h-full bg-zinc-900 border-2 border-zinc-800 rounded-lg overflow-hidden cursor-none group shadow-2xl"
             style={{
                 backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=3433&auto=format&fit=crop')",
                 backgroundSize: "cover",
                 backgroundPosition: "center"
             }}
          >
             {/* Scanlines Overlay */}
             <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10" />

             {/* Grid Overlay */}
             <div className="absolute inset-0 pointer-events-none opacity-20" 
                  style={{
                      backgroundImage: "linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)",
                      backgroundSize: "50px 50px"
                  }}
             />
             


             {/* Lens Cursor & Lock UI */}
             {!showMemory && !isMissionComplete && currentTarget && (
                 <motion.div 
                     className={clsx(
                         "absolute pointer-events-none z-30 w-16 h-16 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-brightness-150 transition-colors duration-200",
                         isLocked ? "border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.6)]" 
                         : isHoveringTarget ? "border-yellow-500 bg-yellow-500/5"
                         : "border-purple-500/50"
                     )}
                     style={{
                         left: `${mousePos.x}%`,
                         top: `${mousePos.y}%`
                     }}
                 >
                    {/* Crosshair lines */}
                    {!isLocked && (
                        <>
                            <div className="absolute w-full h-[1px] bg-white/30" />
                            <div className="absolute h-full w-[1px] bg-white/30" />
                        </>
                    )}

                    {/* Progress Ring */}
                    {isHoveringTarget && !isLocked && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" fill="none" strokeWidth="2" stroke="currentColor" className="text-white/10" />
                            <motion.circle 
                                cx="50" cy="50" r="48" fill="none" strokeWidth="4" stroke="currentColor" 
                                className="text-yellow-500"
                                strokeDasharray="301.59"
                                strokeDashoffset={301.59 - (301.59 * acquisitionProgress) / 100}
                            />
                        </svg>
                    )}

                    {/* Status Text */}
                    <div className="absolute top-full mt-4 text-center whitespace-nowrap">
                        {isLocked ? (
                             <div className="flex flex-col items-center">
                                 <span className="bg-green-600 text-black font-bold px-2 py-1 text-[10px] uppercase tracking-widest rounded animate-pulse">
                                    TARGET LOCKED
                                 </span>
                                 <span className="text-[10px] md:text-sm text-green-500 font-black uppercase mt-1 bg-black/80 px-2 py-1 rounded border border-green-500/50">Click to Confirm</span>
                             </div>
                        ) : isHoveringTarget ? (
                            <div className="text-yellow-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                 <Loader2 className="w-3 h-3 animate-spin"/>
                                 ACQUIRING... {Math.round(acquisitionProgress)}%
                            </div>
                        ) : null}
                    </div>
                 </motion.div>
             )}

             {/* Found Markers */}
             <AnimatePresence>
                {foundPoints.map((point) => (
                    <motion.div 
                        key={point.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] z-40 group"
                        style={{
                            left: `${point.x - 1}%`,
                            top: `${point.y - 3}%`,
                            
                        }}
                    >
                        <MapPin className="w-8 h-8 fill-purple-500/20" />
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] font-bold bg-black/50 px-2 rounded-sm border border-purple-500/30 backdrop-blur-md">
                            {point.label}
                        </span>
                    </motion.div>
                ))}
             </AnimatePresence>
          </div>
       </div>
    </div>
  );
}
