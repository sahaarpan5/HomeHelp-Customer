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

// ============================================================
// BRAND COLORS
// ============================================================

const BRAND_PRIMARY = '#B39AC7';
const BRAND_DARK = '#76577F';
const BRAND_LIGHT = '#F7F2FA';
const BRAND_SOFT = '#E9DFF0';


// ============================================================
// SERVICE ORBIT LOADER
// ============================================================

const ServiceOrbitLoader = ({
  message = 'Preparing your services',
  orbitSize = Math.min(width * 0.68, 270),
  logoSize = Math.min(width * 0.30, 118),
  iconSize = Math.min(width * 0.16, 62),
  duration = 8500,
}) => {

  // ==========================================================
  // ANIMATIONS
  // ==========================================================

  // Main orbit rotation
  const orbitAnim = useRef(
    new Animated.Value(0)
  ).current;

  // Logo breathing
  const logoScale = useRef(
    new Animated.Value(1)
  ).current;

  const logoOpacity = useRef(
    new Animated.Value(1)
  ).current;

  // Glow animation
  const glowScale = useRef(
    new Animated.Value(0.85)
  ).current;

  const glowOpacity = useRef(
    new Animated.Value(0.25)
  ).current;

  // Loading dots
  const dot1 = useRef(
    new Animated.Value(0.3)
  ).current;

  const dot2 = useRef(
    new Animated.Value(0.3)
  ).current;

  const dot3 = useRef(
    new Animated.Value(0.3)
  ).current;

  // Progress animation
  const progressAnim = useRef(
    new Animated.Value(0)
  ).current;


  // ==========================================================
  // SERVICE ICONS
  // ==========================================================

  const serviceIcons = [
    require('../asset/maid.png'),
    require('../asset/box.png'),
    require('../asset/chef.png'),
    require('../asset/street-sweeper.png'),
    require('../asset/helping.png'),
  ];


  // ==========================================================
  // START ANIMATIONS
  // ==========================================================

  useEffect(() => {

    // --------------------------------------------------------
    // Main orbit
    // --------------------------------------------------------

    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    orbitLoop.start();


    // --------------------------------------------------------
    // Logo breathing
    // --------------------------------------------------------

    const logoLoop = Animated.loop(
      Animated.sequence([

        Animated.parallel([

          Animated.timing(logoScale, {
            toValue: 1.055,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(logoOpacity, {
            toValue: 0.92,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

        ]),

        Animated.parallel([

          Animated.timing(logoScale, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

        ]),

      ])
    );

    logoLoop.start();


    // --------------------------------------------------------
    // Soft glow
    // --------------------------------------------------------

    const glowLoop = Animated.loop(
      Animated.sequence([

        Animated.parallel([

          Animated.timing(glowScale, {
            toValue: 1.12,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowOpacity, {
            toValue: 0.42,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

        ]),

        Animated.parallel([

          Animated.timing(glowScale, {
            toValue: 0.85,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

        ]),

      ])
    );

    glowLoop.start();


    // --------------------------------------------------------
    // Loading dots
    // --------------------------------------------------------

    const animateDot = (dot, delay) => {

      return Animated.loop(

        Animated.sequence([

          Animated.delay(delay),

          Animated.timing(dot, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(dot, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

        ])

      );
    };


    const dotLoop1 = animateDot(dot1, 0);
    const dotLoop2 = animateDot(dot2, 180);
    const dotLoop3 = animateDot(dot3, 360);

    dotLoop1.start();
    dotLoop2.start();
    dotLoop3.start();


    // --------------------------------------------------------
    // Progress animation
    // --------------------------------------------------------

    const progressLoop = Animated.loop(

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })

    );

    progressLoop.start();


    // --------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------

    return () => {

      orbitLoop.stop();
      logoLoop.stop();
      glowLoop.stop();

      dotLoop1.stop();
      dotLoop2.stop();
      dotLoop3.stop();

      progressLoop.stop();

    };

  }, [duration]);


  // ==========================================================
  // INTERPOLATIONS
  // ==========================================================

  const rotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });


  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '78%'],
  });


  // ==========================================================
  // ORBIT RADIUS
  // ==========================================================

  const orbitRadius = orbitSize / 2;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <View style={styles.container}>

      <View style={styles.loaderWrapper}>

        {/* ==================================================
            ORBIT AREA
        ================================================== */}

        <View
          style={[
            styles.orbitContainer,
            {
              width: orbitSize,
              height: orbitSize,
            },
          ]}
        >

          {/* ------------------------------------------------
              OUTER GLOW
          ------------------------------------------------ */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.outerGlow,
              {
                width: orbitSize + 18,
                height: orbitSize + 18,
                borderRadius: (orbitSize + 18) / 2,
                opacity: glowOpacity,
                transform: [
                  {
                    scale: glowScale,
                  },
                ],
              },
            ]}
          />


          {/* ------------------------------------------------
              MAIN ORBIT RING
          ------------------------------------------------ */}

          <View
            pointerEvents="none"
            style={[
              styles.orbitRing,
              {
                width: orbitSize,
                height: orbitSize,
                borderRadius: orbitRadius,
              },
            ]}
          />


          {/* ------------------------------------------------
              INNER ORBIT RING
          ------------------------------------------------ */}

          <View
            pointerEvents="none"
            style={[
              styles.innerRing,
              {
                width: orbitSize * 0.78,
                height: orbitSize * 0.78,
                borderRadius: orbitSize * 0.39,
              },
            ]}
          />


          {/* ==================================================
              ROTATING SERVICE ICONS
          ================================================== */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.orbitAnimation,
              {
                width: orbitSize,
                height: orbitSize,

                transform: [
                  {
                    rotate: rotation,
                  },
                ],
              },
            ]}
          >

            {serviceIcons.map((icon, index) => {

              const angle =
                (360 / serviceIcons.length) * index;

              return (

                <View
                  key={index}
                  style={[
                    styles.servicePosition,
                    {
                      width: orbitSize,
                      height: orbitSize,

                      transform: [
                        {
                          rotate: `${angle}deg`,
                        },
                      ],
                    },
                  ]}
                >

                  {/* ----------------------------------------
                      SERVICE ICON CARD
                  ---------------------------------------- */}

                  <View
                    style={[
                      styles.iconWrapper,
                      {
                        width: iconSize,
                        height: iconSize,
                        borderRadius: iconSize / 2,

                        transform: [
                          {
                            rotate: `-${angle}deg`,
                          },
                        ],
                      },
                    ]}
                  >

                    <Image
                      source={icon}
                      style={{
                        width: iconSize * 0.55,
                        height: iconSize * 0.55,
                        resizeMode: 'contain',
                      }}
                    />

                  </View>

                </View>

              );
            })}

          </Animated.View>


          {/* ==================================================
              CENTER GLOW
          ================================================== */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.centerGlow,
              {
                width: logoSize + 22,
                height: logoSize + 22,
                borderRadius: (logoSize + 22) / 2,

                opacity: glowOpacity,

                transform: [
                  {
                    scale: glowScale,
                  },
                ],
              },
            ]}
          />


          {/* ==================================================
              CENTER LOGO
          ================================================== */}

          <Animated.View
            style={[
              styles.logoContainer,
              {
                width: logoSize,
                height: logoSize,
                borderRadius: logoSize / 2,

                transform: [
                  {
                    scale: logoScale,
                  },
                ],

                opacity: logoOpacity,
              },
            ]}
          >

            <View
              style={[
                styles.logoInner,
                {
                  width: logoSize - 12,
                  height: logoSize - 12,
                  borderRadius: (logoSize - 12) / 2,
                },
              ]}
            >

              <Image
                source={require('../asset/genlogo.png')}
                style={{
                  width: logoSize * 0.66,
                  height: logoSize * 0.66,
                  resizeMode: 'contain',
                }}
              />

            </View>

          </Animated.View>

        </View>


        {/* ==================================================
            LOADING MESSAGE
        ================================================== */}

        <View style={styles.messageContainer}>

          <Text style={styles.loadingMessage}>
            {message}
          </Text>


          <View style={styles.dotsContainer}>

            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: dot1,
                },
              ]}
            />

            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: dot2,
                },
              ]}
            />

            <Animated.View
              style={[
                styles.loadingDot,
                {
                  opacity: dot3,
                },
              ]}
            />

          </View>

        </View>


        {/* ==================================================
            PROGRESS BAR
        ================================================== */}

        <View style={styles.progressContainer}>

          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />

        </View>


        {/* ==================================================
            SUB MESSAGE
        ================================================== */}

        <Text style={styles.subText}>
          Please wait a moment
        </Text>

      </View>

    </View>

  );
};


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ----------------------------------------------------------
  // MAIN CONTAINER
  // ----------------------------------------------------------

  container: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',
  },


  // ----------------------------------------------------------
  // LOADER WRAPPER
  // ----------------------------------------------------------

  loaderWrapper: {
    width: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },


  // ----------------------------------------------------------
  // ORBIT CONTAINER
  // ----------------------------------------------------------

  orbitContainer: {
    position: 'relative',

    justifyContent: 'center',
    alignItems: 'center',
  },


  // ----------------------------------------------------------
  // OUTER GLOW
  // ----------------------------------------------------------

  outerGlow: {
    position: 'absolute',

    borderWidth: 1,

    borderColor: BRAND_SOFT,
  },


  // ----------------------------------------------------------
  // MAIN ORBIT
  // ----------------------------------------------------------

  orbitRing: {
    position: 'absolute',

    borderWidth: 1.5,

    borderColor: BRAND_SOFT,
  },


  // ----------------------------------------------------------
  // INNER ORBIT
  // ----------------------------------------------------------

  innerRing: {
    position: 'absolute',

    borderWidth: 1,

    borderColor: '#F1EAF4',
  },


  // ----------------------------------------------------------
  // ORBIT ANIMATION
  // ----------------------------------------------------------

  orbitAnimation: {
    position: 'absolute',

    justifyContent: 'flex-start',
    alignItems: 'center',
  },


  // ----------------------------------------------------------
  // SERVICE POSITION
  // ----------------------------------------------------------

  servicePosition: {
    position: 'absolute',

    justifyContent: 'flex-start',
    alignItems: 'center',
  },


  // ----------------------------------------------------------
  // SERVICE ICON CARD
  // ----------------------------------------------------------

  iconWrapper: {
    position: 'absolute',

    top: -2,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1.5,

    borderColor: BRAND_PRIMARY,

    shadowColor: BRAND_DARK,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.16,

    shadowRadius: 8,

    elevation: 5,
  },


  // ----------------------------------------------------------
  // CENTER GLOW
  // ----------------------------------------------------------

  centerGlow: {
    position: 'absolute',

    backgroundColor: BRAND_SOFT,
  },


  // ----------------------------------------------------------
  // LOGO OUTER
  // ----------------------------------------------------------

  logoContainer: {
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 2,

    borderColor: BRAND_PRIMARY,

    shadowColor: BRAND_DARK,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.2,

    shadowRadius: 14,

    elevation: 9,
  },


  // ----------------------------------------------------------
  // LOGO INNER
  // ----------------------------------------------------------

  logoInner: {
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: BRAND_LIGHT,

    borderWidth: 1,

    borderColor: '#E3D5E9',
  },


  // ----------------------------------------------------------
  // MESSAGE
  // ----------------------------------------------------------

  messageContainer: {
    marginTop: 34,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',
  },


  loadingMessage: {
    fontSize: 16,

    fontWeight: '600',

    color: BRAND_DARK,

    letterSpacing: 0.2,
  },


  // ----------------------------------------------------------
  // LOADING DOTS
  // ----------------------------------------------------------

  dotsContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    marginLeft: 5,

    gap: 3,
  },


  loadingDot: {
    width: 4,

    height: 4,

    borderRadius: 2,

    backgroundColor: BRAND_PRIMARY,
  },


  // ----------------------------------------------------------
  // PROGRESS BAR
  // ----------------------------------------------------------

  progressContainer: {
    width: Math.min(width * 0.42, 170),

    height: 4,

    marginTop: 18,

    backgroundColor: '#F0EAF3',

    borderRadius: 10,

    overflow: 'hidden',
  },


  progressBar: {
    height: 4,

    backgroundColor: BRAND_PRIMARY,

    borderRadius: 10,
  },


  // ----------------------------------------------------------
  // SUB TEXT
  // ----------------------------------------------------------

  subText: {
    marginTop: 10,

    fontSize: 12,

    fontWeight: '500',

    color: '#9A8FA0',

    letterSpacing: 0.3,
  },

});


// ============================================================
// EXPORT
// ============================================================

export default ServiceOrbitLoader;