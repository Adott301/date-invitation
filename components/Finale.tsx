"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Image as ImageIcon, Terminal, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";
import { clsx } from "clsx";

export default function Finale() {
  const { setView, completeMission, stopAmbience } = useGame();
  const { 
    playTyping, 
    playAccessDenied, 
    playClick, 
    playFinaleBeat, 
    stopFinaleBeat, 
    playCute, 
    playConfetti, 
    playFunkyLoop 
  } = useSpySound();
  
  const [stage, setStage] = useState<"terminal" | "decrypting" | "proposal" | "success">("terminal");
  const [progress, setProgress] = useState(0);
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState(false);
  
  // Start logic: Ensure silence initially
  useEffect(() => {
      stopAmbience();
      // playFinaleBeat() removed - waits for decryption
      return () => stopFinaleBeat();
  }, [stopAmbience, stopFinaleBeat]);

  // Terminal Logic
  const FINAL_CODE = "TEMPLATE-CODE";
  
  const handleTerminalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      playClick();
      if (inputCode.toUpperCase().trim() === FINAL_CODE) {
          playFinaleBeat(); // Start text music now
          setStage("decrypting");
      } else {
          playAccessDenied();
          setError(true);
          setTimeout(() => setError(false), 2000);
      }
  };

  // Decryption Animation
  useEffect(() => {
    if (stage === "decrypting") {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            playCute(); // Aww sound
            setStage("proposal");
            return 100;
          }
          return prev + Math.random() * 5; 
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage, playCute]);

  // Runaway Button Logic
  const [declinePos, setDeclinePos] = useState({ x: 0, y: 0 });
  
  const moveButton = () => {
    // Move randomly within a 200px radius but keep on screen ideally
    const randomX = (Math.random() - 0.5) * 300;
    const randomY = (Math.random() - 0.5) * 300;
    setDeclinePos({ x: randomX, y: randomY });
  };

  const handleAccept = () => {
     stopFinaleBeat(); // Stop the beat
     playConfetti(); // Play confetti sound
     playFunkyLoop(); // Start celebration music
     setStage("success");
     completeMission();
     
     // Big confetti
     const duration = 3000;
     const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ef4444', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ef4444', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        
        {/* Stage 0: Terminal Input */}
        {stage === "terminal" && (
            <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-lg"
            >
                <div className="bg-zinc-900 border-2 border-green-500 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <div className="flex items-center gap-4 mb-6 border-b border-green-900 pb-4">
                        <Terminal className="w-8 h-8 text-green-500" />
                        <div>
                            <h1 className="text-xl font-bold text-green-500 tracking-widest uppercase">Master Control</h1>
                            <p className="text-xs text-green-700 uppercase">Awaiting Decryption Keys</p>
                        </div>
                    </div>

                    <form onSubmit={handleTerminalSubmit} className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-xs text-green-500/70 uppercase tracking-widest block">
                                Enter Assembled Passkey:
                             </label>
                             <div className="relative">
                                 <input 
                                    type="text"
                                    value={inputCode}
                                    onChange={(e) => {
                                        setInputCode(e.target.value);
                                        setError(false);
                                        playTyping();
                                    }}
                                    placeholder="YOUR-CODE-HERE"
                                    className={clsx(
                                        "w-full bg-black border-2 outline-none p-4 text-center font-mono text-xl uppercase tracking-widest transition-all",
                                        error 
                                            ? "border-red-500 text-red-500 placeholder:text-red-900 animate-shake" 
                                            : "border-green-800 focus:border-green-500 text-green-500 placeholder:text-green-900"
                                    )}
                                    autoFocus
                                 />
                                 {error && (
                                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                         <Lock className="w-5 h-5 text-red-500" />
                                     </div>
                                 )}
                             </div>
                             {error && (
                                 <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-pulse">
                                     Access Denied: Invalid Sequence
                                 </p>
                             )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onMouseEnter={() => playClick()}
                                onClick={() => setView('dashboard')}
                                className="flex-1 py-3 bg-zinc-800 text-zinc-500 uppercase tracking-widest font-bold text-sm hover:text-white transition-colors"
                            >
                                <span className="flex items-center justify-center gap-2">&lt; Abort</span>
                            </button>
                            <button
                                type="submit"
                                onMouseEnter={() => playClick()}
                                className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-black uppercase tracking-widest font-bold text-sm transition-all shadow-lg"
                            >
                                Execute
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        )}

        {/* Stage 1: Decryption */}
        {stage === "decrypting" && (
          <motion.div
            key="decrypt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg text-center space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-green-500 glitch-text tracking-widest">
              DECRYPTING...
            </h1>
            <div className="w-full h-4 bg-green-900/30 border border-green-500/50 rounded-full overflow-hidden">
               <motion.div 
                  className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                  style={{ width: `${progress}%` }}
               />
            </div>
            <div className="font-mono text-green-500/70 text-sm">
               {progress < 30 && "By-passing Firewall..."}
               {progress >= 30 && progress < 70 && "Parsing Secure Payload..."}
               {progress >= 70 && progress < 100 && "Rendering Heart Protocol..."}
               {progress === 100 && "ACCESS GRANTED"}
            </div>
          </motion.div>
        )}

        {/* Stage 2: Proposal - Resized smaller as requested */}
        {stage === "proposal" && (
          <motion.div
            key="proposal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-zinc-900/90 border-2 border-pink-500 p-8 rounded-2xl shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1),transparent)]" />
            
            <header className="mb-6 relative z-10">
               <div className="inline-block p-2 rounded-full bg-pink-500/20 mb-2 animate-pulse">
                  <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
               </div>
               <h2 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-wide font-sans">
                  MISSION OBJECTIVE:
               </h2>
               <h1 className="text-3xl md:text-5xl font-black text-pink-500 glitch-text tracking-widest uppercase text-pink-500">
                  WILL YOU BE MY VALENTINE?
               </h1>
            </header>

            <div className="space-y-6 relative z-10">
               <p className="text-zinc-300 text-base md:text-lg font-mono">
                  Agent, you have cracked the code. The final mission is yours to accept.
               </p>
               
                <div className="h-48 w-full bg-zinc-800/50 rounded-lg border-2 border-dashed border-pink-500/30 flex flex-col items-center justify-center overflow-hidden relative group">
                   <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent" />
                    <div className="relative z-10 flex flex-col items-center gap-4 w-full h-full">
                       <img 
                          src="/placeholder.jpg" 
                          alt="Valentine" 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                       />
                    </div>
                   
                   {/* Decorative Scan lines */}
                   <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
                </div>

               <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-6 pt-2">
                  <button
                     onMouseEnter={() => playClick()}
                     onClick={handleAccept}
                     className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all hover:scale-105 active:scale-95 w-full md:w-auto text-sm"
                  >
                     Accept Mission
                  </button>

                  <motion.button
                     animate={{ x: declinePos.x, y: declinePos.y }}
                     onMouseEnter={() => { moveButton(); playClick(); }}
                     onClick={moveButton} // Fail safe if they somehow click it
                     className="px-6 py-3 bg-zinc-800 text-zinc-500 font-bold uppercase tracking-widest rounded border border-zinc-700 w-full md:w-auto hover:bg-red-900/20 hover:text-red-500 transition-colors text-sm"
                  >
                     Decline
                  </motion.button>
               </div>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Success */}
        {stage === "success" && (
           <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
           >
              <h1 className="text-5xl md:text-7xl font-bold text-pink-500 mb-4 tracking-tighter">ACCEPTED!</h1>
              <p className="text-2xl text-white font-mono mb-8 opacity-80 uppercase tracking-widest">Date Night Protocol Initiated.</p>
              
              <div className="bg-white text-black p-8 max-w-md mx-auto rounded rotate-[-2deg] shadow-2xl border-b-8 border-r-8 border-zinc-200">
                 <h3 className="font-black text-2xl mb-4 uppercase border-b-4 border-black pb-2 tracking-widest">Mission Ticket</h3>
                 <div className="text-left space-y-3 font-mono text-sm mt-4">
                    <p><strong>AGENT:</strong> [AGENT NAME]</p>
                    <p><strong>OFFICER:</strong> [TARGET NAME]</p>
                    <p><strong>OBJECTIVE:</strong> Valentine&apos;s Date Night</p>
                    <p><strong>DATE:</strong> Feb 14, 20XX</p>
                    <p><strong>STATUS:</strong> CONFIRMED</p>
                 </div>
                 <div className="mt-8 pt-4 border-t-2 border-dashed border-zinc-300 flex justify-between items-center opacity-70">
                    <span className="text-[10px] font-bold">AUTH: [YOUR-CODE]</span>
                    <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                 </div>
              </div>
           </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
