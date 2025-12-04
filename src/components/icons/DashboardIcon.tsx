import React from 'react';
import { Svg, Rect } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function DashboardIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const mainColor = color || defaultColor;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Rect x="35" y="35" width="20" height="20" rx="5" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="65" y="35" width="20" height="20" rx="5" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="35" y="65" width="20" height="20" rx="5" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="65" y="65" width="20" height="20" rx="5" stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
