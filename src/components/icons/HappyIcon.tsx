import React from 'react';
import { Svg, Circle, Path } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function HappyIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';
  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg width={size} height={size} viewBox="20 20 80 80" fill="none">
      <Circle cx="60" cy="60" r="30" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="50" cy="54" r="2.5" fill={mainColor} />
      <Circle cx="70" cy="54" r="2.5" fill={mainColor} />
      <Path d="M 48 66 Q 60 74 72 66" stroke={accent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}
