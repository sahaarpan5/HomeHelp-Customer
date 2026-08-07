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

const SavedServicesScreen = ({ navigation }) => {
    // States
    const [savedServices, setSavedServices] = useState([
        {
            id: '1',
            name: 'Home Cleaning',
            image:  require('../../asset/heroic.png'),
            rating: 4.9,
            reviews: 1240,
            price: '₹499',
            category: 'Cleaning',
            savedDate: '15 Jan 2027',
        },
       
        {
            id: '3',
            name: 'Sofa Cleaning',
            image: require('../../asset/sofa-clean.png'),
            rating: 4.7,
            reviews: 650,
            price: '₹599',
            category: 'Cleaning',
            savedDate: '10 Jan 2027',
        },
        {
            id: '4',
            name: 'Bathroom Cleaning',
            image: require('../../asset/bathroom-clean.png'),
            rating: 4.6,
            reviews: 520,
            price: '₹349',
            category: 'Cleaning',
            savedDate: '8 Jan 2027',
        },
        {
            id: '5',
            name: 'Kitchen Cleaning',
            image: require('../../asset/kitchen-clean.png'),
            rating: 4.5,
            reviews: 480,
            price: '₹449',
            category: 'Cleaning',
            savedDate: '5 Jan 2027',
            rating: 4.5,
            reviews: 480,
            price: '₹449',
            category: 'Cleaning',
            savedDate: '5 Jan 2027',
        },
        {
            id: '6',
            name: 'Carpet Cleaning',
            image: require('../../asset/carpet-clean.png'),
            rating: 4.8,
            reviews: 720,
            price: '₹699',
            category: 'Cleaning',
            savedDate: '3 Jan 2027',
        },
    ]);

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

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
        heart: '#FF4757',
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

    const removeSavedService = (id) => {
        Alert.alert(
            'Remove Service',
            'Are you sure you want to remove this from saved services?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setSavedServices(savedServices.filter(item => item.id !== id));
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
            <Image source={item.image } style={styles.serviceImage} />
            <TouchableOpacity
                style={styles.heartButton}
                onPress={() => removeSavedService(item.id)}
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
                <TouchableOpacity style={styles.bookButton} onPress={() => navigation.replace('ServiceBookingScreen', { serviceId: item.id })}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
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
                <Text style={styles.headerTitle}>Saved Services</Text>
                <View style={styles.headerRight} />
            </View>

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
        color: '#C9A84C',
        marginBottom: 6,
    },
    bookButton: {
        backgroundColor: '#C9A84C',
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
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
});

export default SavedServicesScreen;