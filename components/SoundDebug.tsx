"use client";

import React from "react";
import { ArrowLeft, Play, Volume2, VolumeX } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useSpySound } from "@/hooks/useSpySound";

export default function SoundDebug() {
  const { setView, playAmbience, stopAmbience } = useGame();
  const sounds = useSpySound();

  const soundList = [
    { name: "playClick", fn: sounds.playClick },
    { name: "playType / playTyping", fn: sounds.playType },
    { name: "playSwitch", fn: sounds.playSwitch },
    { name: "playWireCut", fn: sounds.playWireCut },
    { name: "playError / AccessDenied", fn: sounds.playError },
    { name: "playAmbience (Global)", fn: playAmbience },
    { name: "stopAmbience (Global)", fn: stopAmbience },
    { name: "playStamp (Thud)", fn: sounds.playStamp },
    { name: "playTargetLocked", fn: sounds.playTargetLocked },
  ];

  return (
    <div className="min-h-screen p-8 bg-zinc-950 font-mono text-zinc-200">
      <header className="mb-8 flex justify-between items-center border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-yellow-500">AUDIO DIAGNOSTICS</h1>
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white uppercase text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-full mb-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded flex justify-between items-center">
            <span className="uppercase text-sm tracking-widest opacity-70">Master Volume Status</span>
            <div className="flex items-center gap-2">
                 {sounds.isMuted ? <VolumeX className="text-red-500" /> : <Volume2 className="text-green-500" />}
                 <span className={sounds.isMuted ? "text-red-500" : "text-green-500"}>
                     {sounds.isMuted ? "MUTED" : "ACTIVE"}
                 </span>
            </div>
        </div>

        {soundList.map((item) => (
          <button
            key={item.name}
            onClick={() => {
                console.log(`Testing ${item.name}`);
                try {
                    item.fn();
                } catch (e) {
                    console.error(e);
                }
            }}
            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-800 transition-all group"
          >
            <span className="text-xs uppercase tracking-wider font-bold group-hover:text-yellow-500 break-words max-w-[80%] text-left">
              {item.name}
            </span>
            <Play className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-yellow-500" />
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-900/10 border border-blue-900/30 text-xs text-blue-400 font-mono">
         <p><strong>NOTE:</strong> Ambience is looped. Use 'stopAmbience' to kill it manually here. Other sounds use 'interrupt: true' so rapid clicks will restart them.</p>
      </div>
    </div>
  );
}
