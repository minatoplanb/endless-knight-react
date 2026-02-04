// Audio and Haptic feedback manager for React Native
// Provides tactile and audio feedback for UI interactions

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

// Sound types available in the game
export type SoundType =
  | 'click'      // UI button press
  | 'success'    // Upgrade, craft, level up
  | 'coin'       // Gold gain, loot
  | 'hit'        // Attack hit
  | 'crit'       // Critical hit
  | 'death'      // Player or enemy death
  | 'error';     // Failed action

// Haptic feedback intensity mapping
const HAPTIC_MAPPING: Record<SoundType, Haptics.ImpactFeedbackStyle | 'notification' | 'selection'> = {
  click: 'selection',
  success: Haptics.ImpactFeedbackStyle.Medium,
  coin: Haptics.ImpactFeedbackStyle.Light,
  hit: Haptics.ImpactFeedbackStyle.Light,
  crit: Haptics.ImpactFeedbackStyle.Heavy,
  death: 'notification',
  error: 'notification',
};

class AudioManager {
  private isHapticsEnabled: boolean = true;
  private isSoundEnabled: boolean = true;
  private volume: number = 0.5;
  private isInitialized: boolean = false;

  // Initialize audio system (call once on app start)
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode for game sounds
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('AudioManager init error:', error);
    }
  }

  // Settings
  setHapticsEnabled(enabled: boolean): void {
    this.isHapticsEnabled = enabled;
  }

  setSoundEnabled(enabled: boolean): void {
    this.isSoundEnabled = enabled;
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  getHapticsEnabled(): boolean {
    return this.isHapticsEnabled;
  }

  getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  getVolume(): number {
    return this.volume;
  }

  // Play haptic feedback
  private async playHaptic(type: SoundType): Promise<void> {
    if (!this.isHapticsEnabled) return;
    if (Platform.OS === 'web') return; // No haptics on web

    try {
      const hapticType = HAPTIC_MAPPING[type];

      if (hapticType === 'selection') {
        await Haptics.selectionAsync();
      } else if (hapticType === 'notification') {
        await Haptics.notificationAsync(
          type === 'error'
            ? Haptics.NotificationFeedbackType.Error
            : Haptics.NotificationFeedbackType.Warning
        );
      } else {
        await Haptics.impactAsync(hapticType);
      }
    } catch (error) {
      // Haptics may not be available on all devices
    }
  }

  // Main play function
  async play(type: SoundType): Promise<void> {
    // Always try haptic feedback
    this.playHaptic(type);

    // Sound playback can be added here in the future
    // For now, haptic provides the main feedback
  }

  // Convenience methods
  async playClick(): Promise<void> {
    await this.play('click');
  }

  async playSuccess(): Promise<void> {
    await this.play('success');
  }

  async playCoin(): Promise<void> {
    await this.play('coin');
  }

  async playHit(): Promise<void> {
    await this.play('hit');
  }

  async playCrit(): Promise<void> {
    await this.play('crit');
  }

  async playDeath(): Promise<void> {
    await this.play('death');
  }

  async playError(): Promise<void> {
    await this.play('error');
  }
}

// Singleton instance
export const audioManager = new AudioManager();
