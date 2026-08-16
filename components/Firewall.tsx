"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ArrowRight } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";

export default function Firewall() {
  const { login, playAmbience } = useGame();
  const { playTyping, playAccessDenied, playClick } = useSpySound(); // Sound Hook
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(0);
  const [hasStarted, setHasStarted] = useState(false); // Audio Context Start State

  // Start Handler
  const handleStart = () => {
      setHasStarted(true);
      playClick();
      playAmbience();
  };

  // Hardcoded answer from prompt
  const CORRECT_ANSWER = "EXAMPLE"; // Updated per request

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    
    if (password.toUpperCase().trim() === CORRECT_ANSWER) {
      setSuccess(true);
      // playAccessGranted(); // REMOVED
      setTimeout(() => {
        login();
      }, 2000); // Wait for animation
    } else {
      setError(true);
      // playAccessDenied(); // Removed per request
      setShake((prev) => prev + 1);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      playTyping();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 relative">
      <AnimatePresence>
          {!hasStarted && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer"
                  onClick={handleStart}
              >
                  <Lock className="w-16 h-16 text-green-500 mb-8 animate-pulse" />
                  <h1 className="text-2xl text-green-500 font-bold tracking-[0.3em] animate-pulse">
                      CLICK TO INITIALIZE
                  </h1>
                  <p className="text-green-500/50 text-xs mt-4 uppercase tracking-widest">Secure Connection Required</p>
              </motion.div>
          )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-2"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-widest text-red-500 glitch-text">
          UNAUTHORIZED ACCESS
        </h1>
        <p className="text-sm md:text-base opacity-70 tracking-widest uppercase">
          Biometric Scan Failed. Manual Override Required.
        </p>
      </motion.div>

      <motion.div
        key={shake}
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="border-2 border-green-500/30 bg-black/50 p-8 backdrop-blur-sm relative overflow-hidden">
          {success ? (
             <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 py-8"
             >
                <Unlock className="w-16 h-16 text-green-500 animate-pulse" />
                <h2 className="text-2xl font-bold text-green-500 tracking-wider">ACCESS GRANTED</h2>
                <p className="text-xs uppercase tracking-[0.2em] animate-pulse">Decrypting User Profile...</p>
             </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-12 h-12 text-red-500/80" />
              </div>
              
              <div className="space-y-2 text-left">
                 <label className="text-xs uppercase tracking-widest opacity-80">
                    Security Question #1
                 </label>
                  <div className="p-3 border border-green-900/50 bg-green-900/10 text-sm font-bold">
                    HINT: example
                  </div>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={password}
                  onChange={handleInput}
                  placeholder="ENTER PASSPHRASE"
                  className="w-full bg-black border-b-2 border-green-500/50 focus:border-green-500 outline-none py-3 px-4 text-center text-xl tracking-widest uppercase placeholder:text-green-900 transition-all font-mono"
                  autoFocus
                />
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-bold animate-pulse">
                   ERROR: INCORRECT DATA. ATTEMPT LOGGED.
                </p>
              )}

              <button
                type="submit"
                onMouseEnter={() => playClick()}
                className="w-full bg-green-900/20 hover:bg-green-500 hover:text-black border border-green-500/50 text-green-500 py-3 uppercase tracking-widest text-sm font-bold transition-all flex items-center justify-center gap-2 group"
              >
                <span>Authenticate</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
          
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-500" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-500" />
        </div>
      </motion.div>
    </div>
  );
}
