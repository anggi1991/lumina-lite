import React from 'react';
import { Svg, Circle, Line } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function AIInsightIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Circle cx="60" cy="60" r="12" stroke={accent} strokeWidth="2.5" fill={theme === 'dark' ? 'rgba(127, 231, 220, 0.1)' : 'rgba(200, 182, 255, 0.1)'} />
      <Line x1="60" y1="30" x2="60" y2="38" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      <Line x1="60" y1="82" x2="60" y2="90" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      <Line x1="30" y1="60" x2="38" y2="60" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      <Line x1="82" y1="60" x2="90" y2="60" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      <Line x1="39.5" y1="39.5" x2="45.2" y2="45.2" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      <Line x1="74.8" y1="74.8" x2="80.5" y2="80.5" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      <Line x1="80.5" y1="39.5" x2="74.8" y2="45.2" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      <Line x1="45.2" y1="74.8" x2="39.5" y2="80.5" stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}
