import React from 'react';
import { Svg, Circle, Line } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function AngryIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="30" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="50" cy="56" r="2.5" fill={mainColor} />
      <Circle cx="70" cy="56" r="2.5" fill={mainColor} />
      <Line x1="44" y1="48" x2="52" y2="50" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="76" y1="48" x2="68" y2="50" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="50" y1="68" x2="70" y2="68" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}
