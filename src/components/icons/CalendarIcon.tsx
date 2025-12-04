import React from 'react';
import { Svg, Rect, Line, Circle } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function CalendarIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Rect x="32" y="35" width="56" height="56" rx="8" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="45" y1="30" x2="45" y2="40" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="75" y1="30" x2="75" y2="40" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="32" y1="50" x2="88" y2="50" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="50" cy="65" r="3" fill={accent} />
      <Circle cx="70" cy="75" r="3" fill={accent} />
    </Svg>
  );
}
