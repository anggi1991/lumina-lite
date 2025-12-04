import React from 'react';
import { Svg, Circle, Line } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function AddEntryIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="28" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="60" y1="45" x2="60" y2="75" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="45" y1="60" x2="75" y2="60" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}
