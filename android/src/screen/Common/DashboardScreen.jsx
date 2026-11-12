import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Animated,
    Dimensions,
    Image,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
    RefreshControl,
} from 'react-native';
import Video from 'react-native-video';
import API from '../../util/API';
import Loader from '../../util/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CachedImage from '../../util/CachedImage';
import ServiceOrbitLoader from '../../util/ServiceOrbitLoader';

import {
    initializeCartNotifications,
    scheduleCartReminder,
    cancelCartReminder,
} from '../../util/CartNotification';



const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    // States
    const [searchText, setSearchText] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showAllServices, setShowAllServices] = useState(false);
    const [isAllServicesModalVisible, setIsAllServicesModalVisible] = useState(false);
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [currentThoughtfulIndex, setCurrentThoughtfulIndex] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [imagesLoading, setImagesLoading] = useState(0);
    const [profileImage, setProfileImage] = useState(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    const [allServices, setAllServices] = useState([]);
    const [offers, setOffers] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [showCart, setShowCart] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const sidebarAnim = useRef(new Animated.Value(-width)).current;
    const searchBarAnim = useRef(new Animated.Value(0)).current;
    const searchHintAnim = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;


    const tabIcons = [
        require('../../asset/person-outline.png'),
        require('../../asset/calendar-outline.png'),
        require('../../asset/heart.png'),
        // require('../../asset/monthly-subscription.png'),
        require('../../asset/person-outline.png'),
        require('../../asset/gift.png'),
        require('../../asset/information.png'),
    ];

    const COLORS = {
        gold: '#D8B4FE',                            // was '#d6bceb'  → primary
        goldLight: '#A855F7',                       // was '#76577F'  → secondary
        goldDark: '#A855F7',                        // was '#C4B0D3'  → secondary
        goldFade: 'rgba(216, 180, 254, 0.1)',       // was 'rgba(179, 154, 199, 0.1)'
        goldFadeStrong: 'rgba(216, 180, 254, 0.2)', // was 'rgba(179, 154, 199, 0.2)'
        white: '#FFFFFF',                           // unchanged
        dark: '#2D1B4E',                            // was '#1A1A1A'
        textLight: '#6B5B7A',                       // was '#666666'
        lightBg: '#FAF5FF',                         // was '#F8F6F0'
        border: '#EDE0FF',                          // was '#E8E3D8'
        success: '#2ECC71',                         // unchanged (functional)
        purple: '#A855F7',                          // was '#6C5CE7'  → secondary
        pink: '#D8B4FE',                            // was '#FD79A8'  → primary
        blue: '#A855F7',                            // was '#0984E3'  → secondary
        green: '#00B894',                           // unchanged
        red: '#E17055',                             // unchanged (functional)
        orange: '#FDCB6E',                          // unchanged (functional)
        teal: '#00CEC9',                            // unchanged
        indigo: '#A855F7',                          // was '#6C5CE7'  → secondary
        coral: '#D8B4FE',                           // was '#FF6B6B'  → primary
        mint: '#00B894',                            // unchanged
        lavender: '#D8B4FE',                        // was '#A29BFE'  → primary
        peach: '#A855F7',                           // was '#FD79A8'  → secondary
    };
    const offerListRef = useRef(null);

    // Sample user data




    // Popular Services (Only 3)
    const popularServices = [
        {
            id: '1',
            name: 'Home Cleaning',
            icon: require('../../asset/home.png'),
            color: COLORS.gold,
            bg: COLORS.goldFade,
            rating: 4.9,
            reviews: 1240,
            price: '₹499',
            image: require('../../asset/HomeHelp-icon.png'),
        },
        {
            id: '2',
            name: 'Bathroom Cleaning',
            icon: require('../../asset/shower.png'),
            color: COLORS.blue,
            bg: COLORS.blue + '15',
            rating: 4.8,
            reviews: 890,
            price: '₹399',
            image: require('../../asset/bathrromclean-icon.png'),
        },
        {
            id: '3',
            name: 'Kitchen & Utensil cleaning',
            icon: require('../../asset/sofa.png'),
            color: COLORS.purple,
            bg: COLORS.purple + '15',
            rating: 4.7,
            reviews: 650,
            price: '₹599',
            image: require('../../asset/sofaclean-icon.png'),
        },
    ];

    const onTheSpotServices = [

        {
            id: '1',
            name: 'Sofa Cleaning Express',
            description: 'Same-day sofa cleaning service',
            image: require('../../asset/sofa-clean.png'),
            price: '₹499',
            rating: 4.6,
        },
        {
            id: '2',
            name: 'Carpet Cleaning Pro',
            description: 'Professional carpet cleaning in 4 hours',
            image: require('../../asset/carpet-clean.png'),
            price: '₹599',
            rating: 4.8,
        },
    ];

    // Rebook Services
    const rebookServices = [
        {
            id: '1',
            name: 'Bathroom Cleaning',
            provider: 'HomeHelp',
            image: require('../../asset/bathroomclean.png'),
            date: 'Last booked: 15 Dec 2026',
            rating: 4.9,
            price: '₹499',
        },

        {
            id: '3',
            name: 'Cooking',
            provider: 'HomeHelp',
            image: require('../../asset/cooking.png'),
            date: 'Last booked: 5 Dec 2026',
            rating: 4.7,
            price: '₹599',
        },
    ];



    const thoughtfulCreations = [
        {
            id: '1',
            title: 'Professional Cleaning',
            description: 'Experience the best cleaning services',
            video: require('../../asset/videos/pr-2.mp4'),
            cta: 'Book Now',
        },
        {
            id: '2',
            title: 'Sofa Cleaning',
            description: 'Professional sofa cleaning service',
            video: require('../../asset/videos/demo1.mp4'),
            cta: 'Explore',
        },
    ];

    // Quick Actions - 3 Options
    const quickActions = [
        {
            id: '1',
            name: 'My Bookings',
            icon: require('../../asset/calendar-outline.png'),
            color: COLORS.coral,
            bg: COLORS.goldFade,
        },
        {
            id: '2',
            name: 'My Favorites Services',
            icon: require('../../asset/heart.png'),
            color: COLORS.pink,
            bg: COLORS.pink + '15',
        },
        {
            id: '3',
            name: 'My Account',
            icon: require('../../asset/person-outline.png'),
            color: COLORS.purple,
            bg: COLORS.purple + '15',
        },
    ];

    // Why choose HomeHelp
    const whyChoose = [
        {
            id: '1',
            text: 'Verified & Trusted Professionals',
            icon: require('../../asset/shield.png'),
            color: COLORS.purple,
        },
        {
            id: '2',
            text: '100% Satisfaction Guarantee',
            icon: require('../../asset/rating.png'),
            color: COLORS.gold,
        },
        {
            id: '3',
            text: 'Transparent Pricing',
            icon: require('../../asset/rupee.png'),
            color: COLORS.green,
        },
        {
            id: '4',
            text: 'Same-Day Service Available',
            icon: require('../../asset/time-outline.png'),
            color: COLORS.blue,
        },
    ];

    // Search hints
    const searchHints = [
        'Search for Home Cleaning Services...',
        'Search for Bathroom Cleaning...',
        'Search for Kitchen & Utensil cleaning...',
        'Search for Washing & Ironing cloths...',
    ];

    // FlatList refs
    const flatListRef = useRef(null);
    const offersFlatListRef = useRef(null);
    const thoughtfulFlatListRef = useRef(null);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 8000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 6000,
                useNativeDriver: true,
            }),
        ]).start();





        const thoughtfulInterval = setInterval(() => {
            if (thoughtfulCreations.length > 0) {
                setCurrentThoughtfulIndex((prev) => (prev + 1) % thoughtfulCreations.length);
            }
        }, 10000);

        Animated.loop(
            Animated.sequence([
                Animated.timing(searchHintAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(searchHintAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.delay(200),
            ])
        ).start();

        return () => {
            // clearInterval(interval);
            clearInterval(thoughtfulInterval);
        };
    }, []);

    useEffect(() => {
        if (isSearchFocused) {
            Animated.spring(searchBarAnim, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(searchBarAnim, {
                toValue: 0,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    }, [isSearchFocused]);

    useEffect(() => {
        if (offersFlatListRef.current && offers.length > 0) {
            offersFlatListRef.current.scrollToIndex({
                index: currentOfferIndex,
                animated: true,
            });
        }
    }, [currentOfferIndex]);

    useEffect(() => {

        if (thoughtfulFlatListRef.current && thoughtfulCreations.length > 0) {
            thoughtfulFlatListRef.current.scrollToIndex({
                index: currentThoughtfulIndex,
                animated: true,
            });
        }

    }, [currentThoughtfulIndex]);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
            fetchServices();
        }, [])
    );


    useEffect(() => {
        initializeCartNotifications();
    }, []);




    useEffect(() => {
        if (offers.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentOfferIndex((prevIndex) => {
                const nextIndex =
                    prevIndex + 1 >= offers.length
                        ? 0
                        : prevIndex + 1;

                offerListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });

                return nextIndex;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [offers]);


    useFocusEffect(
        useCallback(() => {
            loadCart();
        }, [])
    );


    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('selectedServices');

            if (savedCart) {
                const cart = JSON.parse(savedCart);

                // Remove duplicate services by service ID
                const uniqueCart = cart.filter(
                    (item, index, self) =>
                        index === self.findIndex(
                            service => service.id === item.id
                        )
                );

                setSelectedServices(uniqueCart);

                // Save cleaned cart back to local storage
                await AsyncStorage.setItem(
                    'selectedServices',
                    JSON.stringify(uniqueCart)
                );
            }
        } catch (error) {
            console.log('Load Cart Error:', error);
        }
    };

    const openCart = () => {
        setShowCart(true);

    };
    const closeCart = () => {
        setShowCart(false);
    };

    const removeFromCart = async (serviceName) => {
        const updatedCart = selectedServices.filter(
            item =>
                item.name?.trim().toLowerCase() !==
                serviceName?.trim().toLowerCase()
        );

        setSelectedServices(updatedCart);

        try {
            await AsyncStorage.setItem(
                'selectedServices',
                JSON.stringify(updatedCart)
            );
        } catch (error) {
            console.log('Remove Cart Error:', error);
        }

        if (updatedCart.length === 0) {
            await cancelCartReminder();
            closeCart();
        } else {
            // Reschedule based on remaining items
            await scheduleCartReminder(
                updatedCart
            );
        }
    };



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

        }
    };

    const getServiceColor = (index) => {
        const vibrantColors = [
            '#7C3AED', // Vibrant Purple
            '#FF6B00', // Vibrant Orange
            '#00C853', // Vibrant Green
            '#2979FF', // Vibrant Blue
            '#E91E63', // Vibrant Pink
            '#F50057', // Deep Pink
            '#00B8D4', // Vibrant Cyan
            '#FF1744', // Vibrant Red
            '#651FFF', // Indigo
            '#00A86B', // Emerald Green
            '#FF4081', // Hot Pink
            '#FF9100', // Amber Orange
            '#304FFE', // Royal Blue
            '#AA00FF', // Electric Purple
            '#00BFA5', // Teal
            '#590881',
            '#148644',
        ];

        return vibrantColors[index % vibrantColors.length];
    };


    const fetchServices = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.log('Token not found');
                return;
            }

            // Show full-screen loader
            setIsLoading(true);

            const response = await axios.get(
                API.CUSTOMER_SERVICES,
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'SERVICE API RESPONSE:',
                response.data
            );

            if (Array.isArray(response.data)) {

                // ---------------------------------------------
                // SERVICE COLORS
                // ---------------------------------------------

                const serviceColors = [
                    '#8B5CF6',
                    '#06B6D4',
                    '#F59E0B',
                    '#10B981',
                    '#0EA5E9',
                    '#F43F5E',
                    '#D946EF',
                    '#84CC16',
                    '#EAB308',
                ];

                // ---------------------------------------------
                // FORMAT SERVICES
                // ---------------------------------------------

                const formattedServices = response.data.map(
                    (item, index) => ({
                        id: item.serviceId,
                        name: item.serviceName,

                        icon: {
                            uri: item.icon,
                        },

                        image: {
                            uri: item.imageUrl,
                        },

                        color: getServiceColor(
                            index,
                            response.data.length
                        ),
                    })
                );

                console.log(
                    'FORMATTED SERVICES:',
                    formattedServices
                );

                // ---------------------------------------------
                // FORMAT OFFERS
                // ---------------------------------------------

                const formattedOffers = response.data.map(
                    (item, index) => ({
                        id: item.serviceId,
                        title: item.serviceName,
                        description: getServiceDescription(
                            item.serviceName
                        ),
                        image: {
                            uri: item.imageUrl,
                        },
                    })
                );

                // ---------------------------------------------
                // COLLECT ALL IMAGE URLS
                // ---------------------------------------------

                const imageUrls = response.data.flatMap(
                    item => [
                        item?.icon,
                        item?.imageUrl,
                    ]
                );

                // Remove empty URLs
                const validImageUrls = imageUrls.filter(
                    url =>
                        typeof url === 'string' &&
                        url.trim().length > 0
                );

                // Remove duplicate URLs
                const uniqueImageUrls = [
                    ...new Set(validImageUrls),
                ];

                console.log(
                    'TOTAL UNIQUE IMAGES:',
                    uniqueImageUrls.length
                );

                // ---------------------------------------------
                // PRELOAD ALL IMAGES
                // ---------------------------------------------

                await Promise.all(
                    uniqueImageUrls.map(async url => {
                        try {
                            const result =
                                await Image.prefetch(url);

                            console.log(
                                'IMAGE PRELOADED:',
                                url,
                                result
                            );

                            return result;

                        } catch (imageError) {

                            console.log(
                                'IMAGE PRELOAD ERROR:',
                                url,
                                imageError
                            );

                            // Don't stop all other images
                            return false;
                        }
                    })
                );

                console.log(
                    '===================================='
                );

                console.log(
                    'ALL SERVICE IMAGES PRELOADED'
                );

                console.log(
                    '===================================='
                );

                // ---------------------------------------------
                // NOW SET DATA
                // ---------------------------------------------

                setAllServices(formattedServices);
                setOffers(formattedOffers);

            } else {

                setAllServices([]);
                setOffers([]);

            }

        } catch (error) {

            console.log(
                'FETCH SERVICES ERROR:',
                error
            );

            console.log(
                'SERVICE ERROR RESPONSE:',
                error?.response?.data
            );

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to load services.'
            );

        } finally {

            // ---------------------------------------------
            // ALL API + IMAGE PRELOADING COMPLETED
            // ---------------------------------------------

            setIsLoading(false);
        }
    };

    const getServiceDescription = (serviceName) => {
        const descriptions = {
            'Home Cleaning Services':
                'Get your home sparkling clean with our professional deep cleaning service',

            'Bathroom Cleaning':
                'Professional bathroom cleaning with stain removal and complete sanitization',

            'Cooking Support':
                'Expert cooking with fresh ingredients and hygienic preparation',

            'Kitchen & Utensil Cleaning':
                'Expert kitchen and utensil cleaning with hygienic care',

            'Washing & Ironing Cloths':
                'Professional laundry washing and ironing with premium fabric care',

            'House Maid':
                'Professional house maid services with reliable everyday home care',
        };

        return (
            descriptions[serviceName] ||
            `Professional ${serviceName.toLowerCase()} with quality service and reliable care`
        );
    };

    const getServiceDiscount = (index) => {
        const discounts = ['20%', '25%', '15%', '15%', '15%', '15%'];

        return discounts[index] || '15%';
    };

    const getServiceValidTill = (index) => {
        const validTill = [
            '31 Dec 2026',
            '15 Jan 2027',
            '31 Jan 2027',
            '31 Jan 2027',
            '31 Jan 2027',
            '31 Jan 2027',
        ];

        return validTill[index] || '31 Jan 2027';
    };

    const handleQuickAction = (item) => {
        switch (item.name) {
            case 'My Bookings':
                navigation.navigate('MyBookingsScreen');
                break;

            case 'My Favorites Services':
                navigation.navigate('SavedServicesScreen', {
                    customername: `${firstName} ${lastName}`,
                    customemob: phone,
                });
                break;

            case 'My Account':
                navigation.navigate('ProfileScreen');
                break;

            default:
                break;
        }
    };



    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    const toggleSidebar = () => {
        if (isSidebarOpen) {
            Animated.timing(sidebarAnim, {
                toValue: -width,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setIsSidebarOpen(false));
        } else {
            setIsSidebarOpen(true);
            Animated.spring(sidebarAnim, {
                toValue: 0,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    };

    const openAllServicesModal = () => {
        setIsAllServicesModalVisible(true);
        Animated.spring(modalSlideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const closeAllServicesModal = () => {
        Animated.timing(modalSlideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsAllServicesModalVisible(false);
        });
    };

    const renderSidebar = () => (
        <Modal
            transparent={true}
            visible={isSidebarOpen}
            animationType="none"
            onRequestClose={toggleSidebar}
        >
            <TouchableWithoutFeedback onPress={toggleSidebar}>
                <View style={styles.sidebarOverlay}>
                    <Animated.View
                        style={[
                            styles.sidebar,
                            { transform: [{ translateX: sidebarAnim }] }
                        ]}
                    >
                        <TouchableWithoutFeedback>
                            <View style={styles.sidebarContent}>
                                <TouchableOpacity style={styles.sidebarHeader} onPress={() => navigation.navigate('ProfileScreen')}>
                                    <View style={styles.sidebarAvatarContainer}>

                                        <Image
                                            source={{ uri: profileImage }}
                                            style={styles.sidebarAvatar}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.sidebarStatus} />
                                    </View>
                                    <Text style={styles.sidebarName}>{firstName} {lastName}</Text>
                                    <Text style={styles.sidebarEmail}>{phone}</Text>
                                </TouchableOpacity>

                                <View style={styles.sidebarMenu}>
                                    {['My Account', 'My Bookings', 'My Favorites Services', 'Help & Support'].map((item, index) => (
                                        <TouchableOpacity key={index} style={styles.sidebarMenuItem}
                                            onPress={() => {
                                                switch (item) {
                                                    case 'My Account':
                                                        navigation.navigate('ProfileScreen');
                                                        setIsSidebarOpen(false);
                                                        break;

                                                    case 'My Bookings':
                                                        navigation.navigate('MyBookingsScreen');
                                                        setIsSidebarOpen(false);
                                                        break;

                                                    case 'My Favorites Services':
                                                        navigation.navigate('SavedServicesScreen');
                                                        setIsSidebarOpen(false);
                                                        break;
                                                    case 'Monthly Subscription':
                                                        navigation.navigate('MonthlySubscriptionScreen');
                                                        setIsSidebarOpen(false);
                                                        break;

                                                    case 'Help & Support':
                                                        navigation.navigate('HelpSupport');
                                                        setIsSidebarOpen(false);
                                                        break;

                                                    default:
                                                        break;
                                                }
                                            }}>
                                            <View style={styles.sidebarMenuIcon}>
                                                <Image
                                                    source={tabIcons[index]}
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        resizeMode: 'contain',
                                                        tintColor: '#403746', // Remove if your PNGs are already colored
                                                    }}
                                                />
                                            </View>
                                            <Text style={styles.sidebarMenuText}>{item}</Text>

                                            <Image
                                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    resizeMode: 'contain',
                                                    tintColor: "#CCC",
                                                    marginLeft: 'auto',


                                                }}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={[styles.sidebarMenuItem, styles.sidebarLogout]} onPress={() => navigation.replace('LoginScreen')}>
                                        <View style={[styles.sidebarMenuIcon, { backgroundColor: COLORS.red + '15' }]}>

                                            <Image
                                                source={require('../../asset/log-out.png')} // Update the path as needed
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    resizeMode: 'contain',
                                                    tintColor: COLORS.red,



                                                }}
                                            />
                                        </View>
                                        <Text style={[styles.sidebarMenuText, { color: COLORS.red }]}>Logout</Text>


                                        <Image
                                            source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                            style={{
                                                width: 18,
                                                height: 18,
                                                resizeMode: 'contain',
                                                tintColor: COLORS.red,
                                                marginLeft: 'auto',


                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.sidebarFooter}>
                                    <Text style={styles.sidebarVersion}>HomeHelp v2.4.0</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );


    // Cart Modal
    const renderCartModal = () => (
        <Modal
            transparent={true}
            visible={showCart}
            animationType="none"
            onRequestClose={closeCart}
        >
            <TouchableWithoutFeedback onPress={closeCart}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.cartModalContent,

                            ]}
                        >
                            <View style={styles.modalHandle} />

                            <Text style={styles.cartTitle}>Your Cart</Text>
                            <Text style={styles.cartSubtitle}>{selectedServices.length} service(s) selected</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedServices.map((item) => (
                                    <View key={item.id} style={styles.cartItem}>
                                        <Image source={item.coverImage} style={styles.cartItemImage} />
                                        <View style={styles.cartItemInfo}>
                                            <Text style={styles.cartItemName}>{item.name}</Text>
                                            {/* <Text style={styles.cartItemPrice}>{item.price}</Text> */}
                                        </View>
                                        <TouchableOpacity onPress={() => removeFromCart(item.name)}>

                                            <Image
                                                source={require('../../asset/delete.png')} // Update the path as needed
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    resizeMode: 'contain',
                                                    tintColor: COLORS.red


                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>

                            {selectedServices.length > 0 && (
                                <View style={styles.cartFooter}>
                                    {/* <View style={styles.cartTotal}>
                                            <Text style={styles.cartTotalLabel}>Total</Text>
                                            <Text style={styles.cartTotalPrice}>{getTotalPrice()}</Text>
                                        </View> */}
                                    <TouchableOpacity style={styles.cartCheckoutButton} onPress={() => {
                                        closeCart();
                                        navigation.navigate('ViewCartScreen', {
                                            selectedServices,
                                            customername: `${firstName} ${lastName}`,
                                            customemob: phone,
                                        });
                                    }}>
                                        <Text style={styles.cartCheckoutText}>Proceed to Book</Text>

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
                            )}

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeCart}>
                                <Text style={styles.modalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // All Services Modal - Bottom Sheet with Grid View
    const renderAllServicesModal = () => (
        <Modal
            transparent={true}
            visible={isAllServicesModalVisible}
            animationType="none"
            onRequestClose={closeAllServicesModal}
        >
            <TouchableWithoutFeedback onPress={closeAllServicesModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { transform: [{ translateY: modalSlideAnim }] }
                            ]}
                        >
                            <View style={styles.modalHandle} />

                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>📋 All Services</Text>
                                <Text style={styles.modalSubtitle}>Choose from our wide range of services</Text>
                            </View>

                            <FlatList
                                data={allServices}
                                keyExtractor={(item) => item.id}
                                numColumns={3}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.modalGrid}
                                //op-1
                                // renderItem={({ item }) => (
                                //     <TouchableOpacity
                                //         style={[
                                //             styles.modalServiceItem,
                                //             {
                                //                 backgroundColor: item.bg,
                                //                 borderColor: item.border,
                                //             }
                                //         ]}
                                //         onPress={() => navigation.navigate('ServiceBookingScreen')}
                                //         activeOpacity={0.8}
                                //     >
                                //         <View style={[styles.modalServiceIcon, { backgroundColor: item.color }]}>
                                //             <Image
                                //                 source={item.icon}
                                //                 style={{
                                //                     width: 26,
                                //                     height: 26,
                                //                     resizeMode: 'contain',
                                //                     tintColor: '#FFFFFF',
                                //                 }}
                                //             />
                                //         </View>
                                //         <Text style={[styles.modalServiceName, { color: item.color }]}>
                                //             {item.name}
                                //         </Text>
                                //     </TouchableOpacity>
                                // )}

                                //op-2
                                // renderItem={({ item }) => (
                                //     <TouchableOpacity
                                //         style={[
                                //             styles.modalServiceItem,
                                //             {
                                //                 borderColor: item.border,
                                //             }
                                //         ]}
                                //         onPress={() => navigation.navigate('ServiceBookingScreen')}
                                //         activeOpacity={0.8}
                                //     >
                                //         <View style={[styles.modalServiceIcon, { backgroundColor: item.color }]}>
                                //             <Image
                                //                 source={item.icon}
                                //                 style={{
                                //                     width: 28,
                                //                     height: 28,
                                //                     resizeMode: 'contain',
                                //                     tintColor: '#FFFFFF',
                                //                 }}
                                //             />
                                //         </View>
                                //         <Text style={[styles.modalServiceName, { color: item.color }]}>
                                //             {item.name}
                                //         </Text>
                                //     </TouchableOpacity>
                                // )}

                                //op-3
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalServiceItem}
                                        onPress={() => {
                                            setIsAllServicesModalVisible(false);

                                            navigation.navigate('ServiceBookingScreen', {
                                                serviceId: item.id,
                                                customername: `${firstName} ${lastName}`,
                                                customemob: phone

                                            });
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.modalServiceIcon, { backgroundColor: item.color }]}>
                                            <Image
                                                source={item.icon}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    resizeMode: 'contain',
                                                    tintColor: '#FFFFFF',
                                                }}
                                            />
                                        </View>
                                        <Text style={[styles.modalServiceName, { color: item.color }]}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            //op-4
                            // renderItem={({ item }) => (
                            //     <TouchableOpacity
                            //         style={styles.modalServiceItem}
                            //         onPress={() => navigation.navigate('ServiceBookingScreen')}
                            //         activeOpacity={0.8}
                            //     >
                            //         <View style={styles.modalServiceIcon}>
                            //             <Image
                            //                 source={item.icon}
                            //                 style={{
                            //                     width: 32,
                            //                     height: 32,
                            //                     resizeMode: 'contain',
                            //                     tintColor: item.color,
                            //                 }}
                            //             />
                            //         </View>
                            //         <Text style={[styles.modalServiceName, { color: item.color }]}>
                            //             {item.name}
                            //         </Text>
                            //     </TouchableOpacity>
                            // )}
                            />

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeAllServicesModal}>
                                <Text style={styles.modalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const renderOfferItem = ({ item }) => (
        <TouchableOpacity style={styles.offerCard} onPress={() => {


            navigation.navigate('ServiceBookingScreen', {
                serviceId: item.id,
                customername: `${firstName} ${lastName}`,
                customemob: phone

            });
        }}>
            <CachedImage
                uri={item.image?.uri}
                style={styles.offerImage}
                resizeMode="cover"

            />
            <View style={styles.offerOverlay}>
                <View style={styles.offerDiscountContainer}>
                    {item.discount && item.discount !== '0%' && (
                        <View style={styles.offerDiscountBadge}>
                            <Text style={styles.offerDiscountText}>{item.discount}</Text>
                            <Text style={styles.offerDiscountLabel}>OFF</Text>
                        </View>
                    )}
                </View>

                <View style={styles.offerContent}>
                    <Text style={styles.offerTitle}>{item.title}</Text>
                    <Text style={styles.offerDescription}>{item.description}</Text>
                    <View style={styles.offerFooter}>
                        <View style={styles.offerValidityContainer}>
                            {item.validTill?.trim() && (
                                <View style={styles.offerValidity}>
                                    <Image
                                        source={require('../../asset/time-outline.png')}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.white,
                                        }}
                                    />

                                    <Text style={styles.offerValidityText}>
                                        Valid till {item.validTill}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.bookNowButton} >
                            <Text style={styles.bookNowText}>Book Now</Text>

                            <Image
                                source={require('../../asset/right-arrow.png')} // Update the path as needed
                                style={{
                                    width: 14,
                                    height: 14,
                                    resizeMode: 'contain',
                                    tintColor: '#403746',



                                }}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderPopularService = ({ item }) => (
        <TouchableOpacity style={styles.popularServiceCard} >


            <Image
                source={item.image}
                style={styles.popularServiceImage}
                resizeMode="cover"
            />
            <View style={styles.popularServiceContent}>
                <Text style={styles.popularServiceName}>{item.name}</Text>
                <View style={styles.popularServiceRating}>

                    <Image
                        source={require('../../asset/star-fill.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: '#403746',



                        }}
                    />
                    <Text style={styles.popularServiceRatingText}>{item.rating}</Text>
                    <Text style={styles.popularServiceReviews}>({item.reviews})</Text>
                </View>
                <View style={styles.popularServiceBottom}>
                    <Text style={styles.popularServicePrice}>{item.price}</Text>
                    <View style={[styles.popularServiceIcon, { backgroundColor: item.bg }]}>
                        <Image
                            source={item.icon}
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: item.color, // Remove if your PNGs are already colored
                            }}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderOnTheSpotService = ({ item }) => (
        <TouchableOpacity style={styles.onTheSpotCard} >

            <Image
                source={item.image}
                style={styles.onTheSpotImage}
                resizeMode="cover"
            />
            <View style={styles.onTheSpotOverlay}>
                <View style={styles.onTheSpotBadge}>

                    <Image
                        source={require('../../asset/thunder.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: COLORS.dark,



                        }}
                    />
                    <Text style={styles.onTheSpotBadgeText}>On the Spot</Text>
                </View>
                <View style={styles.onTheSpotContent}>
                    <Text style={styles.onTheSpotName}>{item.name}</Text>
                    <Text style={styles.onTheSpotDescription}>{item.description}</Text>
                    <View style={styles.onTheSpotFooter}>
                        <View style={styles.onTheSpotPriceRating}>
                            <Text style={styles.onTheSpotPrice}>{item.price}</Text>
                            <View style={styles.onTheSpotRating}>

                                <Image
                                    source={require('../../asset/star-fill.png')} // Update the path as needed
                                    style={{
                                        width: 12,
                                        height: 12,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange,



                                    }}
                                />
                                <Text style={styles.onTheSpotRatingText}>{item.rating}</Text>
                            </View>
                        </View>
                        <View style={styles.onTheSpotBookButton}>
                            <Text style={styles.onTheSpotBookText}>Book Now</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderRebookService = ({ item }) => (
        <TouchableOpacity style={styles.rebookCard} >


            <Image
                source={item.image}
                style={styles.rebookImage}
                resizeMode="cover"
            />
            <View style={styles.rebookContent}>
                <Text style={styles.rebookName}>{item.name}</Text>
                <Text style={styles.rebookProvider}>{item.provider}</Text>
                <Text style={styles.rebookDate}>{item.date}</Text>
                <View style={styles.rebookFooter}>
                    <View style={styles.rebookRating}>

                        <Image
                            source={require('../../asset/star-fill.png')} // Update the path as needed
                            style={{
                                width: 14,
                                height: 14,
                                resizeMode: 'contain',
                                tintColor: COLORS.orange,



                            }}
                        />
                        <Text style={styles.rebookRatingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.rebookPrice}>{item.price}</Text>
                </View>
                <View style={styles.rebookButton}>
                    <Text style={styles.rebookButtonText}>Rebook Now</Text>

                    <Image
                        source={require('../../asset/refresh.png')} // Update the path as needed
                        style={{
                            width: 16,
                            height: 16,
                            resizeMode: 'contain',
                            tintColor: '#403746',



                        }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderThoughtfulCreation = ({ item, index }) => (
        <TouchableOpacity style={styles.thoughtfulCard} onPress={() => navigation.navigate('AdvertisementScreen', { creationId: item.id })}>
            {/* <Image
                source={{ uri: item.image }}
                style={styles.thoughtfulImage}
                resizeMode="cover"
            /> */}

            <Video
                source={item.video}
                style={styles.thoughtfulImage}
                resizeMode="cover"
                repeat
                muted
                paused={currentThoughtfulIndex !== index}
                playInBackground={false}
                playWhenInactive={false}
            />
            <View style={styles.thoughtfulOverlay}>
                <View style={styles.thoughtfulBadge}>

                    <Image
                        source={require('../../asset/play-button.png')} // Update the path as needed
                        style={{
                            width: 16,
                            height: 16,
                            resizeMode: 'contain',
                            tintColor: '#403746',



                        }}
                    />
                    <Text style={styles.thoughtfulBadgeText}>Featured</Text>
                </View>
                <View style={styles.thoughtfulContent}>
                    <Text style={styles.thoughtfulTitle}>{item.title}</Text>
                    <Text style={styles.thoughtfulDescription}>{item.description}</Text>
                    <TouchableOpacity style={styles.thoughtfulButton}>
                        <Text style={styles.thoughtfulButtonText}>{item.cta}</Text>

                        <Image
                            source={require('../../asset/right-arrow.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: '#403746',



                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );



    const renderWhyChoose = ({ item }) => (
        <View style={styles.whyChooseItem}>
            <View style={[styles.whyChooseIcon, { backgroundColor: item.color + '15' }]}>
                <Image
                    source={item.icon}
                    style={{
                        width: 20, // Adjust to your desired size
                        height: 20,
                        resizeMode: 'contain',
                        tintColor: item.color, // Remove if the PNGs are already colored
                    }}
                />
            </View>
            <Text style={styles.whyChooseText}>{item.text}</Text>
        </View>
    );

    const currentHintIndex = Math.floor(Date.now() / 3000) % searchHints.length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>

                        <Image
                            source={require('../../asset/menu.png')} // Update the path as needed
                            style={{
                                width: 28,
                                height: 28,
                                resizeMode: 'contain',
                                tintColor: COLORS.dark,



                            }}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerGreeting}>Good Morning 👋</Text>
                        <Text style={styles.headerName}>{firstName} {lastName}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.notificationButton}>

                        <Image
                            source={require('../../asset/notifications.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.dark,



                            }}
                        />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && (
                <View style={styles.loaderOverlay}>
                    <ServiceOrbitLoader />
                </View>
            )}

            <FlatList
                ref={flatListRef}
                data={[{ key: 'dashboard' }]}
                renderItem={() => null}
                ListHeaderComponent={
                    <View style={styles.scrollContent}>
                        {/* Search Bar */}
                        <Animated.View
                            style={[
                                styles.searchContainer,
                                {
                                    transform: [
                                        {
                                            scale: searchBarAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.02],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >

                            <Image
                                source={require('../../asset/search.png')} // Update the path as needed
                                style={{
                                    width: 22,
                                    height: 22,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight,



                                }}
                            />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={searchHints[currentHintIndex]}
                                placeholderTextColor={COLORS.textLight}
                                value={searchText}
                                onChangeText={setSearchText}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchText('')}>

                                    <Image
                                        source={require('../../asset/close-circle.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.textLight,



                                        }}
                                    />
                                </TouchableOpacity>
                            )}
                        </Animated.View>

                        {/* Offers Auto Scroller */}
                        <View style={styles.offersContainer}>
                            <FlatList
                                ref={offerListRef}
                                data={offers}
                                renderItem={renderOfferItem}
                                keyExtractor={(item) => item.id}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={width - 40}
                                decelerationRate="fast"
                                onMomentumScrollEnd={(e) => {
                                    const index = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                                    setCurrentOfferIndex(index);
                                }}
                                scrollEnabled={true}
                            />
                            <View style={styles.offerDots}>
                                {offers.map((_, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            setCurrentOfferIndex(index);
                                            offersFlatListRef.current?.scrollToIndex({ index, animated: true });
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.offerDot,
                                                index === currentOfferIndex && styles.offerDotActive,
                                            ]}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Popular Services */}
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>🔥 Popular Services</Text>
                                <Text style={styles.sectionSubtitle}>Most requested services by our users</Text>
                            </View>
                            <TouchableOpacity onPress={openAllServicesModal}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* <FlatList
                            data={popularServices}
                            renderItem={renderPopularService}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.servicesList}
                        /> */}

                        <FlatList
                            data={allServices.slice(0, 3)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.popularServiceCard}
                                    onPress={() =>
                                        navigation.navigate('ServiceBookingScreen', {
                                            serviceId: item.id,
                                            customername: `${firstName} ${lastName}`,
                                            customemob: phone,
                                        })
                                    }
                                >
                                    <CachedImage
                                        uri={item.image?.uri}
                                        style={styles.popularServiceImage}
                                        resizeMode="cover"
                                    />

                                    <View style={styles.popularServiceContent}>
                                        <Text style={styles.popularServiceName}>
                                            {item.name}
                                        </Text>

                                        <View style={styles.popularServiceBottom}>
                                            <View
                                                style={[
                                                    styles.popularServiceIcon,
                                                    { backgroundColor: item.color },
                                                ]}
                                            >
                                                <Image
                                                    source={item.icon}
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        resizeMode: 'contain',
                                                        tintColor: '#FFFFFF',
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => String(item.id)}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.servicesList}
                        />

                        {/* Quick Actions - 3 Options */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
                        </View>
                        <View style={styles.quickActionsGrid}>
                            {quickActions.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.quickActionCard} onPress={() => handleQuickAction(item)}>
                                    <View style={[styles.quickActionIcon, { backgroundColor: item.bg }]}>
                                        <Image
                                            source={item.icon}
                                            style={{
                                                width: 28, // Adjust as needed
                                                height: 28,
                                                resizeMode: 'contain',
                                                tintColor: item.color, // Remove if your PNGs are already colored
                                            }}
                                        />
                                    </View>
                                    <Text style={styles.quickActionName}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* On the Spot Services */}
                        {/* <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>⚡ On the Spot</Text>

                        </View> */}
                        {/* <FlatList
                            data={onTheSpotServices}
                            renderItem={renderOnTheSpotService}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.onTheSpotList}
                        /> */}

                        {/* Rebook Services */}

                        {/* <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>🔄 Rebook Services</Text>
                            <Text style={styles.viewAllText}>View All</Text>
                        </View> */}


                        {/* <FlatList
                            data={rebookServices}
                            renderItem={renderRebookService}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.rebookList}
                        /> */}

                        {/* Thoughtful Creation */}
                        {/* <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>💡 Thoughtful Creation</Text>
                            <Text style={styles.viewAllText}>View All</Text>
                        </View> */}
                        {/* <View style={styles.thoughtfulContainer}>
                            <FlatList
                                ref={thoughtfulFlatListRef}
                                data={thoughtfulCreations}
                                renderItem={renderThoughtfulCreation}
                                keyExtractor={(item) => item.id}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={width - 40}
                                decelerationRate="fast"
                                onMomentumScrollEnd={(e) => {
                                    const index = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                                    setCurrentThoughtfulIndex(index);
                                }}
                                scrollEnabled={true}
                            />
                            <View style={styles.thoughtfulDots}>
                                {thoughtfulCreations.map((_, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            setCurrentThoughtfulIndex(index);
                                            thoughtfulFlatListRef.current?.scrollToIndex({ index, animated: true });
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.thoughtfulDot,
                                                index === currentThoughtfulIndex && styles.thoughtfulDotActive,
                                            ]}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View> */}

                        {/* Why Choose HomeHelp */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>✨ Why Choose HomeHelp?</Text>
                        </View>
                        <View style={styles.whyChooseContainer}>
                            {whyChoose.map((item) => renderWhyChoose({ item }))}
                        </View>

                        {/* Refer & Earn - Bottom */}
                        <View style={styles.referCard}>
                            <View style={styles.referHeader}>
                                <View style={styles.referIconContainer}>

                                    <Image
                                        source={require('../../asset/gift.png')} // Update the path as needed
                                        style={{
                                            width: 24,
                                            height: 24,
                                            resizeMode: 'contain',
                                            tintColor: '#FFF',



                                        }}
                                    />
                                </View>
                                <Text style={styles.referTitle}>Refer & Earn ₹200</Text>
                            </View>

                            <Text style={styles.referDescription}>
                                Invite your friends and earn ₹200 for every successful booking they make
                            </Text>

                            <View style={styles.referCodeContainer}>
                                <Text style={styles.referCodeLabel}>Your Referral Code</Text>
                                <View style={styles.referCode}>
                                    <Text style={styles.referCodeText}>HOMEHELP200</Text>
                                    <TouchableOpacity style={styles.referCopyButton}>

                                        <Image
                                            source={require('../../asset/copy.png')} // Update the path as needed
                                            style={{
                                                width: 20,
                                                height: 20,
                                                resizeMode: 'contain',
                                                tintColor: '#FFF',



                                            }}
                                        />
                                        <Text style={styles.referCopyText}>Copy</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.referButton}>
                                <Text style={styles.referButtonText}>Invite Friends Now</Text>

                                <Image
                                    source={require('../../asset/right-arrow.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: '#FFF',



                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footerTextContainer}>
                            <Text style={styles.footerCatchyText}>
                                "Your home deserves the best care. We're here to make it happen!"
                            </Text>
                            <Text style={styles.footerSubText}>
                                Trusted by thousands of happy customers across India
                            </Text>
                            <View style={styles.footerDivider} />
                            <Text style={styles.footerVersion}>HomeHelp v2.4.0</Text>
                        </View>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            />

            {/* All Services Bottom Sheet Modal */}

            {selectedServices.length > 0 && (
                <TouchableOpacity style={styles.cartButton} onPress={openCart}>
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{selectedServices.length}</Text>
                    </View>

                    <Image
                        source={require('../../asset/shopping-cart.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.textLight


                        }}
                    />
                    <Text style={styles.cartButtonText}>View Cart</Text>


                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.txtColor


                        }}
                    />
                </TouchableOpacity>
            )}
            {renderAllServicesModal()}

            {renderCartModal()}

            {/* Sidebar */}
            {renderSidebar()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF5FF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0E6FF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuButton: {
        padding: 4,
    },
    headerGreeting: {
        fontSize: 12,
        color: '#6B5B7A',
    },
    headerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    notificationButton: {
        position: 'relative',
        padding: 4,
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#E17055',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    notificationBadgeText: {
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EDE0FF',
        shadowColor: 'rgba(168, 85, 247, 0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        marginLeft: 10,
        paddingVertical: 0,
    },
    offersContainer: {
        marginBottom: 24,
    },
    offerCard: {
        width: width - 40,
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    offerImage: {
        width: '100%',
        height: '100%',
    },
    offerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        padding: 16,
        justifyContent: 'space-between',
    },
    offerDiscountBadge: {
        backgroundColor: '#D8B4FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    offerDiscountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D1B4E',
    },
    offerDiscountLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#2D1B4E',
        opacity: 0.8,
    },
    offerContent: {
        justifyContent: 'flex-end',
    },
    offerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    offerDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
        lineHeight: 16,
    },
    offerFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    offerValidity: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    offerValidityContainer: {
        height: 24,
        justifyContent: 'center',
    },
    offerValidityText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
    },
    bookNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#D8B4FE',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bookNowText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2D1B4E',
    },
    offerDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
    },
    offerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EDE0FF',
    },
    offerDotActive: {
        backgroundColor: '#A855F7',
        width: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#6B5B7A',
        marginTop: 2,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#403746',
    },
    servicesList: {
        paddingBottom: 4,
    },
    popularServiceCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 12,
        marginRight: 12,
        width: 200,
        borderWidth: 1,
        borderColor: '#F0E6FF',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    popularServiceImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    popularServiceContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    popularServiceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    popularServiceRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    popularServiceRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    popularServiceReviews: {
        fontSize: 11,
        color: '#6B5B7A',
    },
    popularServiceBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    popularServicePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#403746',
    },
    popularServiceIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        gap: 10,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0E6FF',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    onTheSpotList: {
        paddingBottom: 4,
        marginBottom: 24,
    },
    onTheSpotCard: {
        width: 280,
        height: 180,
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    onTheSpotImage: {
        width: '100%',
        height: '100%',
    },
    onTheSpotOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: 12,
        justifyContent: 'space-between',
    },
    onTheSpotBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#D8B4FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    onTheSpotBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#2D1B4E',
    },
    onTheSpotContent: {
        justifyContent: 'flex-end',
    },
    onTheSpotName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFF',
    },
    onTheSpotDescription: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    onTheSpotFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    onTheSpotPriceRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    onTheSpotPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    onTheSpotRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    onTheSpotRatingText: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: '500',
    },
    onTheSpotBookButton: {
        backgroundColor: '#D8B4FE',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    onTheSpotBookText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2D1B4E',
    },
    rebookList: {
        paddingBottom: 4,
        marginBottom: 24,
    },
    rebookCard: {
        width: 220,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#F0E6FF',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    rebookImage: {
        width: '100%',
        height: 120,
    },
    rebookContent: {
        padding: 12,
    },
    rebookName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    rebookProvider: {
        fontSize: 11,
        color: '#6B5B7A',
        marginTop: 2,
    },
    rebookDate: {
        fontSize: 10,
        color: '#9E8FB0',
        marginTop: 2,
    },
    rebookFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    rebookRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    rebookRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    rebookPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#A855F7',
    },
    rebookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#D8B4FE',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    rebookButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2D1B4E',
    },
    thoughtfulContainer: {
        marginBottom: 24,
    },
    thoughtfulCard: {
        width: width - 40,
        height: 200,
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    thoughtfulImage: {
        width: '100%',
        height: '100%',
    },
    thoughtfulOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 16,
        justifyContent: 'space-between',
    },
    thoughtfulBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#D8B4FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    thoughtfulBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#2D1B4E',
    },
    thoughtfulContent: {
        justifyContent: 'flex-end',
    },
    thoughtfulTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    thoughtfulDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    thoughtfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#D8B4FE',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    thoughtfulButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2D1B4E',
    },
    thoughtfulDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
    },
    thoughtfulDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EDE0FF',
    },
    thoughtfulDotActive: {
        backgroundColor: '#A855F7',
        width: 24,
    },
    whyChooseContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 2,
        marginBottom: 20,
    },
    whyChooseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0E6FF',
        flex: 1,
        minWidth: (width - 60) / 2,
    },
    whyChooseIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    whyChooseText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1A1A1A',
        flex: 1,

    },
    referCard: {
        backgroundColor: '#A855F7',
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
        marginBottom: 24,
        shadowColor: 'rgba(168, 85, 247, 0.3)',
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
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    referDescription: {
        fontSize: 13,
        color: '#FFF',
        lineHeight: 18,
        marginBottom: 16,
    },
    referCodeContainer: {
        marginBottom: 16,
    },
    referCodeLabel: {
        fontSize: 11,
        color: '#FFF',
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
        color: '#FFF',
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
        color: '#FFF',
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
        color: '#FFF',
    },
    footerTextContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0E6FF',
        marginTop: 8,
    },
    footerCatchyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 24,
    },
    footerSubText: {
        fontSize: 13,
        color: '#6B5B7A',
        textAlign: 'center',
        marginTop: 8,
    },
    footerDivider: {
        width: 40,
        height: 2,
        backgroundColor: '#A855F7',
        marginVertical: 12,
    },
    footerVersion: {
        fontSize: 11,
        color: '#9E8FB0',
    },
    // Modal Styles - Bottom Sheet
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 34,
        maxHeight: height * 0.85,
        minHeight: height * 0.4,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#EDE0FF',
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalHeader: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B5B7A',
        textAlign: 'center',
        marginTop: 4,
    },
    modalGrid: {
        paddingBottom: 16,
    },
    modalServiceItem: {

        //op-1
        // flex: 1,
        // alignItems: 'center',
        // paddingVertical: 14,
        // paddingHorizontal: 6,
        // margin: 5,
        // borderRadius: 16,
        // borderWidth: 2,
        // shadowColor: 'rgba(0,0,0,0.08)',
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.1,
        // shadowRadius: 6,
        // elevation: 3,
        // minHeight: 110,

        //op-2
        // flex: 1,
        // alignItems: 'center',
        // paddingVertical: 14,
        // paddingHorizontal: 6,
        // margin: 5,
        // borderRadius: 16,
        // borderWidth: 2,
        // backgroundColor: '#FFFFFF',
        // shadowColor: 'rgba(0,0,0,0.08)',
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.1,
        // shadowRadius: 6,
        // elevation: 3,
        // minHeight: 110,

        //op-3
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 6,
        margin: 5,
        backgroundColor: 'transparent',
        minHeight: 110,

        //op-4
        // flex: 1,
        // alignItems: 'center',
        // paddingVertical: 14,
        // paddingHorizontal: 6,
        // margin: 5,
        // backgroundColor: 'transparent',
        // minHeight: 110,
    },

    // modalServiceIcon: {
    //     width: 60,
    //     height: 60,
    //     borderRadius: 30,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     marginBottom: 8,
    //     backgroundColor: '#FFFFFF',
    //     shadowColor: 'rgba(0,0,0,0.12)',
    //     shadowOffset: { width: 0, height: 3 },
    //     shadowOpacity: 0.15,
    //     shadowRadius: 6,
    //     elevation: 4,
    // },
    // modalServiceName: {
    //     fontSize: 11,
    //     textAlign: 'center',
    //     fontWeight: '700',
    //     lineHeight: 14,
    // },


    modalServiceIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    modalServiceName: {
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '700',
        lineHeight: 14,
    },
    // modalServiceIcon: {
    //     width: 56,
    //     height: 56,
    //     borderRadius: 14,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     marginBottom: 6,
    // },
    // modalServiceName: {
    //     fontSize: 11,
    //     color: '#1A1A1A',
    //     textAlign: 'center',
    //     fontWeight: '500',
    // },
    modalCloseButton: {
        backgroundColor: '#F5F0FA',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B5B7A',
    },
    sidebarOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: width * 0.8,
        backgroundColor: '#FFFF',
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    sidebarContent: {
        flex: 1,
        paddingTop: 50,
    },
    sidebarHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E6FF',
    },
    sidebarAvatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    sidebarAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    sidebarStatus: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#2ECC71',
        borderWidth: 2,
        borderColor: '#2D1B4E',
    },
    sidebarName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    sidebarEmail: {
        fontSize: 13,
        color: '#6B5B7A',
        marginTop: 4,
    },
    sidebarMenu: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        flex: 1,
    },
    sidebarMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E6FF',
    },
    sidebarMenuIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F5F0FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    sidebarMenuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    sidebarMenuArrow: {
        marginLeft: 'auto',
    },
    sidebarLogout: {
        borderBottomWidth: 0,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0E6FF',
        paddingTop: 16,
    },
    sidebarFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0E6FF',
        alignItems: 'center',
    },
    sidebarVersion: {
        fontSize: 11,
        color: '#9E8FB0',
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

    offerDiscountContainer: {
        height: 28,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    // Cart
    cartButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D8B4FE',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    cartBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#E17055',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cartBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cartButtonText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#2D1B4E',
        marginLeft: 12,
    },
    cartTotalText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D1B4E',
        marginRight: 8,
    },
    // Cart Modal
    cartModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        maxHeight: height * 0.8,
    },
    cartTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    cartSubtitle: {
        fontSize: 14,
        color: '#6B5B7A',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E6FF',
    },
    cartItemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    cartItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    cartItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    cartItemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#403746',
        marginTop: 2,
    },
    cartFooter: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0E6FF',
    },
    cartTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cartTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    cartTotalPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#7E22CE',
    },
    cartCheckoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#7E22CE',
        paddingVertical: 14,
        borderRadius: 12,
    },
    cartCheckoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default DashboardScreen;