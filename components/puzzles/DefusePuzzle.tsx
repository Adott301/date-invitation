"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Scissors, Power, AlertTriangle, BookOpen, Skull, RefreshCw, Copy, CheckCircle } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";
import { clsx } from "clsx";
import confetti from "canvas-confetti";
import useSound from "use-sound";

const BOOM_SFX = "/cinematic-boom-335489.mp3";

interface Wire {
  id: string;
  color: "red" | "blue" | "green" | "yellow";
  cut: boolean;
}

export default function DefusePuzzle() {
  const { setView, solveClue } = useGame();
  const { playWireCut, playSwitch, playError, stopError, playTyping, playSuccess, playClick } = useSpySound();
  const [playBoom] = useSound(BOOM_SFX, { volume: 0.5 });
  
  const [wires, setWires] = useState<Wire[]>([
    { id: "w1", color: "red", cut: false },
    { id: "w2", color: "blue", cut: false },
    { id: "w3", color: "green", cut: false },
    { id: "w4", color: "yellow", cut: false },
  ]);

  const [toggles, setToggles] = useState([false, false, false, false]); 
  const [showManual, setShowManual] = useState(false);
  const [explosion, setExplosion] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(42); 
  const [isDefused, setIsDefused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const REWARD_CODE = "CODE-PART-2";

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 || explosion || isDefused || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerFail("ERROR: TIME EXPIRED. CRITICAL FAILURE.", true);
          return 0;
        }
        playTyping(); // Ticking sound
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, explosion, isDefused, gameOver]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:00`;
  };

  const handleCut = (id: string, color: string) => {
    if (explosion || isDefused || gameOver) return;
    playWireCut();

    // Always cut visuals first
    setWires(prev => prev.map(w => w.id === id ? { ...w, cut: true } : w));

    if (color === "blue") {
      // First step of sequence - Safe to cut
      return;
    }

    if (color === "red") {
       const blueWire = wires.find(w => w.color === "blue");
       if (!blueWire?.cut) {
           triggerFail("ERROR: SEQUENCE VIOLATION. BLUE WIRE REQUIRED FIRST.", true);
           return;
       }

       if (toggles[0] === true) {
          stopError(); // Stop any pending error sounds
          triggerSuccess();
       } else {
          // Now Fatal if override is wrong/missing
          triggerFail("ERROR: BIOMETRICS MISMATCH. CHECK EYE COLOR SWITCH.", true);
       }
       return;
    }

    // Other wires (Green/Yellow) remain non-fatal
    triggerFail("WARNING: WRONG WIRE. SYSTEM UNSTABLE.", false);
  };

  const handleToggle = (index: number) => {
    if (explosion || isDefused || gameOver) return;
    playSwitch();
    setToggles(prev => {
        const newToggles = [...prev];
        newToggles[index] = !newToggles[index];
        return newToggles;
    });
  };

  const triggerFail = (msg: string, isFatal: boolean) => {
      setMessage(msg);
      setExplosion(true);
      
      if (isFatal) {
          playBoom(); // Cinematic Boom
          setGameOver(true);
      } else {
          playError();
          confetti({
             particleCount: 50,
             spread: 45,
             colors: ['#ef4444', '#b91c1c'], // Red colors
             startVelocity: 30,
         });
          setTimeout(() => {
              setExplosion(false);
              setMessage("");
          }, 2000);
      }
  };

  const triggerSuccess = () => {
      setIsDefused(true);
      playSuccess();
      setMessage("PROTOCOL VERIFIED. BOMB DEFUSED.");
      confetti({
          particleCount: 150,
          spread: 100,
          colors: ['#22c55e', '#00ff00'],
      });
      setTimeout(() => {
          setShowReward(true);
          solveClue("defuse", REWARD_CODE);
      }, 1500);
  };

  const handleRestart = () => {
      setWires([
        { id: "w1", color: "red", cut: false },
        { id: "w2", color: "blue", cut: false },
        { id: "w3", color: "green", cut: false },
        { id: "w4", color: "yellow", cut: false },
      ]);
      setToggles([false, false, false, false]);
      setTimeLeft(42);
      setGameOver(false);
      setExplosion(false);
      setMessage("");
      setIsDefused(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-4 md:p-8 font-mono max-w-6xl mx-auto gap-8 relative overflow-hidden">
       {/* Red Alert Overlay - Triggered by Explosion state (Fatal or Non-Fatal) */}
       {(explosion || gameOver) && (
            <div className={clsx("fixed inset-0 pointer-events-none z-40 bg-red-600/20 mix-blend-overlay", gameOver ? "animate-pulse" : "animate-[ping_1s_ease-in-out]")} />
       )}

       {/* Game Over Modal */}
       <AnimatePresence>
           {gameOver && (
               <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center p-4 backdrop-blur-sm animate-pulse">
                   <motion.div 
                       initial={{ scale: 0.5, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="bg-black border-4 border-red-500 p-8 max-w-lg w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.6)]"
                   >
                       <Skull className="w-24 h-24 text-red-500 mx-auto mb-6 animate-bounce" />
                       <h1 className="text-5xl font-black text-red-500 mb-2 tracking-widest glitch-text">MISSION FAILED</h1>
                       <p className="text-xl text-white font-bold mb-8 uppercase tracking-widest">Agent [NAME]</p>
                       
                       <button 
                           onMouseEnter={() => playClick()} // Hover
                           onClick={() => { playClick(); handleRestart(); }}
                           className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105"
                       >
                           <RefreshCw className="w-5 h-5" />
                           Restart Simulation
                       </button>
                   </motion.div>
               </div>
           )}
       </AnimatePresence>

       {/* Reward Modal */}
       <AnimatePresence>
         {showReward && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="bg-zinc-900 border-2 border-green-500 p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.3)] relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
                   <h2 className="text-3xl font-bold text-green-500 mb-2">BOMB DEFUSED</h2>
                   <p className="text-zinc-400 text-sm uppercase tracking-widest mb-6">Threat Neutralized</p>
                   
                   <div className="bg-black p-4 border border-zinc-700 mb-6 relative group cursor-pointer"
                        onClick={() => navigator.clipboard.writeText(REWARD_CODE)}
                   >
                       <p className="text-xs text-zinc-500 uppercase mb-1">Passkey Fragment #2</p>
                       <div className="text-3xl font-mono font-bold text-white tracking-[0.2em] flex items-center justify-center gap-2">
                           {REWARD_CODE}
                           <Copy className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                       </div>
                   </div>

                   <button 
                      onMouseEnter={() => playClick()}
                      onClick={() => { playClick(); setView('dashboard'); }}
                      className="w-full py-4 bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-widest transition-all"
                   >
                      Return to Dashboard
                   </button>
                </motion.div>
            </div>
         )}
       </AnimatePresence>

       {/* Left Panel: Bomb Interface */}
       <div className="flex-1 flex flex-col relative z-10">
          <header className="flex justify-between items-center mb-8 border-b border-blue-500/30 pb-4">
             <button 
                onMouseEnter={() => playClick()}
                onClick={() => { playClick(); setView('dashboard'); }}
                className="flex items-center text-blue-500 hover:text-blue-400 uppercase tracking-widest text-xs font-bold gap-2 group"
             >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Abort Mission
             </button>
             <h1 className="text-xl font-bold tracking-widest text-blue-500">CASE B: DEFUSAL</h1>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center relative bg-zinc-900 border-4 border-zinc-800 p-8 rounded-xl shadow-2xl">
              {/* Timer */}
              <div className="bg-black border-2 border-red-900/50 px-8 py-4 mb-12 rounded shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                  <span className={clsx("text-6xl font-bold tracking-widest font-mono", explosion ? "text-red-500 animate-ping" : "text-red-500")}>
                     {explosion && gameOver ? "00:00:00" : formatTime(timeLeft)}
                  </span>
              </div>

               {/* Message Display */}
               <div className="h-8 mb-8 text-center w-full">
                   {message && (
                       <p className={clsx("text-sm font-bold uppercase tracking-widest animate-pulse", explosion ? "text-red-500" : "text-green-500")}>
                           {message}
                       </p>
                   )}
               </div>

              <div className="flex gap-12 w-full max-w-md justify-between">
                  {/* Wires Section */}
                  <div className="flex flex-col gap-6 items-center flex-1">
                      <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Signal Lines</h3>
                      {wires.map((wire) => (
                          <div key={wire.id} className="relative w-full h-8 group flex items-center">
                              {/* The Wire Visual - Uncut */}
                              {!wire.cut && (
                                  <div 
                                    className={clsx("absolute top-1/2 left-0 right-0 h-3 rounded-full shadow-lg transition-all", 
                                        wire.color === "red" && "bg-red-600",
                                        wire.color === "blue" && "bg-blue-600",
                                        wire.color === "green" && "bg-green-600",
                                        wire.color === "yellow" && "bg-yellow-500"
                                    )} 
                                  />
                              )}
                              
                              {/* Cut Ends (Visible if cut) - Animated */}
                                {wire.cut && (
                                    <>
                                        <motion.div 
                                            initial={{ width: "50%" }}
                                            animate={{ width: "45%" }}
                                            className={clsx("absolute top-1/2 left-0 h-3 rounded-l-full", `bg-${wire.color}-600`)} 
                                        />
                                        <motion.div 
                                            initial={{ opacity: 1, scale: 2 }}
                                            animate={{ opacity: 0, scale: 0 }}
                                            className="absolute top-1/2 left-[48%] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] z-20"
                                        />
                                        <motion.div 
                                            initial={{ width: "50%" }}
                                            animate={{ width: "45%" }}
                                            className={clsx("absolute top-1/2 right-0 h-3 rounded-r-full", `bg-${wire.color}-600`)} 
                                        />
                                    </>
                                )}

                              {/* Hover Interaction */}
                              {!wire.cut && !isDefused && !gameOver && (
                                  <button 
                                    onMouseEnter={() => playClick()}
                                    onClick={() => handleCut(wire.id, wire.color)}
                                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                  >
                                      <Scissors className="text-white drop-shadow-md w-6 h-6 rotate-90" />
                                  </button>
                              )}
                          </div>
                      ))}
                  </div>

                  {/* Switches Section */}
                  <div className="flex flex-col gap-4 items-center">
                     <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Overrides</h3>
                     <div className="grid grid-cols-2 gap-4">
                         {toggles.map((state, i) => (
                             <button
                                key={i}
                                onMouseEnter={() => playClick()}
                                onClick={() => handleToggle(i)}
                                disabled={isDefused || gameOver}
                                className={clsx(
                                    "w-12 h-20 rounded border-2 flex flex-col items-center justify-between p-2 transition-all shadow-inner",
                                    state ? "bg-green-900/30 border-green-500" : "bg-black border-zinc-700",
                                    (isDefused || gameOver) && "opacity-50 cursor-not-allowed"
                                )}
                             >
                                 <div className={clsx("w-full h-2 rounded-full", state ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-zinc-800")} />
                                 <div className={clsx("w-4 h-8 rounded shadow-md transition-transform", state ? "bg-green-600 translate-y-[-10px]" : "bg-zinc-500 translate-y-[10px]")} />
                                 <div className={clsx("w-full h-2 rounded-full", !state ? "bg-red-500/50" : "bg-zinc-800")} />
                             </button>
                         ))}
                     </div>
                  </div>
              </div>
          </div>
       </div>

       {/* Right Panel: The Manual */}
       <div className={clsx("w-full md:w-80 bg-zinc-900 border-l-4 border-yellow-600 overflow-hidden flex flex-col shadow-2xl transition-all", showManual ? "fixed inset-0 z-50 md:relative md:z-auto" : "")}>
            <div className="bg-yellow-600 p-4 text-black font-bold uppercase tracking-widest flex justify-between items-center">
                <span className="flex items-center gap-2"><BookOpen className="w-5 h-5"/> Field Manual</span>
                <span className="text-xs opacity-70">Vol. 1</span>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto text-zinc-300 text-sm font-sans leading-relaxed">
                <div className="bg-black/30 p-4 border border-zinc-700 rounded">
                    <h4 className="text-yellow-500 font-bold uppercase mb-2 text-xs tracking-widest">Section 1: Biometrics</h4>
                    <p>Before modifying signal paths, verify Agent Identity.</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-xs opacity-80">
                        <li>If Agent&apos;s eyes are <strong>[COLOR]</strong>, flip <strong>switch 1</strong>.</li>
                        <li>If eyes are [COLOR 2], enable Override 2.</li>
                        <li>Otherwise, keep all Overrides FLIPPED DOWN.</li>
                    </ul>
                </div>

                <div className="bg-black/30 p-4 border border-zinc-700 rounded">
                    <h4 className="text-blue-500 font-bold uppercase mb-2 text-xs tracking-widest">Section 2: Hazards</h4>
                    <p className="text-xs">
                        <strong>WARNING:</strong> Check specific conditions.
                    </p>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-xs opacity-80">
                         <li>If Agent loves <strong>[TOPIC 1]</strong>, do <strong>NOT</strong> cut the Blue wire.</li>
                         <li>If Agent studies <strong>[TOPIC 2]</strong>, cut yellow first.</li>
                    </ul>
                </div>

                <div className="bg-black/30 p-4 border border-zinc-700 rounded">
                    <h4 className="text-red-500 font-bold uppercase mb-2 text-xs tracking-widest">Section 3: Timeline Check</h4>
                    <p className="text-xs">
                        Calculate relationship duration.
                    </p>
                     <ul className="list-disc pl-4 mt-2 space-y-1 text-xs opacity-80">
                        <li>If relationship duration {'>'} 1 Year, cut the <strong>RED WIRE</strong>.</li>
                        <li>If duration {'<'} 1 Month, abort mission.</li>
                     </ul>
                </div>
            </div>
       </div>
    </div>
  );
}
