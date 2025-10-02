import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

// Flat background color (no gradient) with subtle decorative shapes + glass card
// Custom pulse loader replaces ActivityIndicator
export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.9)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true })
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, fade, pulse]);

  const dotScale = (index: number) => pulse.interpolate({
    inputRange: [0, 1],
    outputRange: index === 1 ? [0.6, 1] : index === 2 ? [1, 0.6] : [0.8, 1.05]
  });

  return (
    <View style={styles.root}>
      {/* Decorative background circles */}
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ scale }] }]}>        
        <Text style={styles.tagline}>VIT • SMEC</Text>
        <Text style={styles.title}>Laboratory{Platform.OS !== 'web' ? '\n' : ' '}Management System</Text>
        <Text style={styles.subtitle}>Cloud-Based Resource & Experiment Platform</Text>

        <View style={styles.divider} />

        <View style={styles.teamWrap}>          
          <Text style={styles.teamLabel}>Developed for Cloud Computing Project</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>Team 10</Text></View>
        </View>

        <View style={styles.loaderRow} accessibilityLabel="Loading application">
          {[0,1,2].map(i => (
            <Animated.View key={i} style={[styles.dot, { transform: [{ scale: dotScale(i) }] }]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F1218', // Deep neutral navy
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.18,
    backgroundColor: '#4da3ff'
  },
  blobA: { width: 260, height: 260, top: -40, left: -60 },
  blobB: { width: 180, height: 180, bottom: 40, right: -50, backgroundColor: '#6f5bff', opacity: 0.16 },
  blobC: { width: 140, height: 140, bottom: -30, left: 40, backgroundColor: '#22d3ee', opacity: 0.14 },
  card: {
    width: '84%',
    maxWidth: 460,
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(14px)', // web only
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#a5b4c8',
    marginBottom: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#d0d8e5',
    marginBottom: 28,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 24,
  },
  teamWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  teamLabel: {
    color: '#b9c4d3',
    fontSize: 13,
    maxWidth: 220,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#2563eb',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  loaderRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#60a5fa',
    shadowColor: '#60a5fa',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  }
});
