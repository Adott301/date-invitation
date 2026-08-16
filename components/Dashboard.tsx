"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Database, CheckCircle, Search, Lock } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";
import { clsx } from "clsx";

// Component for the payload reveal (Placeholder for now)
const PayloadReveal = () => (
  <div className="bg-red-900/10 border border-red-500/30 p-8 rounded-sm text-center opacity-70 cursor-not-allowed relative overflow-hidden group">
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(239,68,68,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-0 group-hover:opacity-100 transition-opacity" />
    <Lock className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
    <h3 className="text-xl font-bold text-red-500 tracking-widest font-mono">ENCRYPTED PAYLOAD</h3>
    <p className="text-xs uppercase mt-2 text-red-400 font-mono tracking-wider">Classified Level 5. Complete all objectives to decrypt.</p>
  </div>
);

export default function Dashboard() {
  const { cluesSolved, setView, stopAmbience } = useGame();
  const { playClick } = useSpySound();
  
  // Checking completion status
  const allSolved = Object.values(cluesSolved).every(Boolean);

  const puzzles = [
    {
      id: "conspiracy",
      title: "CASE A: CONNECTIONS",
      subtitle: "The Conspiracy Wall",
      icon: Search,
      solved: cluesSolved.conspiracy,
      color: "text-yellow-500",
      borderColor: "border-yellow-500/50",
      bgHover: "hover:bg-yellow-900/10",
      description: "Analyze the assets. Find the pattern.",
    },
    {
      id: "defuse",
      title: "CASE B: PROTOCOL",
      subtitle: "The Defusal",
      icon: AlertTriangle,
      solved: cluesSolved.defuse,
      color: "text-blue-500",
      borderColor: "border-blue-500/50",
      bgHover: "hover:bg-blue-900/10",
      description: "Follow the manual. Do not panic.",
    },
    {
      id: "visual",
      title: "CASE C: INTELLIGENCE",
      subtitle: "Visual Triangulation",
      icon: Database,
      solved: cluesSolved.visual,
      color: "text-purple-500",
      borderColor: "border-purple-500/50",
      bgHover: "hover:bg-purple-900/10",
      description: "Scan the satellite imagery for hidden data.",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col font-mono">
      <header className="mb-12 border-b border-green-500/30 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-widest text-green-500 glitch-text">CASE FILES_</h1>
          <p className="text-xs md:text-sm opacity-70 tracking-widest uppercase mt-2 text-green-400">
            Operation [NAME] // Agent Dashboard
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] uppercase tracking-widest text-green-500/70">Secure Connection Est.</p>
          <p className="text-[10px] uppercase tracking-widest text-green-500/70">Clearance: Level 4</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
        {puzzles.map((puzzle, index) => (
          <motion.div
            key={puzzle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => !puzzle.solved && playClick()} // Enable Hover Sound only if active
            onClick={() => {
                if (puzzle.solved) return;
                playClick();
                setView(puzzle.id as any);
            }}
            className={clsx(
              "relative border-2 p-6 transition-all group h-64 flex flex-col justify-between backdrop-blur-sm bg-black/60",
              puzzle.solved ? "cursor-default opacity-50 border-green-500/50" : `cursor-pointer ${puzzle.borderColor} ${puzzle.bgHover}`
            )}
          >
            <div className="flex justify-between items-start">
               <puzzle.icon
                  className={clsx("w-8 h-8", puzzle.solved ? "text-green-500" : puzzle.color)}
               />
               {puzzle.solved && <CheckCircle className="text-green-500 w-6 h-6" />}
            </div>

            <div>
              <h2 className={clsx("text-2xl font-bold tracking-wider mb-1", puzzle.solved ? "text-green-500" : puzzle.color)}>
                {puzzle.title}
              </h2>
              <h3 className="text-sm uppercase tracking-widest opacity-80 mb-2">{puzzle.subtitle}</h3>
              <p className="text-xs opacity-60 font-sans">{puzzle.description}</p>
            </div>

            <div className="absolute top-0 right-0 p-2 opacity-30 text-[10px] uppercase tracking-widest">
               REF: 8492-X{index + 1}
            </div>
            
            {!puzzle.solved && (
               <div className="absolute inset-0 border border-transparent group-hover:border-white/5 pointer-events-none transition-colors" />
            )}
          </motion.div>
        ))}
        
        {/* Payload / Finale Section */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-3 mt-4"
        >
            {allSolved ? (
                <div 
                  onMouseEnter={() => playClick()} // Added playClick for hover
                  onClick={() => {
                      playClick();
                      stopAmbience();
                      setView('finale');
                  }}
                  className="bg-green-900/20 border-2 border-green-500 p-8 rounded-sm text-center cursor-pointer hover:bg-green-500/20 transition-all animate-pulse group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <h3 className="text-2xl md:text-3xl font-bold text-green-500 tracking-widest glitch-text mb-4 relative z-10">CONFIDENTIAL PAYLOAD DECRYPTED</h3>
                    <p className="text-sm md:text-lg uppercase tracking-widest text-green-400 relative z-10">Click to Access Final Objective</p>
                </div>
            ) : (
                <PayloadReveal />
            )}
        </motion.div>
      </div>
      
    </div>
  );
}
