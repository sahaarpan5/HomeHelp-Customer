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
    FlatList,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const ProfessionalDetailsScreen = ({ navigation, route }) => {
    // States
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [expandedAbout, setExpandedAbout] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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

    // Sample professional data
    const professionalData = {
        id: '1',
        name: 'Rajesh Kumar',
        photo:  require('../../asset/demo-user.png'),
        coverImage:  require('../../asset/heroic.png'),
        rating: 4.9,
        totalReviews: 1240,
        experience: '8 years',
        jobsCompleted: 2450,
        about: 'I am a professional home cleaning expert with over 8 years of experience in deep cleaning, sofa cleaning, and bathroom sanitization. I take pride in delivering high-quality services with attention to detail. I believe in building trust with my customers through reliable and consistent service. My goal is to make every home spotless and every customer happy.',
        languages: ['English', 'Hindi', 'Marathi'],
        isVerified: true,
        responseTime: 'Responds in 5 minutes',
        completionRate: '98%',
    };

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    // Customer reviews
    const allReviews = [
        {
            id: '1',
            customerName: 'Priya Sharma',
            customerPhoto: require('../../asset/smile.jpg'),
            rating: 5,
            date: '15 Jan 2027',
            comment: 'Excellent service! Rajesh did a fantastic job cleaning my home. Very professional and thorough. Highly recommend!',
            serviceName: 'Home Cleaning',
        },
        {
            id: '2',
            customerName: 'Amit Patel',
            customerPhoto: require('../../asset/demo-user-one.jpg'),
            rating: 5,
            date: '10 Jan 2027',
            comment: 'Best cleaning service I have ever used. Rajesh is very detailed and leaves the house spotless. Will book again.',
            serviceName: 'Sofa Cleaning',
        },
        {
            id: '3',
            customerName: 'Sunita Reddy',
            customerPhoto: require('../../asset/smile.jpg'),
            rating: 4,
            date: '5 Jan 2027',
            comment: 'Good service overall. Rajesh was punctual and did a good job. A few areas could be improved but satisfied.',
            serviceName: 'Bathroom Cleaning',
        },
        {
            id: '4',
            customerName: 'Vikram Singh',
            customerPhoto: require('../../asset/demo-user-one.jpg'),
            rating: 5,
            date: '2 Jan 2027',
            comment: 'Rajesh is amazing! He cleaned my entire house and made it look brand new. Very professional and friendly.',
            serviceName: 'Deep Cleaning',
        },
        {
            id: '5',
            customerName: 'Neha Gupta',
            customerPhoto: require('../../asset/smile.jpg'),
            rating: 5,
            date: '28 Dec 2026',
            comment: 'Highly professional and skilled. Rajesh knows exactly what he is doing. My home has never looked cleaner.',
            serviceName: 'Kitchen Cleaning',
        },
    ];

    const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 3);

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

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <Image source={item.customerPhoto} style={styles.reviewCustomerPhoto} />
                <View style={styles.reviewCustomerInfo}>
                    <Text style={styles.reviewCustomerName}>{item.customerName}</Text>
                    <View style={styles.reviewRatingRow}>
                        <View style={styles.reviewStars}>{renderStars(item.rating)}</View>
                        <Text style={styles.reviewDate}>{item.date}</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.reviewServiceName}>{item.serviceName}</Text>
            <Text style={styles.reviewComment}>{item.comment}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#C9A84C" />

            {/* Header */}
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
                            tintColor: COLORS.white


                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Professional Details</Text>
                <View style={styles.headerRight} />
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
                {/* Cover Image - Full Width */}
                <View style={styles.coverContainer}>
                    <Image
                        source={professionalData.coverImage}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                    <View style={styles.coverGradient} />
                </View>

                {/* Profile Section - Fixed */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <Image source={professionalData.photo} style={styles.profileImage} />
                        
                    </View>

                    <View style={styles.profileInfo}>
                        <View style={styles.profileNameRow}>
                            <Text style={styles.profileName}>{professionalData.name}</Text>
                            {professionalData.isVerified && (
                                <View style={styles.verifiedTextBadge}>

                                    <Image
                                        source={require('../../asset/checked.png')} // Update the path as needed
                                        style={{
                                            width: 16,
                                            height: 16,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.gold


                                        }}
                                    />
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            )}
                        </View>

                        {/* Rating Row */}
                        <View style={styles.ratingRow}>
                            <View style={styles.ratingStars}>
                                {renderStars(professionalData.rating)}
                            </View>
                            <Text style={styles.ratingText}>{professionalData.rating}</Text>
                            <Text style={styles.ratingCount}>({professionalData.totalReviews} reviews)</Text>
                        </View>

                        {/* Stats Row - Fixed */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{professionalData.experience}</Text>
                                <Text style={styles.statLabel}>Experience</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{professionalData.jobsCompleted}</Text>
                                <Text style={styles.statLabel}>Jobs Done</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{professionalData.completionRate}</Text>
                                <Text style={styles.statLabel}>Completion</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Stats */}


                {/* About Section */}
                <View style={styles.aboutContainer}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText} numberOfLines={expandedAbout ? undefined : 3}>
                        {professionalData.about}
                    </Text>
                    <TouchableOpacity onPress={() => setExpandedAbout(!expandedAbout)}>
                        <Text style={styles.readMoreText}>{expandedAbout ? 'Show Less' : 'Read More'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Languages */}
                <View style={styles.languagesContainer}>
                    <Text style={styles.sectionTitle}>Languages</Text>
                    <View style={styles.languagesList}>
                        {professionalData.languages.map((lang, index) => (
                            <View key={index} style={styles.languageTag}>
                                <Text style={styles.languageText}>{lang}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Customer Reviews */}
                <View style={styles.reviewsContainer}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>Customer Reviews</Text>
                        <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
                            <Text style={styles.viewAllText}>
                                {showAllReviews ? 'Show Less' : 'View All'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {displayedReviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Image source={review.customerPhoto} style={styles.reviewCustomerPhoto} />
                                <View style={styles.reviewCustomerInfo}>
                                    <Text style={styles.reviewCustomerName}>{review.customerName}</Text>
                                    <View style={styles.reviewRatingRow}>
                                        <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
                                        <Text style={styles.reviewDate}>{review.date}</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.reviewServiceName}>{review.serviceName}</Text>
                            <Text style={styles.reviewComment}>{review.comment}</Text>
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
        backgroundColor: '#F8F6F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#C9A84C',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 0,
    },
    // Cover Image
    coverContainer: {
        marginTop: 0,
        height: 200,
        width: width,
        marginHorizontal: -16,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    // Profile Section - Fixed
    profileSection: {
        flexDirection: 'row',
        marginTop: -30,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
        elevation: 4,
        borderRadius: 12,
        
    },
    profileImageContainer: {
        position: 'relative',
        marginRight: 14,
    },
    profileImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
        paddingTop: 8,
    },
    profileNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 4,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    verifiedTextBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F8F6F0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 10,
        color: '#C9A84C',
        fontWeight: '500',
    },
    // Rating Row
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 4,
    },
    ratingStars: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 4,
    },
    ratingCount: {
        fontSize: 12,
        color: '#666666',
    },
    // Stats Row - Fixed
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statLabel: {
        fontSize: 10,
        color: '#666666',
        marginTop: 1,
    },
    statDivider: {
        width: 1,
        height: 26,
        backgroundColor: '#E8E3D8',
    },
    // Quick Stats
    quickStatsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        marginTop: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    quickStat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    quickStatText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    // About Section
    aboutContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        elevation: 4,
       
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 22,
    },
    readMoreText: {
        fontSize: 14,
        color: '#C9A84C',
        fontWeight: '500',
        marginTop: 4,
    },
    // Languages
    languagesContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    languagesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    languageTag: {
        backgroundColor: '#F8F6F0',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    languageText: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    // Reviews
    reviewsContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
         elevation: 4,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    reviewsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    viewAllText: {
        fontSize: 14,
        color: '#C9A84C',
        fontWeight: '600',
    },
    reviewCard: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    reviewCustomerPhoto: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    reviewCustomerInfo: {
        flex: 1,
    },
    reviewCustomerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    reviewRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewDate: {
        fontSize: 11,
        color: '#999999',
    },
    reviewServiceName: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 4,
    },
    reviewComment: {
        fontSize: 14,
        color: '#1A1A1A',
        lineHeight: 20,
    },
    footerSpacer: {
        height: 30,
    },
});

export default ProfessionalDetailsScreen;