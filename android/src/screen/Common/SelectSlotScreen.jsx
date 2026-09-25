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
    FlatList,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SelectSlotScreen = ({ navigation, route }) => {

    // =========================================================
    // ROUTE DATA
    // =========================================================

    const {
        selectedServices: servicesFromRoute = [],
        customerDetails = {},
        addressDetails = null,
        address = '',
        slotSelections: previousSlotSelections = {},
    } = route.params || {};

    const {
        name: customerName = '',
        mobile: customerMobile = '',
    } = customerDetails;

    // =========================================================
    // COLORS
    // =========================================================

    const COLORS = {
        primary: '#76577F',
        primaryLight: '#d6bceb',
        primaryDark: '#403746',

        gold: '#d6bceb',
        goldLight: '#C4B0D3',
        goldFade: 'rgba(179, 154, 199, 0.1)',

        white: '#FFFFFF',
        dark: '#1A1A1A',
        textLight: '#666666',
        lightBg: '#F8F6F0',
        border: '#E8E3D8',

        success: '#2ECC71',
        red: '#E17055',
        warning: '#F39C12',
    };

    // =========================================================
    // STATES
    // =========================================================

    const [selectedServices, setSelectedServices] = useState(
        Array.isArray(servicesFromRoute)
            ? servicesFromRoute
            : []
    );

    // ONE COMMON DATE
    const [selectedDate, setSelectedDate] = useState(
        previousSlotSelections?.date || null
    );

    // ONE COMMON TIME
    const [selectedTime, setSelectedTime] = useState(
        previousSlotSelections?.time || null
    );

    // ONE PROFESSIONAL FOR THE BOOKING
    const [selectedProfessional, setSelectedProfessional] =
        useState(null);

    const [
        selectedProfessionalDetails,
        setSelectedProfessionalDetails
    ] = useState(null);

    const [showProfessionalModal, setShowProfessionalModal] =
        useState(false);

    const [showBillSummary, setShowBillSummary] =
        useState(false);

    // =========================================================
    // ANIMATION
    // =========================================================

    const fadeAnim = useRef(
        new Animated.Value(0)
    ).current;

    const slideAnim = useRef(
        new Animated.Value(30)
    ).current;

    const modalSlideAnim = useRef(
        new Animated.Value(height)
    ).current;

    const billModalSlideAnim = useRef(
        new Animated.Value(height)
    ).current;

    // =========================================================
    // STAR IMAGES
    // =========================================================

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    // =========================================================
    // DATE LIST
    // =========================================================

    const generateDates = () => {

        const dates = [];

        const today = new Date();

        for (let i = 1; i <= 14; i++) {

            const date = new Date(today);

            date.setDate(
                today.getDate() + i
            );

            dates.push(date);
        }

        return dates;
    };

    const availableDates = generateDates();

    // =========================================================
    // TIME SLOTS
    // =========================================================

    const timeSlots = [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '01:00 PM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
        '05:00 PM',
        '06:00 PM',
    ];

    // =========================================================
    // PROFESSIONALS
    // =========================================================

    const professionals = [
        {
            id: 'p1',
            name: 'Rajesh Kumar',
            image:
                'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=6C5CE7&color=fff&size=100',
            rating: 4.9,
            jobsCompleted: 1240,
            isActive: true,
            experience: '8 years',
            availableSlots: [
                '09:00 AM',
                '11:00 AM',
                '02:00 PM',
            ],
        },
        {
            id: 'p2',
            name: 'Priya Sharma',
            image:
                'https://ui-avatars.com/api/?name=Priya+Sharma&background=FD79A8&color=fff&size=100',
            rating: 4.8,
            jobsCompleted: 890,
            isActive: true,
            experience: '6 years',
            availableSlots: [
                '10:00 AM',
                '01:00 PM',
                '03:00 PM',
            ],
        },
        {
            id: 'p3',
            name: 'Amit Patel',
            image:
                'https://ui-avatars.com/api/?name=Amit+Patel&background=0984E3&color=fff&size=100',
            rating: 4.7,
            jobsCompleted: 650,
            isActive: true,
            experience: '5 years',
            availableSlots: [
                '09:00 AM',
                '12:00 PM',
                '04:00 PM',
            ],
        },
        {
            id: 'p4',
            name: 'Sunita Reddy',
            image:
                'https://ui-avatars.com/api/?name=Sunita+Reddy&background=00B894&color=fff&size=100',
            rating: 4.9,
            jobsCompleted: 1560,
            isActive: true,
            experience: '10 years',
            availableSlots: [
                '09:00 AM',
                '12:00 PM',
                '04:00 PM',
            ],
        },
        {
            id: 'p5',
            name: 'Vikram Singh',
            image:
                'https://ui-avatars.com/api/?name=Vikram+Singh&background=E17055&color=fff&size=100',
            rating: 4.6,
            jobsCompleted: 450,
            isActive: true,
            experience: '4 years',
            availableSlots: [
                '10:00 AM',
                '01:00 PM',
                '05:00 PM',
            ],
        },
    ];

    const activeProfessionals =
        professionals.filter(
            item => item.isActive
        );

    // =========================================================
    // EFFECT
    // =========================================================

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

    // =========================================================
    // PRICING HELPERS
    // =========================================================

    const isActivePricing = item => {

        return (
            item?.isActive === true ||
            item?.isActive === 'true' ||
            item?.isActive === 1
        );
    };

    const getPricingItem = (
        service,
        pricingType
    ) => {

        if (
            !Array.isArray(
                service?.pricing
            )
        ) {
            return null;
        }

        return service.pricing.find(
            item =>
                Number(item.pricingType) ===
                Number(pricingType) &&
                isActivePricing(item)
        );
    };

    // =========================================================
    // CALCULATE SERVICE PRICE
    // =========================================================

    const calculateServicePrice = (
        service,
        hours
    ) => {

        const selectedHours =
            Number(hours) || 0;

        if (selectedHours <= 0) {
            return 0;
        }

        // Hourly pricing
        const hourlyPricing =
            getPricingItem(
                service,
                1
            );

        const hourlyPrice =
            Number(
                hourlyPricing?.price
            ) || 0;

        // =====================================================
        // 4 HOURS
        // =====================================================

        if (selectedHours === 4) {

            const fourHourPricing =
                getPricingItem(
                    service,
                    2
                );

            if (fourHourPricing) {

                return (
                    Number(
                        fourHourPricing.price
                    ) || 0
                );
            }

            return hourlyPrice * 4;
        }

        // =====================================================
        // 8 HOURS
        // =====================================================

        if (selectedHours === 8) {

            const eightHourPricing =
                getPricingItem(
                    service,
                    3
                );

            if (eightHourPricing) {

                return (
                    Number(
                        eightHourPricing.price
                    ) || 0
                );
            }

            return hourlyPrice * 8;
        }

        // =====================================================
        // ALL OTHER HOURS
        //
        // 1, 2, 3, 5, 6, 7...
        // =====================================================

        return hourlyPrice * selectedHours;
    };

    // =========================================================
    // UPDATE HOURS FOR ONE SERVICE
    // =========================================================

    const updateServiceHours = (
        serviceId,
        hours
    ) => {

        const selectedHours =
            Number(hours);

        setSelectedServices(
            previousServices => {

                return previousServices.map(
                    service => {

                        if (
                            String(service.id) !==
                            String(serviceId)
                        ) {
                            return service;
                        }

                        const calculatedPrice =
                            calculateServicePrice(
                                service,
                                selectedHours
                            );

                        return {
                            ...service,

                            selectedHours,

                            calculatedPrice,
                        };
                    }
                );
            }
        );
    };

    // =========================================================
    // TOTAL PRICE
    // =========================================================

    const getTotalAmount = () => {

        return selectedServices.reduce(
            (total, service) => {

                const hours =
                    Number(
                        service.selectedHours
                    ) || 1;

                const price =
                    calculateServicePrice(
                        service,
                        hours
                    );

                return (
                    total + price
                );
            },
            0
        );
    };

    // =========================================================
    // TOTAL HOURS
    // =========================================================

    const getTotalHours = () => {

        return selectedServices.reduce(
            (total, service) => {

                return (
                    total +
                    (
                        Number(
                            service.selectedHours
                        ) || 1
                    )
                );
            },
            0
        );
    };

    // =========================================================
    // DATE SELECTION
    // =========================================================

    const toggleDateSelection = (
        date
    ) => {

        const dateStr =
            date.toDateString();

        setSelectedDate(
            dateStr
        );
    };

    // =========================================================
    // TIME SELECTION
    // =========================================================

    const selectTime = time => {

        setSelectedTime(time);

        // If selected professional is not
        // available at this time, remove it.

        if (
            selectedProfessional
        ) {

            const professional =
                professionals.find(
                    item =>
                        item.id ===
                        selectedProfessional
                );

            if (
                professional &&
                !professional.availableSlots.includes(
                    time
                )
            ) {
                setSelectedProfessional(
                    null
                );

                setSelectedProfessionalDetails(
                    null
                );
            }
        }
    };

    // =========================================================
    // PROFESSIONAL MODAL
    // =========================================================

    const openProfessionalModal =
        professional => {

            setSelectedProfessionalDetails(
                professional
            );

            setShowProfessionalModal(
                true
            );

            setTimeout(() => {

                animateModalIn(
                    modalSlideAnim
                );

            }, 100);
        };

    const closeProfessionalModal =
        () => {

            animateModalOut(
                modalSlideAnim,
                () => {

                    setShowProfessionalModal(
                        false
                    );

                    setSelectedProfessionalDetails(
                        null
                    );
                }
            );
        };

    // =========================================================
    // MODAL ANIMATION
    // =========================================================

    const animateModalIn =
        animRef => {

            animRef.setValue(height);

            Animated.spring(animRef, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        };

    const animateModalOut =
        (
            animRef,
            callback
        ) => {

            Animated.timing(animRef, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {

                if (callback) {
                    callback();
                }

            });
        };

    // =========================================================
    // BILL SUMMARY
    // =========================================================

    const openBillSummary =
        () => {

            if (
                selectedServices.length ===
                0
            ) {

                Alert.alert(
                    'No Services',
                    'Please select at least one service.'
                );

                return;
            }

            if (!selectedDate) {

                Alert.alert(
                    'Select Date',
                    'Please select a booking date.'
                );

                return;
            }

            if (!selectedTime) {

                Alert.alert(
                    'Select Time',
                    'Please select a booking time.'
                );

                return;
            }

            // Check hours for all services

            const invalidService =
                selectedServices.find(
                    service =>
                        !service.selectedHours ||
                        Number(
                            service.selectedHours
                        ) <= 0
                );

            if (invalidService) {

                Alert.alert(
                    'Select Hours',
                    `Please select hours for ${invalidService.name}.`
                );

                return;
            }

            if (
                !selectedProfessional
            ) {

                Alert.alert(
                    'Select Professional',
                    'Please select a professional.'
                );

                return;
            }

            setShowBillSummary(
                true
            );

            setTimeout(() => {

                animateModalIn(
                    billModalSlideAnim
                );

            }, 100);
        };

    // =========================================================
    // CLOSE BILL
    // =========================================================

    const closeBillSummary =
        () => {

            animateModalOut(
                billModalSlideAnim,
                () => {

                    setShowBillSummary(
                        false
                    );
                }
            );
        };

    // =========================================================
    // RENDER STARS
    // =========================================================

    const renderStars = (
        rating,
        size = 14
    ) => {

        const stars = [];

        const fullStars =
            Math.floor(rating);

        const hasHalfStar =
            rating % 1 >= 0.5;

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            let image =
                starImages.empty;

            if (
                i < fullStars
            ) {

                image =
                    starImages.full;

            } else if (
                i === fullStars &&
                hasHalfStar
            ) {

                image =
                    starImages.half;
            }

            stars.push(
                <Image
                    key={i}
                    source={image}
                    style={{
                        width: size,
                        height: size,
                        resizeMode:
                            'contain',
                        marginHorizontal: 1,
                    }}
                />
            );
        }

        return stars;
    };

    // =========================================================
    // PROFESSIONAL GRID
    // =========================================================

    const renderProfessionalGrid =
        ({ item }) => {

            const isSelected =
                selectedProfessional ===
                item.id;

            const isAvailable =
                !selectedTime ||
                item.availableSlots.includes(
                    selectedTime
                );

            return (
                <TouchableOpacity
                    style={[
                        styles.professionalGridCard,

                        isSelected &&
                        styles.professionalGridCardSelected,

                        !isAvailable &&
                        styles.professionalGridCardUnavailable,
                    ]}
                    onPress={() => {

                        if (!selectedDate) {

                            Alert.alert(
                                'Select Date First',
                                'Please select a date before choosing a professional.'
                            );

                            return;
                        }

                        if (!selectedTime) {

                            Alert.alert(
                                'Select Time First',
                                'Please select a time before choosing a professional.'
                            );

                            return;
                        }

                        if (!isAvailable) {

                            Alert.alert(
                                'Not Available',
                                `${item.name} is not available at ${selectedTime}.`
                            );

                            return;
                        }

                        setSelectedProfessional(
                            isSelected
                                ? null
                                : item.id
                        );

                        setSelectedProfessionalDetails(
                            isSelected
                                ? null
                                : item
                        );
                    }}
                    activeOpacity={0.8}
                >

                    <Image
                        source={{
                            uri: item.image
                        }}
                        style={
                            styles.professionalGridImage
                        }
                    />

                    <View
                        style={
                            styles.professionalGridInfo
                        }
                    >

                        <Text
                            style={
                                styles.professionalGridName
                            }
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>

                        <View
                            style={
                                styles.professionalGridRating
                            }
                        >

                            {renderStars(
                                item.rating,
                                12
                            )}

                            <Text
                                style={
                                    styles.professionalGridRatingText
                                }
                            >
                                {item.rating}
                            </Text>

                        </View>

                        <Text
                            style={
                                styles.professionalGridJobs
                            }
                        >
                            {item.jobsCompleted} jobs
                        </Text>

                        <Text
                            style={
                                styles.professionalExperience
                            }
                        >
                            {item.experience}
                        </Text>

                    </View>

                    {isSelected && (

                        <View
                            style={
                                styles.professionalGridCheck
                            }
                        >

                            <Image
                                source={require('../../asset/checked.png')}
                                style={{
                                    width: 11,
                                    height: 11,
                                    resizeMode:
                                        'contain',
                                    tintColor:
                                        COLORS.white,
                                }}
                            />

                        </View>
                    )}

                    {!isAvailable && (

                        <View
                            style={
                                styles.professionalGridUnavailableBadge
                            }
                        >
                            <Text
                                style={
                                    styles.professionalGridUnavailableText
                                }
                            >
                                Unavailable
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={
                            styles.professionalGridViewButton
                        }
                        onPress={() =>
                            openProfessionalModal(
                                item
                            )
                        }
                    >

                        <Image
                            source={require('../../asset/eye_open.png')}
                            style={{
                                width: 18,
                                height: 18,
                                resizeMode:
                                    'contain',
                                tintColor:
                                    COLORS.primary,
                            }}
                        />

                    </TouchableOpacity>

                </TouchableOpacity>
            );
        };

    // =========================================================
    // PROFESSIONAL DETAILS MODAL
    // =========================================================

    const renderProfessionalModal =
        () => (

            <Modal
                transparent
                visible={
                    showProfessionalModal
                }
                animationType="none"
                onRequestClose={
                    closeProfessionalModal
                }
            >

                <TouchableWithoutFeedback
                    onPress={
                        closeProfessionalModal
                    }
                >

                    <View
                        style={
                            styles.modalOverlay
                        }
                    >

                        <TouchableWithoutFeedback>

                            <Animated.View
                                style={[
                                    styles.modalContent,

                                    {
                                        transform: [
                                            {
                                                translateY:
                                                    modalSlideAnim,
                                            },
                                        ],
                                    },
                                ]}
                            >

                                <View
                                    style={
                                        styles.modalHandle
                                    }
                                />

                                {selectedProfessionalDetails && (

                                    <ScrollView
                                        showsVerticalScrollIndicator={
                                            false
                                        }
                                    >

                                        <View
                                            style={
                                                styles.modalProfessionalHeader
                                            }
                                        >

                                            <Image
                                                source={{
                                                    uri: selectedProfessionalDetails.image,
                                                }}
                                                style={
                                                    styles.modalProfessionalImage
                                                }
                                            />

                                            <Text
                                                style={
                                                    styles.modalProfessionalName
                                                }
                                            >
                                                {
                                                    selectedProfessionalDetails.name
                                                }
                                            </Text>

                                            <View
                                                style={
                                                    styles.modalProfessionalRating
                                                }
                                            >

                                                {renderStars(
                                                    selectedProfessionalDetails.rating,
                                                    16
                                                )}

                                                <Text
                                                    style={
                                                        styles.modalProfessionalRatingText
                                                    }
                                                >
                                                    {
                                                        selectedProfessionalDetails.rating
                                                    }
                                                </Text>

                                            </View>

                                        </View>

                                        <View
                                            style={
                                                styles.modalStats
                                            }
                                        >

                                            <View
                                                style={
                                                    styles.modalStat
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.modalStatValue
                                                    }
                                                >
                                                    {
                                                        selectedProfessionalDetails.jobsCompleted
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.modalStatLabel
                                                    }
                                                >
                                                    Jobs
                                                </Text>

                                            </View>

                                            <View
                                                style={
                                                    styles.modalStatDivider
                                                }
                                            />

                                            <View
                                                style={
                                                    styles.modalStat
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.modalStatValue
                                                    }
                                                >
                                                    {
                                                        selectedProfessionalDetails.experience
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.modalStatLabel
                                                    }
                                                >
                                                    Experience
                                                </Text>

                                            </View>

                                            <View
                                                style={
                                                    styles.modalStatDivider
                                                }
                                            />

                                            <View
                                                style={
                                                    styles.modalStat
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.modalStatValue
                                                    }
                                                >
                                                    {
                                                        selectedProfessionalDetails.rating
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.modalStatLabel
                                                    }
                                                >
                                                    Rating
                                                </Text>

                                            </View>

                                        </View>

                                        <View
                                            style={
                                                styles.modalSection
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.modalSectionTitle
                                                }
                                            >
                                                Available Time Slots
                                            </Text>

                                            <View
                                                style={
                                                    styles.modalSlotsContainer
                                                }
                                            >

                                                {selectedProfessionalDetails.availableSlots.map(
                                                    (
                                                        slot,
                                                        index
                                                    ) => (

                                                        <View
                                                            key={
                                                                index
                                                            }
                                                            style={
                                                                styles.modalSlotTag
                                                            }
                                                        >

                                                            <Text
                                                                style={
                                                                    styles.modalSlotTagText
                                                                }
                                                            >
                                                                {
                                                                    slot
                                                                }
                                                            </Text>

                                                        </View>
                                                    )
                                                )}

                                            </View>

                                        </View>

                                        <TouchableOpacity
                                            style={
                                                styles.modalSelectButton
                                            }
                                            onPress={() => {

                                                setSelectedProfessional(
                                                    selectedProfessionalDetails.id
                                                );

                                                closeProfessionalModal();

                                            }}
                                        >

                                            <Text
                                                style={
                                                    styles.modalSelectButtonText
                                                }
                                            >
                                                Select Professional
                                            </Text>

                                        </TouchableOpacity>

                                    </ScrollView>
                                )}

                                <TouchableOpacity
                                    style={
                                        styles.modalCloseButton
                                    }
                                    onPress={
                                        closeProfessionalModal
                                    }
                                >

                                    <Text
                                        style={
                                            styles.modalCloseText
                                        }
                                    >
                                        Close
                                    </Text>

                                </TouchableOpacity>

                            </Animated.View>

                        </TouchableWithoutFeedback>

                    </View>

                </TouchableWithoutFeedback>

            </Modal>
        );

    // =========================================================
    // BILL SUMMARY
    // =========================================================

    const renderBillSummary =
        () => {

            const subtotal =
                getTotalAmount();

            const gst =
                Math.round(
                    subtotal * 0.18
                );

            const grandTotal =
                subtotal + gst;

            return (

                <Modal
                    transparent
                    visible={
                        showBillSummary
                    }
                    animationType="none"
                    onRequestClose={
                        closeBillSummary
                    }
                >

                    <TouchableWithoutFeedback
                        onPress={
                            closeBillSummary
                        }
                    >

                        <View
                            style={
                                styles.modalOverlay
                            }
                        >

                            <TouchableWithoutFeedback>

                                <Animated.View
                                    style={[
                                        styles.billModalContent,

                                        {
                                            transform: [
                                                {
                                                    translateY:
                                                        billModalSlideAnim,
                                                },
                                            ],
                                        },
                                    ]}
                                >

                                    <View
                                        style={
                                            styles.modalHandle
                                        }
                                    />

                                    <View
                                        style={
                                            styles.billHeader
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.billTitle
                                            }
                                        >
                                            Bill Summary
                                        </Text>

                                        <Text
                                            style={
                                                styles.billSubtitle
                                            }
                                        >
                                            Review your booking
                                        </Text>

                                    </View>

                                    <ScrollView
                                        showsVerticalScrollIndicator={
                                            false
                                        }
                                    >

                                        {/* COMMON SLOT */}

                                        <View
                                            style={
                                                styles.commonSlotCard
                                            }
                                        >

                                            <View
                                                style={
                                                    styles.commonSlotHeader
                                                }
                                            >

                                                <Image
                                                    source={require('../../asset/calendar.png')}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        resizeMode:
                                                            'contain',
                                                        tintColor:
                                                            COLORS.primary,
                                                    }}
                                                />

                                                <Text
                                                    style={
                                                        styles.commonSlotTitle
                                                    }
                                                >
                                                    Common Booking Slot
                                                </Text>

                                            </View>

                                            <Text
                                                style={
                                                    styles.commonSlotText
                                                }
                                            >
                                                {selectedDate}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.commonSlotText
                                                }
                                            >
                                                {selectedTime}
                                            </Text>

                                        </View>

                                        {/* SERVICES */}

                                        {selectedServices.map(
                                            service => {

                                                const hours =
                                                    Number(
                                                        service.selectedHours
                                                    ) || 1;

                                                const price =
                                                    calculateServicePrice(
                                                        service,
                                                        hours
                                                    );

                                                return (

                                                    <View
                                                        key={
                                                            service.id
                                                        }
                                                        style={
                                                            styles.billServiceCard
                                                        }
                                                    >

                                                        <View
                                                            style={
                                                                styles.billServiceHeader
                                                            }
                                                        >

                                                            <Text
                                                                style={
                                                                    styles.billServiceName
                                                                }
                                                            >
                                                                {
                                                                    service.name
                                                                }
                                                            </Text>

                                                            <Text
                                                                style={
                                                                    styles.billServicePrice
                                                                }
                                                            >
                                                                ₹{price}
                                                            </Text>

                                                        </View>

                                                        <Text
                                                            style={
                                                                styles.billServiceHours
                                                            }
                                                        >
                                                            {hours}{' '}
                                                            {hours === 1
                                                                ? 'Hour'
                                                                : 'Hours'}
                                                        </Text>

                                                    </View>
                                                );
                                            }
                                        )}

                                        <View
                                            style={
                                                styles.billDivider
                                            }
                                        />

                                        <View
                                            style={
                                                styles.billRow
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.billLabel
                                                }
                                            >
                                                Total Hours
                                            </Text>

                                            <Text
                                                style={
                                                    styles.billValue
                                                }
                                            >
                                                {
                                                    getTotalHours()
                                                } hrs
                                            </Text>

                                        </View>

                                        <View
                                            style={
                                                styles.billRow
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.billLabel
                                                }
                                            >
                                                Subtotal
                                            </Text>

                                            <Text
                                                style={
                                                    styles.billValue
                                                }
                                            >
                                                ₹{subtotal}
                                            </Text>

                                        </View>

                                        {/* <View
                                            style={
                                                styles.billRow
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.billLabel
                                                }
                                            >
                                                GST (18%)
                                            </Text>

                                            <Text
                                                style={
                                                    styles.billValue
                                                }
                                            >
                                                ₹{gst}
                                            </Text>

                                        </View> */}

                                        <View
                                            style={
                                                styles.billDivider
                                            }
                                        />

                                        <View
                                            style={
                                                styles.billTotalRow
                                            }
                                        >

                                            <View>

                                                <Text
                                                    style={
                                                        styles.billTotalLabel
                                                    }
                                                >
                                                    Total Amount
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.billTotalSubtext
                                                    }
                                                >
                                                    Including GST
                                                </Text>

                                            </View>

                                            <Text
                                                style={
                                                    styles.billTotalAmount
                                                }
                                            >
                                                ₹{subtotal}
                                            </Text>

                                        </View>

                                        <TouchableOpacity
                                            style={
                                                styles.billConfirmButton
                                            }
                                            onPress={
                                                handleConfirmBooking
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.billConfirmText
                                                }
                                            >
                                                Confirm Booking
                                            </Text>

                                            <Image
                                                source={require('../../asset/right-arrow.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    resizeMode:
                                                        'contain',
                                                    tintColor:
                                                        COLORS.white,
                                                }}
                                            />

                                        </TouchableOpacity>

                                    </ScrollView>

                                    <TouchableOpacity
                                        style={
                                            styles.modalCloseButton
                                        }
                                        onPress={
                                            closeBillSummary
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.modalCloseText
                                            }
                                        >
                                            Cancel
                                        </Text>

                                    </TouchableOpacity>

                                </Animated.View>

                            </TouchableWithoutFeedback>

                        </View>

                    </TouchableWithoutFeedback>

                </Modal>
            );
        };

    // =========================================================
    // CONFIRM BOOKING
    // =========================================================

    const handleConfirmBooking = async () => {
        try {
            const totalPrice = getTotalAmount();

            const finalServices = selectedServices.map(service => ({
                ...service,
                selectedHours: service.selectedHours || 1,
                calculatedPrice: calculateServicePrice(
                    service,
                    service.selectedHours || 1
                ),
            }));

            const bookingData = {
                selectedServices: finalServices,

                customerDetails: {
                    name: customerName,
                    mobile: customerMobile,
                },

                addressDetails,
                address,

                slotSelections: {
                    date: selectedDate,
                    time: selectedTime,
                },

                professional: selectedProfessionalDetails,
                professionalId: selectedProfessional,

                subtotal: totalPrice,
                totalPrice: totalPrice,
            };

            // ---------------------------------------
            // REMOVE BOOKED SERVICES FROM CART
            // ---------------------------------------
            await AsyncStorage.removeItem('selectedServices');

            // Clear local cart state
            setSelectedServices([]);

            // ---------------------------------------
            // GO TO CONFIRMATION SCREEN
            // ---------------------------------------
            navigation.replace(
                'BookingConfirmationScreen',
                bookingData
            );

        } catch (error) {
            console.log('Confirm Booking Error:', error);
        }
    };

    // =========================================================
    // RENDER SERVICE
    // =========================================================

    const renderServiceCard =
        service => {

            const hours =
                Number(
                    service.selectedHours
                ) || 0;

            const price =
                hours > 0
                    ? calculateServicePrice(
                        service,
                        hours
                    )
                    : 0;

            return (

                <View
                    key={service.id}
                    style={
                        styles.serviceCard
                    }
                >

                    {/* SERVICE HEADER */}

                    <View
                        style={
                            styles.serviceHeader
                        }
                    >

                        {service.image ||
                            service.coverImage ? (

                            <Image
                                source={
                                    service.image ||
                                    service.coverImage
                                }
                                style={
                                    styles.serviceImage
                                }
                            />

                        ) : (

                            <View
                                style={
                                    styles.serviceImagePlaceholder
                                }
                            >

                                <Text
                                    style={
                                        styles.serviceImagePlaceholderText
                                    }
                                >
                                    {service.name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </Text>

                            </View>
                        )}

                        <View
                            style={
                                styles.serviceInfo
                            }
                        >

                            <Text
                                style={
                                    styles.serviceName
                                }
                                numberOfLines={2}
                            >
                                {service.name}
                            </Text>

                            <Text
                                style={
                                    styles.servicePriceText
                                }
                            >
                                {hours > 0
                                    ? `₹${price}`
                                    : 'Select hours'}
                            </Text>

                        </View>

                    </View>

                    {/* HOURS */}

                    <Text
                        style={
                            styles.hoursTitle
                        }
                    >
                        Select Hours
                    </Text>

                    <View
                        style={
                            styles.hoursContainer
                        }
                    >

                        {[
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                        ].map(hour => {

                            const isSelected =
                                hours === hour;

                            const calculatedPrice =
                                calculateServicePrice(
                                    service,
                                    hour
                                );

                            return (

                                <TouchableOpacity
                                    key={hour}
                                    style={[
                                        styles.hoursCard,

                                        isSelected &&
                                        styles.hoursCardSelected,
                                    ]}
                                    onPress={() =>
                                        updateServiceHours(
                                            service.id,
                                            hour
                                        )
                                    }
                                >

                                    <Text
                                        style={[
                                            styles.hoursText,

                                            isSelected &&
                                            styles.hoursTextSelected,
                                        ]}
                                    >
                                        {hour}{' '}
                                        {hour === 1
                                            ? 'Hour'
                                            : 'Hours'}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.hoursPrice,

                                            isSelected &&
                                            styles.hoursPriceSelected,
                                        ]}
                                    >
                                        ₹{calculatedPrice}
                                    </Text>

                                </TouchableOpacity>
                            );
                        })}

                    </View>

                    {/* PRICING INFORMATION */}

                    {hours > 0 && (

                        <View
                            style={
                                styles.priceInfoBox
                            }
                        >

                            <Text
                                style={
                                    styles.priceInfoText
                                }
                            >
                                {hours === 4 &&
                                    getPricingItem(
                                        service,
                                        2
                                    )
                                    ? '4-hour package price applied'
                                    : hours === 8 &&
                                        getPricingItem(
                                            service,
                                            3
                                        )
                                        ? '8-hour package price applied'
                                        : 'Hourly price applied'}
                            </Text>

                            <Text
                                style={
                                    styles.selectedServiceTotal
                                }
                            >
                                ₹{price}
                            </Text>

                        </View>
                    )}

                </View>
            );
        };

    // =========================================================
    // RETURN
    // =========================================================

    return (

        <View
            style={
                styles.container
            }
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor={
                    COLORS.primaryLight
                }
            />

            {/* HEADER */}

            <View
                style={
                    styles.header
                }
            >

                <TouchableOpacity
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        navigation.goBack()
                    }
                >

                    <Image
                        source={require('../../asset/arrow-back.png')}
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode:
                                'contain',
                            tintColor:
                                COLORS.primaryDark,
                        }}
                    />

                </TouchableOpacity>

                <Text
                    style={
                        styles.headerTitle
                    }
                >
                    Select Slot
                </Text>

                <View
                    style={
                        styles.headerRight
                    }
                />

            </View>

            <Animated.ScrollView
                style={[
                    styles.content,

                    {
                        opacity:
                            fadeAnim,

                        transform: [
                            {
                                translateY:
                                    slideAnim,
                            },
                        ],
                    },
                ]}
                showsVerticalScrollIndicator={
                    false
                }
            >

                {/* =================================================
                    SERVICES
                ================================================= */}

                <View
                    style={
                        styles.sectionContainer
                    }
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Select Service Hours
                    </Text>

                    <Text
                        style={
                            styles.sectionSubtitle
                        }
                    >
                        Select duration separately for each service
                    </Text>

                    {selectedServices.length === 0 ? (

                        <View
                            style={
                                styles.emptyBox
                            }
                        >

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                No services selected
                            </Text>

                        </View>

                    ) : (

                        selectedServices.map(
                            renderServiceCard
                        )
                    )}

                </View>

                {/* =================================================
                    COMMON DATE
                ================================================= */}

                <View
                    style={
                        styles.sectionContainer
                    }
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Select Date
                    </Text>

                    <Text
                        style={
                            styles.sectionSubtitle
                        }
                    >
                        One date will be used for all selected services
                    </Text>

                    <View
                        style={
                            styles.datesContainer
                        }
                    >

                        {availableDates.map(
                            (
                                date,
                                index
                            ) => {

                                const dateStr =
                                    date.toDateString();

                                const isSelected =
                                    selectedDate ===
                                    dateStr;

                                return (

                                    <TouchableOpacity
                                        key={
                                            index
                                        }
                                        style={[
                                            styles.dateCard,

                                            isSelected &&
                                            styles.dateCardSelected,
                                        ]}
                                        onPress={() =>
                                            toggleDateSelection(
                                                date
                                            )
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.dateDay,

                                                isSelected &&
                                                styles.dateTextSelected,
                                            ]}
                                        >
                                            {
                                                [
                                                    'Sun',
                                                    'Mon',
                                                    'Tue',
                                                    'Wed',
                                                    'Thu',
                                                    'Fri',
                                                    'Sat',
                                                ][
                                                date.getDay()
                                                ]
                                            }
                                        </Text>

                                        <Text
                                            style={[
                                                styles.dateNumber,

                                                isSelected &&
                                                styles.dateTextSelected,
                                            ]}
                                        >
                                            {
                                                date.getDate()
                                            }
                                        </Text>

                                        <Text
                                            style={[
                                                styles.dateMonth,

                                                isSelected &&
                                                styles.dateTextSelected,
                                            ]}
                                        >
                                            {date.toLocaleString(
                                                'default',
                                                {
                                                    month:
                                                        'short',
                                                }
                                            )}
                                        </Text>

                                    </TouchableOpacity>
                                );
                            }
                        )}

                    </View>

                    {selectedDate && (

                        <View
                            style={
                                styles.selectedInfoBox
                            }
                        >

                            <Image
                                source={require('../../asset/calendar.png')}
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode:
                                        'contain',
                                    tintColor:
                                        COLORS.primary,
                                }}
                            />

                            <Text
                                style={
                                    styles.selectedInfoText
                                }
                            >
                                Booking Date:{' '}
                                {selectedDate}
                            </Text>

                        </View>
                    )}

                </View>

                {/* =================================================
                    COMMON TIME
                ================================================= */}

                <View
                    style={
                        styles.sectionContainer
                    }
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Select Time
                    </Text>

                    <Text
                        style={
                            styles.sectionSubtitle
                        }
                    >
                        One time will be used for all selected services
                    </Text>

                    <View
                        style={
                            styles.timeContainer
                        }
                    >

                        {timeSlots.map(
                            time => {

                                const isSelected =
                                    selectedTime ===
                                    time;

                                return (

                                    <TouchableOpacity
                                        key={
                                            time
                                        }
                                        style={[
                                            styles.timeCard,

                                            isSelected &&
                                            styles.timeCardSelected,
                                        ]}
                                        onPress={() =>
                                            selectTime(
                                                time
                                            )
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.timeText,

                                                isSelected &&
                                                styles.timeTextSelected,
                                            ]}
                                        >
                                            {
                                                time
                                            }
                                        </Text>

                                    </TouchableOpacity>
                                );
                            }
                        )}

                    </View>

                    {selectedTime && (

                        <View
                            style={
                                styles.selectedInfoBox
                            }
                        >

                            <Image
                                source={require('../../asset/time-outline.png')}
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode:
                                        'contain',
                                    tintColor:
                                        COLORS.primary,
                                }}
                            />

                            <Text
                                style={
                                    styles.selectedInfoText
                                }
                            >
                                Common Time:{' '}
                                {selectedTime}
                            </Text>

                        </View>
                    )}

                </View>

                {/* =================================================
                    PROFESSIONAL
                ================================================= */}

                <View
                    style={
                        styles.sectionContainer
                    }
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Choose Professional
                    </Text>

                    <Text
                        style={
                            styles.sectionSubtitle
                        }
                    >
                        Select one professional for this booking
                    </Text>

                    {!selectedDate && (

                        <View
                            style={
                                styles.warningBox
                            }
                        >

                            <Image
                                source={require('../../asset/information.png')}
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode:
                                        'contain',
                                    tintColor:
                                        COLORS.warning,
                                }}
                            />

                            <Text
                                style={
                                    styles.warningText
                                }
                            >
                                Select a date first
                            </Text>

                        </View>
                    )}

                    {selectedDate &&
                        !selectedTime && (

                            <View
                                style={
                                    styles.warningBox
                                }
                            >

                                <Image
                                    source={require('../../asset/information.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode:
                                            'contain',
                                        tintColor:
                                            COLORS.warning,
                                    }}
                                />

                                <Text
                                    style={
                                        styles.warningText
                                    }
                                >
                                    Select a time first
                                </Text>

                            </View>
                        )}

                    <FlatList
                        data={
                            activeProfessionals
                        }
                        renderItem={
                            renderProfessionalGrid
                        }
                        keyExtractor={
                            item =>
                                item.id
                        }
                        numColumns={2}
                        scrollEnabled={
                            false
                        }
                        contentContainerStyle={
                            styles.professionalGrid
                        }
                        columnWrapperStyle={
                            styles.professionalGridRow
                        }
                    />

                </View>

                {/* =================================================
                    BOOKING SUMMARY
                ================================================= */}

                <View
                    style={
                        styles.summaryCard
                    }
                >

                    <Text
                        style={
                            styles.summaryTitle
                        }
                    >
                        Booking Summary
                    </Text>

                    <View
                        style={
                            styles.summaryRow
                        }
                    >

                        <Text
                            style={
                                styles.summaryLabel
                            }
                        >
                            Services
                        </Text>

                        <Text
                            style={
                                styles.summaryValue
                            }
                        >
                            {
                                selectedServices.length
                            }
                        </Text>

                    </View>

                    <View
                        style={
                            styles.summaryRow
                        }
                    >

                        <Text
                            style={
                                styles.summaryLabel
                            }
                        >
                            Total Hours
                        </Text>

                        <Text
                            style={
                                styles.summaryValue
                            }
                        >
                            {
                                getTotalHours()
                            } hrs
                        </Text>

                    </View>

                    <View
                        style={
                            styles.summaryRow
                        }
                    >

                        <Text
                            style={
                                styles.summaryLabel
                            }
                        >
                            Subtotal
                        </Text>

                        <Text
                            style={
                                styles.summaryValue
                            }
                        >
                            ₹{getTotalAmount()}
                        </Text>

                    </View>

                    <View
                        style={
                            styles.summaryDivider
                        }
                    />

                    <View
                        style={
                            styles.summaryRow
                        }
                    >

                        <Text
                            style={
                                styles.summaryTotalLabel
                            }
                        >
                            Total
                        </Text>

                        <Text
                            style={
                                styles.summaryTotalValue
                            }
                        >
                            ₹{getTotalAmount()}
                        </Text>

                    </View>

                </View>

                {/* =================================================
                    CONTINUE
                ================================================= */}

                <TouchableOpacity
                    style={[
                        styles.continueButton,

                        (
                            selectedServices.length ===
                            0 ||
                            !selectedDate ||
                            !selectedTime ||
                            !selectedProfessional ||
                            selectedServices.some(
                                service =>
                                    !service.selectedHours
                            )
                        ) &&
                        styles.continueButtonDisabled,
                    ]}
                    disabled={
                        selectedServices.length ===
                        0 ||
                        !selectedDate ||
                        !selectedTime ||
                        !selectedProfessional ||
                        selectedServices.some(
                            service =>
                                !service.selectedHours
                        )
                    }
                    onPress={
                        openBillSummary
                    }
                >

                    <Text
                        style={
                            styles.continueButtonText
                        }
                    >
                        Review Booking
                    </Text>

                    <Image
                        source={require('../../asset/right-arrow.png')}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode:
                                'contain',
                            tintColor:
                                COLORS.white,
                        }}
                    />

                </TouchableOpacity>

                <View
                    style={
                        styles.footerSpacer
                    }
                />

            </Animated.ScrollView>

            {/* =====================================================
                MODALS
            ===================================================== */}

            {renderProfessionalModal()}

            {renderBillSummary()}

        </View>
    );
};

