import React from 'react';
import Svg, { 
  Defs, 
  RadialGradient, 
  Stop, 
  Filter, 
  FeGaussianBlur, 
  FeMerge, 
  FeMergeNode,
  Circle, 
  Path, 
  Line 
} from 'react-native-svg';

interface LuminaOrbIconProps {
  size?: number;
  variant?: 'light' | 'dark';
}

export function LuminaOrbIcon({ size = 200, variant = 'light' }: LuminaOrbIconProps) {
  // Scale proportionally from base 512
  const scale = size / 512;
  const orbCenterY = 220 * scale;
  const orbRadius = 100 * scale;
  const innerRadius = 72 * scale;
  const journalStartY = 300 * scale;
  const journalEndY = 380 * scale;
  const journalBottomY = 400 * scale;
  const centerX = size / 2;

  const primaryColor = variant === 'light' ? '#C8B6FF' : '#7FE7DC';
  const strokeColor = variant === 'light' ? '#2E2E2E' : '#E0E0E0';

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        {/* Radial gradient for orb glow */}
        <RadialGradient id="orbGlow" cx="50%" cy="40%">
          <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.6" />
          <Stop offset="50%" stopColor={primaryColor} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
        </RadialGradient>
        
        {/* Soft glow filter */}
        <Filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur stdDeviation={8 * scale} result="coloredBlur"/>
          <FeMerge>
            <FeMergeNode in="coloredBlur"/>
            <FeMergeNode in="SourceGraphic"/>
          </FeMerge>
        </Filter>
      </Defs>
      
      {/* Main glowing orb - centered */}
      <Circle
        cx={centerX}
        cy={orbCenterY}
        r={orbRadius}
        fill="url(#orbGlow)"
        filter="url(#softGlow)"
      />
      
      {/* Orb outer ring */}
      <Circle
        cx={centerX}
        cy={orbCenterY}
        r={orbRadius}
        stroke={primaryColor}
        strokeWidth={6 * scale}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Inner orb detail */}
      <Circle
        cx={centerX}
        cy={orbCenterY}
        r={innerRadius}
        stroke={primaryColor}
        strokeWidth={3 * scale}
        fill="none"
        opacity="0.5"
      />
      
      {/* Minimal journal shape merged at bottom */}
      {/* Left page */}
      <Path
        d={`M ${170 * scale} ${journalStartY} L ${170 * scale} ${journalEndY} C ${170 * scale} ${(journalEndY + 12 * scale)} ${178 * scale} ${journalBottomY} ${190 * scale} ${journalBottomY} L ${248 * scale} ${journalBottomY}`}
        stroke={strokeColor}
        strokeWidth={8 * scale}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Right page */}
      <Path
        d={`M ${342 * scale} ${journalStartY} L ${342 * scale} ${journalEndY} C ${342 * scale} ${(journalEndY + 12 * scale)} ${334 * scale} ${journalBottomY} ${322 * scale} ${journalBottomY} L ${264 * scale} ${journalBottomY}`}
        stroke={strokeColor}
        strokeWidth={8 * scale}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Journal binding center */}
      <Line
        x1={centerX}
        y1={journalStartY}
        x2={centerX}
        y2={journalBottomY}
        stroke={primaryColor}
        strokeWidth={6 * scale}
        strokeLinecap="round"
      />
      
      {/* Left journal details */}
      <Line
        x1={190 * scale}
        y1={330 * scale}
        x2={235 * scale}
        y2={330 * scale}
        stroke={primaryColor}
        strokeWidth={3 * scale}
        strokeLinecap="round"
        opacity="0.6"
      />
      <Line
        x1={190 * scale}
        y1={355 * scale}
        x2={230 * scale}
        y2={355 * scale}
        stroke={primaryColor}
        strokeWidth={3 * scale}
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Right journal details */}
      <Line
        x1={277 * scale}
        y1={330 * scale}
        x2={322 * scale}
        y2={330 * scale}
        stroke={primaryColor}
        strokeWidth={3 * scale}
        strokeLinecap="round"
        opacity="0.6"
      />
      <Line
        x1={282 * scale}
        y1={355 * scale}
        x2={322 * scale}
        y2={355 * scale}
        stroke={primaryColor}
        strokeWidth={3 * scale}
        strokeLinecap="round"
        opacity="0.6"
      />
    </Svg>
  );
}
