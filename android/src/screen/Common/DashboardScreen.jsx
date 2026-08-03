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

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const sidebarAnim = useRef(new Animated.Value(-width)).current;
    const searchBarAnim = useRef(new Animated.Value(0)).current;
    const searchHintAnim = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;


    const tabIcons = [
        require('../../asset/home.png'),
        require('../../asset/calendar-outline.png'),
        require('../../asset/heart.png'),
        require('../../asset/person-outline.png'),
        require('../../asset/gift.png'),
        require('../../asset/information.png'),
    ];

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
        teal: '#00CEC9',
        indigo: '#6C5CE7',
        coral: '#FF6B6B',
        mint: '#00B894',
        lavender: '#A29BFE',
        peach: '#FD79A8',
    };

    // Sample user data
    const userData = {
        name: 'Rahul Sharma',
        email: 'rahul@email.com',
        avatar: require('../../asset/demo-user.png'),
    };

    // Offers data
    const offers = [
        {
            id: '1',
            title: '20% OFF on Deep Cleaning',
            description: 'Get your home sparkling clean with our professional deep cleaning service',
            image: require('../../asset/deepclean.png'),
            discount: '20%',
            validTill: '31 Dec 2026',
        },
        {
            id: '2',
            title: '25% OFF on Bathroom Cleaning',
            description: 'Professional bathroom cleaning with stain removal and complete sanitization',
            image: require('../../asset/bathroom-clean.png'),
            discount: '25%',
            validTill: '15 Jan 2027',
        },
        {
            id: '3',
            title: '15% OFF on Sofa Cleaning',
            description: 'Professional sofa cleaning with premium fabric care',
            image: require('../../asset/sofa-clean.png'),
            discount: '15%',
            validTill: '31 Jan 2027',
        },
    ];

    // Popular Services (Only 3)
    const popularServices = [
        {
            id: '1',
            name: 'Home Deep Cleaning',
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
            name: 'Sofa Cleaning',
            icon: require('../../asset/sofa.png'),
            color: COLORS.purple,
            bg: COLORS.purple + '15',
            rating: 4.7,
            reviews: 650,
            price: '₹599',
            image: require('../../asset/sofaclean-icon.png'),
        },
    ];
    // All Services - Grid View for Modal
    const allServices = [
        {
            id: '1',
            name: 'Home Deep Cleaning',
            icon: require('../../asset/home.png'),
            color: COLORS.gold,
        },
        {
            id: '3',
            name: 'Sofa Cleaning',
            icon: require('../../asset/sofa.png'),
            color: COLORS.purple,
        },
        {
            id: '4',
            name: 'Bathroom Cleaning',
            icon: require('../../asset/shower.png'),
            color: COLORS.blue,
        },
        {
            id: '5',
            name: 'Kitchen Cleaning',
            icon: require('../../asset/kitchen.png'),
            color: COLORS.orange,
        },
        {
            id: '6',
            name: 'Carpet Cleaning',
            icon: require('../../asset/power-washing.png'),
            color: COLORS.purple,
        },
    ];
    // On the Spot Services
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
            name: 'Deep Cleaning',
            provider: 'CleanMaster Services',
            image: require('../../asset/deepclean.png'),
            date: 'Last booked: 15 Dec 2026',
            rating: 4.9,
            price: '₹499',
        },

        {
            id: '3',
            name: 'Sofa Cleaning',
            provider: 'SofaCare Experts',
            image: require('../../asset/sofa-clean.png'),
            date: 'Last booked: 5 Dec 2026',
            rating: 4.7,
            price: '₹599',
        },
    ];

    // Thoughtful Creation
    // const thoughtfulCreations = [
    //     {
    //         id: '1',
    //         title: 'Professional Cleaning at Your Doorstep',
    //         description: 'Experience the best home cleaning services with our experts',
    //         image: 'https://media.giphy.com/media/3o7abKhOpu0N9H3zUc/giphy.gif',
    //         type: 'gif',
    //         cta: 'Book Now',
    //     },
    //     {
    //         id: '2',
    //         title: 'Expert AC Service Made Easy',
    //         description: 'Keep your AC running smoothly all year round',
    //         image: 'https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif',
    //         type: 'gif',
    //         cta: 'Learn More',
    //     },
    //     {
    //         id: '3',
    //         title: 'Premium Sofa Care Services',
    //         description: 'Extend the life of your furniture with professional care',
    //         image: 'https://media.giphy.com/media/3o7abKhOpu0N9H3zUc/giphy.gif',
    //         type: 'gif',
    //         cta: 'Explore',
    //     },
    // ];

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
            color: COLORS.gold,
            bg: COLORS.goldFade,
        },
        {
            id: '2',
            name: 'Saved Services',
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
        'Search for Bathroom Cleaning...',
        'Search for Sofa Cleaning...',
        'Search for AC Service...',
        'Search for Deep Cleaning...',
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

        const interval = setInterval(() => {
            if (offers.length > 0) {
                setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
            }
        }, 4000);

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
            clearInterval(interval);
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

    const handleQuickAction = (item) => {
    switch (item.name) {
        case 'My Bookings':
            navigation.navigate('MyBookingsScreen');
            break;

        case 'Saved Services':
            navigation.navigate('SavedServices');
            break;

        case 'My Account':
            navigation.navigate('MyAccount');
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
                                <View style={styles.sidebarHeader}>
                                    <View style={styles.sidebarAvatarContainer}>
                                       
                                        <Image
                                            source={userData.avatar}
                                            style={styles.sidebarAvatar}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.sidebarStatus} />
                                    </View>
                                    <Text style={styles.sidebarName}>{userData.name}</Text>
                                    <Text style={styles.sidebarEmail}>{userData.email}</Text>
                                </View>

                                <View style={styles.sidebarMenu}>
                                    {['Dashboard', 'My Bookings', 'Saved Services', 'Profile Settings', 'Refer & Earn', 'Help & Support'].map((item, index) => (
                                        <TouchableOpacity key={index} style={styles.sidebarMenuItem}>
                                            <View style={styles.sidebarMenuIcon}>
                                                <Image
                                                    source={tabIcons[index]}
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        resizeMode: 'contain',
                                                        tintColor: COLORS.gold, // Remove if your PNGs are already colored
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
                                    <TouchableOpacity style={[styles.sidebarMenuItem, styles.sidebarLogout]}>
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
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.modalServiceItem}>
                                        <View style={[styles.modalServiceIcon, { backgroundColor: item.color + '15' }]}>
                                            <Image
                                                source={item.icon}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    resizeMode: 'contain',
                                                    tintColor: item.color, // Remove this if your PNGs are already colored
                                                }}
                                            />
                                        </View>
                                        <Text style={styles.modalServiceName}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
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
        <View style={styles.offerCard}>
            <Image
                source={item.image}
                style={styles.offerImage}
                resizeMode="cover"
            />
            <View style={styles.offerOverlay}>
                <View style={styles.offerDiscountBadge}>
                    <Text style={styles.offerDiscountText}>{item.discount}</Text>
                    <Text style={styles.offerDiscountLabel}>OFF</Text>
                </View>
                <View style={styles.offerContent}>
                    <Text style={styles.offerTitle}>{item.title}</Text>
                    <Text style={styles.offerDescription}>{item.description}</Text>
                    <View style={styles.offerFooter}>
                        <View style={styles.offerValidity}>

                            <Image
                                source={require('../../asset/time-outline.png')} // Update the path as needed
                                style={{
                                    width: 14,
                                    height: 14,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white,



                                }}
                            />
                            <Text style={styles.offerValidityText}>Valid till {item.validTill}</Text>
                        </View>
                        <TouchableOpacity style={styles.bookNowButton}>
                            <Text style={styles.bookNowText}>Book Now</Text>

                            <Image
                                source={require('../../asset/right-arrow.png')} // Update the path as needed
                                style={{
                                    width: 14,
                                    height: 14,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white,



                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPopularService = ({ item }) => (
        <TouchableOpacity style={styles.popularServiceCard}>


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
                            tintColor: COLORS.orange,



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
        <TouchableOpacity style={styles.onTheSpotCard}>

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
                            tintColor: COLORS.white,



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
                        <TouchableOpacity style={styles.onTheSpotBookButton}>
                            <Text style={styles.onTheSpotBookText}>Book Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderRebookService = ({ item }) => (
        <TouchableOpacity style={styles.rebookCard}>


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
                <TouchableOpacity style={styles.rebookButton}>
                    <Text style={styles.rebookButtonText}>Rebook Now</Text>

                    <Image
                        source={require('../../asset/refresh.png')} // Update the path as needed
                        style={{
                            width: 16,
                            height: 16,
                            resizeMode: 'contain',
                            tintColor: COLORS.white,



                        }}
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderThoughtfulCreation = ({ item, index }) => (
        <TouchableOpacity style={styles.thoughtfulCard}>
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
                            tintColor: COLORS.white,



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
                                tintColor: COLORS.white,



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
                        <Text style={styles.headerName}>{userData.name}</Text>
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
                                ref={offersFlatListRef}
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

                        <FlatList
                            data={popularServices}
                            renderItem={renderPopularService}
                            keyExtractor={(item) => item.id}
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
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>⚡ On the Spot</Text>

                        </View>
                        <FlatList
                            data={onTheSpotServices}
                            renderItem={renderOnTheSpotService}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.onTheSpotList}
                        />

                        {/* Rebook Services */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>🔄 Rebook Services</Text>
                            <Text style={styles.viewAllText}>View All</Text>
                        </View>
                        <FlatList
                            data={rebookServices}
                            renderItem={renderRebookService}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.rebookList}
                        />

                        {/* Thoughtful Creation */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>💡 Thoughtful Creation</Text>
                            <Text style={styles.viewAllText}>View All</Text>
                        </View>
                        <View style={styles.thoughtfulContainer}>
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
                        </View>

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
                                            tintColor: COLORS.white,



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
                                                tintColor: COLORS.white,



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
                                        tintColor: COLORS.white,



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
            {renderAllServicesModal()}

            {/* Sidebar */}
            {renderSidebar()}
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
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
        color: '#666666',
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
        borderColor: '#E8E3D8',
        shadowColor: 'rgba(201, 168, 76, 0.08)',
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
        height: 200,
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
        backgroundColor: '#C9A84C',
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
        color: '#FFFFFF',
    },
    offerDiscountLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
        opacity: 0.8,
    },
    offerContent: {
        justifyContent: 'flex-end',
    },
    offerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
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
    offerValidityText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
    },
    bookNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#C9A84C',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    bookNowText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
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
        backgroundColor: '#D4D4D4',
    },
    offerDotActive: {
        backgroundColor: '#C9A84C',
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
        color: '#666666',
        marginTop: 2,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#C9A84C',
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
        borderColor: '#F0EDE8',
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
        color: '#666666',
    },
    popularServiceBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    popularServicePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#C9A84C',
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
        borderColor: '#F0EDE8',
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
        backgroundColor: '#C9A84C',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    onTheSpotBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    onTheSpotContent: {
        justifyContent: 'flex-end',
    },
    onTheSpotName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
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
        color: '#FFFFFF',
    },
    onTheSpotRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    onTheSpotRatingText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    onTheSpotBookButton: {
        backgroundColor: '#C9A84C',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    onTheSpotBookText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
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
        borderColor: '#F0EDE8',
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
        color: '#666666',
        marginTop: 2,
    },
    rebookDate: {
        fontSize: 10,
        color: '#999999',
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
        color: '#C9A84C',
    },
    rebookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#C9A84C',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    rebookButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
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
        backgroundColor: 'rgba(201, 168, 76, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    thoughtfulBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    thoughtfulContent: {
        justifyContent: 'flex-end',
    },
    thoughtfulTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
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
        backgroundColor: '#C9A84C',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    thoughtfulButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
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
        backgroundColor: '#D4D4D4',
    },
    thoughtfulDotActive: {
        backgroundColor: '#C9A84C',
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
        borderColor: '#F0EDE8',
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
        backgroundColor: '#C9A84C',
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
        marginBottom: 24,
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
        fontSize: 20,
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
    footerTextContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0EDE8',
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
        color: '#666666',
        textAlign: 'center',
        marginTop: 8,
    },
    footerDivider: {
        width: 40,
        height: 2,
        backgroundColor: '#C9A84C',
        marginVertical: 12,
    },
    footerVersion: {
        fontSize: 11,
        color: '#999999',
    },
    // Modal Styles - Bottom Sheet
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#E0E0E0',
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
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
    },
    modalGrid: {
        paddingBottom: 16,
    },
    modalServiceItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    modalServiceIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    modalServiceName: {
        fontSize: 11,
        color: '#1A1A1A',
        textAlign: 'center',
        fontWeight: '500',
    },
    modalCloseButton: {
        backgroundColor: '#F8F6F0',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
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
        backgroundColor: '#FFFFFF',
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
        borderBottomColor: '#F0EDE8',
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
        borderColor: '#FFFFFF',
    },
    sidebarName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    sidebarEmail: {
        fontSize: 13,
        color: '#666666',
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
        borderBottomColor: '#F5F5F5',
    },
    sidebarMenuIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F8F6F0',
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
        borderTopColor: '#F5F5F5',
        paddingTop: 16,
    },
    sidebarFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0EDE8',
        alignItems: 'center',
    },
    sidebarVersion: {
        fontSize: 11,
        color: '#999999',
    },
});

export default DashboardScreen;