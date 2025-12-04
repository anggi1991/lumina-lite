import React from 'react';
import { Svg, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function SettingsIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="12" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="57" y="32" width="6" height="10" rx="3" stroke={mainColor} strokeWidth="2" fill="none" />
      <Rect x="57" y="78" width="6" height="10" rx="3" stroke={mainColor} strokeWidth="2" fill="none" />
      <Rect x="32" y="57" width="10" height="6" rx="3" stroke={mainColor} strokeWidth="2" fill="none" />
      <Rect x="78" y="57" width="10" height="6" rx="3" stroke={mainColor} strokeWidth="2" fill="none" />
      <G transform="rotate(45 60 60)">
        <Rect x="57" y="32" width="6" height="10" rx="3" stroke={mainColor} strokeWidth="2" fill="none" />
        <Rect x="57" y="78" width="6" height="10" rx="3" stroke={mainColor} strokeWidth="2" fill="none" />
      </G>
    </Svg>
  );
}
