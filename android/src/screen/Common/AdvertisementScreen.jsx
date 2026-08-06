import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    Animated,
    Alert,
    ActivityIndicator,
} from 'react-native';

import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const AdvertisementScreen = ({ navigation }) => {
    // States
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const videoSource = require('../../asset/videos/pr-2.mp4');

    const COLORS = {
        gold: '#C9A84C',
        goldLight: '#D4AF37',
        goldDark: '#B8943E',
        goldFade: 'rgba(201, 168, 76, 0.1)',
        white: '#FFFFFF',
        dark: '#1A1A1A',
        textLight: '#666666',
        lightBg: '#F8F6F0',
        border: '#E8E3D8',
        success: '#2ECC71',
        purple: '#6C5CE7',
        pink: '#FD79A8',
        blue: '#0984E3',
        green: '#00B894',
        red: '#E17055',
        orange: '#FDCB6E',
        warning: '#F39C12',
    };

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    // Advertisement data
    const adData = {
        id: '1',
        title: 'Premium Home Cleaning',
        tagline: '✨ Experience the best cleaning service',
        video: require('../../asset/sofa-clean.png'),
        thumbnail: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        rating: 4.9,
        orders: 15420,
        description: 'Professional cleaning at your doorstep with 100% satisfaction guarantee',
        discount: '20% OFF',
        validTill: '31 Dec 2026',
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
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
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Floating animation for the card
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Start video after a slight delay
        setTimeout(() => {
            setIsPlaying(true);
        }, 1000);
    }, []);

    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleExploreMore = () => {
        animateButtonPress();
       navigation.replace('ServiceBookingScreen', { adId: adData.id });
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const onLoadStart = () => {
        setIsLoading(true);
        setError(null);
    };

    const onLoad = () => {
        setIsLoading(false);
        setIsBuffering(false);
    };

    const onBuffer = ({ isBuffering }) => {
        setIsBuffering(isBuffering);
    };

    const onError = (e) => {
        console.log('Video Error:', e);
        setError(true);
        setIsLoading(false);
        setIsBuffering(false);
        // Try to replay after error
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.seek(0);
                setIsPlaying(true);
            }
        }, 2000);
    };

    const onProgress = (data) => {
        setProgress(data.currentTime / data.seekableDuration);
    };

    const onEnd = () => {
        // Replay video when finished
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.seek(0);
                setIsPlaying(true);
            }
        }, 2000);
    };


    const renderStars = (rating, size = 16) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            let image = starImages.empty;
            let tintColor = '#DDD';

            if (i < fullStars) {
                image = starImages.full;
                tintColor = '#FFD700';
            } else if (i === fullStars && hasHalfStar) {
                image = starImages.half;
                tintColor = '#FFD700';
            }

            stars.push(
                <Image
                    key={i}
                    source={image}
                    style={{
                        width: 16,
                        height: 16,
                        tintColor, // Remove this if your PNGs are already colored
                        resizeMode: 'contain',
                        marginHorizontal: 1,
                    }}
                />
            );
        }
        return stars;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Full Screen Video */}
          <Video
        ref={videoRef}
        source={videoSource}
        style={styles.fullVideo}
        resizeMode="cover"
        paused={!isPlaying}
        muted={isMuted}
        repeat={false}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onBuffer={onBuffer}
        onError={onError}
        onProgress={onProgress}
        onEnd={onEnd}
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
        progressUpdateInterval={1000}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch={"ignore"}
      />

            {/* Gradient Overlay */}
            <View style={styles.gradientOverlay} />

            {/* Loading Indicator */}
            {(isLoading || isBuffering) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.gold} />
                    <Text style={styles.loadingText}>
                        {isLoading ? 'Loading video...' : 'Buffering...'}
                    </Text>
                </View>
            )}

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>

                    <Image
                        source={require('../../asset/alert.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.red


                        }}
                    />
                    <Text style={styles.errorText}>Failed to load video</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setError(null);
                            setIsLoading(true);
                            setTimeout(() => {
                                if (videoRef.current) {
                                    videoRef.current.seek(0);
                                    setIsPlaying(true);
                                }
                            }, 1000);
                        }}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Video Progress Bar */}
            {!isLoading && !error && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>
            )}

            {/* Video Controls */}
            <View style={styles.videoControls}>
                <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
                    <Image
                        source={
                            isPlaying
                                ? require('../../asset/pause.png')
                                : require('../../asset/play-circle-outline.png')
                        }
                        style={{
                            width: 22,
                            height: 22,
                            resizeMode: 'contain',
                            tintColor: COLORS.white, // Remove if your PNGs are already white
                        }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                    <Image
                        source={
                            isMuted
                                ? require('../../asset/mute.png')
                                : require('../../asset/volume-up.png')
                        }
                        style={{
                            width: 22,
                            height: 22,
                            resizeMode: 'contain',
                            tintColor: COLORS.white,
                        }}
                    />

                    <Image
                        source={
                            isPlaying
                                ? require('../../asset/pause.png')
                                : require('../../asset/play-circle-outline.png')
                        }
                        style={{
                            width: 22,
                            height: 22,
                            resizeMode: 'contain',
                            tintColor: COLORS.white, // Remove if your PNGs are already white
                        }}
                    />
                </TouchableOpacity>
            </View>

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >

                <Image
                    source={require('../../asset/close.png')} // Update the path as needed
                    style={{
                        width: 24,
                        height: 24,
                        resizeMode: 'contain',
                        tintColor: COLORS.red


                    }}
                />
            </TouchableOpacity>

            {/* Floating Card */}
            <Animated.View
                style={[
                    styles.floatingCard,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: slideAnim },
                            {
                                translateY: floatAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8],
                                })
                            },
                        ],
                    }
                ]}
            >
                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{adData.discount}</Text>
                </View>

                {/* Service Name */}
                <Text style={styles.serviceTitle}>{adData.title}</Text>

                {/* Tagline */}
                <Text style={styles.serviceTagline}>{adData.tagline}</Text>

                {/* Rating & Orders */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <View style={styles.starsContainer}>
                            {renderStars(adData.rating)}
                        </View>
                        <Text style={styles.statText}>{adData.rating}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>

                        <Image
                            source={require('../../asset/briefcase.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.white


                            }}
                        />
                        <Text style={styles.statText}>{adData.orders.toLocaleString()} orders</Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.serviceDescription}>{adData.description}</Text>

                {/* Explore More Button - Right Aligned */}
                <Animated.View style={{
                    transform: [{ scale: buttonScaleAnim }],
                    alignSelf: 'flex-end',
                }}>
                    <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={handleExploreMore}
                    >
                        <Text style={styles.exploreButtonText}>Explore More</Text>

                        <Image
                            source={require('../../asset/right-arrow.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.white


                            }}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    fullVideo: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    videoControls: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
        gap: 10,
    },
    controlButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Loading State
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginTop: 12,
        fontWeight: '500',
    },
    // Error State
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 12,
        fontWeight: '500',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#C9A84C',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Progress Bar
    progressContainer: {
        position: 'absolute',
        bottom: 190,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    progressBar: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#C9A84C',
        borderRadius: 2,
    },
    // Floating Card
    floatingCard: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    discountBadge: {
        position: 'absolute',
        top: -12,
        right: 16,
        backgroundColor: '#E17055',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    serviceTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    serviceTagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    statText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    statDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    serviceDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 16,
        lineHeight: 18,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#C9A84C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    exploreButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default AdvertisementScreen;