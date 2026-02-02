import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Base design: 375 x 812 (iPhone SE / small screen)
// On web, always use base size (375) to fit phone frame
const BASE_WIDTH = 375;
const effectiveWidth = Platform.OS === 'web' ? BASE_WIDTH : SCREEN_W;

export const scale = (size: number) => (effectiveWidth / BASE_WIDTH) * size;

export const SCREEN = {
  width: Platform.OS === 'web' ? BASE_WIDTH : SCREEN_W,
  height: Platform.OS === 'web' ? 812 : SCREEN_H,
};

export const COLORS = {
  // Backgrounds
  bg: '#0f0f23',
  bgLight: '#1a1a3e',
  panel: '#16213e',

  // Text
  text: '#ffffff',
  textDim: '#8888aa',
  textGold: '#ffd700',

  // Health bars
  hpFull: '#44ff44',
  hpMid: '#ffff44',
  hpLow: '#ff4444',
  hpBg: '#333355',

  // Rarity
  common: '#ffffff',
  uncommon: '#44ff44',
  rare: '#4488ff',
  epic: '#aa44ff',
  legendary: '#ffaa00',

  // Buttons
  buttonPrimary: '#4466aa',
  buttonDisabled: '#333355',
  buttonSuccess: '#44aa44',
  buttonDanger: '#aa4444',

  // Effects
  damage: '#ff4444',
  heal: '#44ff44',
  crit: '#ffdd00',
};

export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(24),
  xxl: scale(32),
};

export const FONT_SIZES = {
  xxs: scale(8),
  xs: scale(10),
  sm: scale(12),
  md: scale(14),
  lg: scale(18),
  xl: scale(24),
  xxl: scale(32),
  title: scale(48),
};

export const LAYOUT = {
  topBarHeight: scale(50),
  bottomNavHeight: scale(60),
  progressBarHeight: scale(30),
  minTouchSize: 48,
};