// =============================================================
// STYLES
// =============================================================

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
        backgroundColor: '#d6bceb',
        borderBottomWidth: 1,
        borderBottomColor:
            'rgba(255,255,255,0.1)',
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
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    sectionContainer: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },

    sectionSubtitle: {
        fontSize: 13,
        color: '#999999',
        marginBottom: 12,
    },

    // =========================================================
    // SERVICE CARD
    // =========================================================

    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },

    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

    serviceImage: {
        width: 58,
        height: 58,
        borderRadius: 10,
        resizeMode: 'cover',
    },

    serviceImagePlaceholder: {
        width: 58,
        height: 58,
        borderRadius: 10,
        backgroundColor: '#d6bceb',
        justifyContent: 'center',
        alignItems: 'center',
    },

    serviceImagePlaceholderText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    serviceInfo: {
        flex: 1,
        marginLeft: 12,
    },

    serviceName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    servicePriceText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#76577F',
        marginTop: 4,
    },

    hoursTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },

    hoursContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    hoursCard: {
        width: '23%',
        paddingVertical: 9,
        borderRadius: 9,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E8E3D8',
        alignItems: 'center',
    },

    hoursCardSelected: {
        backgroundColor: '#76577F',
        borderColor: '#76577F',
    },

    hoursText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A1A',
    },

    hoursTextSelected: {
        color: '#FFFFFF',
    },

    hoursPrice: {
        fontSize: 10,
        color: '#76577F',
        marginTop: 3,
        fontWeight: '600',
    },

    hoursPriceSelected: {
        color: '#FFFFFF',
    },

    priceInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F6F0',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 12,
    },

    priceInfoText: {
        flex: 1,
        fontSize: 11,
        color: '#666666',
    },

    selectedServiceTotal: {
        fontSize: 15,
        fontWeight: '700',
        color: '#76577F',
    },

    emptyBox: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },

    emptyText: {
        color: '#666666',
        fontSize: 14,
    },

    // =========================================================
    // DATE
    // =========================================================

    datesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    dateCard: {
        width: (width - 60) / 7,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E8E3D8',
    },

    dateCardSelected: {
        backgroundColor: '#76577F',
        borderColor: '#C4B0D3',
    },

    dateDay: {
        fontSize: 10,
        color: '#666666',
        fontWeight: '500',
    },

    dateNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 2,
    },

    dateMonth: {
        fontSize: 9,
        color: '#666666',
        marginTop: 1,
    },

    dateTextSelected: {
        color: '#FFFFFF',
    },

    selectedInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0EAF3',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        gap: 8,
    },

    selectedInfoText: {
        fontSize: 13,
        color: '#76577F',
        fontWeight: '600',
    },

    // =========================================================
    // TIME
    // =========================================================

    timeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    timeCard: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E8E3D8',
    },

    timeCardSelected: {
        backgroundColor: '#76577F',
        borderColor: '#C4B0D3',
    },

    timeText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '500',
    },

    timeTextSelected: {
        color: '#FFFFFF',
    },

    // =========================================================
    // PROFESSIONAL
    // =========================================================

    professionalGrid: {
        paddingVertical: 4,
    },

    professionalGridRow: {
        justifyContent: 'space-between',
    },

    professionalGridCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        margin: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0EDE8',
        position: 'relative',
        minHeight: 165,
        maxWidth:
            (width - 40) / 2,
    },

    professionalGridCardSelected: {
        borderColor: '#76577F',
        backgroundColor: '#F8F6F0',
        borderWidth: 2,
    },

    professionalGridCardUnavailable: {
        opacity: 0.5,
    },

    professionalGridImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },

    professionalGridInfo: {
        alignItems: 'center',
        marginTop: 4,
    },

    professionalGridName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
    },

    professionalGridRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },

    professionalGridRatingText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 2,
    },

    professionalGridJobs: {
        fontSize: 9,
        color: '#666666',
        marginTop: 2,
    },

    professionalExperience: {
        fontSize: 9,
        color: '#76577F',
        marginTop: 2,
        fontWeight: '600',
    },

    professionalGridCheck: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
    },

    professionalGridUnavailableBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#E8E3D8',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },

    professionalGridUnavailableText: {
        fontSize: 7,
        color: '#666666',
    },

    professionalGridViewButton: {
        position: 'absolute',
        bottom: 2,
        right: 4,
        padding: 4,
    },

    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF8E1',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },

    warningText: {
        fontSize: 13,
        color: '#666666',
    },

    // =========================================================
    // SUMMARY
    // =========================================================

    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },

    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    summaryLabel: {
        fontSize: 13,
        color: '#666666',
    },

    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },

    summaryDivider: {
        height: 1,
        backgroundColor: '#F0EDE8',
        marginVertical: 8,
    },

    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    summaryTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#76577F',
    },

    // =========================================================
    // CONTINUE
    // =========================================================

    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#76577F',
        paddingVertical: 15,
        borderRadius: 12,
    },

    continueButtonDisabled: {
        opacity: 0.45,
    },

    continueButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    footerSpacer: {
        height: 30,
    },

    // =========================================================
    // MODAL
    // =========================================================

    modalOverlay: {
        flex: 1,
        backgroundColor:
            'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        maxHeight:
            height * 0.85,
    },

    billModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        maxHeight:
            height * 0.85,
    },

    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },

    modalProfessionalHeader: {
        alignItems: 'center',
        paddingVertical: 16,
    },

    modalProfessionalImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },

    modalProfessionalName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 8,
    },

    modalProfessionalRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    modalProfessionalRatingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 4,
    },

    modalStats: {
        flexDirection: 'row',
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
    },

    modalStat: {
        flex: 1,
        alignItems: 'center',
    },

    modalStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    modalStatLabel: {
        fontSize: 11,
        color: '#666666',
        marginTop: 2,
    },

    modalStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E8E3D8',
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

    modalSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    modalSlotTag: {
        backgroundColor: '#F8F6F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },

    modalSlotTagText: {
        fontSize: 12,
        color: '#1A1A1A',
    },

    modalSelectButton: {
        backgroundColor: '#76577F',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },

    modalSelectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    modalCloseButton: {
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },

    modalCloseText: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '500',
    },

    // =========================================================
    // BILL
    // =========================================================

    billHeader: {
        marginBottom: 12,
    },

    billTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },

    billSubtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
    },

    commonSlotCard: {
        backgroundColor: '#F0EAF3',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },

    commonSlotHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },

    commonSlotTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#76577F',
    },

    commonSlotText: {
        fontSize: 13,
        color: '#403746',
        marginTop: 2,
    },

    billServiceCard: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },

    billServiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    billServiceName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 10,
    },

    billServicePrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#76577F',
    },

    billServiceHours: {
        fontSize: 12,
        color: '#666666',
        marginTop: 3,
    },

    billDivider: {
        height: 1,
        backgroundColor: '#F0EDE8',
        marginVertical: 12,
    },

    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 7,
    },

    billLabel: {
        fontSize: 14,
        color: '#666666',
    },

    billValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },

    billTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    billTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    billTotalSubtext: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },

    billTotalAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#76577F',
    },

    billConfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#76577F',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 16,
    },

    billConfirmText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default SelectSlotScreen;