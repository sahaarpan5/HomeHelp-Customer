import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const Loader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Line animation
    const startAnimation = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(() => startAnimation());
    };

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    startAnimation();
  }, []);

  const leftInterpolate = animatedValue.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: ['-20%', '40%', '60%', '100%']
  });

  const widthInterpolate = animatedValue.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: ['20%', '50%', '40%', '20%']
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.loaderCard,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.headerText}>
            <View style={styles.namePlaceholder} />
            <View style={styles.timePlaceholder} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.textPlaceholder} />
          <View style={[styles.textPlaceholder, { width: '80%' }]} />
          <View style={[styles.textPlaceholder, { width: '60%' }]} />
          <View style={styles.imagePlaceholder} />
        </View>

        <View style={styles.loaderWrapper}>
          <View style={styles.loaderBackground}>
            <Animated.View
              style={[
                styles.loaderLine,
                {
                  left: leftInterpolate,
                  width: widthInterpolate,
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.actionPlaceholder} />
          <View style={styles.actionPlaceholder} />
          <View style={styles.actionPlaceholder} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4E6EB',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  namePlaceholder: {
    height: 16,
    width: '60%',
    backgroundColor: '#E4E6EB',
    borderRadius: 4,
    marginBottom: 6,
  },
  timePlaceholder: {
    height: 12,
    width: '30%',
    backgroundColor: '#E4E6EB',
    borderRadius: 4,
  },
  content: {
    marginBottom: 12,
  },
  textPlaceholder: {
    height: 14,
    width: '100%',
    backgroundColor: '#E4E6EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  imagePlaceholder: {
    height: 180,
    width: '100%',
    backgroundColor: '#E4E6EB',
    borderRadius: 8,
    marginTop: 8,
  },
  loaderWrapper: {
    marginVertical: 12,
  },
  loaderBackground: {
    height: 4,
    backgroundColor: '#E4E6EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderLine: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 2,
    position: 'absolute',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
  },
  actionPlaceholder: {
    height: 20,
    width: 80,
    backgroundColor: '#E4E6EB',
    borderRadius: 4,
  },
});

export default Loader;