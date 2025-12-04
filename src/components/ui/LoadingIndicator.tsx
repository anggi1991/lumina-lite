import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Svg, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface LoadingIndicatorProps {
  size?: number;
  color?: string;
}

export function LoadingIndicator({ size = 48, color = '#C8B6FF' }: LoadingIndicatorProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Defs>
            <RadialGradient id="loader-glow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          {/* Outer Ring - Solid Gradient */}
          <Circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Rotating Arc */}
          <Circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="60 190"
            opacity="1"
          />
          
          {/* Inner Ring - Subtle */}
          <Circle
            cx="50"
            cy="50"
            r="25"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.2"
          />
          
          {/* Center Glow */}
          <Circle
            cx="50"
            cy="50"
            r="15"
            fill="url(#loader-glow)"
            opacity="0.5"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
