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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import axios from 'axios';
import API from '../../util/API';
import Loader from '../../util/Loader';


const { width, height } = Dimensions.get('window');

const SavedServicesScreen = ({ navigation, route }) => {
    // States

    const { customername, customemob } = route.params || {};

    console.log('Customer Name:', customername);
    console.log('Customer Mobile:', customemob);

    const [allServices, setAllServices] = useState([]);
    const [savedServices, setSavedServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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


    useFocusEffect(
        useCallback(() => {
            loadServicesAndSavedServices();
        }, [])
    );



    const loadServicesAndSavedServices = async () => {
        try {
            setIsLoading(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.log('Token not found');
                setAllServices([]);
                setSavedServices([]);
                return;
            }

            const response = await axios.get(
                API.CUSTOMER_SERVICES,
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('SERVICE API RESPONSE:', response.data);

            if (!Array.isArray(response.data)) {
                setAllServices([]);
                setSavedServices([]);
                return;
            }

            const formattedServices = response.data.map((item, index) => ({
                id: item.serviceId,
                name: item.serviceName,
                icon: {
                    uri: item.icon,
                },
                image: {
                    uri: item.imageUrl,
                },
                // color: getServiceColor(index, response.data.length),
            }));

            setAllServices(formattedServices);

            // -----------------------------
            // Load saved service names
            // -----------------------------

            const saved = await AsyncStorage.getItem('savedServices');

            console.log('SAVED SERVICES:', saved);

            if (!saved) {
                setSavedServices([]);
                return;
            }

            const savedNames = JSON.parse(saved);

            if (!Array.isArray(savedNames)) {
                setSavedServices([]);
                return;
            }

            // -----------------------------
            // Match saved names with API
            // -----------------------------

            const matchedServices = formattedServices.filter(service =>
                savedNames.some(
                    savedName =>
                        savedName?.trim().toLowerCase() ===
                        service.name?.trim().toLowerCase()
                )
            );

            console.log('MATCHED SAVED SERVICES:', matchedServices);

            setSavedServices(matchedServices);

        } catch (error) {
            console.log('LOAD SERVICES ERROR:', error);
            console.log('ERROR RESPONSE:', error?.response?.data);

            setAllServices([]);
            setSavedServices([]);

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to load services.'
            );

        } finally {
            setIsLoading(false);
        }
    };






    const removeSavedService = (serviceName) => {
        Alert.alert(
            'Remove Service',
            'Are you sure you want to remove this from saved services?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const saved =
                                await AsyncStorage.getItem('savedServices');

                            const savedNames = saved
                                ? JSON.parse(saved)
                                : [];

                            const updatedNames = savedNames.filter(
                                name =>
                                    name?.trim().toLowerCase() !==
                                    serviceName?.trim().toLowerCase()
                            );

                            await AsyncStorage.setItem(
                                'savedServices',
                                JSON.stringify(updatedNames)
                            );

                            // Immediately remove from screen
                            setSavedServices(prev =>
                                prev.filter(
                                    item =>
                                        item.name?.trim().toLowerCase() !==
                                        serviceName?.trim().toLowerCase()
                                )
                            );

                        } catch (error) {
                            console.log(
                                'REMOVE SAVED SERVICE ERROR:',
                                error
                            );
                        }
                    },
                },
            ]
        );
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

    const renderSavedService = ({ item }) => (
        <View style={styles.serviceCard}>
            <Image source={item.image} style={styles.serviceImage} />
            <TouchableOpacity
                style={styles.heartButton}
                onPress={() => removeSavedService(item.name)}
            >

                <Image
                    source={require('../../asset/like.png')} // Update the path as needed
                    style={{
                        width: 18,
                        height: 18,
                        resizeMode: 'contain',
                        tintColor: COLORS.heart


                    }}
                />
            </TouchableOpacity>
            <View style={styles.serviceContent}>
                <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.serviceRating}>
                    {renderStars(item.rating)}
                    <Text style={styles.serviceRatingText}>{item.rating}</Text>
                </View>
                <Text style={styles.servicePrice}>{item.price}</Text>
                <TouchableOpacity style={styles.bookButton} onPress={() =>
                    navigation.replace('ServiceBookingScreen', {
                        serviceId: item.id,
                        customername,
                        customemob,
                    })
                }>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#d6bceb" />

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
                            tintColor: COLORS.txtColor


                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Services</Text>
                <View style={styles.headerRight} />
            </View>


            {isLoading && (
                <View style={styles.loaderOverlay}>
                    <Loader />
                </View>
            )}

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                {savedServices.length > 0 ? (
                    <FlatList
                        data={savedServices}
                        renderItem={renderSavedService}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={
                            <View style={styles.headerContainer}>
                                <Text style={styles.savedCount}>{savedServices.length} services saved</Text>
                            </View>
                        }
                        columnWrapperStyle={styles.columnWrapper}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>

                            <Image
                                source={require('../../asset/like.png')} // Update the path as needed
                                style={{
                                    width: 64,
                                    height: 64,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight


                                }}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>No Saved Services</Text>
                        <Text style={styles.emptyText}>Start saving your favorite services by tapping the heart icon</Text>
                        <TouchableOpacity style={styles.exploreButton}>
                            <Text style={styles.exploreButtonText}>Explore Services</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
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
        backgroundColor: '#d6bceb',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#403746',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    headerContainer: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    savedCount: {
        fontSize: 14,
        color: '#666666',
    },
    listContent: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    // Service Card - Grid (2 items per row)
    serviceCard: {
        width: (width - 40) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceImage: {
        width: '100%',
        height: 110,
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceContent: {
        padding: 10,
    },
    serviceName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    serviceRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginBottom: 4,
    },
    serviceRatingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#403746',
        marginBottom: 6,
    },
    bookButton: {
        backgroundColor: '#76577F',
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFF',
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8F6F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    exploreButton: {
        backgroundColor: '#C9A84C',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
    },
    exploreButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
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

export default SavedServicesScreen;