import { useEffect } from "react";
import useSound from 'use-sound';
import { useGame } from "@/context/GameContext";

// --- Asset Configuration ---
// Using raw GitHub URLs from Kenney and Google Actions Sounds
const ASSETS = {
  click: "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/click1.wav",
  type: "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/switch10.wav",
  switch: "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/switch26.wav",
  wireCut: "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/switch33.wav",
  error: "https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg",
  ambience: "/spy-28109.mp3",
  explosion: "https://actions.google.com/sounds/v1/science_fiction/rubble_breaking.ogg",
  targetLocked: "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/switch37.wav",
  
  // New Assets
  beat: "/cool-beat-100-bpm-loop-77735.mp3",
  cute: "/aww-cute-reaction-6208.mp3",
  confetti: "/1gift-confetti-447240.mp3",
  funky: "/funky-guitar-and-bass-loop-in-gm-407639.mp3",
  success: "/success-videogame-sfx-423626.mp3",
};

export function useSpySound() {
  const { isMuted, volume } = useGame();
  
  // SFX Volume
  const sfxVol = (v: number) => isMuted ? 0 : v * (volume * 2);

  // Music Volume
  const musicVol = (v: number) => isMuted ? 0 : v * (volume * 2);

  const [playClick, { stop: stopClick }] = useSound(ASSETS.click, { volume: sfxVol(0.5) });
  const [playKeyboard, { stop: stopKeyboard }] = useSound(ASSETS.click, { volume: sfxVol(0.25), interrupt: true }); // Quieter click for typing
  const [playQuietType, { stop: stopQuietType }] = useSound(ASSETS.type, { volume: sfxVol(0.25), interrupt: true }); // Quieter typewriter sound
  const [playType, { stop: stopType }] = useSound(ASSETS.type, { volume: sfxVol(0.5), interrupt: true }); // Added interrupt
  const [playSwitch, { stop: stopSwitch }] = useSound(ASSETS.switch, { volume: sfxVol(0.4), interrupt: true });
  const [playWireCut, { stop: stopWireCut }] = useSound(ASSETS.wireCut, { volume: sfxVol(0.6) });
  const [playError, { stop: stopError }] = useSound(ASSETS.error, { volume: sfxVol(0.3), interrupt: true });
  
  // Ambience moved to GameContext for global control

  // New Music Layers
  const [playFinaleBeat, { stop: stopFinaleBeat }] = useSound(ASSETS.beat, { volume: musicVol(0.25), loop: true });
  const [playFunkyLoop, { stop: stopFunkyLoop }] = useSound(ASSETS.funky, { volume: musicVol(0.3), loop: true });

  // New SFX
  const [playCute, { stop: stopCute }] = useSound(ASSETS.cute, { volume: sfxVol(0.5) });
  const [playConfetti, { stop: stopConfetti }] = useSound(ASSETS.confetti, { volume: sfxVol(0.5) });
  const [playSuccess, { stop: stopSuccess }] = useSound(ASSETS.success, { volume: sfxVol(0.5) });
  
  // Deploy Sound (Mapped to Success as requested)
  const [playDeploy, { stop: stopDeploy }] = useSound(ASSETS.success, { volume: sfxVol(0.5) });

  // Sprites for Explosion
  const [playExplosionFx, { stop: stopExplosion }] = useSound(ASSETS.explosion, { 
      volume: sfxVol(0.6), 
      interrupt: true,
      sprite: {
          thud: [0, 800]
      }
  });
  
  const playStamp = () => playExplosionFx({ id: 'thud' });

  const [playTargetLocked, { stop: stopTargetLocked }] = useSound(ASSETS.targetLocked, { volume: sfxVol(0.4) });

  // Cleanup effect
  useEffect(() => {
      return () => {
          stopClick();
          stopType();
          stopSwitch();
          stopWireCut();
          stopError();
          stopExplosion();
          stopTargetLocked();
          stopFinaleBeat();
          stopFunkyLoop();
          stopCute();
          stopConfetti();
          stopSuccess();
          stopDeploy();
      };
  }, [stopClick, stopType, stopSwitch, stopWireCut, stopError, stopExplosion, stopTargetLocked, stopFinaleBeat, stopFunkyLoop, stopCute, stopConfetti, stopSuccess, stopDeploy]);

  const playAccessDenied = playError;

  return {
    isMuted,
    playClick,
    playKeyboard,
    playQuietType,
    playType,
    playTyping: playType,
    playError,
    stopError,
    
    // Game Specifics
    playAccessDenied,
    playStamp,
    playTargetLocked,
    playWireCut,
    playSwitch,
    
    // New Audio
    playFinaleBeat,
    stopFinaleBeat,
    playFunkyLoop,
    playCute,
    playConfetti,
    playSuccess,
    playDeploy
  };
}
