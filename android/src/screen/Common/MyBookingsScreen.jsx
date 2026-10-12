import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    Animated,
    RefreshControl,
    FlatList,
    Alert,
    Clipboard,
    Linking,
    ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../util/API';
// Adjust this path to your API file


const { width, height } = Dimensions.get('window');

const MyBookingsScreen = ({ navigation }) => {
    // States
    const [refreshing, setRefreshing] = useState(false);

    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
    const [loadingUpcoming, setLoadingUpcoming] = useState(false);
    const [loadingMoreUpcoming, setLoadingMoreUpcoming] = useState(false);

    const PAGE_SIZE = 5;


    const [cancelledBookings, setCancelledBookings] = useState([]);
    const [cancelledPage, setCancelledPage] = useState(1);
    const [hasMoreCancelled, setHasMoreCancelled] = useState(true);
    const [loadingCancelled, setLoadingCancelled] = useState(false);
    const [loadingMoreCancelled, setLoadingMoreCancelled] = useState(false);

    const CANCELLED_PAGE_SIZE = 5;

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const COLORS = {
        gold: '#d6bceb',
        goldLight: '#76577F',
        goldDark: '#C4B0D3',
        goldFade: 'rgba(179, 154, 199, 0.1)',
        goldBg: '#C9A84C',
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

    // Sample Data - In Progress (Always one item)
    const inProgressData = {
        id: '1',
        serviceName: 'Home Cleaning',
        provider: 'HomeHelp',
        status: 'In Progress',
        items: ['Living Room', 'Kitchen', 'Bathrooms'],
        startOtp: '4826',
        endOtp: '7391',
        providerPhone: '+91 98765 43210',
    };

    // Sample Data - Previous Bookings
    const previousBookings = [

        {
            id: '1',
            serviceName: 'Cooking Support',
            provider: 'HomeHelp',
            date: '10 Dec 2026',
            status: 'Completed',
            rating: 4.5,
            image: require('../../asset/cooking.png'),
            price: '₹599',
            feedback: 'Good quality cleaning.',
        },
        {
            id: '2',
            serviceName: 'Kitchen Cleaning',
            provider: 'HomeHelp',
            date: '5 Dec 2026',
            status: 'Completed',
            rating: 4.9,
            image: require('../../asset/kitchenclean.png'),
            price: '₹349',
            feedback: 'Excellent work! Very thorough.',
        },
        {
            id: '2',
            serviceName: 'Bathroom Cleaning',
            provider: 'HomeHelp',
            date: '8 Dec 2025',
            status: 'Cancelled',
            rating: 4.9,
            image: require('../../asset/bathroomclean.png'),
            price: '₹0',
            feedback: '-.',
        },
    ];

    // Sample Data - Upcoming Bookings


    // Combine all data for FlatList
    const sections = [
        {
            id: 'upcoming',
            title: 'Active & Upcoming Bookings',
            icon: require('../../asset/calendar.png'),
            iconColor: COLORS.goldBg,
            data: upcomingBookings,
            type: 'upcoming',
            emptyMessage: 'No upcoming bookings scheduled',
        },
        {
            id: 'inprogress',
            title: 'In Progress',
            icon: require('../../asset/time-outline.png'),
            iconColor: COLORS.purple,
            data: inProgressData ? [inProgressData] : [],
            type: 'inprogress',
            emptyMessage: 'No services in progress',
        },
        {
            id: 'previous',
            title: 'Previous Bookings',
            icon: require('../../asset/checked.png'),
            iconColor: COLORS.success,
            data: previousBookings,
            type: 'previous',
            emptyMessage: 'No previous bookings found',
        },


        {
            id: 'cancelled',
            title: 'Cancelled Bookings',
            icon: require('../../asset/closefill.png'),
            iconColor: COLORS.red,
            data: cancelledBookings,
            type: 'cancelled',
            emptyMessage: 'No cancelled bookings found',
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

    useEffect(() => {
        fetchUpcomingBookings(1, false);
        fetchCancelledBookings(1, false);
    }, []);



    const formatBookingDate = (dateString) => {
        if (!dateString) return 'Date not available';

        const date = new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatBookingTime = (timeString) => {
        if (!timeString) return '--:--';

        const [hourString, minuteString] = timeString.split(':');
        const hour = Number(hourString);
        const minute = Number(minuteString);

        if (
            !Number.isFinite(hour) ||
            !Number.isFinite(minute) ||
            hour < 0 ||
            hour > 23
        ) {
            return timeString;
        }

        const date = new Date();
        date.setHours(hour, minute, 0, 0);

        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };


    const getBookingImage = (serviceName = '') => {
        const service = serviceName.toLowerCase();



        return require('../../asset/kitchenclean.png');
    };


    const mapUpcomingBooking = (item) => ({
        ...item,
        id: item.bookingDetailId || item.bookingId,
        serviceName: item.serviceName || 'Home Service',
        provider: item.partnerName || 'HomeHelp',
        date: formatBookingDate(item.serviceDate),
        time: `${formatBookingTime(item.startTime)} - ${formatBookingTime(item.endTime)}`,
        status: item.status || 'Upcoming',
        image: item.serviceBannerImageUrl
            ? { uri: item.serviceBannerImageUrl }
            : getBookingImage(item.serviceName),
        address: [
            item.addressLine1,
            item.city,
            item.postalCode,
        ]
            .filter(Boolean)
            .join(', ') || 'Address not available',
        price: `₹${Number(item.rate || 0).toLocaleString('en-IN')}`,
        paymentStatus: item.paymentStatus || 'Pending',
    });


    const fetchUpcomingBookings = useCallback(
        async (page = 1, append = false) => {
            if (loadingUpcoming || loadingMoreUpcoming) return;

            if (append) {
                setLoadingMoreUpcoming(true);
            } else {
                setLoadingUpcoming(true);
            }

            try {
                const token = await AsyncStorage.getItem('token');

                if (!token) {
                    Alert.alert(
                        'Session expired',
                        'Please log in again to view your bookings.'
                    );
                    return;
                }

                const url =
                    `${API.CUSTOMER_MY_BOOKINGS}` +
                    `?status=Upcoming&page=${page}&pageSize=${PAGE_SIZE}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Request failed (${response.status})`);
                }

                const responseData = await response.json();

                // The API example returns an array directly.
                const records = Array.isArray(responseData)
                    ? responseData
                    : responseData?.data ??
                    responseData?.items ??
                    responseData?.bookings ??
                    [];

                const mappedBookings = records.map(mapUpcomingBooking);

                setUpcomingBookings(previous =>
                    append
                        ? [...previous, ...mappedBookings]
                        : mappedBookings
                );

                setUpcomingPage(page);
                setHasMoreUpcoming(records.length === PAGE_SIZE);
            } catch (error) {
                console.error('Fetch upcoming bookings error:', error);
                Alert.alert(
                    'Error',
                    'Unable to load upcoming bookings. Please try again.'
                );
            } finally {
                setLoadingUpcoming(false);
                setLoadingMoreUpcoming(false);
            }
        },
        [loadingUpcoming, loadingMoreUpcoming]
    );


    const fetchCancelledBookings = async (page = 1, append = false) => {
        if (loadingCancelled || loadingMoreCancelled) return;

        if (append) {
            setLoadingMoreCancelled(true);
        } else {
            setLoadingCancelled(true);
        }

        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Session expired',
                    'Please log in again to view your bookings.'
                );
                return;
            }

            const url =
                `${API.CUSTOMER_MY_BOOKINGS}` +
                `?status=Cancelled&page=${page}&pageSize=${CANCELLED_PAGE_SIZE}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }

            const responseData = await response.json();

            const records = Array.isArray(responseData)
                ? responseData
                : responseData?.data ??
                responseData?.items ??
                responseData?.bookings ??
                [];

            const mappedBookings = records.map(mapUpcomingBooking);

            setCancelledBookings(previous =>
                append
                    ? [...previous, ...mappedBookings]
                    : mappedBookings
            );

            setCancelledPage(page);
            setHasMoreCancelled(records.length === CANCELLED_PAGE_SIZE);
        } catch (error) {
            console.error('Fetch cancelled bookings error:', error);
            Alert.alert(
                'Error',
                'Unable to load cancelled bookings. Please try again.'
            );
        } finally {
            setLoadingCancelled(false);
            setLoadingMoreCancelled(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);

        try {
        await Promise.all([
            fetchUpcomingBookings(1, false),
            fetchCancelledBookings(1, false),
        ]);
    } finally {
            setRefreshing(false);
        }
    };

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        Alert.alert('Copied!', 'OTP copied to clipboard');
    };

    const makePhoneCall = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`).catch(() => {
            Alert.alert('Error', 'Unable to make call');
        });
    };

    const renderInProgressCard = (item) => (
        <View style={styles.inProgressCard}>
            <View style={styles.inProgressHeader}>
                <View style={styles.inProgressStatusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.inProgressStatusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.inProgressContent}>
                <Text style={styles.inProgressServiceName}>{item.serviceName}</Text>
                <Text style={styles.inProgressProvider}>{item.provider}</Text>

                <View style={styles.inProgressItems}>
                    <Text style={styles.inProgressItemsLabel}>Services:</Text>
                    <View style={styles.inProgressItemsList}>
                        {item.items.map((service, index) => (
                            <View key={index} style={styles.inProgressItemTag}>
                                <Text style={styles.inProgressItemText}>{service}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Start Service OTP Display */}
                <View style={styles.otpDisplayCard}>
                    <View style={styles.otpDisplayHeader}>

                        <Image
                            source={require('../../asset/key.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.white


                            }}
                        />
                        <Text style={styles.otpDisplayTitle}>Start Service OTP</Text>
                    </View>
                    <View style={styles.otpDisplayRow}>
                        <Text style={styles.otpDisplayLabel}>Provide this OTP to the partner:</Text>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(item.startOtp)}
                            style={styles.otpCopyContainer}
                        >
                            <Text style={styles.otpDisplayValue}>{item.startOtp}</Text>

                            <Image
                                source={require('../../asset/copy.png')} // Update the path as needed
                                style={{
                                    width: 16,
                                    height: 16,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* End Service OTP Display */}
                {/* <View style={[styles.otpDisplayCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <View style={styles.otpDisplayHeader}>
                        <Image
                            source={require('../../asset/key.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.white


                            }}
                        />
                        <Text style={[styles.otpDisplayTitle, { color: COLORS.white }]}>End Service OTP</Text>
                    </View>
                    <View style={styles.otpDisplayRow}>
                        <Text style={styles.otpDisplayLabel}>Provide this OTP to the partner:</Text>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(item.endOtp)}
                            style={[styles.otpCopyContainer, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
                        >
                            <Text style={styles.otpDisplayValue}>{item.endOtp}</Text>
                            <Image
                                source={require('../../asset/copy.png')} // Update the path as needed
                                style={{
                                    width: 16,
                                    height: 16,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View> */}

                {/* Call Button */}
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => makePhoneCall(item.providerPhone)}
                >

                    <Image
                        source={require('../../asset/telephone.png')} // Update the path as needed
                        style={{
                            width: 18,
                            height: 18,
                            resizeMode: 'contain',
                            tintColor: COLORS.white


                        }}
                    />
                    <Text style={styles.callButtonText}>Call Professional</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    const renderCancelledBookingItem = (item) => (
        <View style={styles.bookingCard}>
            <Image
                source={item.image}
                style={styles.bookingImage}
                resizeMode="cover"
            />

            <View style={styles.bookingContent}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingName}>
                        {item.serviceName}
                    </Text>

                    <View
                        style={[
                            styles.bookingStatusBadge,
                            { backgroundColor: '#FDECEC' },
                        ]}
                    >
                        <Text
                            style={[
                                styles.bookingStatusText,
                                { color: '#D93025' },
                            ]}
                        >
                            Cancelled
                        </Text>
                    </View>
                </View>

                <Text style={styles.bookingDate}>{item.date}</Text>

                <View style={styles.paymentStatusContainer}>
                    <Text style={styles.paymentStatusLabel}>
                        Payment:
                    </Text>

                    <View
                        style={[
                            styles.paymentStatusBadge,
                            {
                                backgroundColor:
                                    item.paymentStatus?.toLowerCase() === 'paid'
                                        ? '#E8F8EF'
                                        : '#FDECEC',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.paymentStatusText,
                                {
                                    color:
                                        item.paymentStatus?.toLowerCase() === 'paid'
                                            ? '#218838'
                                            : '#D93025',
                                },
                            ]}
                        >
                            {item.paymentStatus || 'Unknown'}
                        </Text>
                    </View>
                </View>

                <View style={styles.upcomingDateTime}>
                    <Text style={styles.upcomingDateText}>
                        {item.time}
                    </Text>
                </View>

                

                <View style={styles.bookingFooter}>
                    <Text style={styles.bookingPrice}>
                        {item.price}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderPreviousBookingItem = (item) => (
        <TouchableOpacity
            style={styles.bookingCard}
            activeOpacity={0.8}
            onPress={() => {
                if (item.status === 'Completed') {
                    navigation.navigate('JobCompletedScreen', {
                        booking: item,
                    });
                } else if (item.status === 'Cancelled') {
                    navigation.navigate('CancelOrderScreen', {
                        booking: item,
                    });
                }
            }}
        >
            <Image source={item.image} style={styles.bookingImage} />
            <View style={styles.bookingContent}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingName}>{item.serviceName}</Text>
                    <View style={[styles.bookingStatusBadge, { backgroundColor: COLORS.success + '20' }]}>
                        <Text style={[styles.bookingStatusText, { color: COLORS.success }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                <Text style={styles.bookingProvider}>{item.provider}</Text>
                <Text style={styles.bookingDate}>{item.date}</Text>

                <View style={styles.bookingRating}>

                    <Image
                        source={require('../../asset/star-fill.png')} // Update the path as needed
                        style={{
                            width: 16,
                            height: 16,
                            resizeMode: 'contain',
                            tintColor: COLORS.orange


                        }}
                    />
                    <Text style={styles.bookingRatingText}>{item.rating}</Text>
                    <Text style={styles.bookingPrice}>{item.price}</Text>
                </View>

                {item.feedback && (
                    <Text style={styles.bookingFeedback}>"{item.feedback}"</Text>
                )}

                <View style={styles.bookingActions}>
                    <TouchableOpacity style={styles.rebookButton}>

                        <Image
                            source={require('../../asset/refresh.png')} // Update the path as needed
                            style={{
                                width: 18,
                                height: 18,
                                resizeMode: 'contain',
                                tintColor: COLORS.txtColor


                            }}
                        />
                        <Text style={styles.rebookButtonText}>Rebook</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedbackButton}>

                        <Image
                            source={require('../../asset/feedback.png')} // Update the path as needed
                            style={{
                                width: 18,
                                height: 18,
                                resizeMode: 'contain',
                                tintColor: COLORS.txtColor


                            }}
                        />
                        <Text style={styles.feedbackButtonText}>Feedback</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderUpcomingBookingItem = (item) => (
        <TouchableOpacity
            style={styles.bookingCard}
            activeOpacity={0.8}
        // onPress={() => {

        //     navigation.navigate('BookingScheduleScreen', {
        //         booking: item,
        //     });

        // }}
        >
            <Image source={item.image} style={styles.bookingImage} />
            <View style={styles.bookingContent}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingName}>{item.serviceName}</Text>
                    <View
                        style={[
                            styles.paymentStatusBadge,
                            {
                                backgroundColor:
                                    item.paymentStatus === 'Paid'
                                        ? '#E8F8EF'
                                        : '#FFF3E0',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.paymentStatusText,
                                {
                                    color:
                                        item.paymentStatus === 'Paid'
                                            ? '#218838'
                                            : '#E67E22',
                                },
                            ]}
                        >
                            {item.paymentStatus}
                        </Text>
                    </View>
                    {/* <View style={[
                        styles.bookingStatusBadge,
                        { backgroundColor: item.status === 'Confirmed' ? COLORS.green + '20' : COLORS.warning + '20' }
                    ]}>
                        <Text style={[
                            styles.bookingStatusText,
                            { color: item.status === 'Confirmed' ? COLORS.green : COLORS.warning }
                        ]}>
                            {item.status}
                        </Text>
                    </View> */}
                </View>

                <View style={styles.upcomingDateTime}>
                    <View style={styles.upcomingDateRow}>

                        <Image
                            source={require('../../asset/calendar-outline.png')} // Update the path as needed
                            style={{
                                width: 14,
                                height: 14,
                                resizeMode: 'contain',
                                tintColor: COLORS.txtColor


                            }}
                        />
                        <Text style={styles.upcomingDateText}>{item.date}</Text>
                    </View>
                    <View style={styles.upcomingDateRow}>

                        <Image
                            source={require('../../asset/time-outline.png')} // Update the path as needed
                            style={{
                                width: 14,
                                height: 14,
                                resizeMode: 'contain',
                                tintColor: COLORS.textLight


                            }}
                        />
                        <Text style={styles.upcomingDateText}>{item.time}</Text>
                    </View>
                </View>
                <View style={styles.upcomingAddress}>

                    <Image
                        source={require('../../asset/location-outline.png')} // Update the path as needed
                        style={{
                            width: 14,
                            height: 14,
                            resizeMode: 'contain',
                            tintColor: COLORS.textLight


                        }}
                    />
                    <Text style={styles.upcomingAddressText}
                        numberOfLines={2}
                        ellipsizeMode="tail">{item.address}</Text>
                </View>

                <View style={styles.bookingFooter}>
                    <Text style={styles.bookingPrice}>{item.price}</Text>
                    <View style={styles.bookingActions}>
                        <TouchableOpacity style={styles.rescheduleButton}>

                            <Image
                                source={require('../../asset/calendar-outline.png')} // Update the path as needed
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.txtColor


                                }}
                            />
                            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>




                {item.isPartnerAssigned === true && (
                    <View style={styles.partnerAssignedContainer}>
                        <Text style={styles.partnerAssignedLabel}>
                            Partner Assigned:
                        </Text>
                        <Text style={styles.partnerAssignedName}>
                            {item.partnerName || 'Name not available'}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
                <Image
                    source={section.icon}
                    style={{
                        width: 22,
                        height: 22,
                        resizeMode: 'contain',
                        tintColor: section.iconColor, // Remove this if your PNGs are already colored
                    }}
                />
                <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

        </View>
    );

    const renderSectionItem = ({ item, section }) => {
        if (section.type === 'upcoming') {
            return renderUpcomingBookingItem(item);
        } else if (section.type === 'inprogress') {
            return renderInProgressCard(item);
        } else if (section.type === 'previous') {
            return renderPreviousBookingItem(item);
        } else if (section.type === 'cancelled') {
            return renderCancelledBookingItem(item);
        }


        return null;
    };

    const renderEmptyState = (section) => (
        <View style={styles.emptyState}>
            <Image
                source={
                    section.type === 'upcoming'
                        ? require('../../asset/calendar.png')
                        : section.type === 'inprogress'
                            ? require('../../asset/time-outline.png')
                            : require('../../asset/briefcase.png')
                }
                style={{
                    width: 48,
                    height: 48,
                    resizeMode: 'contain',
                    tintColor: COLORS.textLight, // Remove if your PNGs are already colored
                }}
            />
            <Text style={styles.emptyStateTitle}>No {section.title}</Text>
            <Text style={styles.emptyStateText}>{section.emptyMessage}</Text>
        </View>
    );

    // const renderSection = ({ item: section }) => {
    //     const hasData = section.data.length > 0;

    //     return (
    //         <View style={styles.sectionContainer}>
    //             {renderSectionHeader({ section })}

    //             {section.type === 'upcoming' && loadingUpcoming && !hasData ? (
    //                 <ActivityIndicator
    //                     size="large"
    //                     color={COLORS.goldDark}
    //                     style={{ paddingVertical: 25 }}
    //                 />
    //             ) : hasData ? (
    //                 <View>
    //                     {section.data.map((item) => (
    //                         <View key={item.id}>
    //                             {renderSectionItem({ item, section })}
    //                         </View>
    //                     ))}

    //                     {section.type === 'upcoming' && hasMoreUpcoming && (
    //                         <TouchableOpacity
    //                             style={styles.loadMoreButton}
    //                             disabled={loadingMoreUpcoming}
    //                             onPress={() =>
    //                                 fetchUpcomingBookings(upcomingPage + 1, true)
    //                             }
    //                         >
    //                             {loadingMoreUpcoming ? (
    //                                 <ActivityIndicator
    //                                     size="small"
    //                                     color={COLORS.txtColor}
    //                                 />
    //                             ) : (
    //                                 <Text style={styles.loadMoreText}>
    //                                     Load More Bookings
    //                                 </Text>
    //                             )}
    //                         </TouchableOpacity>
    //                     )}
    //                 </View>
    //             ) : (
    //                 renderEmptyState(section)
    //             )}
    //         </View>
    //     );
    // };




    const renderSection = ({ item: section }) => {
        const hasData = section.data.length > 0;

        const isInitialLoading =
            (section.type === 'upcoming' &&
                loadingUpcoming &&
                !hasData) ||
            (section.type === 'cancelled' &&
                loadingCancelled &&
                !hasData);

        return (
            <View style={styles.sectionContainer}>
                {renderSectionHeader({ section })}

                {isInitialLoading ? (
                    <ActivityIndicator
                        size="large"
                        color={COLORS.goldDark}
                        style={{ paddingVertical: 25 }}
                    />
                ) : hasData ? (
                    <View>
                        {section.data.map((item) => (
                            <View key={item.id}>
                                {renderSectionItem({ item, section })}
                            </View>
                        ))}

                        {/* Upcoming Bookings Pagination */}
                        {section.type === 'upcoming' &&
                            hasMoreUpcoming && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    disabled={loadingMoreUpcoming}
                                    onPress={() =>
                                        fetchUpcomingBookings(
                                            upcomingPage + 1,
                                            true
                                        )
                                    }
                                >
                                    {loadingMoreUpcoming ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={COLORS.txtColor}
                                        />
                                    ) : (
                                        <Text style={styles.loadMoreText}>
                                            Load More Bookings
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}

                        {/* Cancelled Bookings Pagination */}
                        {section.type === 'cancelled' &&
                            hasMoreCancelled && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    disabled={loadingMoreCancelled}
                                    onPress={() =>
                                        fetchCancelledBookings(
                                            cancelledPage + 1,
                                            true
                                        )
                                    }
                                >
                                    {loadingMoreCancelled ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={COLORS.txtColor}
                                        />
                                    ) : (
                                        <Text style={styles.loadMoreText}>
                                            Load More Cancelled Bookings
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                    </View>
                ) : (
                    renderEmptyState(section)
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#d6bceb" />

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
                <Text style={styles.headerTitle}>My Bookings</Text>
                {/* <TouchableOpacity style={styles.filterButton}>

                    <Image
                        source={require('../../asset/filter.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.white


                        }}
                    />
                </TouchableOpacity> */}
            </View>

            {/* Content with FlatList */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <FlatList
                    data={sections}
                    renderItem={renderSection}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                />
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


        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#d6bceb',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',

    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#403746',
    },
    filterButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 30,
    },
    separator: {
        height: 8,
    },
    sectionContainer: {
        marginVertical: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    seeAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#403746',
    },
    // In Progress Card Styles - Gold Background
    inProgressCard: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#76577F',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    inProgressHeader: {
        padding: 16,
        paddingBottom: 0,
    },
    inProgressStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2ECC71',
        marginRight: 8,
        shadowColor: '#2ECC71',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
    },
    inProgressStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    inProgressContent: {
        padding: 16,
        paddingTop: 8,
    },
    inProgressServiceName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    inProgressProvider: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: 8,
    },
    inProgressItems: {
        marginTop: 4,
        marginBottom: 8,
    },
    inProgressItemsLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    inProgressItemsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    inProgressItemTag: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inProgressItemText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.85)',
    },
    // OTP Display Cards
    otpDisplayCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        marginTop: 6,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    otpDisplayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    otpDisplayTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    otpDisplayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    otpDisplayLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        flex: 1,
    },
    otpCopyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },
    otpDisplayValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 4,
    },
    // Call Button
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    callButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Booking Card Styles (Previous & Upcoming)
    bookingCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    bookingImage: {
        width: 100,
        height: '100%',
        minHeight: 140,
    },
    bookingContent: {
        flex: 1,
        padding: 12,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    bookingName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    bookingStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    bookingStatusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    bookingProvider: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 2,
    },
    bookingDate: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 6,
    },
    bookingRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    bookingRatingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    bookingPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#403746',
        marginLeft: 8,
    },
    bookingFeedback: {
        fontSize: 12,
        color: '#666666',
        fontStyle: 'italic',
        marginBottom: 6,
    },
    bookingActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    rebookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#C4B0D3',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    rebookButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#403746',
    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#d6bceb',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(201, 168, 76, 0.3)',
    },
    feedbackButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#403746',
    },
    // Upcoming Specific Styles
    upcomingDateTime: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    upcomingDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    upcomingDateText: {
        fontSize: 12,
        color: '#666666',
    },
    upcomingAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    upcomingAddressText: {
        fontSize: 12,
        color: '#666666',
        flex: 1,
    },
    bookingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    rescheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 14,
        backgroundColor: 'rgba(201, 168, 76, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(201, 168, 76, 0.3)',
    },
    rescheduleButtonText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#403746',
    },
    cancelButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 14,
        backgroundColor: 'rgba(225, 112, 85, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(225, 112, 85, 0.3)',
    },
    cancelButtonText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#403746',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 10,
    },
    emptyStateText: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
        textAlign: 'center',
    },

    loadMoreButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        marginTop: 8,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#d6bceb',
        borderWidth: 1,
        borderColor: '#C4B0D3',
    },

    loadMoreText: {
        color: '#403746',
        fontSize: 14,
        fontWeight: '700',
    },

    partnerAssignedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 6,
    },

    partnerAssignedLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#76577F',
        marginRight: 4,
    },

    partnerAssignedName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#403746',
    },
    paymentStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },

    paymentStatusLabel: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '500',
    },

    paymentStatusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 12,
    },

    paymentStatusText: {
        fontSize: 11,
        fontWeight: '700',
    },
});

export default MyBookingsScreen;