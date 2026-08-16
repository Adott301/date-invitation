"use client";

import React, { useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useGame } from "@/context/GameContext";
export default function SoundController() {
    const { isMuted, toggleMute, volume, setVolume, playAmbience, stopAmbience, isAmbienceActive } = useGame();

    // Ambient Hum Logic
    useEffect(() => {
        if (isMuted || !isAmbienceActive || volume === 0) {
            stopAmbience();
            return;
        }

        playAmbience();
        
        return () => {
            stopAmbience();
        }
    }, [isMuted, isAmbienceActive, playAmbience, stopAmbience, volume]);

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 group bg-black/50 backdrop-blur-md p-2 rounded-full border border-green-500/30 hover:border-green-500/50 transition-all w-12 hover:w-48 overflow-hidden group">
            <button 
                onClick={toggleMute}
                className="text-green-500 hover:text-white transition-colors shrink-0"
            >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <div className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-2">
                <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-green-900 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
            </div>
        </div>
    );
}
