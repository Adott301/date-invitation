"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";

export default function MissionBriefing() {
  const { startMission } = useGame();
  const { playTyping, playStamp, playClick, playQuietType } = useSpySound();
  
  // Typewriter effect state
  const text = "Agent [NAME], your target is Officer [NAME]. Intelligence suggests they have been compromised. Solve the 3 cases to unlock the encryption keys. Good luck.";
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      if (i % 4 === 0) playQuietType(); // Quieter typewriter sound
      i++;
      if (i === text.length) {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 40); // speed of typing (fast)
    return () => clearInterval(interval);
  }, [playQuietType]); // Added dependency

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,20,1),rgba(0,0,0,1))] -z-10" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 -z-10" />

      <motion.div
        initial={{ x: -1000, rotate: -10 }}
        animate={{ x: 0, rotate: -2 }}
        transition={{ type: "spring", stiffness: 50, damping: 12 }}
        className="max-w-xl w-full bg-[#fdfbf7] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
        style={{
          boxShadow: "10px 10px 30px rgba(0,0,0,0.5)",
          clipPath: "polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)"
        }}
      >
         {/* Paper Texture Overlay */}
         <div className="absolute inset-0 opacity-5 bg-[#d4c5b1] mix-blend-multiply pointer-events-none" />
         
         {/* "TOP SECRET" Stamp */}
         <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.2 }}
            onAnimationComplete={() => playStamp()} // Thud sound (clipped)
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-red-900 text-red-900 font-black text-6xl md:text-8xl p-4 -rotate-12 select-none pointer-events-none whitespace-nowrap z-0"
         >
            TOP SECRET
         </motion.div>

         <div className="relative z-10 flex flex-col gap-6 font-mono text-zinc-900">
             <header className="border-b-2 border-zinc-900 pb-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    <span className="font-bold tracking-widest uppercase text-sm">Classified Briefing</span>
                 </div>
                 <div className="text-[10px] bg-red-900 text-white px-2 py-1 uppercase font-bold tracking-widest">
                    Eyes Only
                 </div>
             </header>

             <div className="min-h-[120px] text-lg md:text-xl leading-relaxed font-bold font-typewriter">
                {displayedText}
                <span className="animate-pulse">|</span>
             </div>

            <div className="pt-4 border-t border-zinc-900/20 flex justify-end">
                {isTypingComplete && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onMouseEnter={() => playClick()}
                        onClick={() => {
                            playClick();
                            startMission();
                        }}
                        className="bg-zinc-900 text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg group"
                    >
                        <span>Acknowledge Directive</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                )}
            </div>
         </div>
      </motion.div>
    </div>
  );
}
