"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle, Image as ImageIcon, Copy, StickyNote } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";
import { clsx } from "clsx";
import confetti from "canvas-confetti";

type NetworkItem = {
  id: string;
  word: string;
  category: string;
  hasImage?: boolean;
};

// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------
const PUZZLE_DATA = {
  items: [
    // Group A: Category 1 (e.g. Places)
    { id: "a1", word: "ITEM 1", category: "GROUP_A" },
    { id: "a2", word: "ITEM 2", category: "GROUP_A", hasImage: true },
    { id: "a3", word: "ITEM 3", category: "GROUP_A", hasImage: true },
    { id: "a4", word: "ITEM 4", category: "GROUP_A", hasImage: true },

    // Group B: Category 2 (e.g. Names)
    { id: "b1", word: "ITEM 5", category: "GROUP_B" },
    { id: "b2", word: "ITEM 6", category: "GROUP_B" },
    { id: "b3", word: "ITEM 7", category: "GROUP_B" },
    { id: "b4", word: "ITEM 8", category: "GROUP_B" },

    // Group C: Category 3 (e.g. Favorites)
    { id: "c1", word: "ITEM 9", category: "GROUP_C" },
    { id: "c2", word: "ITEM 10", category: "GROUP_C" },
    { id: "c3", word: "ITEM 11", category: "GROUP_C" },
    { id: "c4", word: "ITEM 12", category: "GROUP_C" },

    // Group D: Category 4 (e.g. Dislikes)
    { id: "d1", word: "ITEM 13", category: "GROUP_D" },
    { id: "d2", word: "ITEM 14", category: "GROUP_D" },
    { id: "d3", word: "ITEM 15", category: "GROUP_D" },
    { id: "d4", word: "ITEM 16", category: "GROUP_D" },
  ],
  groups: {
    "GROUP_A": { label: "CATEGORY 1", color: "bg-yellow-500" },
    "GROUP_B": { label: "CATEGORY 2", color: "bg-green-500" },
    "GROUP_C": { label: "CATEGORY 3", color: "bg-purple-500" },
    "GROUP_D": { label: "CATEGORY 4", color: "bg-blue-500" },
  },
  rewardCode: "CODE-PART-1"
};

