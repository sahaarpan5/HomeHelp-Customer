import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Text,
} from 'react-native';

const { width } = Dimensions.get('window');

const ServiceOrbitLoader = ({
  message = 'Loading...',
  orbitSize = 260,
  logoSize = 130,
  iconSize = 70,
  duration = 8000,
}) => {
  // 5 rotation values for 5 icons
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const rotate3 = useRef(new Animated.Value(0)).current;
  const rotate4 = useRef(new Animated.Value(0)).current;
  const rotate5 = useRef(new Animated.Value(0)).current;

  // Logo pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  // Service icons (replace with your actual assets)
  const serviceIcons = [
    require('../asset/maid.png'),      // Service 1
    require('../asset/box.png'),      // Service 2
    require('../asset/chef.png'),      // Service 3
    require('../asset/street-sweeper.png'),      // Service 4
    require('../asset/helping.png'),      // Service 5
  ];

  // Fallback if images don't exist - using emojis
  const serviceEmojis = ['🔧', '⚡', '🧹', '🪚', '🎨'];

  useEffect(() => {
    // Start rotation animations - each offset by 72deg (360/5)
    const startRotation = (animValue, delay) => {
      animValue.setValue(0);
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation(rotate1, 0);
    startRotation(rotate2, 0);
    startRotation(rotate3, 0);
    startRotation(rotate4, 0);
    startRotation(rotate5, 0);

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Opacity pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolate rotation for each icon with 72deg offset
  const rotation1 = rotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotation2 = rotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['72deg', '432deg'],
  });

  const rotation3 = rotate3.interpolate({
    inputRange: [0, 1],
    outputRange: ['144deg', '504deg'],
  });

  const rotation4 = rotate4.interpolate({
    inputRange: [0, 1],
    outputRange: ['216deg', '576deg'],
  });

  const rotation5 = rotate5.interpolate({
    inputRange: [0, 1],
    outputRange: ['288deg', '648deg'],
  });

  const rotations = [rotation1, rotation2, rotation3, rotation4, rotation5];

  const orbitRadius = orbitSize / 2;

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrapper}>
        {/* Orbit container */}
        <View
          style={[
            styles.orbitContainer,
            { width: orbitSize, height: orbitSize }
          ]}
        >
          {/* Orbit ring (visual guide) */}
          <View
            style={[
              styles.orbitRing,
              {
                width: orbitSize,
                height: orbitSize,
                borderRadius: orbitSize / 2,
              }
            ]}
          />

          {/* 5 Rotating Service Icons */}
          {rotations.map((rotation, index) => (
            <Animated.View
              key={index}
              style={[
                styles.iconContainer,
                {
                  width: orbitSize,
                  height: orbitSize,
                  transform: [{ rotate: rotation }],
                }
              ]}
              pointerEvents="none"
            >
              <View
                style={[
                  styles.iconWrapper,
                  {
                    width: iconSize,
                    height: iconSize,
                    borderRadius: iconSize / 2,
                    // Position at top of orbit
                    top: 0,
                    left: (orbitSize - iconSize) / 2,
                  }
                ]}
              >
                {/* <Text style={[styles.iconEmoji, { fontSize: iconSize * 0.55 }]}>
                  {serviceEmojis[index]}
                </Text> */}

                <Image
                  source={serviceIcons[index]}
                  style={{
                    width: iconSize * 0.6,
                    height: iconSize * 0.6,
                    resizeMode: 'contain',
                    tintColor: '#FF8C00',
                  }}
                />
              </View>
            </Animated.View>
          ))}

          {/* Center Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                width: logoSize,
                height: logoSize,
                borderRadius: logoSize / 2,
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            <Image
              source={require('../asset/genlogo.png')}
              style={{
                width: logoSize * 0.7,
                height: logoSize * 0.7,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>
        </View>

        {/* Loading Text */}
        <Animated.Text
          style={[
            styles.loadingText,
            { opacity: opacityAnim }
          ]}
        >
          {message}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFE0CC',
    borderStyle: 'dashed',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: '#FFF8F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  iconEmoji: {
    textAlign: 'center',
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    position: 'absolute',
  },
  loadingText: {
    marginTop: 40,
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ServiceOrbitLoader;