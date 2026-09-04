import AsyncStorage from '@react-native-async-storage/async-storage';
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
import API from '../../util/API';
import Loader from '../../util/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

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

    // Sample user data
    const userData = {
        name: 'Arpan Saha',
        mobileNumber: '+91 98765 43210',
        email: 'rahul@email.com',
        isProfileComplete: false,
        completionPercentage: 70,
        avatar: 'https://ui-avatars.com/api/?name=Arpan+Saha&background=C9A84C&color=fff&size=100',
    };

    // Profile menu items
    const profileMenuItems = [
        {
            id: '6',
            icon: require('../../asset/monthly-subscription.png'),
            title: 'Monthly Subscription',
            subtitle: 'Enjoy hassle-free recurring home services',
            color: COLORS.green,
            onPress: () => navigation.navigate('MonthlySubscriptionScreen'),
        },
        {
            id: '1',
            icon: require('../../asset/wallet.png'),
            title: 'Wallet',
            subtitle: 'Manage your payments and transactions',
            color: COLORS.gold,
            onPress: () => navigation.navigate('WalletScreen'),
        },
        {
            id: '2',
            icon: require('../../asset/star-outline.png'),
            title: 'My Ratings',
            subtitle: 'View your ratings and reviews',
            color: COLORS.orange,
            onPress: () => navigation.navigate('MyRatingsScreen'),


        },
        {
            id: '3',
            icon: require('../../asset/location-outline.png'),
            title: 'Manage Address',
            subtitle: 'Add or edit your saved addresses',
            color: COLORS.blue,
            onPress: () => navigation.navigate('ManageAddressScreen'),


        },
        {
            id: '4',
            icon: require('../../asset/credit-card.png'),
            title: 'Manage Payment Methods',
            subtitle: 'Add or remove payment options',
            color: COLORS.purple,
            onPress: () => navigation.navigate('ManagePaymentScreen'),

        },
        {
            id: '5',
            icon: require('../../asset/information.png'),
            title: 'About HomeHelp',
            subtitle: 'Learn more about us',
            color: COLORS.green,
            onPress: () => Alert.alert('About HomeHelp', 'About section coming soon...'),
        },
    ];

    // Refer & Earn Data
    const referData = {
        title: 'Refer & Earn ₹200',
        description: 'Invite your friends and earn ₹200 for every successful booking they make',
        code: 'HOMEHELP200',
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
            Animated.timing(progressAnim, {
                toValue: userData.completionPercentage / 100,
                duration: 1000,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );



    const fetchProfile = async () => {
        try {


            const token = await AsyncStorage.getItem('token');

            console.log('TOKEN:', token ? 'Token Found' : 'Token Not Found');
            console.log('PROFILE API URL:', API.CUSTOMER_PROFILE);

            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            setIsLoading(true);

            const response = await fetch(API.CUSTOMER_PROFILE, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('HTTP STATUS:', response.status);
            console.log('HTTP OK:', response.ok);

            // IMPORTANT: Get raw response first
            const responseText = await response.text();

            console.log('RAW PROFILE RESPONSE:', responseText);

            if (!response.ok) {
                console.log('PROFILE API FAILED');

                if (response.status === 401) {
                    Alert.alert(
                        'Session Expired',
                        'Your session has expired. Please login again.'
                    );
                } else {
                    Alert.alert(
                        'Error',
                        `Profile API failed. Status: ${response.status}`
                    );
                }

                return;
            }

            // Convert raw response to JSON
            let data;

            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.log('JSON PARSE ERROR:', jsonError);
                console.log('SERVER RESPONSE:', responseText);

                Alert.alert(
                    'Error',
                    'Invalid response received from server.'
                );

                return;
            }

            console.log('PROFILE DATA:', data);
            console.log('PROFILE SUCCESS:', data?.success);
            console.log('FIRST NAME:', data?.firstName);
            console.log('LAST NAME:', data?.lastName);
            console.log('EMAIL:', data?.email);
            console.log('MOBILE:', data?.mobileNo);
            console.log('GENDER:', data?.gender);
            console.log('DOB:', data?.dob);
            console.log('IMAGE:', data?.profileImage);

            if (data?.success !== true) {
                Alert.alert(
                    'Error',
                    data?.message || 'Unable to fetch profile'
                );
                return;
            }

            // ==============================
            // PROFILE DATA
            // ==============================

            const profileFirstName = data.firstName || '';
            const profileLastName = data.lastName || '';
            const profileEmail = data.email || '';
            const profilePhone = data.mobileNo || '';
            const profileGender = data.gender || '';



            setFirstName(profileFirstName);
            setLastName(profileLastName);
            setPhone(profilePhone);


            // ==============================
            // SAVE ORIGINAL DATA
            // ==============================



            // ==============================
            // PROFILE IMAGE
            // ==============================

            if (data.profileImage) {
                setProfileImage(data.profileImage);
                setProfileImage(
                    data.profileImage.startsWith('http')
                        ? data.profileImage
                        : `https://www.geniushomehelp.com/${data.profileImage}`
                );
            } else {
                const fullName =
                    `${profileFirstName} ${profileLastName}`.trim();

                setProfileImage(
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        fullName || 'User'
                    )}&background=C9A84C&color=fff&size=200`
                );
            }

            console.log('PROFILE DATA SET SUCCESSFULLY');

        } catch (error) {
            console.log('FETCH PROFILE ERROR:', error);
            console.log('ERROR MESSAGE:', error?.message);

            Alert.alert(
                'Error',
                error?.message || 'Something went wrong while loading profile.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteProfile = () => {
        navigation.navigate('ProfileUpdateScreen');
    };

    const getCompletionStatus = (percentage) => {
        if (percentage >= 100) return { text: 'Complete', color: COLORS.success };
        if (percentage >= 50) return { text: 'In Progress', color: COLORS.warning };
        return { text: 'Incomplete', color: COLORS.red };
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return COLORS.success;
        if (percentage >= 70) return '#2ECC71';
        if (percentage >= 50) return COLORS.warning;
        if (percentage >= 30) return '#F39C12';
        return COLORS.red;
    };

    const handleMyBookings = () => {
        navigation.navigate('MyBookingsScreen');
    };

    const handleHelpSupport = () => {
        Alert.alert('Help & Support', 'Support section coming soon...');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout', style: 'destructive', onPress: () => {
                        Alert.alert('Logged Out', 'You have been logged out successfully');
                        navigation.replace('Login');
                    }
                },
            ]
        );
    };

    const handleReferNow = () => {
        Alert.alert('Refer & Earn', 'Referral link copied to clipboard!');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#C9A84C" />

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
                            tintColor: COLORS.white


                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            {isLoading && (
                <View style={styles.loaderOverlay}>
                    <Loader />
                </View>
            )}

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
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image source={{ uri: profileImage }} style={styles.profileAvatar} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}> {firstName} {lastName}</Text>
                        <Text style={styles.profileMobile}>{phone}</Text>
                    </View>
                </View>

                {/* Profile Status */}
                <View style={styles.profileStatusContainer}>
                    <View style={styles.profileStatusRow}>
                        <View style={styles.profileStatusIcon}>
                            {userData.isProfileComplete ? (

                                <Image
                                    source={require('../../asset/checked.png')} // Update the path as needed
                                    style={{
                                        width: 22,
                                        height: 22,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.success


                                    }}
                                />
                            ) : (

                                <Image
                                    source={require('../../asset/alert.png')} // Update the path as needed
                                    style={{
                                        width: 22,
                                        height: 22,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.warning


                                    }}
                                />
                            )}
                        </View>
                        <View style={styles.profileStatusInfo}>
                            <Text style={styles.profileStatusTitle}>
                                {userData.isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                            </Text>
                            <Text style={styles.profileStatusPercentage}>
                                {userData.completionPercentage}% Complete
                            </Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        backgroundColor: getProgressColor(userData.completionPercentage),
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressLabel}>
                            {userData.isProfileComplete ? '✅ Profile Complete' : `⚠️ ${100 - userData.completionPercentage}% remaining`}
                        </Text>
                    </View>
                    {!userData.isProfileComplete && (
                        <TouchableOpacity style={styles.completeProfileButton} onPress={handleCompleteProfile}>
                            <Text style={styles.completeProfileText}>Complete Profile</Text>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* My Bookings & Help & Support */}
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity style={styles.quickActionCard} onPress={handleMyBookings}>
                        <View style={[styles.quickActionIcon, { backgroundColor: COLORS.gold + '15' }]}>

                            <Image
                                source={require('../../asset/calendar-outline.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold


                                }}
                            />
                        </View>
                        <Text style={styles.quickActionTitle}>My Bookings</Text>
                        <Text style={styles.quickActionSubtitle}>View all your bookings</Text>


                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionCard} onPress={handleHelpSupport}>
                        <View style={[styles.quickActionIcon, { backgroundColor: COLORS.blue + '15' }]}>

                            <Image
                                source={require('../../asset/support.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.blue


                                }}
                            />
                        </View>
                        <Text style={styles.quickActionTitle}>Help & Support</Text>
                        <Text style={styles.quickActionSubtitle}>Get help and support</Text>

                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <Text style={styles.menuSectionTitle}>Account Settings</Text>

                    {profileMenuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                                <Image
                                    source={item.icon}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        resizeMode: 'contain',
                                        tintColor: item.color, // Remove if your PNGs are already colored
                                    }}
                                />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight


                                }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Refer & Earn Section */}
                <View style={styles.referContainer}>
                    <Text style={styles.menuSectionTitle}>Refer & Earn</Text>
                    <View style={styles.referCard}>
                        <View style={styles.referHeader}>
                            <View style={styles.referIconContainer}>

                                <Image
                                    source={require('../../asset/gift.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white


                                    }}
                                />
                            </View>
                            <Text style={styles.referTitle}>{referData.title}</Text>
                        </View>

                        <Text style={styles.referDescription}>{referData.description}</Text>

                        <View style={styles.referCodeContainer}>
                            <Text style={styles.referCodeLabel}>Your Referral Code</Text>
                            <View style={styles.referCode}>
                                <Text style={styles.referCodeText}>{referData.code}</Text>
                                <TouchableOpacity style={styles.referCopyButton}>

                                    <Image
                                        source={require('../../asset/copy.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.white


                                        }}
                                    />
                                    <Text style={styles.referCopyText}>Copy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.referButton} onPress={handleReferNow}>
                            <Text style={styles.referButtonText}>Invite Friends Now</Text>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <View style={[styles.logoutIcon, { backgroundColor: COLORS.red + '15' }]}>

                        <Image
                            source={require('../../asset/log-out.png')} // Update the path as needed
                            style={{
                                width: 22,
                                height: 22,
                                resizeMode: 'contain',
                                tintColor: COLORS.red


                            }}
                        />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: COLORS.red
                        }}
                    />
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.versionText}>HomeHelp v2.4.0</Text>

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
        backgroundColor: '#C9A84C',
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
        color: '#FFFFFF',
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Profile Card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
    profileAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    profileMobile: {
        fontSize: 14,
        color: '#666666',
        marginTop: 2,
    },
    // Profile Status
    profileStatusContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#F8F6F0',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    profileStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    profileStatusIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileStatusTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    completeProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#C9A84C',
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 12,
    },
    completeProfileText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Quick Actions
    quickActionsContainer: {
        marginTop: 16,
        flexDirection: 'row',
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    quickActionSubtitle: {
        fontSize: 11,
        color: '#666666',
        marginTop: 2,
    },
    quickActionArrow: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -10,
    },
    // Menu Items
    menuContainer: {
        marginTop: 16,
    },
    menuSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#666666',
        marginTop: 1,
    },
    // Refer & Earn Section
    referContainer: {
        marginTop: 16,
    },
    referCard: {
        backgroundColor: '#C9A84C',
        borderRadius: 16,
        padding: 20,
        marginTop: 4,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    referHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    referIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    referTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    referDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 18,
        marginBottom: 16,
    },
    referCodeContainer: {
        marginBottom: 16,
    },
    referCodeLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 6,
    },
    referCode: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    referCodeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1.5,
    },
    referCopyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    referCopyText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    referButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    referButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Logout Button
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 4,
        marginTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    logoutIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    logoutText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#E17055',
    },
    // Version
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#999999',
        marginTop: 24,
        marginBottom: 8,
    },
    footerSpacer: {
        height: 20,
    },
    profileStatusInfo: {
        flex: 1,
    },
    profileStatusPercentage: {
        fontSize: 12,
        color: '#666666',
        marginTop: 1,
    },

    progressContainer: {
        marginTop: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E8E3D8',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressLabel: {
        fontSize: 11,
        color: '#666666',
        marginTop: 4,
        textAlign: 'right',
    },
    loaderOverlay: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: 'rgba(255,255,255,0.7)',
        zIndex: 999,
    },
});

export default ProfileScreen;