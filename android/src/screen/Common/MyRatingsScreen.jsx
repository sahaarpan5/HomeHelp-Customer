import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    Animated,
    Alert,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const MyRatingsScreen = ({ navigation }) => {
    // States
    const [isLoading, setIsLoading] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const COLORS = {
         gold: '#76577F',
        goldLight: '#76577F',
        goldDark: '#C4B0D3',
        goldFade: 'rgba(179, 154, 199, 0.1)',
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
        txtColor: '#403746',
    };

    // Sample rating data
    const ratingData = {
        averageRating: 4.8,
        totalRatings: 45,
        distribution: {
            5: 32,
            4: 8,
            3: 3,
            2: 1,
            1: 1,
        },
    };

    // Rating breakdown items
    const ratingBreakdown = [
        { stars: 5, count: 32, percentage: 71 },
        { stars: 4, count: 8, percentage: 18 },
        { stars: 3, count: 3, percentage: 7 },
        { stars: 2, count: 1, percentage: 2 },
        { stars: 1, count: 1, percentage: 2 },
    ];

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    // Tips for being a 5-star customer
    const fiveStarTips = [
        {
            id: '1',
            icon: require('../../asset/heart.png'),
            title: 'Empathise',
            description: 'Understand that professionals work hard to serve you better. A little empathy goes a long way.',
            color: COLORS.pink,
        },
        {
            id: '2',
            icon: require('../../asset/bubble-chat.png'),
            title: 'Support',
            description: 'Communicate clearly and provide necessary information to help them complete the job efficiently.',
            color: COLORS.blue,
        },
        {
            id: '3',
            icon: require('../../asset/handshake.png'),
            title: 'Respect',
            description: 'Treat professionals with dignity and respect. A kind word can make their day.',
            color: COLORS.gold,
        },
    ];

    // How rating is calculated
    const ratingCalculation = [
        {
            id: '1',
            title: 'Service Quality',
            description: 'Quality of work delivered by the professional',
        },
        {
            id: '2',
            title: 'Punctuality',
            description: 'Timeliness and adherence to scheduled time',
        },
        {
            id: '3',
            title: 'Professionalism',
            description: 'Behavior, communication, and overall conduct',
        },
        {
            id: '4',
            title: 'Value for Money',
            description: 'Whether the service was worth the price paid',
        },
    ];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // const renderStars = (count) => {
    //     const stars = [];
    //     for (let i = 0; i < 5; i++) {
    //         stars.push(
    //             <Ionicons
    //                 key={i}
    //                 name={i < count ? 'star' : 'star-outline'}
    //                 size={16}
    //                 color={i < count ? COLORS.orange : '#D4D4D4'}
    //             />
    //         );
    //     }
    //     return stars;
    // };

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
            <StatusBar barStyle="light-content" backgroundColor="#d6bceb" />

            {/* Header - Left Aligned */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={require('../../asset/arrow-back.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.txtColor


                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Ratings</Text>
            </View>

            <Animated.ScrollView
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Rating Summary */}
                <View style={styles.ratingSummaryCard}>
                    <View style={styles.ratingSummaryLeft}>
                        <Text style={styles.averageRating}>{ratingData.averageRating}</Text>
                        <View style={styles.starsContainer}>
                            {renderStars(Math.round(ratingData.averageRating))}
                        </View>
                        <Text style={styles.totalRatings}>{ratingData.totalRatings} ratings</Text>
                    </View>
                    <View style={styles.ratingSummaryRight}>
                        {ratingBreakdown.map((item) => (
                            <View key={item.stars} style={styles.ratingBarRow}>
                                <View style={styles.ratingBarLabel}>
                                    <Text style={styles.ratingBarStar}>{item.stars}</Text>

                                    <Image
                                        source={require('../../asset/star-fill.png')} // Update the path as needed
                                        style={{
                                            width: 12,
                                            height: 12,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.orange


                                        }}
                                    />
                                </View>
                                <View style={styles.ratingBarTrack}>
                                    <View
                                        style={[
                                            styles.ratingBarFill,
                                            { width: `${item.percentage}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.ratingBarCount}>{item.count}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* How Can I Be a 5 Star Customer? */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>🌟 How Can I Be a 5 Star Customer?</Text>

                    {fiveStarTips.map((tip) => (
                        <View key={tip.id} style={styles.tipCard}>
                            <View style={[styles.tipIcon, { backgroundColor: tip.color + '15' }]}>

                                <Image
                                    source={tip.icon}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: tip.color, // Remove if your PNGs are already colored
                                    }}
                                />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>{tip.title}</Text>
                                <Text style={styles.tipDescription}>{tip.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* How Rating is Calculated */}
                <View style={styles.calculationContainer}>
                    <Text style={styles.calculationTitle}>📊 How Rating is Calculated</Text>

                    {ratingCalculation.map((item, index) => (
                        <View key={item.id} style={styles.calculationItem}>
                            <View style={styles.calculationNumber}>
                                <Text style={styles.calculationNumberText}>{index + 1}</Text>
                            </View>
                            <View style={styles.calculationContent}>
                                <Text style={styles.calculationItemTitle}>{item.title}</Text>
                                <Text style={styles.calculationItemDescription}>{item.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.footerSpacer} />
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#d6bceb',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#403746',
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Rating Summary Card
    ratingSummaryCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    ratingSummaryLeft: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: '#F0EDE8',
    },
    averageRating: {
        fontSize: 40,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    starsContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    totalRatings: {
        fontSize: 13,
        color: '#666666',
        marginTop: 4,
    },
    ratingSummaryRight: {
        flex: 1.5,
        paddingLeft: 16,
        justifyContent: 'center',
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    ratingBarLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 28,
    },
    ratingBarStar: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 2,
    },
    ratingBarTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#F0EDE8',
        borderRadius: 3,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        backgroundColor: '#76577F',
        borderRadius: 3,
    },
    ratingBarCount: {
        fontSize: 12,
        color: '#666666',
        width: 20,
        textAlign: 'right',
    },
    // Tips Section
    tipsContainer: {
        marginTop: 20,
    },
    tipsTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    tipIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    tipDescription: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
        lineHeight: 18,
    },
    // Calculation Section
    calculationContainer: {
        marginTop: 20,
    },
    calculationTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    calculationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    calculationNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#76577F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    calculationNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    calculationContent: {
        flex: 1,
    },
    calculationItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    calculationItemDescription: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    footerSpacer: {
        height: 20,
    },
});

export default MyRatingsScreen;