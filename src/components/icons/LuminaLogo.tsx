import React from 'react';
import { Svg, Defs, RadialGradient, Stop, Rect, Circle, Path, Line, G } from 'react-native-svg';

interface LuminaLogoProps {
  size?: number;
  id?: string;
  transparent?: boolean;
  theme?: 'light' | 'dark';
}

export function LuminaLogo({ size = 48, id = 'lumina-logo', transparent = false, theme = 'light' }: LuminaLogoProps) {
  const color = theme === 'light' ? '#2E2E2E' : '#E0E0E0';
  const accent = theme === 'light' ? '#C8B6FF' : '#C8B6FF'; // Keep purple accent for consistency, or use #7FE7DC if preferred
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
    >
      <Defs>
        {/* Background gradient - pastel lavender */}
        {!transparent && (
          <RadialGradient id={`full-bg-${id}`} cx="50%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#F3EEFF" />
            <Stop offset="50%" stopColor="#F8F5FF" />
            <Stop offset="100%" stopColor="#FFFFFF" />
          </RadialGradient>
        )}
        
        {/* Orb glow gradient */}
        <RadialGradient id={`full-orb-${id}`} cx="50%" cy="40%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.7" />
          <Stop offset="50%" stopColor={accent} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0.1" />
        </RadialGradient>
      </Defs>
      
      {/* Rounded square background - Google Play standard */}
      {!transparent && (
        <Rect
          width="512"
          height="512"
          rx="112"
          fill={`url(#full-bg-${id})`}
        />
      )}
      
      {/* Main glowing orb - centered and prominent */}
      <Circle
        cx="256"
        cy="220"
        r="95"
        fill={`url(#full-orb-${id})`}
      />
      
      {/* Orb outer ring - strong presence */}
      <Circle
        cx="256"
        cy="220"
        r="95"
        stroke={accent}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Inner orb circle for depth */}
      <Circle
        cx="256"
        cy="220"
        r="68"
        stroke={accent}
        strokeWidth="4"
        fill="none"
        opacity="0.5"
      />
      
      {/* Minimal journal shape - merged with orb */}
      {/* Left page */}
      <Path
        d="M 175 295 L 175 375 C 175 387 183 395 195 395 L 248 395"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right page */}
      <Path
        d="M 337 295 L 337 375 C 337 387 329 395 317 395 L 264 395"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Journal binding */}
      <Line
        x1="256"
        y1="295"
        x2="256"
        y2="395"
        stroke={accent}
        strokeWidth="8"
        strokeLinecap="round"
      />
      
      {/* Page detail lines - left */}
      <Line
        x1="195"
        y1="325"
        x2="230"
        y2="325"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
      <Line
        x1="195"
        y1="350"
        x2="230"
        y2="350"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
      
      {/* Page detail lines - right */}
      <Line
        x1="282"
        y1="325"
        x2="317"
        y2="325"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
      <Line
        x1="282"
        y1="350"
        x2="317"
        y2="350"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.35"
      />
      
      {/* Light rays from orb - minimal */}
      <G opacity="0.3">
        <Line x1="256" y1="105" x2="256" y2="125" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <Line x1="161" y1="145" x2="175" y2="159" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <Line x1="351" y1="145" x2="337" y2="159" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <Line x1="141" y1="220" x2="161" y2="220" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <Line x1="351" y1="220" x2="371" y2="220" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      </G>
      
      {/* Highlight in orb */}
      <Circle
        cx="238"
        cy="198"
        r="14"
        fill="#FFFFFF"
        opacity="0.5"
      />
      
      <Circle
        cx="242"
        cy="203"
        r="10"
        fill={accent}
        opacity="0.7"
      />
    </Svg>
  );
}
