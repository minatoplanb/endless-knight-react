// React hook for audio/haptic feedback
// Usage: const { playClick, playSuccess } = useAudio();

import { useCallback, useEffect } from 'react';
import { audioManager, SoundType } from './AudioManager';

export function useAudio() {
  // Initialize audio manager on first use
  useEffect(() => {
    audioManager.init();
  }, []);

  const play = useCallback((type: SoundType) => {
    audioManager.play(type);
  }, []);

  const playClick = useCallback(() => {
    audioManager.playClick();
  }, []);

  const playSuccess = useCallback(() => {
    audioManager.playSuccess();
  }, []);

  const playCoin = useCallback(() => {
    audioManager.playCoin();
  }, []);

  const playHit = useCallback(() => {
    audioManager.playHit();
  }, []);

  const playCrit = useCallback(() => {
    audioManager.playCrit();
  }, []);

  const playDeath = useCallback(() => {
    audioManager.playDeath();
  }, []);

  const playError = useCallback(() => {
    audioManager.playError();
  }, []);

  return {
    play,
    playClick,
    playSuccess,
    playCoin,
    playHit,
    playCrit,
    playDeath,
    playError,
    // Settings
    setHapticsEnabled: audioManager.setHapticsEnabled.bind(audioManager),
    setSoundEnabled: audioManager.setSoundEnabled.bind(audioManager),
    setVolume: audioManager.setVolume.bind(audioManager),
  };
}

export default useAudio;
