"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import useSound from 'use-sound';

// Ambience Assets
const SPY_AMBIENCE = "/spy-28109.mp3";
const PIANO_AMBIENCE = "/noncopyright-music-pianos-295174.mp3";

type ViewState = "firewall" | "briefing" | "dashboard" | "conspiracy" | "defuse" | "visual" | "finale" | "debug";

interface GameState {
  isAuthenticated: boolean;
  currentView: ViewState;
  cluesSolved: {
    conspiracy: boolean;
    defuse: boolean;
    visual: boolean;
  };
  collectedCodes: string[];
  isMissionComplete: boolean;
}

interface GameContextType extends GameState {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  login: () => void;
  startMission: () => void;
  setView: (view: ViewState) => void;
  solveClue: (clue: "conspiracy" | "defuse" | "visual", code: string) => void;
  completeMission: () => void;
  
  // Audio Controls
  playAmbience: () => void;
  stopAmbience: () => void;
  isAmbienceActive: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    isAuthenticated: false,
    currentView: "firewall",
    cluesSolved: {
      conspiracy: false, // false
      defuse: false,    // false
      visual: false,    // false
    },
    collectedCodes: [],
    isMissionComplete: false,
  });
  
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isAmbienceActive, setIsAmbienceActive] = useState(false);

  // Global Ambience Hooks
  const [playSpy, { stop: stopSpy }] = useSound(SPY_AMBIENCE, { 
    volume: isMuted ? 0 : 0.15 * (volume * 2), 
    loop: true 
  });

  // Volume multiplier: Quiter when in dashboard/gameplay vs briefing
  const pianoVolumeScale = state.currentView === 'briefing' ? 0.2 : 0.025;

  const [playPiano, { stop: stopPiano }] = useSound(PIANO_AMBIENCE, { 
    volume: isMuted ? 0 : pianoVolumeScale * (volume * 2), 
    loop: true 
  });

  const [currentTrack, setCurrentTrack] = useState<'spy' | 'piano'>('spy');

  const playAmbience = () => {
    setIsAmbienceActive(true);
    if (currentTrack === 'spy') {
        playSpy();
    } else {
        playPiano();
    }
  };

  const stopAmbience = () => {
    setIsAmbienceActive(false);
    stopSpy();
    stopPiano();
  };
  
  // Switch track helper
  const switchTrack = (track: 'spy' | 'piano') => {
      stopAmbience();
      setCurrentTrack(track);
      // If we were active, restart with new track (or if switching to piano on login, auto-start)
      if (isAmbienceActive || track === 'piano') {
          setIsAmbienceActive(true);
          if (track === 'spy') playSpy(); else playPiano();
      }
  };

  // Resume AudioContext on first interaction
  useEffect(() => {
    // Note: use-sound / Howler handles AudioContext resumption automatically on user interaction.
    // We serve as a backup or just initialization here if needed, but reducing complexity.
  }, []);

  // Effect to handle navigation based on auth state
  useEffect(() => {
    if (state.isAuthenticated && state.currentView === "firewall") {
      setState((prev) => ({ ...prev, currentView: "briefing" }));
      switchTrack('piano'); // Switch music on login
    }
  }, [state.isAuthenticated, state.currentView]);

  const login = () => {
    setState((prev) => ({ ...prev, isAuthenticated: true }));
  };

  const startMission = () => {
    setState((prev) => ({ ...prev, currentView: "dashboard" }));
  };

  const setView = (view: ViewState) => {
    setState((prev) => ({ ...prev, currentView: view }));
  };

  const solveClue = (clue: "conspiracy" | "defuse" | "visual", code: string) => {
    setState((prev) => ({
      ...prev,
      cluesSolved: {
        ...prev.cluesSolved,
        [clue]: true,
      },
      collectedCodes: prev.collectedCodes.includes(code) 
        ? prev.collectedCodes 
        : [...prev.collectedCodes, code]
    }));
  };

  const completeMission = () => {
    setState((prev) => ({ ...prev, isMissionComplete: true }));
  };
  
  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <GameContext.Provider value={{ ...state, isMuted, volume, toggleMute, setVolume, login, startMission, setView, solveClue, completeMission, playAmbience, stopAmbience, isAmbienceActive }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
