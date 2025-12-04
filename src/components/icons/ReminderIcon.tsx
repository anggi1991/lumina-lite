import React from 'react';
import { Svg, Path, Line } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function ReminderIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Path d="M 45 50 C 45 41.7157 51.7157 35 60 35 C 68.2843 35 75 41.7157 75 50 L 75 65 C 75 70 78 73 82 75 L 38 75 C 42 73 45 70 45 65 Z" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 54 75 C 54 78.3137 56.6863 81 60 81 C 63.3137 81 66 78.3137 66 75" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="60" y1="30" x2="60" y2="35" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}
