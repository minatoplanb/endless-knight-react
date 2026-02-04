import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { FONT_SIZES, scale } from '../../constants/theme';

interface LootNotificationItemProps {
  icon: string;
  text: string;
  color: string;
  onComplete: () => void;
}

export const LootNotificationItem = React.memo<LootNotificationItemProps>(
  ({ icon, text, color, onComplete }) => {
    const translateY = useRef(new Animated.Value(20)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      // Entrance animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Exit animation after delay
      const exitTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(onComplete);
      }, 1500);

      return () => clearTimeout(exitTimer);
    }, []);

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }, { scale: scaleAnim }],
            opacity,
            borderColor: color,
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.text, { color }]}>{text}</Text>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    borderWidth: 2,
    marginBottom: scale(4),
  },
  icon: {
    fontSize: FONT_SIZES.md,
    marginRight: scale(6),
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
});