export default function ConspiracyPuzzle() {
  const { setView, solveClue } = useGame();
  const { playClick, playError, playStamp, playSuccess } = useSpySound();
  
  // Shuttle the items initially
  const [gridItems, setGridItems] = useState<NetworkItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<string[]>([]); // Array of category names
  const [mistakesRemaining, setMistakesRemaining] = useState(4);
  const [errorShake, setErrorShake] = useState(0);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    setGridItems([...PUZZLE_DATA.items].sort(() => Math.random() - 0.5));
  }, []);

  const handleSelect = (id: string) => {
    if (showReward) return;
    playClick();
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(item => item !== id));
    } else {
      if (selected.length < 4) {
        setSelected(prev => [...prev, id]);
      }
    }
  };

  const checkSelection = () => {
    playClick();
    if (selected.length !== 4) return;

    const selectedItems = PUZZLE_DATA.items.filter(item => selected.includes(item.id));
    const firstCategory = selectedItems[0].category;
    const allMatch = selectedItems.every(item => item.category === firstCategory);

    if (allMatch) {
      setSolvedGroups(prev => [...prev, firstCategory]);
      setGridItems(prev => prev.filter(item => item.category !== firstCategory));
      setSelected([]);
      playSuccess(); // Group solved sound
    } else {
      setErrorShake(prev => prev + 1);
      setMistakesRemaining(prev => prev - 1);
      // playError(); // REMOVED
      setTimeout(() => setSelected([]), 500);
    }
  };
  
  const [hasWon, setHasWon] = useState(false);

  // Effect to check win condition based on solved count
  useEffect(() => {
     if (solvedGroups.length === 4 && !hasWon) {
         setHasWon(true);
         setTimeout(() => {
             setShowReward(true);
             confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#ffffff']
             });
             solveClue("conspiracy", PUZZLE_DATA.rewardCode);
         }, 500);
     }
  }, [solvedGroups, solveClue, hasWon]);

  // Effect: Play stamp sound when sticky note "lands"
  useEffect(() => {
      const timer = setTimeout(() => {
          playStamp();
      }, 750); // 0.5s delay + ~0.25s animation = Impact
      return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const getImagePath = (word: string) => {
      const lower = word.toLowerCase();
      // Use placeholders or your own images in public/ folder
      return `/placeholder.jpg`; 
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 font-mono max-w-5xl mx-auto">
       {/* Background Corkboard Texture (CSS Only) */}
       <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none" 
            style={{
                backgroundColor: "#5d4037",
                backgroundImage: "radial-gradient(#8d6e63 1px, transparent 0)",
                backgroundSize: "20px 20px"
            }}
       />

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
                   <h2 className="text-3xl font-bold text-green-500 mb-2">CASE CLEARED</h2>
                   <p className="text-zinc-400 text-sm uppercase tracking-widest mb-6">File Decrypted Successfully</p>
                   
                   <div className="bg-black p-4 border border-zinc-700 mb-6 relative group cursor-pointer"
                        onClick={() => navigator.clipboard.writeText(PUZZLE_DATA.rewardCode)}
                   >
                       <p className="text-xs text-zinc-500 uppercase mb-1">Passkey Fragment #1</p>
                       <div className="text-3xl font-mono font-bold text-white tracking-[0.2em] flex items-center justify-center gap-2">
                           {PUZZLE_DATA.rewardCode}
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
       <header className="flex justify-between items-center mb-8 border-b border-white/20 pb-4 relative z-10">
          <button 
             onMouseEnter={() => playClick()}
             onClick={() => {
                 playClick();
                 setView('dashboard');
             }}
             className="flex items-center text-white/70 hover:text-white uppercase tracking-widest text-xs font-bold gap-2 group"
          >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             Return to Case Files
          </button>
          <div className="text-right">
             <h1 className="text-xl font-bold tracking-widest text-yellow-500">CASE A: CONSPIRACY</h1>
             <p className="text-[10px] text-white/50 uppercase">Analysis Sector: Intel Association</p>
          </div>
       </header>

       <div className="flex-1 flex flex-col items-center relative z-10 w-full">
          
          <div className="mb-4 h-6 text-center">
             {mistakesRemaining <= 2 && mistakesRemaining > 0 && (
                <p className="text-red-500 text-xs font-bold animate-pulse">CRITICAL: {mistakesRemaining} ATTEMPTS REMAINING</p>
             )}
          </div>

          {/* Sticky Note Instruction */}
          <motion.div 
             initial={{ rotate: 5, y: -20, opacity: 0, scale: 1.1 }}
             animate={{ rotate: 3, y: 0, opacity: 1, scale: 1 }}
             transition={{ delay: 0.5, duration: 0.2 }}
             className="absolute -top-6 -right-4 md:right-10 z-20 w-48 bg-yellow-200 text-black p-4 shadow-xl transform rotate-3 font-handwriting"
             style={{ fontFamily: 'cursive' }} // Fallback
          >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-yellow-400/50 rotate-[-2deg]" /> {/* Tape */}
              <p className="text-sm font-bold leading-tight">
                 "The red string binds what history scattered. Order is the only exit."
              </p>
          </motion.div>

          {/* Solved Groups */}
          <div className="w-full space-y-3 mb-6">
             {solvedGroups.map(category => (
                <motion.div 
                   key={category}
                   initial={{ scale: 0.9, opacity: 0, rotateX: 90 }}
                   animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                   className={clsx("w-full p-6 border-b-4 border-black/20 rounded-lg text-black font-bold text-center tracking-widest uppercase flex flex-col items-center justify-center gap-1 shadow-2xl", PUZZLE_DATA.groups[category as keyof typeof PUZZLE_DATA.groups].color)}
                >
                   <span className="text-lg">{PUZZLE_DATA.groups[category as keyof typeof PUZZLE_DATA.groups].label}</span>
                   <div className="text-[10px] opacity-60 flex gap-2">
                       {PUZZLE_DATA.items.filter(i => i.category === category).map(i => i.word).join(", ")}
                   </div>
                </motion.div>
             ))}
          </div>

          {/* The Grid / Corkboard */}
          <div className="w-full bg-black/20 p-8 rounded border-2 border-white/10 shadow-inner min-h-[400px]">
                <motion.div 
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                    animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                >
                    <AnimatePresence>
                        {gridItems.map((item, idx) => (
                            <motion.button
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8, rotate: (Math.random() - 0.5) * 10 }}
                                animate={{ 
                                    opacity: 1, 
                                    scale: 1,
                                    rotate: selected.includes(item.id) ? 0 : (idx % 2 === 0 ? 2 : -2),
                                    y: selected.includes(item.id) ? -10 : 0
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                onMouseEnter={() => playClick()} // Hover sound
                                onClick={() => handleSelect(item.id)}
                                className={clsx(
                                    "relative bg-white p-2 pb-4 shadow-xl transition-all flex flex-col items-center justify-between aspect-[3/4] group border-4",
                                    selected.includes(item.id) 
                                        ? "border-yellow-500 scale-105 z-20" 
                                        : "border-transparent hover:border-white/50"
                                )}
                            >
                                {/* The Pin */}
                                <div className={clsx(
                                    "absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md z-30 transition-colors",
                                    selected.includes(item.id) ? "bg-yellow-500" : "bg-red-600"
                                )} />
                                
                                {/* Image Area */}
                                <div className="w-full flex-1 bg-zinc-200 flex items-center justify-center overflow-hidden mb-2 relative">
                                    <div className="w-full h-full bg-zinc-400 group-hover:bg-zinc-300 transition-colors flex items-center justify-center text-zinc-600 relative">
                                        {/* Dynamic Image */}
                                        <img 
                                            src={getImagePath(item.word)} 
                                            alt={item.word}
                                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                                            onError={(e) => {
                                                // Fallback if image missing
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.classList.add('fallback-icon');
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                                             <ImageIcon className="w-8 h-8 opacity-30" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                </div>

                                <span className="text-[11px] font-bold text-zinc-800 uppercase text-center leading-tight">
                                    {item.word}
                                </span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

          {/* Submissions */}
          <div className="mt-12 flex gap-6">
             <button
                disabled={selected.length !== 4}
                onMouseEnter={() => playClick()}
                onClick={checkSelection}
                className={clsx(
                   "px-10 py-4 border-2 uppercase tracking-widest font-black text-base shadow-xl transition-all",
                   selected.length === 4 
                      ? "bg-yellow-500 text-black border-yellow-400 hover:scale-110 active:scale-95" 
                      : "bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed"
                )}
             >
                <span className="flex items-center gap-2">Analyze Pattern</span>
             </button>
              <button
                onMouseEnter={() => playClick()}
                onClick={() => {
                    playClick();
                    setSelected([]);
                }}
                className="px-6 py-4 text-white/50 uppercase tracking-widest text-sm hover:text-white transition-colors"
             >
                Clear Selections
             </button>
          </div>

       </div>
    </div>
  );
}
