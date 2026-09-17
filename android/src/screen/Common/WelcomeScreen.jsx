import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineSlideAnim = useRef(new Animated.Value(20)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // const GOLD_COLOR = '#C9A84C';
  // const GOLD_DARK = '#B8943E';
  // const GOLD_LIGHT = '#D4AF37';

   const GOLD_COLOR = '#d6bceb';
   const GOLD_DARK = '#76577F';
   const GOLD_LIGHT = '#C4B0D3';

  useEffect(() => {
    // Start shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start logo animation
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Start content fade in after logo appears
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Animate loading bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3200,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        navigation.replace('LoginScreen');
      }, 500);
    });

    // Fallback timer
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 3800);

    return () => clearTimeout(timer);
  }, [navigation]);

  const loadingWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={GOLD_COLOR} />

      {/* Golden Background */}
      <View style={styles.background}>
        {/* Decorative Gold Elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />
        <View style={styles.decorCircle4} />
        <View style={styles.decorLine1} />
        <View style={styles.decorLine2} />
        <View style={styles.decorDot1} />
        <View style={styles.decorDot2} />
        <View style={styles.decorDot3} />
        <View style={styles.decorDot4} />

        {/* Shimmer Effect Overlay */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoFade,
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <View style={styles.logoOuterRing}>
              <View style={styles.logoInnerRing}>
                <View style={styles.logoIcon}>
                  <Image
                    source={require('../../asset/genlogo.png')} // Update the path as needed
                    style={{
                      width: 80,
                      height: 80,
                      resizeMode: 'contain',
                      
                    }}
                  />
                </View>
              </View>
            </View>
            <View style={styles.logoBadge}>
             
              <Image
                source={require('../../asset/sparkler.png')} // Update the path as needed
                style={{
                  width: 18,
                  height: 18,
                  resizeMode: 'contain',
                  tintColor: "#FFFFFF",

                }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.appNameContainer}>
            <Text style={styles.appNameHome}>Home</Text>
            <Text style={styles.appNameHelp}>Help</Text>
          </View>

          <View style={styles.divider} />

          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: textFadeAnim,
                transform: [{ translateY: taglineSlideAnim }],
              },
            ]}
          >
            <Text style={styles.tagline}>Premium Home Services</Text>
            <Text style={styles.taglineSub}>Professional • Reliable • Trusted</Text>

            <View style={styles.taglineBadges}>
              <View style={styles.taglineBadge}>
                
                <Image
                  source={require('../../asset/checked.png')} // Update the path as needed
                  style={{
                    width: 14,
                    height: 14,
                    tintColor: GOLD_DARK,

                  }}
                />
                <Text style={styles.taglineBadgeText}>Verified</Text>
              </View>
              <View style={styles.taglineBadge}>
                
                <Image
                  source={require('../../asset/star-fill.png')} // Update the path as needed
                  style={{
                    width: 14,
                    height: 14,
                    tintColor: GOLD_DARK,

                  }}
                />
                <Text style={styles.taglineBadgeText}>4.9 ★</Text>
              </View>
              <View style={styles.taglineBadge}>
               
                 <Image
                  source={require('../../asset/people.png')} // Update the path as needed
                  style={{
                    width: 14,
                    height: 14,
                    tintColor: GOLD_DARK,

                  }}
                />
                <Text style={styles.taglineBadgeText}>50K+</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Loading Section */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  width: loadingWidth,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 2.4.0</Text>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>2026</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d6bceb',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#d6bceb',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  // Shimmer Effect
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    width: width * 0.5,
    height: '100%',
    backgroundColor: 'rgba(5, 1, 1, 0.05)',
    transform: [{ skewX: '-20deg' }],
  },
  // Decorative elements
  decorCircle1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    top: -200,
    right: -150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  decorCircle2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    bottom: -100,
    left: -100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  decorCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    top: '30%',
    right: -60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  decorCircle4: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    bottom: '25%',
    left: -50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  decorLine1: {
    position: 'absolute',
    width: 2,
    height: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    right: 60,
    top: '35%',
  },
  decorLine2: {
    position: 'absolute',
    width: 2,
    height: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    left: 40,
    bottom: '30%',
  },
  decorDot1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '15%',
    right: 80,
  },
  decorDot2: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    bottom: '20%',
    right: 50,
  },
  decorDot3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    top: '45%',
    left: 60,
  },
  decorDot4: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: '65%',
    right: 100,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  logoInnerRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  logoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B8943E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appNameHome: {
    fontSize: 46,
    fontWeight: '700',
    color: '#352B38',
    letterSpacing: -1.5,
    includeFontPadding: false,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appNameHelp: {
    fontSize: 46,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  divider: {
    width: 60,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginBottom: 16,
    opacity: 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4A3A1A',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  taglineBadges: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taglineBadgeText: {
    fontSize: 11,
    color: '#4A3A1A',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    marginTop: 48,
    width: width * 0.4,
    maxWidth: 160,
  },
  loadingBar: {
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  loadingFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default WelcomeScreen;