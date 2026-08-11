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

const MonthlySubscriptionScreen = ({ navigation }) => {
    // States
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [subscribedPlans, setSubscribedPlans] = useState(['1']); // ID of subscribed plans

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

    // Subscription Plans Data
    const subscriptionPlans = [
        {
            id: '1',
            name: 'Home Cleaning',
            icon: require('../../asset/home.png'),
            description: 'Professional home cleaning service',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            maxHoursPerDay: 4,
            monthlyPrice: '₹9,980',
            features: [
                'Deep cleaning of all rooms',
                'Kitchen degreasing',
                'Bathroom sanitization',
                'Floor mopping',
                'Dusting of all surfaces',
                'Flexible scheduling',
            ],
            popular: true,
            status: 'active', // 'active', 'inactive'
        },
        {
            id: '2',
            name: 'House Maid',
            icon: require('../../asset/person-outline.png'),
            description: 'Daily household help',
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
            maxHoursPerDay: 6,
            monthlyPrice: '₹11,970',
            features: [
                'Daily cleaning routine',
                'Dish washing',
                'Laundry & Ironing',
                'Organizing & tidying',
                'Grocery assistance',
                'Regular schedule',
            ],
            popular: false,
            status: 'inactive',
        },
        {
            id: '3',
            name: 'Babysitting & Childcare',
            icon: require('../../asset/people.png'),
            description: 'Professional childcare services',
            image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=300&fit=crop',
            maxHoursPerDay: 5,
            monthlyPrice: '₹14,975',
            features: [
                'Trained childcare professionals',
                'Educational activities',
                'Meal preparation',
                'Homework assistance',
                'Safety first approach',
                'Flexible timing',
            ],
            popular: false,
            status: 'inactive',
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

    const handleBookNow = (plan) => {
        if (isSubscribed(plan.id)) {
            Alert.alert(
                'Already Subscribed',
                `You are already subscribed to ${plan.name}`,
                [{ text: 'OK' }]
            );
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Subscription Confirmed!',
                `You have subscribed to ${plan.name}\nMonthly Price: ${plan.monthlyPrice}\nMax Hours: ${plan.maxHoursPerDay} hrs/day`,
                [
                    {
                        text: 'OK', onPress: () => {
                            setSubscribedPlans([...subscribedPlans, plan.id]);
                        }
                    }
                ]
            );
        }, 1500);
    };

    const isSubscribed = (planId) => {
        return subscribedPlans.includes(planId);
    };

    const renderPlanCard = ({ item }) => {
        const isSelected = selectedPlan === item.id;
        const subscribed = isSubscribed(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    item.popular && styles.planCardPopular,
                    subscribed && styles.planCardSubscribed,
                ]}
                onPress={() => {
                    if (subscribed) {
                        navigation.navigate('SubscribedServiceScreen', {
                            plan: item,
                        });
                    } else {
                        navigation.replace('SubscriptionDetailScreen', {
                            plan: item,
                        });
                    }
                }}
                activeOpacity={0.9}
            >
                {item.popular && !subscribed && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Popular</Text>
                    </View>
                )}

                {subscribed && (
                    <View style={styles.subscribedBadge}>

                        <Image
                            source={require('../../asset/checked.png')} // Update the path as needed
                            style={{
                                width: 14,
                                height: 14,
                                resizeMode: 'contain',
                                tintColor: COLORS.white


                            }}
                        />

                        <Text style={styles.subscribedBadgeText}>Subscribed</Text>
                    </View>
                )}

                <Image source={{ uri: item.image }} style={styles.planImage} />

                <View style={styles.planContent}>
                    <View style={styles.planHeader}>
                        <View style={styles.planIconContainer}>
                            <Image
                                source={item.icon}
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: subscribed ? COLORS.success : COLORS.gold, // Remove if your PNGs are already colored
                                }}
                            />
                        </View>
                        <View>
                            <Text style={styles.planName}>{item.name}</Text>
                            <Text style={styles.planDescription}>{item.description}</Text>
                        </View>
                    </View>

                    <View style={styles.planDetails}>
                        <View style={styles.planDetailItem}>

                            <Image
                                source={require('../../asset/time-outline.png')} // Update the path as needed
                                style={{
                                    width: 16,
                                    height: 16,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight


                                }}
                            />
                            <Text style={styles.planDetailText}>Max {item.maxHoursPerDay} hrs/day</Text>
                        </View>
                    </View>

                    <View style={styles.planFeatures}>
                        {item.features.slice(0, 4).map((feature, index) => (
                            <View key={index} style={styles.planFeatureItem}>
                                <Image
                                    source={require('../../asset/checked.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: subscribed ? COLORS.success : COLORS.success
                                    }}
                                />
                                <Text style={styles.planFeatureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.planFooter}>
                        <View>
                            <Text style={styles.planPrice}>{item.monthlyPrice}</Text>
                            <Text style={styles.planDuration}>Monthly</Text>
                        </View>
                        <View
                            style={[
                                styles.bookButton,
                               styles.bookButtonActive,
                                subscribed && styles.bookButtonSubscribed,
                            ]}
                            onPress={() => handleBookNow(item)}
                            disabled={subscribed}
                        >
                            <Text style={[
                                styles.bookButtonText,
                                subscribed && styles.bookButtonTextSubscribed,
                            ]}>
                                {subscribed ? 'Subscribed' : 'Book Now'}
                            </Text>
                            {!subscribed && <Image
                                source={require('../../asset/right-arrow.png')} // Update the path as needed
                                style={{
                                    width: 16,
                                    height: 16,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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
                <Text style={styles.headerTitle}>My Subscriptions</Text>
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
                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    <Text style={styles.heroTitle}>💎 Your Monthly Plans</Text>
                    <Text style={styles.heroSubtitle}>Manage your subscriptions</Text>
                </View>

                {/* Plans List */}
                <FlatList
                    data={subscriptionPlans}
                    renderItem={renderPlanCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.plansList}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />

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
        paddingTop: 16,
    },
    // Hero Section
    heroContainer: {
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    // Plans
    plansList: {
        paddingVertical: 8,
    },
    separator: {
        height: 12,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#F0EDE8',
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#C9A84C',
    },
    planCardPopular: {
        borderColor: '#C9A84C',
    },
    planCardSubscribed: {
        borderColor: '#2ECC71',
        backgroundColor: '#F8FDF9',
    },
    popularBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#C9A84C',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    popularBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subscribedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#2ECC71',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    subscribedBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    planImage: {
        width: '100%',
        height: 120,
    },
    planContent: {
        padding: 14,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    planIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F8F6F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    planName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    planDescription: {
        fontSize: 12,
        color: '#666666',
    },
    planDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 10,
    },
    planDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    planDetailText: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    planFeatures: {
        marginBottom: 12,
    },
    planFeatureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3,
    },
    planFeatureText: {
        fontSize: 12,
        color: '#666666',
    },
    planFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        paddingTop: 12,
    },
    planPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#C9A84C',
    },
    planDuration: {
        fontSize: 11,
        color: '#999999',
        marginTop: 2,
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E8E3D8',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    bookButtonActive: {
        backgroundColor: '#C9A84C',
    },
    bookButtonSubscribed: {
        backgroundColor: '#2ECC71',
    },
    bookButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bookButtonTextSubscribed: {
        color: '#FFFFFF',
    },
    footerSpacer: {
        height: 20,
    },
});

export default MonthlySubscriptionScreen;