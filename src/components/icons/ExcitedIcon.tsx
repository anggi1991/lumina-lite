import React from 'react';
import { Svg, Circle, Path, Line, G } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function ExcitedIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="20 20 80 80" fill="none">
      <Circle cx="60" cy="60" r="30" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="50" cy="54" r="2.5" fill={mainColor} />
      <Circle cx="70" cy="54" r="2.5" fill={mainColor} />
      <Path d="M 46 64 Q 60 76 74 64" stroke={accent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <G opacity="0.7">
        <Line x1="40" y1="40" x2="40" y2="46" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <Line x1="37" y1="43" x2="43" y2="43" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <Line x1="78" y1="42" x2="78" y2="46" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="76" y1="44" x2="80" y2="44" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
