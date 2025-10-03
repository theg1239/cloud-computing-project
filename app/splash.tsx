import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

// Redesigned splash: minimalist, purposeful, no gradients, brand monogram + subtle animated progress bar
export default function SplashScreen() {
  const reduceMotion = useRef(false);
  const [ready, setReady] = useState(false);

  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslate = useRef(new Animated.Value(14)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const barAnim = useRef(new Animated.Value(0)).current; // 0..1 sweep
  const gridOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((rm) => {
      reduceMotion.current = rm;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (reduceMotion.current) {
      introOpacity.setValue(1);
      introTranslate.setValue(0);
      ringScale.setValue(1);
      gridOpacity.setValue(1);
      return; // no animation
    }
    // Staggered entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(gridOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true })
      ]),
      Animated.delay(40),
      Animated.parallel([
        Animated.timing(introOpacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(introTranslate, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ])
    ]).start();

    // Indeterminate loader bar sweep loop
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(barAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.timing(barAnim, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ready, introOpacity, introTranslate, ringScale, barAnim, gridOpacity]);

  // Map barAnim 0..1 to translateX across track (overshoot a little for style)
  const barTranslate = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['-20%', '110%'] });

  const gridDots = GRID_POINTS.map((p, i) => (
    <Animated.View
      key={i}
      style={[
        styles.gridDot,
        { left: p[0], top: p[1], opacity: gridOpacity }
      ]}
    />
  ));

  return (
    <View style={styles.root} accessibilityLabel="Splash screen" accessibilityRole="summary">
      {/* Subtle decorative grid */}
      <View style={styles.grid}>{gridDots}</View>

      <Animated.View style={[styles.monogramWrap, { transform: [{ scale: ringScale }] }]}>        
        <View style={styles.monogramInner}>
          <Text style={styles.monogramText}>SMEC</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.textBlock, { opacity: introOpacity, transform: [{ translateY: introTranslate }] }]}>        
        <Text style={styles.product}>Lab Management</Text>
        <Text style={styles.tagline}>{Platform.OS === 'web' ? 'Cloud Resources • Scheduling • Experiments' : 'Cloud Resources  •  Scheduling  •  Experiments'}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Team 10 • Cloud Computing Project</Text>
        </View>
        <View style={styles.loaderTrack} accessibilityLabel="Loading">
          <Animated.View style={[styles.loaderBar, { transform: [{ translateX: barTranslate }] }]} />
        </View>
      </Animated.View>
    </View>
  );
}

// Precomputed positions for a subtle grid of tiny squares (kept sparse)
const GRID_POINTS: [number, number][] = [
  [24, 34],[72, 52],[140, 28],[210, 46],[280, 36],[52, 120],[128, 114],[196, 108],[264, 118],[320, 110],
  [40, 200],[110, 190],[178, 198],[246, 192],[310, 202],[70, 270],[150, 260],[230, 268],[300, 258]
];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    alignItems: 'center',
    justifyContent: 'center'
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5
  },
  gridDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1f2933'
  },
  monogramWrap: {
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: '#121317',
    borderWidth: 1,
    borderColor: '#1e2430',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    marginBottom: 38
  },
  monogramInner: {
    width: 112,
    height: 112,
    borderRadius: 24,
    backgroundColor: '#0F1115',
    borderWidth: 2,
    borderColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  monogramText: {
    color: '#0A84FF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 2
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  product: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F2F2F7',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center'
  },
  tagline: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 18,
    maxWidth: 320
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26
  },
  meta: {
    fontSize: 12,
    color: '#5f6672',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  loaderTrack: {
    width: 180,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#1c1f26',
    overflow: 'hidden'
  },
  loaderBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '28%',
    borderRadius: 4,
    backgroundColor: '#0A84FF'
  }
});
