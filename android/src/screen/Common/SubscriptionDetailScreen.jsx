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
    Switch,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const SubscriptionDetailScreen = ({ navigation }) => {
    // States
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isAutoRenew, setIsAutoRenew] = useState(true);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);

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
    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };
      const serviceData = {
        id: '1',
        name: 'Home Cleaning',
        tagline: '✨ A spotless home, just a tap away',
        coverImage: require('../../asset/heroic.png'),
        rating: 4.9,
        totalReviews: 1240,
        bookingCount: 15420,
        price: '₹499',
        whatIsCovered: [
            'Living Room Deep Cleaning',
            'Kitchen Degreasing',
            'Bathroom Sanitization',
            'Bedroom Cleaning',
            'Floor Mopping',
            'Dusting of all surfaces',
            'Cobweb Removal',
            'Waste Disposal',
        ],
        ourProcess: [
            {
                step: '1',
                title: 'Plan the Work',
                description: 'Our expert team plans the cleaning process based on your requirements',
                image: require('../../asset/planned.png'),
            },
            {
                step: '2',
                title: 'Start Cleaning',
                description: 'Professional cleaning with eco-friendly products and advanced equipment',
                image: require('../../asset/start.png'),
            },
            {
                step: '3',
                title: 'Final Checks',
                description: 'Thorough quality check to ensure 100% satisfaction',
               image: require('../../asset/final-check.png'),
            },
        ],
        images: [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
        ],
        childServices: [
            {
                id: 'c1',
                name: 'Living Room Deep Cleaning',
                price: '₹299',
                coverImage: require('../../asset/heroic.png'),
                description: 'Professional deep cleaning of your living room including sofas, carpets, and all surfaces.',
                whatIsCovered: ['Sofa Cleaning', 'Carpet Vacuuming', 'Surface Dusting', 'Floor Mopping'],
                duration: '2 hours',
            },
            {
                id: 'c2',
                name: 'Kitchen Deep Cleaning',
                price: '₹349',
                coverImage: require('../../asset/kitchen-clean.png'),
                description: 'Complete kitchen cleaning including cabinets, countertops, and appliances.',
                whatIsCovered: ['Cabinet Cleaning', 'Countertop Cleaning', 'Appliance Cleaning', 'Floor Mopping'],
                duration: '1.5 hours',
            },
            {
                id: 'c3',
                name: 'Bathroom Deep Cleaning',
                price: '₹249',
                coverImage: require('../../asset/bathroom-clean.png'),
                description: 'Thorough bathroom cleaning and sanitization.',
                whatIsCovered: ['Tile Cleaning', 'Fixture Sanitization', 'Mirror Cleaning', 'Floor Mopping'],
                duration: '1 hour',
            },
        ],
        faqs: [
            {
                id: '1',
                question: 'What is included in deep cleaning?',
                answer: 'Deep cleaning includes thorough cleaning of all surfaces, dusting, mopping, kitchen degreasing, bathroom sanitization, and waste disposal.',
            },
            {
                id: '2',
                question: 'How long does the service take?',
                answer: 'The service typically takes 3-4 hours depending on the size of your home and the services selected.',
            },
            {
                id: '3',
                question: 'Do I need to be present during the service?',
                answer: 'Yes, we recommend being present to provide access and ensure you are satisfied with the service.',
            },
            {
                id: '4',
                question: 'What products do you use?',
                answer: 'We use eco-friendly and safe cleaning products that are effective and gentle on surfaces.',
            },
        ],
        reviews: [
            {
                id: '1',
                customer: 'Priya Sharma',
                rating: 5,
                date: '15 Jan 2027',
                comment: 'Excellent service! My home has never been cleaner. Very professional team.',
            },
            {
                id: '2',
                customer: 'Amit Patel',
                rating: 5,
                date: '10 Jan 2027',
                comment: 'Great job! They were punctual and thorough. Highly recommend this service.',
            },
            {
                id: '3',
                customer: 'Sunita Reddy',
                rating: 4,
                date: '5 Jan 2027',
                comment: 'Good service overall. A few minor issues but they fixed it quickly.',
            },
        ],
    };

    // Subscription Data
    const subscriptionData = {
        id: '1',
        name: 'Home Cleaning',
        coverImage: require('../../asset/housemaid.png'),
        rating: 4.9,
        totalReviews: 1240,
        bookings: 15420,
        maxHoursPerDay: 4,
        monthlyPrice: '₹9,980',
        description: 'Get your home professionally cleaned with our premium subscription service.',
        whatIsIncluded: [
            'Deep cleaning of all rooms',
            'Kitchen degreasing',
            'Bathroom sanitization',
            'Floor mopping',
            'Dusting of all surfaces',
            'Cobweb removal',
            'Waste disposal',
            'Flexible scheduling',
        ],
        benefits: [
            { icon: require('../../asset/rupee.png'), title: 'Best Value', description: 'Save up to 30% compared to one-time bookings' },
            { icon: require('../../asset/time-outline.png'), title: 'Flexible Hours', description: 'Use your hours anytime during the month' },
            { icon: require('../../asset/person-outline.png'), title: 'Trusted Professionals', description: 'Verified and experienced experts' },
            { icon: require('../../asset/shiled-outline.png'), title: 'Priority Support', description: '24/7 dedicated customer support' },
        ],
        ourProcess: [
            { step: '1', title: 'Subscribe', description: 'Choose your plan and subscribe' },
            { step: '2', title: 'Schedule', description: 'Book your preferred date and time' },
            { step: '3', title: 'Service Delivery', description: 'Professional arrives and delivers service' },
            { step: '4', title: 'Enjoy', description: 'Enjoy a clean and fresh home' },
        ],
        faqs: [
            {
                id: '1',
                question: 'How does the subscription work?',
                answer: 'You pay a monthly fee and get a fixed number of hours of service. You can use these hours anytime during the month.',
            },
            {
                id: '2',
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription anytime. No cancellation fees apply.',
            },
            {
                id: '3',
                question: 'What if I don\'t use all my hours?',
                answer: 'Unused hours do not roll over to the next month. We recommend planning your services accordingly.',
            },
            {
                id: '4',
                question: 'Is there a contract?',
                answer: 'No, there is no long-term contract. You can subscribe on a month-to-month basis.',
            },
        ],
        reviews: [
            {
                id: '1',
                customer: 'Priya Sharma',
                rating: 5,
                date: '15 Jan 2027',
                comment: 'Excellent service! My home has never been cleaner. Very professional team.',
            },
            {
                id: '2',
                customer: 'Amit Patel',
                rating: 5,
                date: '10 Jan 2027',
                comment: 'Great job! They were punctual and thorough. Highly recommend this service.',
            },
            {
                id: '3',
                customer: 'Sunita Reddy',
                rating: 4,
                date: '5 Jan 2027',
                comment: 'Good service overall. A few minor issues but they fixed it quickly.',
            },
        ],
    };

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

    const handleSubscribe = () => {
        navigation.replace('SubscriptionSlotScreen', { subscriptionData });
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


    const renderFaqItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Image
                    source={
                        expandedFaq === item.id
                            ? require('../../asset/minus.png')
                            : require('../../asset/plus.png')
                    }
                    style={{
                        width: 14,
                        height: 14,
                        resizeMode: 'contain',
                        tintColor: COLORS.textLight, // Remove if your PNGs are already colored
                    }}
                />
            </View>
            {expandedFaq === item.id && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
            )}
        </TouchableOpacity>
    );

    const renderReview = (item) => (
        <View key={item.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewCustomer}>
                    <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{item.customer[0]}</Text>
                    </View>
                    <View>
                        <Text style={styles.reviewCustomerName}>{item.customer}</Text>
                        <View style={styles.reviewStarsRow}>
                            {renderStars(item.rating)}
                            <Text style={styles.reviewDate}>{item.date}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <Text style={styles.reviewComment}>"{item.comment}"</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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
                {/* Cover Image with Back Button */}
                <View style={styles.coverContainer}>
                    <Image source={ subscriptionData.coverImage } style={styles.coverImage} />
                    <View style={styles.coverGradient} />

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
                </View>

                {/* Service Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.serviceName}>{subscriptionData.name}</Text>
                    <View style={styles.ratingRow}>
                        <View style={styles.ratingStars}>{renderStars(subscriptionData.rating)}</View>
                        <Text style={styles.ratingText}>{subscriptionData.rating}</Text>
                        <Text style={styles.ratingCount}>({subscriptionData.totalReviews} reviews)</Text>
                        <Text style={styles.bookingCount}>• {subscriptionData.bookings} bookings</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.servicePrice}>{subscriptionData.monthlyPrice}</Text>
                        <Text style={styles.priceSubtext}>/ month</Text>
                    </View>
                    <Text style={styles.serviceDescription}>{subscriptionData.description}</Text>
                </View>

                {/* Auto Renew Switch */}
                <View style={styles.switchContainer}>
                    <View style={styles.switchLeft}>

                        <Image
                            source={require('../../asset/refresh.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.switchLabel}>Auto Renew</Text>
                    </View>
                    <Switch
                        value={isAutoRenew}
                        onValueChange={setIsAutoRenew}
                        trackColor={{ false: '#D4D4D4', true: COLORS.gold }}
                        thumbColor={isAutoRenew ? '#FFFFFF' : '#FFFFFF'}
                    />
                </View>

                {/* Subscribe Button */}
                <TouchableOpacity
                    style={[styles.subscribeButton, isSubscribed && styles.subscribeButtonActive]}
                    onPress={handleSubscribe}
                >
                    <Text style={styles.subscribeButtonText}>
                        {isSubscribed ? 'Subscribed ✓' : 'Subscribe Now'}
                    </Text>
                    {!isSubscribed && <Image
                        source={require('../../asset/right-arrow.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.white
                        }}
                    />}
                </TouchableOpacity>

                {/* What's Included */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>✅ What's Included</Text>
                    <View style={styles.includedGrid}>
                        {subscriptionData.whatIsIncluded.map((item, index) => (
                            <View key={index} style={styles.includedItem}>

                                <Image
                                    source={require('../../asset/checked.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.purple


                                    }}
                                />
                                <Text style={styles.includedText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Subscription Benefits */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>✨ Subscription Benefits</Text>
                    {subscriptionData.benefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <View style={[styles.benefitIcon, { backgroundColor: COLORS.gold + '15' }]}>
                                <Image
                                    source={benefit.icon}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold
                                    }}
                                />
                            </View>
                            <View style={styles.benefitContent}>
                                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                                <Text style={styles.benefitDesc}>{benefit.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Our Process */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔄 Our Process</Text>
                        <Text style={styles.sectionSubtitle}>How we deliver excellence</Text>
                    </View>
                    <View style={styles.processContainer}>
                        {serviceData.ourProcess.map((item, index) => (
                            <View key={index} style={styles.processStepWrapper}>
                                <View style={styles.processCard}>
                                    <View style={styles.processImageContainer}>
                                        <Image source={item.image} style={styles.processImage} />
                                        <View style={styles.processStepBadge}>
                                            <Text style={styles.processStepBadgeText}>{item.step}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.processContent}>
                                        <Text style={styles.processTitle}>{item.title}</Text>
                                        <Text style={styles.processDescription}>{item.description}</Text>
                                    </View>
                                </View>

                            </View>
                        ))}
                    </View>
                </View>

                {/* Customer Reviews */}
                <View style={styles.sectionContainer}>
                    <View style={styles.reviewsHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>⭐ Customer Reviews</Text>
                            <Text style={styles.sectionSubtitle}>What our customers say</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
                            <Text style={styles.viewAllText}>
                                {showAllReviews ? 'Show Less' : 'View All'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {(showAllReviews ? subscriptionData.reviews : subscriptionData.reviews.slice(0, 2)).map(renderReview)}
                </View>

                {/* FAQs */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>
                    {subscriptionData.faqs.map(renderFaqItem)}
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
    content: {
        flex: 1,
    },
    // Cover Image
    coverContainer: {
        position: 'relative',
        height: 220,
        width: '100%',
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
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.3)',
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
    // Info Container
    infoContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    serviceName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
    },
    ratingStars: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    ratingCount: {
        fontSize: 13,
        color: '#666666',
    },
    bookingCount: {
        fontSize: 13,
        color: '#666666',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 6,
    },
    servicePrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#76577F',
    },
    priceSubtext: {
        fontSize: 13,
        color: '#666666',
        marginLeft: 4,
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666666',
        marginTop: 6,
        lineHeight: 20,
    },
    // Auto Renew Switch
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginTop: 8,
    },
    switchLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    // Subscribe Button
    subscribeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#76577F',
        paddingVertical: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 14,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    subscribeButtonActive: {
        backgroundColor: '#2ECC71',
    },
    subscribeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Section
    sectionContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#999999',
        marginTop: 2,
    },
    // What's Included
    includedGrid: {
        gap: 6,
    },
    includedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    includedText: {
        fontSize: 14,
        color: '#1A1A1A',
    },
    // Benefits
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    benefitIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    benefitDesc: {
        fontSize: 12,
        color: '#666666',
        marginTop: 1,
    },
    // Process
    processItem: {
        flexDirection: 'row',
        marginBottom: 14,
        gap: 14,
    },
    processStep: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#76577F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processStepText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    processContent: {
        flex: 1,
    },
    processTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    processDescription: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    // Reviews
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    viewAllText: {
        fontSize: 14,
        color: '#76577F',
        fontWeight: '600',
    },
    reviewItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    reviewCustomer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#76577F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    reviewCustomerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    reviewStarsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    reviewDate: {
        fontSize: 11,
        color: '#999999',
    },
    reviewComment: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    // FAQs
    faqItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
        marginRight: 10,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#666666',
        marginTop: 8,
        lineHeight: 20,
    },
    footerSpacer: {
        height: 20,
    },
    processContainer: {
        marginTop: 4,
    },
    processStepWrapper: {
        alignItems: 'center',
    },
    processCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 12,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        width: '100%',
    },
    processImageContainer: {
        position: 'relative',
        marginRight: 14,
    },
    processImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    processStepBadge: {
        position: 'absolute',
        top: -2,
        right: -5,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#76577F',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    processStepBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    processContent: {
        flex: 1,
        justifyContent: 'center',
    },
    processTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    processDescription: {
        fontSize: 12,
        color: '#666666',
        lineHeight: 16,
    },
    processArrow: {
        alignItems: 'center',
        paddingVertical: 4,
    },
});

export default SubscriptionDetailScreen;