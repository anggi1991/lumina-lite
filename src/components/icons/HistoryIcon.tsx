import React from 'react';
import { Svg, Circle, Line, Path } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function HistoryIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="28" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="60" y1="60" x2="60" y2="42" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="60" y1="60" x2="72" y2="60" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 35 45 A 28 28 0 0 1 60 32" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M 60 32 L 57 37 M 60 32 L 65 34" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}
