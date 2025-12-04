import React from 'react';
import { Svg, Path, Line } from 'react-native-svg';

interface IconProps {
  theme?: 'light' | 'dark';
  size?: number;
  color?: string;
  accentColor?: string;
}

export function JournalIcon({ theme = 'light', size = 24, color, accentColor }: IconProps) {
  const defaultColor = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const defaultAccent = theme === 'light' ? '#C8B6FF' : '#7FE7DC';

  const mainColor = color || defaultColor;
  const accent = accentColor || defaultAccent;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* Open book shape with rounded pages */}
      <Path
        d="M30 35C30 32.2386 32.2386 30 35 30H57C58.1046 30 59 30.8954 59 32V88C59 89.1046 58.1046 90 57 90H35C32.2386 90 30 87.7614 30 85V35Z"
        stroke={mainColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M90 35C90 32.2386 87.7614 30 85 30H63C61.8954 30 61 30.8954 61 32V88C61 89.1046 61.8954 90 63 90H85C87.7614 90 90 87.7614 90 85V35Z"
        stroke={mainColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Binding center */}
      <Line
        x1="60"
        y1="30"
        x2="60"
        y2="90"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Page lines */}
      <Line x1="40" y1="45" x2="50" y2="45" stroke={mainColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <Line x1="40" y1="55" x2="50" y2="55" stroke={mainColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <Line x1="70" y1="45" x2="80" y2="45" stroke={mainColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <Line x1="70" y1="55" x2="80" y2="55" stroke={mainColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}
