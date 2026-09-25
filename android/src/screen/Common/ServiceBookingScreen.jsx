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
    Modal,
    TouchableWithoutFeedback,
    Linking,
    Share
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../util/API';
import Loader from '../../util/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';



const { width, height } = Dimensions.get('window');

const ServiceBookingScreen = ({ navigation, route }) => {
    // States
    const [selectedServices, setSelectedServices] = useState([]);
    const [savedServices, setSavedServices] = useState([]);
    const [showChildModal, setShowChildModal] = useState(false);
    const [currentChildService, setCurrentChildService] = useState(null);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [showCart, setShowCart] = useState(false);


    const [serviceData, setServiceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRateChart, setShowRateChart] = useState(false);

    const { serviceId, customername, customemob } = route.params || {};

    console.log('Service ID:', serviceId);
    console.log('Customer Name:', customername);
    console.log('Customer Mob:', customemob);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const cartSlideAnim = useRef(new Animated.Value(height)).current;
    const heartAnim = useRef(new Animated.Value(1)).current;

    const COLORS = {
        gold: '#d6bceb',
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
        heart: '#FF4757',
        txtColor: '#403746',
    };

    // Sample Service Data
    // const serviceData = {
    //     id: '1',
    //     name: 'House Maid',
    //     tagline: '✨ A spotless home, just a tap away',
    //     coverImage: require('../../asset/housemaid.png'),
    //     rating: 4.9,
    //     totalReviews: 1240,
    //     bookingCount: 15420,
    //     price: '₹499',
    //     whatIsCovered: ['House Cleaning', 'Dusting of all surfaces', 'Sweeping & Floor Mopping', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Bedroom Cleaning', 'Utensil Washing', 'Laundry & Clothes Folding', 'Cobweb Removal', 'Waste Disposal',],
    //     ourProcess: [
    //         {
    //             step: '1',
    //             title: 'Plan the Work',
    //             description: 'Our expert team plans the cleaning process based on your requirements',
    //             image: require('../../asset/planned.png'),
    //         },
    //         {
    //             step: '2',
    //             title: 'Start Cleaning',
    //             description: 'Professional cleaning with eco-friendly products and advanced equipment',
    //             image: require('../../asset/start.png'),
    //         },
    //         {
    //             step: '3',
    //             title: 'Final Checks',
    //             description: 'Thorough quality check to ensure 100% satisfaction',
    //             image: require('../../asset/final-check.png'),
    //         },
    //     ],
    //     images: [
    //         'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    //         'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
    //         'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
    //         'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    //     ],
    //     childServices: [
    //         { id: 'c2', name: 'House Maid', price: '₹399', coverImage: require('../../asset/housemaid.png'), description: 'Reliable house maid service for everyday household chores, cleaning, and maintaining a neat and comfortable home.', whatIsCovered: ['General House Cleaning', 'Dusting & Sweeping', 'Floor Mopping', 'Kitchen Cleaning', 'Bathroom Cleaning', 'Utensil Washing'], duration: '3 hours', },


    //     ],
    //     faqs: [
    //         {
    //             id: '1',
    //             question: 'What is included in deep cleaning?',
    //             answer: 'Deep cleaning includes thorough cleaning of all surfaces, dusting, mopping, kitchen degreasing, bathroom sanitization, and waste disposal.',
    //         },
    //         {
    //             id: '2',
    //             question: 'How long does the service take?',
    //             answer: 'The service typically takes 3-4 hours depending on the size of your home and the services selected.',
    //         },
    //         {
    //             id: '3',
    //             question: 'Do I need to be present during the service?',
    //             answer: 'Yes, we recommend being present to provide access and ensure you are satisfied with the service.',
    //         },
    //         {
    //             id: '4',
    //             question: 'What products do you use?',
    //             answer: 'We use eco-friendly and safe cleaning products that are effective and gentle on surfaces.',
    //         },
    //     ],
    //     reviews: [
    //         {
    //             id: '1',
    //             customer: 'Priya Sharma',
    //             rating: 5,
    //             date: '15 Jan 2027',
    //             comment: 'Excellent service! My home has never been cleaner. Very professional team.',
    //         },
    //         {
    //             id: '2',
    //             customer: 'Amit Patel',
    //             rating: 5,
    //             date: '10 Jan 2027',
    //             comment: 'Great job! They were punctual and thorough. Highly recommend this service.',
    //         },
    //         {
    //             id: '3',
    //             customer: 'Sunita Reddy',
    //             rating: 4,
    //             date: '5 Jan 2027',
    //             comment: 'Good service overall. A few minor issues but they fixed it quickly.',
    //         },
    //     ],
    // };

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
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


    useEffect(() => {
        fetchServiceDetails();
    }, [serviceId]);

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



    const fetchServiceDetails = async () => {
        try {
            if (!serviceId) {
                Alert.alert('Error', 'Service ID not found.');
                return;
            }

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                return;
            }

            setIsLoading(true);

            const response = await axios.get(
                `${API.CUSTOMER_SERVICE_DETAILS}/${serviceId}`,
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('SERVICE DETAILS:', response.data);

            const data = response.data;

            if (!data) {
                Alert.alert('Error', 'Service details not found.');
                return;
            }

            const activePricing = Array.isArray(data.pricing)
                ? data.pricing.filter(item => item.isActive)
                : [];

            const hourlyPricing = activePricing.find(
                item => item.pricingType === 1
            );

            const childServices = hourlyPricing
                ? [
                    {
                        id: data.serviceId,
                        name: data.serviceName,
                        price: `₹${hourlyPricing.price}`,
                        coverImage: {
                            uri: data.imageUrl,
                        },
                        description:
                            hourlyPricing.pricingDescription ||
                            data.workProfile ||
                            data.serviceName,

                        whatIsCovered: Array.isArray(data.included)
                            ? data.included.map(
                                item => item.includedService
                            )
                            : [],

                        duration: '1 hour',
                    },
                ]
                : [
                    {
                        id: data.serviceId,
                        name: data.serviceName,
                        price: 'Price unavailable',
                        coverImage: {
                            uri: data.imageUrl,
                        },
                        description: data.workProfile || data.serviceName,
                        whatIsCovered: Array.isArray(data.included)
                            ? data.included.map(
                                item => item.includedService
                            )
                            : [],
                        duration: '',
                    },
                ];

            // const formattedService = {
            //     id: data.serviceId,
            //     name: data.serviceName,
            //     categoryName: data.categoryName,

            //     tagline: data.workProfile
            //         ? `✨ ${data.workProfile}`
            //         : `✨ ${data.serviceName}`,

            //     coverImage: {
            //         uri: data.imageUrl,
            //     },

            //     rating: 0,
            //     totalReviews: 0,
            //     bookingCount: 0,

            //     price:
            //         activePricing.length > 0
            //             ? `₹${Math.min(
            //                 ...activePricing.map(
            //                     item => Number(item.price) || 0
            //                 )
            //             )}`
            //             : 'Price unavailable',

            //     whatIsCovered: Array.isArray(data.included)
            //         ? data.included.map(
            //             item => item.includedService
            //         )
            //         : [],

            //     ourProcess: Array.isArray(data.processSteps)
            //         ? [...data.processSteps]
            //             .sort((a, b) => a.ordinal - b.ordinal)
            //             .map(item => ({
            //                 step: String(item.ordinal),
            //                 title: item.header,
            //                 description: item.description,
            //                 image: item.imageUrl,
            //             }))
            //         : [],

            //     images: Array.isArray(data.galaries)
            //         ? data.galaries
            //             .map(item => item.imageUrl)
            //             .filter(Boolean)
            //         : [],

            //     childServices,

            //     faqs: Array.isArray(data.faQs)
            //         ? [...data.faQs]
            //             .sort((a, b) => a.ordinal - b.ordinal)
            //             .map((item, index) => ({
            //                 id: String(item.ordinal || index + 1),
            //                 question: item.question,
            //                 answer: item.answer,
            //             }))
            //         : [],

            //     reviews: [],
            // };


            const formattedService = {
                id: data.serviceId,
                name: data.serviceName,
                categoryName: data.categoryName,

                tagline: data.workProfile
                    ? `✨ ${data.workProfile}`
                    : `✨ ${data.serviceName}`,

                coverImage: {
                    uri: data.imageUrl,
                },

                rating: 0,
                totalReviews: 0,
                bookingCount: 0,

                price:
                    activePricing.length > 0
                        ? `₹${Math.min(
                            ...activePricing.map(
                                item => Number(item.price) || 0
                            )
                        )}`
                        : 'Price unavailable',

                // IMPORTANT
                pricing: activePricing,

                whatIsCovered: Array.isArray(data.included)
                    ? data.included.map(
                        item => item.includedService
                    )
                    : [],

                ourProcess: Array.isArray(data.processSteps)
                    ? [...data.processSteps]
                        .sort((a, b) => a.ordinal - b.ordinal)
                        .map(item => ({
                            step: String(item.ordinal),
                            title: item.header,
                            description: item.description,
                            image: item.imageUrl,
                        }))
                    : [],

                images: Array.isArray(data.galaries)
                    ? data.galaries
                        .map(item => item.imageUrl)
                        .filter(Boolean)
                    : [],

                childServices,

                faqs: Array.isArray(data.faQs)
                    ? [...data.faQs]
                        .sort((a, b) => a.ordinal - b.ordinal)
                        .map((item, index) => ({
                            id: String(item.ordinal || index + 1),
                            question: item.question,
                            answer: item.answer,
                        }))
                    : [],

                reviews: [],
            };
            setServiceData(formattedService);

        } catch (error) {
            console.log('SERVICE DETAILS ERROR:', error);
            console.log(
                'ERROR RESPONSE:',
                error?.response?.data
            );

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to load service details.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const animateModalIn = (animRef) => {
        animRef.setValue(height);
        Animated.spring(animRef, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const animateModalOut = (animRef, callback) => {
        Animated.timing(animRef, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (callback) callback();
        });
    };

    const animateHeart = () => {
        Animated.sequence([
            Animated.timing(heartAnim, {
                toValue: 1.5,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(heartAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const toggleSaveService = (serviceId) => {
        if (savedServices.includes(serviceId)) {
            setSavedServices(savedServices.filter(id => id !== serviceId));
        } else {
            setSavedServices([...savedServices, serviceId]);
            animateHeart();
            Alert.alert('Saved!', 'Service added to your saved list ❤️');
        }
    };

    const openChildModal = (childService) => {
        setCurrentChildService(childService);
        setShowChildModal(true);
        setTimeout(() => animateModalIn(modalSlideAnim), 100);
    };

    const closeChildModal = () => {
        animateModalOut(modalSlideAnim, () => {
            setShowChildModal(false);
            setCurrentChildService(null);
        });
    };

    const openCart = () => {
        setShowCart(true);
        setTimeout(() => animateModalIn(cartSlideAnim), 100);
    };

    const closeCart = () => {
        animateModalOut(cartSlideAnim, () => {
            setShowCart(false);
        });
    };

    const addToCart = async (service) => {
        const exists = selectedServices.some(
            item => String(item.id) === String(service.id)
        );

        if (exists) {
            return;
        }

        const updatedCart = [
            ...selectedServices,
            service,
        ];

        setSelectedServices(updatedCart);

        try {
            await AsyncStorage.setItem(
                'selectedServices',
                JSON.stringify(updatedCart)
            );
        } catch (error) {
            console.log('Save Cart Error:', error);
        }
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
            closeCart();
        }
    };

    const isServiceSelected = (serviceName) => {
        return selectedServices.some(
            item =>
                item.name?.trim().toLowerCase() ===
                serviceName?.trim().toLowerCase()
        );
    };

    const isServiceSaved = (serviceId) => {
        return savedServices.includes(serviceId);
    };

    const handleShare = async () => {
        try {
            const serviceName = serviceData?.name || 'Home Service';

            // Get hourly pricing
            const hourlyPricing = serviceData?.pricing?.find(
                item =>
                    Number(item.pricingType) === 1 &&
                    (
                        item.isActive === true ||
                        item.isActive === 'true' ||
                        item.isActive === 1
                    )
            );

            const hourlyPrice = hourlyPricing?.price
                ? `₹${hourlyPricing.price}`
                : 'Price available in app';

            // Your actual Play Store link
            const appLink =
                'https://play.google.com/store/apps/details?id=com.yourapp';

            const message =
                `🏠 ${serviceName}\n\n` +
                `✨ Professional home service at your convenience.\n\n` +
                `💰 Hourly Price: ${hourlyPrice}\n\n` +
                `📱 Book this service from our app:\n` +
                `${appLink}\n\n` +
                `Download the app and book your service today!`;

            await Share.share({
                message: message,
                title: `Share ${serviceName}`,
            });

        } catch (error) {
            console.log('Share Error:', error);
        }
    };

    const getTotalPrice = () => {
        const total = selectedServices.reduce((sum, item) => {
            const price = parseInt(item.price.replace('₹', ''));
            return sum + price;
        }, 0);
        return `₹${total}`;
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

    const renderServiceImage = ({ item }) => (
        <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />
    );


    //     const isAdded = isServiceSelected(item.id);
    //     const isSaved = isServiceSaved(item.id);
    //     return (
    //         <TouchableOpacity
    //             style={styles.childServiceCard}
    //             onPress={() => openChildModal(item)}
    //             activeOpacity={0.8}
    //         >
    //             <Image source={item.coverImage} style={styles.childServiceImage} />
    //             <View style={styles.childServiceInfo}>
    //                 <View style={styles.childServiceHeaderRow}>
    //                     <Text style={styles.childServiceName}>{item.name}</Text>
    //                     <TouchableOpacity
    //                         style={styles.heartButtonInline}
    //                         onPress={() => toggleSaveService(item.id)}
    //                     >
    //                         <Animated.View style={{ transform: [{ scale: isSaved ? heartAnim : 1 }] }}>
    //                             <Image
    //                                 source={
    //                                     isSaved
    //                                         ? require('../../asset/like.png')
    //                                         : require('../../asset/heart.png')
    //                                 }
    //                                 style={{
    //                                     width: 18,
    //                                     height: 18,
    //                                     resizeMode: 'contain',
    //                                     tintColor: isSaved ? COLORS.heart : COLORS.textLight, // Remove if your PNGs are already colored
    //                                 }}
    //                             />
    //                         </Animated.View>
    //                     </TouchableOpacity>
    //                 </View>
    //                 <Text style={styles.childServicePrice}>{item.price}</Text>

    //             </View>
    //             <TouchableOpacity
    //                 style={[styles.actionButton, isAdded && styles.actionButtonAdded]}
    //                 onPress={() => isAdded ? removeFromCart(item.id) : openChildModal(item)}
    //             >
    //                 <Image
    //                     source={
    //                         isAdded
    //                             ? require('../../asset/minus.png')
    //                             : require('../../asset/plus.png')
    //                     }
    //                     style={{
    //                         width: 20,
    //                         height: 20,
    //                         resizeMode: 'contain',
    //                         tintColor: COLORS.white, // Remove if your PNGs are already white
    //                     }}
    //                 />
    //             </TouchableOpacity>
    //         </TouchableOpacity>
    //     );
    // };
    const renderChildService = ({ item }) => {

        // Check whether this service is already in cart
        const isAdded = isServiceSelected(item.name);

        // Check whether this service is saved/favourite
        const isSaved = isServiceSaved(item.id);

        return (
            <View style={styles.childServiceCard}>

                <Image
                    source={item.coverImage}
                    style={styles.childServiceImage}
                />

                <View style={styles.childServiceInfo}>

                    <View style={styles.childServiceHeaderRow}>

                        <Text style={styles.childServiceName}>
                            {item.name}
                        </Text>

                        <TouchableOpacity
                            style={styles.heartButtonInline}
                            onPress={() => toggleSaveService(item.id)}
                        >
                            {/* heart code */}
                        </TouchableOpacity>

                    </View>

                    <Text style={styles.childServicePrice}>
                        {item.price}
                        <Text style={styles.childServicePerHour}>
                            {' / hour'}
                        </Text>
                    </Text>

                    <TouchableOpacity
                        style={styles.rateChartButton}
                        onPress={() => setShowRateChart(true)}
                    >
                        <Text style={styles.rateChartButtonText}>
                            Rate Chart
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* PLUS / MINUS */}
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        isAdded && styles.actionButtonAdded,
                    ]}
                    onPress={() =>
                        isAdded
                            ? removeFromCart(item.name)
                            : addToCart(item)
                    }
                >
                    <Image
                        source={
                            isAdded
                                ? require('../../asset/minus.png')
                                : require('../../asset/plus.png')
                        }
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.white,
                        }}
                    />
                </TouchableOpacity>

            </View>
        );
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
                        width: 16,
                        height: 16,
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

    // Our Process Renderer with Images
    const renderProcessItem = ({ item, index }) => (
        <View style={styles.processCard}>
            <View style={styles.processImageContainer}>
                <Image source={{ uri: item.image }} style={styles.processImage} />
                <View style={styles.processStepBadge}>
                    <Text style={styles.processStepBadgeText}>{item.step}</Text>
                </View>
            </View>
            <View style={styles.processContent}>
                <Text style={styles.processTitle}>{item.title}</Text>
                <Text style={styles.processDescription}>{item.description}</Text>
            </View>
            {index < serviceData.ourProcess.length - 1 && (
                <View style={styles.processArrow}>

                    <Image
                        source={require('../../asset/arrow-down.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold


                        }}
                    />
                </View>
            )}
        </View>
    );


    const getPricingLabel = (item) => {
        switch (Number(item.pricingType)) {
            case 1:
                return 'Hourly';

            case 2:
                return '4 Hours';

            case 3:
                return '8 Hours';

            case 4:
                return 'Monthly';

            case 5:
                return 'Project Based';

            default:
                return item.durationHours
                    ? `${item.durationHours} Hours`
                    : 'Other';
        }
    };

    const renderRateChartModal = () => (
        <Modal
            transparent
            visible={showRateChart}
            animationType="fade"
            onRequestClose={() => setShowRateChart(false)}
        >
            <TouchableWithoutFeedback
                onPress={() => setShowRateChart(false)}
            >
                <View style={styles.rateChartOverlay}>

                    <TouchableWithoutFeedback>
                        <View style={styles.rateChartModal}>

                            {/* Header */}
                            <View style={styles.rateChartHeader}>
                                <View>
                                    <Text style={styles.rateChartTitle}>
                                        Rate Chart
                                    </Text>

                                    <Text style={styles.rateChartServiceName}>
                                        {serviceData?.name}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setShowRateChart(false)}
                                    style={styles.rateChartCloseButton}
                                >
                                    <Image
                                        source={require('../../asset/close.png')}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            resizeMode: 'contain',
                                            tintColor: '#666666',
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Pricing */}
                            <View style={styles.rateChartList}>
                                {Array.isArray(serviceData?.pricing) &&
                                    serviceData.pricing
                                        .filter(item => item.isActive)
                                        .map((item, index) => (
                                            <View
                                                key={`${item.pricingType}-${index}`}
                                                style={styles.rateChartRow}
                                            >
                                                <View style={styles.rateChartDuration}>
                                                    <Text style={styles.rateChartDurationText}>
                                                        {getPricingLabel(item)}
                                                    </Text>
                                                </View>

                                                <View style={styles.rateChartPriceContainer}>
                                                    <Text style={styles.rateChartPrice}>
                                                        ₹{item.price}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))
                                }
                            </View>

                            <TouchableOpacity
                                style={styles.rateChartDoneButton}
                                onPress={() => setShowRateChart(false)}
                            >
                                <Text style={styles.rateChartDoneText}>
                                    Close
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>

                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Child Service Modal
    const renderChildModal = () => (
        <Modal
            transparent={true}
            visible={showChildModal}
            animationType="none"
            onRequestClose={closeChildModal}
        >
            <TouchableWithoutFeedback onPress={closeChildModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { transform: [{ translateY: modalSlideAnim }] }
                            ]}
                        >
                            <View style={styles.modalHandle} />

                            {currentChildService && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Image source={currentChildService.coverImage} style={styles.modalCoverImage} />

                                    <View style={styles.modalBody}>
                                        <View style={styles.modalHeaderRow}>
                                            <Text style={styles.modalServiceName}>{currentChildService.name}</Text>
                                            <TouchableOpacity
                                                style={styles.modalHeartButton}
                                                onPress={() => toggleSaveService(currentChildService.id)}
                                            >
                                                <Animated.View style={{ transform: [{ scale: isServiceSaved(currentChildService.id) ? heartAnim : 1 }] }}>
                                                    <Image
                                                        source={
                                                            isServiceSaved(currentChildService.id)
                                                                ? require('../../asset/like.png')
                                                                : require('../../asset/heart.png')
                                                        }
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            resizeMode: 'contain',
                                                            tintColor: isServiceSaved(currentChildService.id)
                                                                ? COLORS.heart
                                                                : COLORS.textLight, // Remove if your PNGs are already colored
                                                        }}
                                                    />
                                                </Animated.View>
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={styles.modalServicePrice}>{currentChildService.price}</Text>
                                        <Text style={styles.modalServiceDescription}>{currentChildService.description}</Text>




                                        {/* What's Included */}
                                        <View style={styles.sectionContainer}>

                                            <View style={styles.sectionHeader}>
                                                <Text style={styles.sectionTitle}>
                                                    ✅ What's Included
                                                </Text>

                                                <Text style={styles.sectionSubtitle}>
                                                    Everything we cover in this service
                                                </Text>
                                            </View>

                                            <View style={styles.includedList}>
                                                {serviceData.whatIsCovered.map((item, index) => {

                                                    const parts = item.split('–');

                                                    const title = parts[0]?.trim();

                                                    const description = parts
                                                        .slice(1)
                                                        .join('–')
                                                        .trim();

                                                    return (
                                                        <View
                                                            key={index}
                                                            style={styles.includedCard}
                                                        >

                                                            {/* Check Icon */}
                                                            <View style={styles.includedCheck}>
                                                                <Text style={styles.includedCheckText}>
                                                                    ✓
                                                                </Text>
                                                            </View>

                                                            {/* Content */}
                                                            <View style={styles.includedContent}>

                                                                <Text style={styles.includedText}>

                                                                    {/* Bold title */}
                                                                    <Text style={styles.includedBold}>
                                                                        {title}
                                                                    </Text>

                                                                    {/* Normal description */}
                                                                    {description ? (
                                                                        <Text style={styles.includedNormal}>
                                                                            {' – '}{description}
                                                                        </Text>
                                                                    ) : null}

                                                                </Text>

                                                            </View>

                                                        </View>
                                                    );
                                                })}
                                            </View>

                                        </View>


                                        <TouchableOpacity
                                            style={[styles.modalAddButton, isServiceSelected(currentChildService.id) && styles.modalAddButtonAdded]}
                                            onPress={() => {
                                                if (isServiceSelected(currentChildService.id)) {
                                                    removeFromCart(currentChildService.id);
                                                    closeChildModal();
                                                } else {
                                                    addToCart(currentChildService);
                                                }
                                            }}
                                        >
                                            <Text style={styles.modalAddButtonText}>
                                                {isServiceSelected(currentChildService.id) ? 'Remove Service' : 'Add to Cart'}
                                            </Text>
                                            <Image
                                                source={
                                                    isServiceSelected(currentChildService.id)
                                                        ? require('../../asset/close.png')
                                                        : require('../../asset/arrow-forward.png')
                                                }
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    resizeMode: 'contain',
                                                    tintColor: COLORS.white, // Remove if your PNGs are already white
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            )}

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeChildModal}>
                                <Text style={styles.modalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
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
                                { transform: [{ translateY: cartSlideAnim }] }
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
                                            selectedServices: selectedServices,
                                            customername : customername,
                                            customemob : customemob
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

    if (isLoading || !serviceData) {
        return (
            <View style={styles.container}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />

                <Loader />
            </View>
        );
    }

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
                {/* Cover Image with Back & Share Icons */}
                <View style={styles.coverContainer}>
                    <Image source={serviceData.coverImage} style={styles.coverImage} />
                    <View style={styles.coverGradient} />



                    <View style={styles.iconOverlay}>
                        <TouchableOpacity
                            style={styles.iconButton}
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
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleShare}
                        >

                            <Image
                                source={require('../../asset/share.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    {(
                        Number(serviceData?.rating) > 0 ||
                        Number(serviceData?.bookingCount) > 0
                    ) && (
                            <View style={styles.coverBadge}>
                                {Number(serviceData?.rating) > 0 && (
                                    <View style={styles.coverBadgeItem}>
                                        <Text style={styles.coverBadgeIcon}>⭐</Text>

                                        <Text style={styles.coverBadgeText}>
                                            {serviceData.rating}
                                        </Text>
                                    </View>
                                )}

                                {Number(serviceData?.rating) > 0 &&
                                    Number(serviceData?.bookingCount) > 0 && (
                                        <View style={styles.coverBadgeDivider} />
                                    )}

                                {Number(serviceData?.bookingCount) > 0 && (
                                    <View style={styles.coverBadgeItem}>
                                        <Text style={styles.coverBadgeText}>
                                            {serviceData.bookingCount} bookings
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                </View>

                {/* Service Header Info */}
                <View style={styles.infoContainer}>

                    <Text style={styles.serviceName}>{serviceData.name}</Text>
                    <Text style={styles.serviceTagline}>{serviceData.tagline}</Text>
                    {serviceData?.totalReviews > 0 && (
                        <View style={styles.ratingRow}>
                            <View style={styles.ratingStars}>{renderStars(serviceData.rating)}</View>
                            <Text style={styles.ratingText}>{serviceData.rating}</Text>
                            <Text style={styles.ratingCount}>({serviceData.totalReviews} reviews)</Text>
                        </View>
                    )}

                </View>

                {/* Services Section */}
                <View style={styles.servicesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🛋️ Choose Your Services</Text>
                        <Text style={styles.sectionSubtitle}>Select the services you need</Text>
                    </View>
                    <FlatList
                        data={serviceData.childServices}
                        renderItem={renderChildService}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                    />
                </View>

                {/* What's Covered */}
                <View style={styles.sectionContainer}>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            ✅ What's Included
                        </Text>

                        <Text style={styles.sectionSubtitle}>
                            Everything we cover in this service
                        </Text>
                    </View>

                    <View style={styles.includedList}>
                        {serviceData.whatIsCovered.map((item, index) => {

                            const parts = item.split('–');

                            const title = parts[0]?.trim();

                            const description = parts
                                .slice(1)
                                .join('–')
                                .trim();

                            return (
                                <View
                                    key={index}
                                    style={styles.includedCard}
                                >

                                    {/* Check Icon */}
                                    <View style={styles.includedCheck}>
                                        <Text style={styles.includedCheckText}>
                                            ✓
                                        </Text>
                                    </View>

                                    {/* Content */}
                                    <View style={styles.includedContent}>

                                        <Text style={styles.includedText}>

                                            {/* Bold title */}
                                            <Text style={styles.includedBold}>
                                                {title}
                                            </Text>

                                            {/* Normal description */}
                                            {description ? (
                                                <Text style={styles.includedNormal}>
                                                    {' – '}{description}
                                                </Text>
                                            ) : null}

                                        </Text>

                                    </View>

                                </View>
                            );
                        })}
                    </View>

                </View>


                {/* Our Process - Updated with Images */}
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
                                        <Image source={{ uri: item.image }} style={styles.processImage} />
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

                {/* Gallery */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📸 Gallery</Text>
                        <Text style={styles.sectionSubtitle}>See our work in action</Text>
                    </View>
                    <FlatList
                        data={serviceData.images}
                        renderItem={renderServiceImage}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.galleryList}
                    />
                </View>

                {/* Reviews */}
                {Array.isArray(serviceData?.reviews) &&
                    serviceData.reviews.length > 0 && (
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
                            {(showAllReviews ? serviceData.reviews : serviceData.reviews.slice(0, 2)).map(renderReview)}
                        </View>
                    )}

                {/* FAQs */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>
                        <Text style={styles.sectionSubtitle}>Quick answers to common questions</Text>
                    </View>
                    {serviceData.faqs.map(renderFaqItem)}
                </View>
            </Animated.ScrollView>

            {/* Cart Button */}
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

            {/* Child Service Modal */}
            {renderChildModal()}

            {/* Cart Modal */}
            {renderCartModal()}

            {renderRateChartModal()}
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
        paddingBottom: 100,
    },
    // Cover Image
    coverContainer: {
        position: 'relative',
        height: 240,
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
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    iconOverlay: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverBadge: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    coverBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
    },

    coverBadgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    coverBadgeIcon: {
        fontSize: 13,
        marginRight: 4,
    },

    coverBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    coverBadgeDivider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: 8,
    },
    // Info Container
    infoContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    serviceTagline: {
        fontSize: 13,
        color: '#C9A84C',
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    serviceName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    servicePrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#403746',
    },
    pricePerService: {
        fontSize: 13,
        color: '#666666',
        marginLeft: 4,
    },
    // Section Styles
    servicesSection: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    sectionContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    sectionHeader: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#999999',
        marginTop: 2,
    },
    // Child Services
    childServiceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    childServiceImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    childServiceInfo: {
        flex: 1,
        marginLeft: 12,
    },
    childServiceHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childServiceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    heartButtonInline: {
        paddingLeft: 6,
        paddingVertical: 2,
    },
    childServicePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#403746',
        marginTop: 2,
    },
    childServiceDuration: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#403746',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonAdded: {
        backgroundColor: '#C4B0D3',
    },
    // List Items
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    listItemText: {
        fontSize: 14,
        color: '#1A1A1A',
        flex: 1,
    },
    // Our Process - Updated with Images
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
    // Gallery
    galleryList: {
        paddingVertical: 4,
    },
    galleryImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginRight: 10,
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
    // Reviews
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    viewAllText: {
        fontSize: 14,
        color: '#403746',
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
        marginBottom: 6,
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
        backgroundColor: '#403746',
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
    // Cart
    cartButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d6bceb',
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
        color: '#403746',
        marginLeft: 12,
    },
    cartTotalText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#403746',
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
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
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
        borderTopColor: '#F0EDE8',
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
        color: '#403746',
    },
    cartCheckoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#403746',
        paddingVertical: 14,
        borderRadius: 12,
    },
    cartCheckoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        maxHeight: height * 0.9,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalHeartButton: {
        padding: 4,
    },
    modalCoverImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
    },
    modalBody: {
        paddingVertical: 16,
    },
    modalServiceName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        flex: 1,
    },
    modalServicePrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#76577F',
        marginTop: 4,
    },
    modalServiceDuration: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    modalServiceDescription: {
        fontSize: 14,
        color: '#666666',
        marginTop: 8,
        lineHeight: 20,
    },
    modalSection: {
        marginTop: 16,
    },
    modalSectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    modalListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    modalListItemText: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
    modalAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#403746',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
    },
    modalAddButtonAdded: {
        backgroundColor: '#E17055',
    },
    modalAddButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    modalCloseButton: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 8,
    },
    modalCloseText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    selectSlotButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#C9A84C',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 12,
        marginTop: 16,
    },
    selectSlotText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
        marginLeft: 12,
    },
    slotCountBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 8,
    },
    slotCountText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
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

    rateChartButton: {
        alignSelf: 'flex-start',
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#76577F',
        backgroundColor: '#F8F3FA',
    },

    rateChartButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#76577F',
    },

    childServicePerHour: {
        fontSize: 11,
        fontWeight: '500',
        color: '#777777',
    },
    rateChartOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    rateChartModal: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
    },

    rateChartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    rateChartTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    rateChartServiceName: {
        fontSize: 13,
        color: '#777777',
        marginTop: 3,
    },

    rateChartCloseButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    rateChartList: {
        marginTop: 4,
    },

    rateChartRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 8,
        borderRadius: 10,
        backgroundColor: '#F8F6F0',
        borderWidth: 1,
        borderColor: '#EFE9E0',
    },

    rateChartDuration: {
        flex: 1,
    },

    rateChartDurationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#403746',
    },

    rateChartPriceContainer: {
        alignItems: 'flex-end',
    },

    rateChartPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#76577F',
    },

    rateChartDoneButton: {
        backgroundColor: '#76577F',
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 12,
    },

    rateChartDoneText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    includedSection: {
        marginTop: 20,
    },

    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

    sectionIconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F1EAF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    sectionIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D2530',
    },

    includedList: {
        gap: 10,
    },

    includedCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FAF8FB',
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#EEE6F1',
    },

    includedCheck: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#76577F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 1,
    },

    includedCheckText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    includedContent: {
        flex: 1,
    },

    includedText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#55505A',
    },

    includedBold: {
        fontSize: 14,
        fontWeight: '700',
        color: '#302936',
    },

    includedNormal: {
        fontSize: 14,
        fontWeight: '400',
        color: '#66616A',
    },

    includedList: {
        marginTop: 4,
    },

    includedCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 0,
        backgroundColor: '#FFFFFF',
    },

    includedCheck: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 1,
    },

    includedCheckText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },

    includedContent: {
        flex: 1,
        paddingTop: 2,
    },

    includedText: {
        fontSize: 15,
        lineHeight: 21,
        color: '#222222',
    },

    includedBold: {
        fontSize: 15,
        fontWeight: '700',
        color: '#222222',
    },

    includedNormal: {
        fontSize: 15,
        fontWeight: '400',
        color: '#333333',
    },
});

export default ServiceBookingScreen;