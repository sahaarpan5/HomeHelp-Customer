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
    SafeAreaView,
    Pressable,
    Platform,
    ActivityIndicator,
} from 'react-native';

import RazorpayCheckout from 'react-native-razorpay';

import API from '../../util/API';
import axios from 'axios';
import ServiceOrbitLoader from '../../util/ServiceOrbitLoader';
import {
    initializeCartNotifications,
    scheduleCartReminder,
    cancelCartReminder,
} from '../../util/CartNotification';

const { width, height } = Dimensions.get('window');

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
    txtColor: '#403746',
};

const HALF_DAY_HOURS = 4;
const FULL_DAY_HOURS = 8;

const SelectSlotScreenV1 = ({ navigation, route }) => {

    /*
    |--------------------------------------------------------------------------
    | ROUTE DATA
    |--------------------------------------------------------------------------
    */


    const getBookingTimeRange = (time, hours) => {
        if (!time) {
            return {
                startTime: '',
                endTime: '',
            };
        }

        const match = String(time).match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
        );

        if (!match) {
            console.log('Invalid booking time:', time);

            return {
                startTime: '',
                endTime: '',
            };
        }

        let hour = Number(match[1]);
        const minute = Number(match[2]);
        const period = match[3].toUpperCase();

        // Convert 12-hour time to 24-hour time
        if (period === 'PM' && hour !== 12) {
            hour += 12;
        }

        if (period === 'AM' && hour === 12) {
            hour = 0;
        }

        const startDate = new Date();
        startDate.setHours(hour, minute, 0, 0);

        const endDate = new Date(startDate);

        endDate.setMinutes(
            endDate.getMinutes() +
            (Number(hours) || 1) * 60
        );

        const formatTime = date => {
            const h = String(date.getHours()).padStart(2, '0');
            const m = String(date.getMinutes()).padStart(2, '0');
            const s = String(date.getSeconds()).padStart(2, '0');

            return `${h}:${m}:${s}`;
        };

        return {
            startTime: formatTime(startDate),
            endTime: formatTime(endDate),
        };
    };


    const formatServiceDate = date => {
        if (!date) {
            return '';
        }

        // Already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
            return String(date);
        }

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return '';
        }

        const year = parsedDate.getFullYear();
        const month = String(
            parsedDate.getMonth() + 1
        ).padStart(2, '0');
        const day = String(
            parsedDate.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const {
        selectedServices = [],
        customerDetails = {},
        addressDetails = null,
        address = '',
        slotSelections: previousSlotSelections = {},
    } = route.params || {};

    const {
        name: customerName = '',
        mobile: customerMobile = '',
    } = customerDetails;

    console.log('Selected Services:', selectedServices);
    console.log('Customer Name:', customerName);
    console.log('Customer Mobile:', customerMobile);
    console.log('Address Details:', addressDetails);
    console.log('Address:', address);


    const [isPaymentLoading, setIsPaymentLoading] = useState(false);


    const [isBookingLoading, setIsBookingLoading] = useState(false);

    const [orderID, setOrderID] = useState('');

    const [paymentResponse, setPaymentResponse] = useState(null);

    const [totalAmt, setTotalAmt] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | STATES
    |--------------------------------------------------------------------------
    */

    const billScrollRef = useRef(null);

    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Hourly / Half Day / Full Day
    const [selectedDurationType, setSelectedDurationType] =
        useState('hourly');

    // DEFAULT = 1 HOUR
    const [selectedHours, setSelectedHours] =
        useState('1 Hour');

    const [selectedProfessional, setSelectedProfessional] =
        useState(null);

    const [addedSlots, setAddedSlots] =
        useState([]);

    const [showProfessionalModal, setShowProfessionalModal] =
        useState(false);

    const [selectedProfessionalDetails, setSelectedProfessionalDetails] =
        useState(null);

    const [showBillSummary, setShowBillSummary] =
        useState(false);

    const [scheduleType, setScheduleType] =
        useState('same');

    /*
    |--------------------------------------------------------------------------
    | SAME SCHEDULE
    |--------------------------------------------------------------------------
    */

    const [commonDates, setCommonDates] =
        useState([]);

    const [commonDateServices, setCommonDateServices] =
        useState({});

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT SCHEDULE
    |--------------------------------------------------------------------------
    */

    const [serviceSchedules, setServiceSchedules] =
        useState({});

    /*
    |--------------------------------------------------------------------------
    | ANIMATION
    |--------------------------------------------------------------------------
    */

    const fadeAnim =
        useRef(new Animated.Value(0)).current;

    const slideAnim =
        useRef(new Animated.Value(30)).current;

    const modalSlideAnim =
        useRef(new Animated.Value(height)).current;

    const billModalSlideAnim =
        useRef(new Animated.Value(height)).current;

    /*
    |--------------------------------------------------------------------------
    | STAR IMAGES
    |--------------------------------------------------------------------------
    */

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    /*
    |--------------------------------------------------------------------------
    | DATES
    |--------------------------------------------------------------------------
    */

    const generateDates = () => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }

        return dates;
    };

    const availableDates = generateDates();

    /*
    |--------------------------------------------------------------------------
    | TIME SLOTS
    |--------------------------------------------------------------------------
    */

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

    /*
 |-------------------------------------------------------------------------- 
 | SCHEDULE BUTTON STATE
 |-------------------------------------------------------------------------- 
 */

    const getProfessionalKey = professional => {
        if (!professional) {
            return '';
        }

        return String(
            professional.id ??
            professional.professionalId ??
            professional.userId ??
            professional.name ??
            ''
        );
    };

    const getCurrentScheduleSignature = () => {

        const rows = [];

        if (scheduleType === 'same') {

            commonDates.forEach(date => {

                const data =
                    commonDateServices[date] || {};

                selectedServices.forEach(service => {

                    const item =
                        data[String(service.id)];

                    if (!item) {
                        return;
                    }

                    const hours = Number(item.hours) || 1;

                    const {
                        startTime,
                        endTime,
                    } = getBookingTimeRange(
                        item.time,
                        hours
                    );

                    rows.push({
                        id: `${service.id}-${date}`,

                        serviceId: service.id,

                        serviceName: service.name,

                        date,

                        // UI display value
                        time: item.time,

                        // Selected duration
                        hours,

                        // API booking time
                        startTime,

                        endTime,

                        amount:
                            Number(item.amount) || 0,

                        professional:
                            item.professional,

                        professionalName:
                            item.professional?.name ||
                            'Select Any Professional',

                        pricing:
                            service.pricing || [],

                        ourProcess:
                            service.ourProcess || [],

                        service,
                    });
                });
            });

        } else {

            selectedServices.forEach(service => {

                const schedules =
                    serviceSchedules[service.id] || [];

                schedules.forEach(item => {

                    rows.push({
                        serviceId: String(service.id),
                        date: String(item.date),
                        time: item.time || '',
                        hours: Number(item.hours || 0),
                        professional: getProfessionalKey(
                            item.professional
                        ),
                    });

                });
            });
        }

        return rows.sort((a, b) => {

            const first =
                `${a.serviceId}-${a.date}`;

            const second =
                `${b.serviceId}-${b.date}`;

            return first.localeCompare(second);
        });
    };


    const getAddedScheduleSignature = () => {

        return addedSlots
            .map(slot => ({
                serviceId: String(slot.serviceId),
                date: String(slot.date),
                time: slot.time || '',
                hours: Number(slot.hours || 0),
                professional: getProfessionalKey(
                    slot.professional
                ),
            }))
            .sort((a, b) => {

                const first =
                    `${a.serviceId}-${a.date}`;

                const second =
                    `${b.serviceId}-${b.date}`;

                return first.localeCompare(second);
            });
    };


    const getScheduleButtonText = () => {

        // No schedule added yet
        if (addedSlots.length === 0) {
            return 'Add Schedule';
        }

        const current =
            getCurrentScheduleSignature();

        const added =
            getAddedScheduleSignature();

        // Nothing changed
        if (
            JSON.stringify(current) ===
            JSON.stringify(added)
        ) {
            return '';
        }

        /*
        |---------------------------------------------------------
        | Check DATE change
        |---------------------------------------------------------
        */

        const currentDates = current
            .map(item =>
                `${item.serviceId}-${item.date}`
            )
            .sort();

        const addedDates = added
            .map(item =>
                `${item.serviceId}-${item.date}`
            )
            .sort();

        const dateChanged =
            JSON.stringify(currentDates) !==
            JSON.stringify(addedDates);

        /*
        |---------------------------------------------------------
        | DATE changed
        |---------------------------------------------------------
        */

        if (dateChanged) {
            return 'Add Schedule';
        }

        /*
        |---------------------------------------------------------
        | Same date but hours/time/professional changed
        |---------------------------------------------------------
        */

        return 'Update Schedule';
    };


    const scheduleButtonText =
        getScheduleButtonText();

    const shouldShowScheduleButton =
        scheduleButtonText !== '';





    /*
    |--------------------------------------------------------------------------
    | PROFESSIONALS
    |--------------------------------------------------------------------------
    */

    const professionals = [

    ];

    const ANY_PROFESSIONAL = {
        id: 'ANY',
        name: 'Select Any Professional',
        image:
            'https://ui-avatars.com/api/?name=Any+Professional&background=76577F&color=fff&size=100',
        rating: 0,
        jobsCompleted: 0,
        experience: 'All professionals',
        availableSlots: timeSlots,
        lastBookingDate: 'Any',
        isAny: true,
        isActive: true,
    };

    const activeProfessionals = [
        ANY_PROFESSIONAL,
        ...professionals.filter(
            item => item.isActive
        ),
    ];

    /*
    |--------------------------------------------------------------------------
    | ANIMATION
    |--------------------------------------------------------------------------
    */

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
        if (showBillSummary) {
            const timer = setTimeout(() => {
                billScrollRef.current?.scrollToEnd({
                    animated: true,
                });
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [showBillSummary]);



    useEffect(() => {
        initializeCartNotifications();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | MODAL ANIMATION
    |--------------------------------------------------------------------------
    */

    const animateModalIn = animRef => {
        animRef.setValue(height);

        Animated.spring(animRef, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const animateModalOut = (
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


    const removeServicesFromCart = async () => {
        try {
            await AsyncStorage.removeItem('selectedServices');
             await cancelCartReminder();

            console.log('Cart cleared successfully');
        } catch (error) {
            console.log('Error clearing cart:', error);
        }
    };


    const validatePayment = async ({
        orderId,
        paymentId,
        signature,
    }) => {
        try {
            setIsPaymentLoading(true);

            const token = await AsyncStorage.getItem('token');

            const response = await axios.post(
                'https://www.geniushomehelp.com/api/Booking/validate-payment',
                {
                    orderId,
                    paymentId,
                    signature,
                },
                {
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Validate Payment Response:', response.data);

            const {
                bookingId,
                bookingNo,
                bookingStatus,
                paymentStatus,
            } = response.data || {};



            setOrderID(bookingNo);
            setShowPaymentModal(true);

        } catch (error) {
            console.log(
                'Validate Payment Error:',
                error?.response?.data || error.message
            );



        } finally {
            setIsPaymentLoading(false);
        }
    };


    const handleDemoPayment = async (orderId) => {
        try {
            // Get all selected service names
            const serviceNames = selectedServices
                .map(service => service?.name)
                .filter(Boolean)
                .join(', ');

            // Get total amount from your existing calculation
            const totalAmount = Number(getTotalAmount()) || 0;

            // Razorpay amount must be in paise
            const razorpayAmount = Math.round(totalAmount * 100);

            console.log('Selected Services:', serviceNames);
            console.log('Total Amount:', totalAmount);
            console.log('Razorpay Amount:', razorpayAmount);

            if (totalAmount <= 0) {
                Alert.alert(
                    'Invalid Amount',
                    'The total booking amount must be greater than ₹0.'
                );
                return;
            }

            const options = {
                key: 'rzp_test_RIAZiMV1zkO9Ah',

                // ₹ amount converted to paise
                amount: razorpayAmount,

                currency: 'INR',

                name: 'HomeHelp',

                order_id: orderId,

                // All selected service names
                description: serviceNames || 'HomeHelp Services',

                prefill: {
                    name: customerName || '',
                    email: 'demo@example.com',
                    contact: customerMobile || '',
                },

                theme: {
                    color: '#76577F',
                },
            };

            console.log(
                'RAZORPAY OPTIONS:',
                options
            );

            const paymentResponse =
                await RazorpayCheckout.open(options);

            console.log(
                'RAZORPAY SUCCESS:',
                paymentResponse
            );

            setPaymentResponse(paymentResponse);


            await removeServicesFromCart();



            await validatePayment({
                orderId: paymentResponse.razorpay_order_id,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
            });

            // Alert.alert(
            //     'Payment Successful',
            //     '',
            //     [
            //         {
            //             text: 'OK',
            //             onPress: async () => {
            //                 await removeServicesFromCart();

            //                 navigation.replace(
            //                     'BookingConfirmationScreen',
            //                     {
            //                         slots: addedSlots,

            //                         bookingRows: addedSlots,

            //                         totalAmount: totalAmount,

            //                         totalHours: getTotalHours(),

            //                         selectedServices,

            //                         customerDetails: {
            //                             name: customerName,
            //                             mobile: customerMobile,
            //                         },

            //                         addressDetails,

            //                         address,

            //                         scheduleType,

            //                         paymentDetails: paymentResponse,
            //                     }
            //                 );
            //             },
            //         },
            //     ],
            //     {
            //         cancelable: false,
            //     }
            // );

        } catch (error) {

            console.log(
                'RAZORPAY PAYMENT ERROR:',
                error
            );

            Alert.alert(
                'Payment Failed',
                error?.description ||
                'Payment was cancelled or failed.'
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */

    const getPricingItem = (
        service,
        pricingType
    ) => {
        if (!Array.isArray(service?.pricing)) {
            return null;
        }

        return service.pricing.find(
            item =>
                Number(item.pricingType) ===
                pricingType &&
                (
                    item.isActive === true ||
                    item.isActive === 'true' ||
                    item.isActive === 1
                )
        );
    };

    const calculateServicePrice = (
        service,
        hours
    ) => {

        const selectedHour =
            Number(hours) || 0;

        if (selectedHour <= 0) {
            return 0;
        }

        /*
        | 1 = Hourly
        */

        const hourlyPricing =
            getPricingItem(
                service,
                1
            );

        const hourlyPrice =
            Number(
                hourlyPricing?.price
            ) || 0;

        /*
        | 4 Hours
        */

        if (selectedHour === 4) {

            const fourHourPricing =
                getPricingItem(
                    service,
                    2
                );

            if (fourHourPricing) {
                return Number(
                    fourHourPricing.price
                ) || 0;
            }

            return hourlyPrice * 4;
        }

        /*
        | 8 Hours
        */

        if (selectedHour === 8) {

            const eightHourPricing =
                getPricingItem(
                    service,
                    3
                );

            if (eightHourPricing) {
                return Number(
                    eightHourPricing.price
                ) || 0;
            }

            return hourlyPrice * 8;
        }

        /*
        | 1,2,3,5,6,7 Hours
        */

        return hourlyPrice * selectedHour;
    };

    /*
    |--------------------------------------------------------------------------
    | HOURS COMPONENT
    |--------------------------------------------------------------------------
    */

    // const renderHours = (
    //     service,
    //     selected,
    //     onSelect
    // ) => {

    //     return (
    //         <View
    //             style={
    //                 styles.hoursContainer
    //             }
    //         >

    //             {[
    //                 1,
    //                 2,
    //                 3,
    //                 4,
    //                 5,
    //                 6,
    //                 7,
    //                 8,
    //             ].map(hour => {

    //                 const amount =
    //                     calculateServicePrice(
    //                         service,
    //                         hour
    //                     );

    //                 const isSelected =
    //                     Number(selected) ===
    //                     hour;

    //                 return (
    //                     <TouchableOpacity
    //                         key={hour}
    //                         style={[
    //                             styles.hoursCard,
    //                             isSelected &&
    //                             styles.hoursCardSelected,
    //                         ]}
    //                         onPress={() =>
    //                             onSelect(hour)
    //                         }
    //                         activeOpacity={0.8}
    //                     >

    //                         <Text
    //                             style={[
    //                                 styles.hoursText,
    //                                 isSelected &&
    //                                 styles.hoursTextSelected,
    //                             ]}
    //                         >
    //                             {hour}{' '}
    //                             {hour === 1
    //                                 ? 'Hour'
    //                                 : 'Hours'}
    //                         </Text>

    //                         <Text
    //                             style={[
    //                                 styles.hoursAmount,
    //                                 isSelected &&
    //                                 styles.hoursAmountSelected,
    //                             ]}
    //                         >
    //                             ₹{amount}
    //                         </Text>

    //                     </TouchableOpacity>
    //                 );
    //             })}

    //         </View>
    //     );
    // };



    const renderHours = (
        service,
        selected,
        onSelect,
        date
    ) => {

        return (
            <View style={styles.hoursContainer}>
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

                    const amount = calculateServicePrice(
                        service,
                        hour
                    );

                    // If price is 0, this hour is unavailable
                    const isAvailable = Number(amount) > 0;

                    const isSelected =
                        isAvailable &&
                        Number(selected) === hour;

                    return (
                        <TouchableOpacity
                            key={hour}
                            style={[
                                styles.hoursCard,

                                // Disabled card
                                !isAvailable &&
                                styles.hoursCardDisabled,

                                // Selected card
                                isSelected &&
                                styles.hoursCardSelected,
                            ]}
                            onPress={() => {
                                if (!isAvailable) {
                                    return;
                                }

                                onSelect(hour);
                            }}
                            activeOpacity={
                                isAvailable ? 0.8 : 1
                            }
                            disabled={!isAvailable}
                        >
                            <Text
                                style={[
                                    styles.hoursText,

                                    !isAvailable &&
                                    styles.hoursTextDisabled,

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
                                    styles.hoursAmount,

                                    !isAvailable &&
                                    styles.hoursAmountDisabled,

                                    isSelected &&
                                    styles.hoursAmountSelected,
                                ]}
                            >
                                {isAvailable
                                    ? `₹${amount}`
                                    : 'Not Available'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };
    /*
    |--------------------------------------------------------------------------
    | STAR RENDER
    |--------------------------------------------------------------------------
    */

    const renderStars = (
        rating,
        size = 16
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

            let tintColor =
                '#DDD';

            if (
                i < fullStars
            ) {
                image =
                    starImages.full;

                tintColor =
                    '#FFD700';
            }
            else if (
                i === fullStars &&
                hasHalfStar
            ) {
                image =
                    starImages.half;

                tintColor =
                    '#FFD700';
            }

            stars.push(
                <Image
                    key={i}
                    source={image}
                    style={{
                        width: size,
                        height: size,
                        tintColor,
                        resizeMode:
                            'contain',
                        marginHorizontal:
                            1,
                    }}
                />
            );
        }

        return stars;
    };

    /*
    |--------------------------------------------------------------------------
    | DATE / TIME AVAILABILITY
    |--------------------------------------------------------------------------
    */

    const isTodayDate = date => {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    };

    const getTodayMinimumDateTime = () => {
        return new Date(Date.now() + 30 * 60 * 1000);
    };

    const parseTimeForDate = (date, time) => {
        if (!date || !time) return null;

        const match = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return null;

        let hour = Number(match[1]);
        const minute = Number(match[2]);
        const period = match[3].toUpperCase();

        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        const result = new Date(date);
        result.setHours(hour, minute, 0, 0);
        return result;
    };

    const formatTime = date => {
        if (!date) return '';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isProfessionalAvailable = (professional, date, time) => {
        if (!professional?.isActive || !date || !time) return false;

        const dateStr = typeof date === 'string' ? date : new Date(date).toDateString();

        if (isTodayDate(dateStr)) {
            const slotDateTime = parseTimeForDate(dateStr, time);
            if (!slotDateTime || slotDateTime < getTodayMinimumDateTime()) {
                return false;
            }
        }

        if (professional.isAny) {
            return professionals.some(item =>
                isProfessionalAvailable(item, dateStr, time)
            );
        }

        return Array.isArray(professional.availableSlots) &&
            professional.availableSlots.includes(time);
    };

    const getAvailableProfessionals = (date, time) => {
        if (!date || !time) return [];

        const available = professionals.filter(professional =>
            isProfessionalAvailable(professional, date, time)
        );

        return [ANY_PROFESSIONAL, ...available];
    };

    // const getAvailableTimes = date => {
    //     if (!date) return [];

    //     return timeSlots.filter(time =>
    //         professionals.some(professional =>
    //             isProfessionalAvailable(professional, date, time)
    //         )
    //     );
    // };

    const getAvailableTimes = date => {
        if (!date) return [];

        return [...timeSlots];
    };

    const getCurrentDateAvailabilityText = professional => {
        if (!isTodayDate(new Date())) return null;

        if (professional.isAny) {
            const times = timeSlots.filter(time =>
                professionals.some(item =>
                    isProfessionalAvailable(item, new Date(), time)
                )
            );
            const firstTime = times[0];
            return firstTime
                ? `Available after 30 min • from ${firstTime}`
                : 'Not available today';
        }

        const times = timeSlots.filter(time =>
            isProfessionalAvailable(professional, new Date(), time)
        );
        const firstTime = times[0];

        return firstTime
            ? `Available after 30 min • from ${firstTime}`
            : 'Not available today';
    };

    /*
    |--------------------------------------------------------------------------
    | DURATION
    |--------------------------------------------------------------------------
    */

    const selectDurationType = type => {

        setSelectedDurationType(
            type
        );

        if (
            type === 'hourly'
        ) {

            // DEFAULT 1 HOUR
            setSelectedHours(
                '1 Hour'
            );
        }
        else if (
            type === 'halfDay'
        ) {

            setSelectedHours(
                '4 Hours'
            );
        }
        else if (
            type === 'fullDay'
        ) {

            setSelectedHours(
                '8 Hours'
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    const toggleDateSelection =
        date => {

            const dateStr =
                date.toDateString();

            if (
                selectedDate ===
                dateStr
            ) {
                setSelectedDate(
                    null
                );
            }
            else {
                setSelectedDate(
                    dateStr
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | SAME SCHEDULE DATE
    |--------------------------------------------------------------------------
    */

    const addCommonDate = date => {

        const dateStr =
            date.toDateString();

        setCommonDates(
            prev => {

                if (
                    prev.includes(
                        dateStr
                    )
                ) {

                    return prev.filter(
                        item =>
                            item !==
                            dateStr
                    );
                }

                return [
                    ...prev,
                    dateStr,
                ];
            }
        );

        setCommonDateServices(
            prev => {

                if (
                    prev[dateStr]
                ) {
                    return prev;
                }

                const serviceData =
                    {};

                selectedServices.forEach(
                    service => {

                        serviceData[
                            String(
                                service.id
                            )
                        ] = {
                            // DEFAULT 1 HOUR
                            hours: 1,
                            time: null,
                            professional:
                                null,
                            amount:
                                calculateServicePrice(
                                    service,
                                    1
                                ),
                        };
                    }
                );

                return {
                    ...prev,
                    [dateStr]:
                        serviceData,
                };
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | COMMON HOURS
    |--------------------------------------------------------------------------
    */

    const updateCommonDateHours = (
        date,
        serviceId,
        hours
    ) => {

        const service =
            selectedServices.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        serviceId
                    )
            );

        setCommonDateServices(
            prev => {

                const dateData =
                    prev[date] || {};

                return {
                    ...prev,

                    [date]: {
                        ...dateData,

                        [serviceId]: {
                            ...dateData[
                            serviceId
                            ],

                            hours,

                            amount:
                                calculateServicePrice(
                                    service,
                                    hours
                                ),
                        },
                    },
                };
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | COMMON TIME
    |--------------------------------------------------------------------------
    */

    const updateCommonDateTime = (
        date,
        serviceId,
        time
    ) => {

        setCommonDateServices(
            prev => {

                const dateData =
                    prev[date] || {};

                return {
                    ...prev,

                    [date]: {
                        ...dateData,

                        [serviceId]: {
                            ...dateData[
                            serviceId
                            ],

                            time,
                        },
                    },
                };
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | COMMON PROFESSIONAL
    |--------------------------------------------------------------------------
    */

    const updateCommonDateProfessional =
        (
            date,
            serviceId,
            professional
        ) => {

            setCommonDateServices(
                prev => {

                    const dateData =
                        prev[date] || {};

                    return {
                        ...prev,

                        [date]: {
                            ...dateData,

                            [serviceId]: {
                                ...dateData[
                                serviceId
                                ],

                                professional,
                            },
                        },
                    };
                }
            );
        };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT SCHEDULE DATE
    |--------------------------------------------------------------------------
    */

    const addServiceDate = (
        serviceId,
        date
    ) => {

        const dateStr =
            date.toDateString();

        setServiceSchedules(
            prev => {

                const current =
                    prev[
                    serviceId
                    ] || [];

                const exists =
                    current.some(
                        item =>
                            item.date ===
                            dateStr
                    );

                if (exists) {

                    return {
                        ...prev,

                        [serviceId]:
                            current.filter(
                                item =>
                                    item.date !==
                                    dateStr
                            ),
                    };
                }

                return {
                    ...prev,

                    [serviceId]: [
                        ...current,

                        {
                            id:
                                Date.now().toString(),

                            date:
                                dateStr,

                            // DEFAULT 1 HOUR
                            hours: 1,

                            time: null,

                            professional:
                                null,

                            amount: 0,
                        },
                    ],
                };
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT HOURS
    |--------------------------------------------------------------------------
    */

    const updateServiceDateHours = (
        serviceId,
        date,
        hours
    ) => {

        const service =
            selectedServices.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        serviceId
                    )
            );

        setServiceSchedules(
            prev => {

                const current =
                    prev[
                    serviceId
                    ] || [];

                return {
                    ...prev,

                    [serviceId]:
                        current.map(
                            item =>
                                item.date ===
                                    date
                                    ? {
                                        ...item,

                                        hours,

                                        amount:
                                            calculateServicePrice(
                                                service,
                                                hours
                                            ),
                                    }
                                    : item
                        ),
                };
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT TIME
    |--------------------------------------------------------------------------
    */

    const updateServiceDateTime = (
        serviceId,
        date,
        time
    ) => {

        setServiceSchedules(
            prev => {

                const current =
                    prev[
                    serviceId
                    ] || [];

                return {
                    ...prev,

                    [serviceId]:
                        current.map(
                            item =>
                                item.date ===
                                    date
                                    ? {
                                        ...item,
                                        time,
                                    }
                                    : item
                        ),
                };
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT PROFESSIONAL
    |--------------------------------------------------------------------------
    */

    const updateServiceDateProfessional =
        (
            serviceId,
            date,
            professional
        ) => {

            setServiceSchedules(
                prev => {

                    const current =
                        prev[
                        serviceId
                        ] || [];

                    return {
                        ...prev,

                        [serviceId]:
                            current.map(
                                item =>
                                    item.date ===
                                        date
                                        ? {
                                            ...item,
                                            professional,
                                        }
                                        : item
                            ),
                    };
                }
            );
        };

    /*
    |--------------------------------------------------------------------------
    | COMMON DATE TOTAL HOURS
    |--------------------------------------------------------------------------
    */

    const getCommonDateTotalHours =
        date => {

            const data =
                commonDateServices[
                date
                ] || {};

            return Object.values(
                data
            ).reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.hours || 0
                    ),
                0
            );
        };

    /*
    |--------------------------------------------------------------------------
    | ADD SAME SCHEDULE
    |--------------------------------------------------------------------------
    */

    const addSameSchedule = () => {
        const isUpdating =
            addedSlots.length > 0;

        if (commonDates.length === 0) {
            Alert.alert(
                'Select Date',
                'Please select at least one date.'
            );
            return;
        }

        for (const date of commonDates) {
            const data =
                commonDateServices[date] || {};

            const totalHours =
                getCommonDateTotalHours(date);

            if (totalHours > 8) {
                Alert.alert(
                    'Maximum 8 Hours',
                    `${date} has ${totalHours} hours selected. Maximum combined hours per date is 8 hours.`
                );
                return;
            }

            for (const service of selectedServices) {
                const item =
                    data[String(service.id)];

                if (!item?.time) {
                    Alert.alert(
                        'Select Time',
                        `Please select time for ${service.name} on ${date}.`
                    );
                    return;
                }

                if (!item?.professional) {
                    Alert.alert(
                        'Select Professional',
                        `Please select professional for ${service.name} on ${date}.`
                    );
                    return;
                }
            }
        }

        const rows = [];

        commonDates.forEach(date => {
            const data =
                commonDateServices[date] || {};

            selectedServices.forEach(service => {
                const item =
                    data[String(service.id)];

                if (!item) {
                    return;
                }

                // Selected duration
                const hours =
                    Number(item.hours) || 1;

                // Calculate API start/end time
                const {
                    startTime,
                    endTime,
                } = getBookingTimeRange(
                    item.time,
                    hours
                );

                rows.push({
                    id:
                        `${service.id}-${date}`,

                    serviceId:
                        service.id,

                    serviceName:
                        service.name,

                    // UI date
                    date,

                    // UI time
                    time:
                        item.time,

                    // Duration
                    hours,

                    // API time values
                    startTime,
                    endTime,

                    amount:
                        Number(item.amount) || 0,

                    professional:
                        item.professional,

                    professionalName:
                        item.professional?.name ||
                        'Select Any Professional',

                    pricing:
                        service.pricing || [],

                    ourProcess:
                        service.ourProcess || [],

                    service,
                });
            });
        });

        console.log(
            'Added Same Schedule:',
            JSON.stringify(rows, null, 2)
        );

        setAddedSlots(rows);

        Alert.alert(
            isUpdating
                ? 'Schedule Updated'
                : 'Schedule Added',
            isUpdating
                ? 'Your schedule has been updated successfully.'
                : 'Your schedule has been added successfully.'
        );
    };

    /*
    |--------------------------------------------------------------------------
    | ADD DIFFERENT SCHEDULE
    |--------------------------------------------------------------------------
    */

    const addDifferentSchedule =
        () => {

            const isUpdating =
                addedSlots.length > 0;

            if (
                selectedServices.length ===
                0
            ) {

                Alert.alert(
                    'No Services',
                    'No service selected.'
                );

                return;
            }

            const rows = [];

            for (
                const service
                of selectedServices
            ) {

                const schedules =
                    serviceSchedules[
                    service.id
                    ] || [];

                if (
                    schedules.length ===
                    0
                ) {

                    Alert.alert(
                        'Select Date',
                        `Please select at least one date for ${service.name}.`
                    );

                    return;
                }

                for (
                    const item
                    of schedules
                ) {

                    if (!item.time) {

                        Alert.alert(
                            'Select Time',
                            `Please select time for ${service.name} on ${item.date}.`
                        );

                        return;
                    }

                    if (
                        !item.professional
                    ) {

                        Alert.alert(
                            'Select Professional',
                            `Please select professional for ${service.name} on ${item.date}.`
                        );

                        return;
                    }

                    const hours = Number(item.hours) || 1;

                    const {
                        startTime,
                        endTime,
                    } = getBookingTimeRange(
                        item.time,
                        hours
                    );

                    rows.push({
                        id:
                            `${service.id}-${item.date}`,

                        serviceId:
                            service.id,

                        serviceName:
                            service.name,

                        date:
                            item.date,

                        // UI display value
                        time:
                            item.time,

                        // Duration
                        hours,

                        // API values
                        startTime,

                        endTime,

                        amount:
                            Number(item.amount) || 0,

                        professional:
                            item.professional,

                        professionalName:
                            item.professional?.name ||
                            'Select Any Professional',

                        pricing:
                            service.pricing || [],

                        ourProcess:
                            service.ourProcess || [],

                        service,
                    });
                }
            }

            setAddedSlots(rows);

            Alert.alert(
                isUpdating
                    ? 'Schedule Updated'
                    : 'Schedule Added',
                isUpdating
                    ? 'Your schedule has been updated successfully.'
                    : 'Your schedule has been added successfully.'
            );
        };

    /*
    |--------------------------------------------------------------------------
    | TOTAL
    |--------------------------------------------------------------------------
    */

    const getTotalAmount = () => {

        return addedSlots.reduce(
            (
                total,
                slot
            ) =>
                total +
                Number(
                    slot.amount || 0
                ),
            0
        );
    };

    const getTotalHours = () => {

        return addedSlots.reduce(
            (
                total,
                slot
            ) =>
                total +
                Number(
                    slot.hours || 0
                ),
            0
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PROFESSIONAL MODAL
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | BILL
    |--------------------------------------------------------------------------
    */

    const openBillSummary = () => {

        if (
            addedSlots.length === 0
        ) {

            Alert.alert(
                'No Schedule',
                'Please add at least one schedule.'
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

    const closeBillSummary = () => {

        animateModalOut(
            billModalSlideAnim,
            () => {
                setShowBillSummary(
                    false
                );
            }
        );
    };




    /*
    |--------------------------------------------------------------------------
    | CONFIRM
    |--------------------------------------------------------------------------
    */




    const handleConfirmBooking = async () => {
        if (addedSlots.length === 0) {
            Alert.alert(
                'No Schedule',
                'Please add your schedule first.'
            );
            return;
        }

        if (isBookingLoading) {
            return;
        }

        try {
            setIsBookingLoading(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
                return;
            }

            const totalAmount = Number(getTotalAmount()) || 0;
            setTotalAmt(totalAmount);

            const payload = {
                customerName: customerName,
                customerPhone: customerMobile,
                customerEmail: "sahha@gmail.com",

                addressId: addressDetails?.addressId || '',
                addressLine1: addressDetails?.addressLine1 || '',
                addressLine2: addressDetails?.addressLine2 || '',

                city: addressDetails?.city || '',
                state: addressDetails?.state || '',
                postalCode: addressDetails?.pinCode || '',

                latitude: Number(
                    addressDetails?.latitude || 0
                ),

                longitude: Number(
                    addressDetails?.longitude || 0
                ),

                subTotal: totalAmount,
                discountAmount: 0,
                taxAmount: 0,

                notes: 'ok',

                items: addedSlots.map(slot => {
                    const hours =
                        Number(slot.hours) || 1;

                    // Safety fallback in case start/end are missing
                    const timeRange =
                        slot.startTime && slot.endTime
                            ? {
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                            }
                            : getBookingTimeRange(
                                slot.time,
                                hours
                            );

                    return {
                        serviceId:
                            slot.serviceId,

                        serviceDate:
                            formatServiceDate(slot.date),

                        startTime:
                            timeRange.startTime,

                        endTime:
                            timeRange.endTime,

                        rate:
                            Number(slot.amount) || 0,

                        notes:
                            slot.notes || 'string',

                        PartnerID:
                            slot.PartnerID || '',
                    };
                }),
            };

            console.log(
                'Booking Payload:',
                JSON.stringify(payload, null, 2)
            );

            const response = await axios.post(
                API.CUSTOMER_BOOKING,
                payload,
                {
                    headers: {
                        accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log(
                'Booking Response:',
                JSON.stringify(response.data, null, 2)
            );

            if (response.data?.success === true) {

                const orderId =
                    response.data?.booking?.orderId;




                if (!orderId) {
                    Alert.alert(
                        'Booking Error',
                        'Booking created but Razorpay order ID was not received.'
                    );
                    return;
                }

                console.log(
                    'Booking ID:',
                    response.data.booking.bookingId
                );

                console.log(
                    'Booking No:',
                    response.data.booking.bookingNo
                );

                console.log(
                    'Razorpay Order ID:',
                    orderId
                );

                // Close bill summary
                closeBillSummary();

                // Open Razorpay
                handleDemoPayment(orderId);

            } else {
                Alert.alert(
                    'Booking Failed',
                    response.data?.message ||
                    'Unable to create booking.'
                );
            }

        } catch (error) {

            console.log(
                'Booking API Error:',
                error?.response?.data || error?.message
            );

            Alert.alert(
                'Booking Failed',
                error?.response?.data?.message ||
                'Something went wrong while creating your booking.'
            );

        } finally {
            setIsBookingLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | TIME SELECTOR
    |--------------------------------------------------------------------------
    */

    const renderTimeSelector = (
        value,
        onSelect,
        date
    ) => {
        const availableTimes = getAvailableTimes(date);

        return (
            <View style={styles.smallTimeContainer}>
                {availableTimes.length === 0 ? (
                    <Text style={styles.noAvailabilityText}>
                        No professional is available for the selected date.
                    </Text>
                ) : (
                    availableTimes.map(time => (
                        <TouchableOpacity
                            key={time}
                            style={[
                                styles.smallTimeCard,
                                value === time && styles.smallTimeCardSelected,
                            ]}
                            onPress={() => onSelect(time)}
                        >
                            <Text
                                style={[
                                    styles.smallTimeText,
                                    value === time && styles.smallTimeTextSelected,
                                ]}
                            >
                                {time}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PROFESSIONAL SELECTOR
    |--------------------------------------------------------------------------
    */

    const renderProfessionalSelector = (
        value,
        onSelect,
        date,
        time
    ) => {
        const availableProfessionals = getAvailableProfessionals(date, time);

        return (
            <View>
                <Text style={styles.subSectionTitle}>
                    Select Professional
                </Text>

                {!date || !time ? (
                    <Text style={styles.professionalHintText}>
                        Select a date and time to see available professionals.
                    </Text>
                ) : availableProfessionals.length === 0 ? (
                    <Text style={styles.noAvailabilityText}>
                        No professional is available at the selected date and time.
                    </Text>
                ) : (
                    <FlatList
                        data={availableProfessionals}
                        numColumns={2}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.professionalColumn}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            const isSelected = value?.id === item.id;
                            const availabilityText = getCurrentDateAvailabilityText(item);

                            return (
                                <View style={styles.professionalMiniWrapper}>
                                    <TouchableOpacity
                                        style={[
                                            styles.professionalMiniCard,
                                            isSelected && styles.professionalMiniCardSelected,
                                        ]}
                                        onPress={() => onSelect(item)}
                                    >
                                        <Image
                                            source={{ uri: item.image }}
                                            style={styles.professionalMiniImage}
                                        />

                                        <Text
                                            style={styles.professionalMiniName}
                                            numberOfLines={1}
                                        >
                                            {item.name}
                                        </Text>

                                        {!item.isAny && (
                                            <View style={styles.miniRating}>
                                                {renderStars(item.rating, 10)}
                                                <Text style={styles.miniRatingText}>
                                                    {item.rating}
                                                </Text>
                                            </View>
                                        )}

                                        <Text style={styles.miniLastBooking}>
                                            Last Booking: {item.lastBookingDate}
                                        </Text>

                                        {availabilityText && (
                                            <Text
                                                style={[
                                                    styles.miniAvailabilityText,
                                                    availabilityText === 'Not available today' &&
                                                    styles.miniUnavailableText,
                                                ]}
                                            >
                                                {availabilityText}
                                            </Text>
                                        )}

                                        <TouchableOpacity
                                            onPress={() => openProfessionalModal(item)}
                                        >
                                            <Text style={styles.miniViewText}>
                                                View Details
                                            </Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                    />
                )}
            </View>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | COMMON SERVICE
    |--------------------------------------------------------------------------
    */

    const renderCommonService =
        service => {

            const serviceId =
                String(
                    service.id
                );

            return (
                <View
                    key={serviceId}
                    style={
                        styles.serviceScheduleCard
                    }
                >

                    <View
                        style={
                            styles.serviceScheduleHeader
                        }
                    >

                        <Image
                            source={
                                service.coverImage ||
                                service.image
                            }
                            style={
                                styles.serviceScheduleImage
                            }
                        />

                        <View
                            style={
                                styles.serviceScheduleInfo
                            }
                        >

                            <Text
                                style={
                                    styles.serviceScheduleName
                                }
                            >
                                {
                                    service.name
                                }
                            </Text>

                        </View>

                    </View>

                    {commonDates.map(
                        date => {

                            const data =
                                commonDateServices[
                                date
                                ] || {};

                            const item =
                                data[
                                serviceId
                                ] || {};

                            // DEFAULT 1 HOUR
                            const hours =
                                Number(
                                    item.hours ||
                                    1
                                );

                            return (
                                <View
                                    key={
                                        date
                                    }
                                    style={
                                        styles.dateServiceBlock
                                    }
                                >

                                    <Text
                                        style={
                                            styles.dateBlockTitle
                                        }
                                    >
                                        {new Date(
                                            date
                                        ).toLocaleDateString(
                                            'en-US',
                                            {
                                                weekday:
                                                    'short',
                                                month:
                                                    'short',
                                                day:
                                                    'numeric',
                                            }
                                        )}
                                    </Text>

                                    <Text
                                        style={
                                            styles.smallLabel
                                        }
                                    >
                                        Select Hours
                                    </Text>

                                    {renderHours(
                                        service,
                                        hours,
                                        value =>
                                            updateCommonDateHours(
                                                date,
                                                serviceId,
                                                value
                                            ),
                                        date
                                    )}

                                    <Text
                                        style={
                                            styles.selectedAmountText
                                        }
                                    >
                                        Selected Amount: ₹
                                        {
                                            calculateServicePrice(
                                                service,
                                                hours
                                            )
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.smallLabel
                                        }
                                    >
                                        Select Time
                                    </Text>

                                    {renderTimeSelector(
                                        item.time,
                                        value =>
                                            updateCommonDateTime(
                                                date,
                                                serviceId,
                                                value
                                            ),
                                        date,
                                        item.time
                                    )}

                                    {renderProfessionalSelector(
                                        item.professional,
                                        value =>
                                            updateCommonDateProfessional(
                                                date,
                                                serviceId,
                                                value
                                            ),
                                        date,
                                        item.time
                                    )}

                                </View>
                            );
                        }
                    )}

                </View>
            );
        };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT SERVICE
    |--------------------------------------------------------------------------
    */

    const renderDifferentService =
        service => {

            const serviceId =
                String(
                    service.id
                );

            const schedules =
                serviceSchedules[
                serviceId
                ] || [];

            return (
                <View
                    key={serviceId}
                    style={
                        styles.serviceScheduleCard
                    }
                >

                    <View
                        style={
                            styles.serviceScheduleHeader
                        }
                    >

                        <Image
                            source={
                                service.coverImage ||
                                service.image
                            }
                            style={
                                styles.serviceScheduleImage
                            }
                        />

                        <View
                            style={
                                styles.serviceScheduleInfo
                            }
                        >

                            <Text
                                style={
                                    styles.serviceScheduleName
                                }
                            >
                                {
                                    service.name
                                }
                            </Text>

                        </View>

                    </View>

                    <Text
                        style={
                            styles.smallLabel
                        }
                    >
                        Select Dates
                    </Text>

                    <View
                        style={
                            styles.differentDatesContainer
                        }
                    >

                        {availableDates.map(
                            date => {

                                const dateStr =
                                    date.toDateString();

                                const isSelected =
                                    schedules.some(
                                        item =>
                                            item.date ===
                                            dateStr
                                    );

                                return (
                                    <TouchableOpacity
                                        key={
                                            dateStr
                                        }
                                        style={[
                                            styles.differentDateCard,
                                            isSelected &&
                                            styles.differentDateCardSelected,
                                        ]}
                                        onPress={() =>
                                            addServiceDate(
                                                serviceId,
                                                date
                                            )
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.differentDateDay,
                                                isSelected &&
                                                styles.differentDateTextSelected,
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
                                                styles.differentDateNumber,
                                                isSelected &&
                                                styles.differentDateTextSelected,
                                            ]}
                                        >
                                            {
                                                date.getDate()
                                            }
                                        </Text>

                                        {isTodayDate(date) && (
                                            <Text style={styles.differentTodayBadge}>
                                                TODAY
                                            </Text>
                                        )}

                                        <Text
                                            style={[
                                                styles.differentDateMonth,
                                                isSelected &&
                                                styles.differentDateTextSelected,
                                            ]}
                                        >
                                            {date.toLocaleString(
                                                'default',
                                                {
                                                    month: 'short',
                                                }
                                            )}
                                        </Text>

                                    </TouchableOpacity>
                                );
                            }
                        )}

                    </View>

                    {schedules.map(
                        slot => {

                            // DEFAULT 1 HOUR
                            const hours =
                                Number(
                                    slot.hours ||
                                    1
                                );

                            return (
                                <View
                                    key={
                                        slot.date
                                    }
                                    style={
                                        styles.dateServiceBlock
                                    }
                                >

                                    <Text
                                        style={
                                            styles.dateBlockTitle
                                        }
                                    >
                                        {new Date(
                                            slot.date
                                        ).toLocaleDateString(
                                            'en-US',
                                            {
                                                weekday:
                                                    'short',
                                                month:
                                                    'short',
                                                day:
                                                    'numeric',
                                            }
                                        )}
                                    </Text>

                                    <Text
                                        style={
                                            styles.smallLabel
                                        }
                                    >
                                        Select Hours
                                    </Text>

                                    {renderHours(
                                        service,
                                        hours,
                                        value =>
                                            updateServiceDateHours(
                                                serviceId,
                                                slot.date,
                                                value
                                            ),
                                        slot.date
                                    )}

                                    <Text
                                        style={
                                            styles.selectedAmountText
                                        }
                                    >
                                        Selected Amount: ₹
                                        {
                                            calculateServicePrice(
                                                service,
                                                hours
                                            )
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.smallLabel
                                        }
                                    >
                                        Select Time
                                    </Text>

                                    {renderTimeSelector(
                                        slot.time,
                                        value =>
                                            updateServiceDateTime(
                                                serviceId,
                                                slot.date,
                                                value
                                            ),
                                        slot.date,
                                        slot.time
                                    )}

                                    {renderProfessionalSelector(
                                        slot.professional,
                                        value =>
                                            updateServiceDateProfessional(
                                                serviceId,
                                                slot.date,
                                                value
                                            ),
                                        slot.date,
                                        slot.time
                                    )}

                                </View>
                            );
                        }
                    )}

                </View>
            );
        };

    /*
    |--------------------------------------------------------------------------
    | PROFESSIONAL MODAL
    |--------------------------------------------------------------------------
    */

    const renderProfessionalModal =
        () => {

            if (
                !selectedProfessionalDetails
            ) {
                return null;
            }

            const professional =
                selectedProfessionalDetails;

            return (
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
                                        styles.professionalModalContent,
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

                                    <ScrollView
                                        showsVerticalScrollIndicator={
                                            false
                                        }
                                    >

                                        <View
                                            style={
                                                styles.professionalModalHeader
                                            }
                                        >

                                            <Image
                                                source={{
                                                    uri:
                                                        professional.image,
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
                                                    professional.name
                                                }
                                            </Text>

                                            {!professional.isAny && (
                                                <View
                                                    style={
                                                        styles.modalRating
                                                    }
                                                >

                                                    {renderStars(
                                                        professional.rating,
                                                        18
                                                    )}

                                                    <Text
                                                        style={
                                                            styles.modalRatingText
                                                        }
                                                    >
                                                        {
                                                            professional.rating
                                                        }
                                                    </Text>

                                                </View>
                                            )}

                                        </View>

                                        {!professional.isAny && (
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
                                                            professional.jobsCompleted
                                                        }
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.modalStatLabel
                                                        }
                                                    >
                                                        Jobs Completed
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
                                                            professional.experience
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
                                                            professional.lastBookingDate
                                                        }
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.modalStatLabel
                                                        }
                                                    >
                                                        Last Booking
                                                    </Text>

                                                </View>

                                            </View>
                                        )}

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

                                                {professional.availableSlots.map(
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
                                                About
                                            </Text>

                                            <Text
                                                style={
                                                    styles.modalAboutText
                                                }
                                            >
                                                {professional.isAny
                                                    ? 'You can select any available professional for your service.'
                                                    : `${professional.name} is a professional with ${professional.experience} of experience in home services. They have completed ${professional.jobsCompleted} jobs.`}
                                            </Text>

                                        </View>

                                    </ScrollView>

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
        };

    /*
    |--------------------------------------------------------------------------
    | BILL SUMMARY MODAL
    |--------------------------------------------------------------------------
    */

    const renderBillSummary = () => {
        const billData = [
            {
                id: 'customer',
                type: 'customer',
            },
            {
                id: 'services',
                type: 'services',
            },
            {
                id: 'calculation',
                type: 'calculation',
            },
            {
                id: 'total',
                type: 'total',
            },
        ];

        const renderBillItem = ({ item }) => {

            /* ============================= */
            /* CUSTOMER DETAILS */
            /* ============================= */

            if (item.type === 'customer') {
                return (
                    <View style={styles.customerSummaryCard}>

                        <Text style={styles.customerSummaryTitle}>
                            Customer Details
                        </Text>

                        <View style={styles.customerSummaryRow}>

                            <Text style={styles.customerSummaryLabel}>
                                Name
                            </Text>

                            <Text style={styles.customerSummaryValue}>
                                {customerName || '-'}
                            </Text>

                        </View>

                        <View style={styles.customerSummaryRow}>

                            <Text style={styles.customerSummaryLabel}>
                                Phone Number
                            </Text>

                            <Text style={styles.customerSummaryValue}>
                                {customerMobile || '-'}
                            </Text>

                        </View>

                        <View style={styles.customerSummaryAddressRow}>

                            <Text style={styles.customerSummaryLabel}>
                                Service Address
                            </Text>

                            <Text style={styles.customerAddressValue}>
                                {address ||
                                    addressDetails?.address ||
                                    addressDetails?.fullAddress ||
                                    addressDetails?.formattedAddress ||
                                    addressDetails?.addressLine1 ||
                                    '-'}
                            </Text>

                        </View>

                    </View>
                );
            }


            /* ============================= */
            /* SERVICE DETAILS */
            /* ============================= */

            if (item.type === 'services') {
                return (
                    <View>

                        <Text style={styles.billSectionTitle}>
                            Service Details
                        </Text>

                        {addedSlots.map((slot, index) => (
                            <View
                                key={
                                    slot.id ||
                                    `${slot.serviceId}-${slot.date}-${index}`
                                }
                                style={styles.billSlotItem}
                            >

                                <View style={styles.billSlotHeader}>

                                    <View
                                        style={
                                            styles.billSlotHeaderLeft
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.billSlotService
                                            }
                                        >
                                            {slot.serviceName}
                                        </Text>

                                        <Text
                                            style={
                                                styles.billSlotDate
                                            }
                                        >
                                            {new Date(
                                                slot.date
                                            ).toLocaleDateString(
                                                'en-US',
                                                {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </Text>

                                    </View>

                                    <Text
                                        style={
                                            styles.billSlotAmount
                                        }
                                    >
                                        ₹{slot.amount}
                                    </Text>

                                </View>


                                <Text
                                    style={
                                        styles.billSlotDetails
                                    }
                                >
                                    {slot.time || '-'}
                                    {' • '}
                                    {slot.hours || 0} hrs
                                </Text>


                                <Text
                                    style={
                                        styles.billSlotProfessional
                                    }
                                >
                                    Professional:{' '}
                                    {slot.professionalName ||
                                        slot.professional?.name ||
                                        'Select Any Professional'}
                                </Text>

                            </View>
                        ))}

                    </View>
                );
            }


            /* ============================= */
            /* CALCULATION */
            /* ============================= */

            if (item.type === 'calculation') {
                return (
                    <View>

                        <View style={styles.billDivider} />

                        <View style={styles.billCalculation}>

                            <View style={styles.billRow}>

                                <Text style={styles.billLabel}>
                                    Total Hours
                                </Text>

                                <Text style={styles.billValue}>
                                    {getTotalHours()} hrs
                                </Text>

                            </View>

                        </View>

                        <View style={styles.billDivider} />

                    </View>
                );
            }


            /* ============================= */
            /* TOTAL + CONFIRM */
            /* ============================= */

            if (item.type === 'total') {
                return (
                    <View style={styles.billBottomSection}>

                        <View style={styles.billTotalRow}>

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
                                ₹{getTotalAmount()}
                            </Text>

                        </View>


                        <TouchableOpacity
                            style={
                                styles.billConfirmButton
                            }
                            onPress={handleConfirmBooking}
                            activeOpacity={0.8}
                        >

                            {isBookingLoading ? (
                                <View style={styles.bookingButtonLoader}>
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.confirmButtonText}>
                                        Creating Booking...
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    Confirm Booking
                                </Text>
                            )}

                            <Image
                                source={require('../../asset/right-arrow.png')}
                                style={styles.billArrow}
                            />

                        </TouchableOpacity>

                    </View>
                );
            }

            return null;
        };


        return (
            <Modal
                transparent
                visible={showBillSummary}
                animationType="none"
                onRequestClose={closeBillSummary}
            >

                <View style={styles.modalOverlay}>

                    {/* BACKDROP */}

                    <Pressable
                        style={StyleSheet.absoluteFillObject}
                        onPress={closeBillSummary}
                    />


                    {/* MODAL */}

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

                        {/* HANDLE */}

                        <View style={styles.modalHandle} />


                        {/* HEADER */}

                        <View style={styles.billHeader}>

                            <View
                                style={
                                    styles.billHeaderTextContainer
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
                                    Review your booking details
                                </Text>

                            </View>


                            {/* CLOSE */}

                            <TouchableOpacity
                                style={
                                    styles.billCloseButton
                                }
                                onPress={closeBillSummary}
                                activeOpacity={0.7}
                            >

                                <Text
                                    style={
                                        styles.billCloseButtonText
                                    }
                                >
                                    ×
                                </Text>

                            </TouchableOpacity>

                        </View>


                        {/* ============================= */}
                        {/* FLATLIST */}
                        {/* ============================= */}

                        <FlatList
                            ref={billScrollRef}
                            data={billData}
                            keyExtractor={item => item.id}
                            renderItem={renderBillItem}

                            style={styles.billFlatList}

                            contentContainerStyle={
                                styles.billFlatListContent
                            }

                            showsVerticalScrollIndicator={true}

                            nestedScrollEnabled={true}

                            keyboardShouldPersistTaps="handled"

                            bounces={true}

                            alwaysBounceVertical={true}

                            removeClippedSubviews={false}

                            initialNumToRender={4}

                            windowSize={5}

                            scrollEventThrottle={16}
                        />

                    </Animated.View>

                </View>

            </Modal>
        );
    };





    /*
    |--------------------------------------------------------------------------
    | MAIN UI
    |--------------------------------------------------------------------------
    */

    return (
        <View
            style={
                styles.container
            }
        >

            <StatusBar
                translucent={false}
                barStyle="dark-content"
                backgroundColor="#d6bceb"
            />

            {/* HEADER */}

            <SafeAreaView style={styles.headerSafeArea}>

                <View style={styles.header}>

                    {/* BACK BUTTON */}

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        hitSlop={{
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10,
                        }}
                    >

                        <Image
                            source={require('../../asset/arrow-back.png')}
                            style={styles.backIcon}
                        />

                    </TouchableOpacity>

                    {/* TITLE */}

                    <View style={styles.headerTitleContainer}>

                        <Text
                            style={styles.headerTitle}
                            numberOfLines={1}
                        >
                            Select Schedule
                        </Text>

                    </View>

                    {/* RIGHT SIDE */}

                    <View style={styles.headerRight} />

                </View>

            </SafeAreaView>

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

                {/* SCHEDULE TYPE */}
                {selectedServices.length > 1 && (
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
                            Schedule Type
                        </Text>

                        <Text
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            Choose how you want to schedule your services
                        </Text>

                        <View
                            style={
                                styles.scheduleTypeContainer
                            }
                        >

                            <TouchableOpacity
                                style={[
                                    styles.scheduleTypeCard,
                                    scheduleType ===
                                    'same' &&
                                    styles.scheduleTypeCardSelected,
                                ]}
                                onPress={() =>
                                    setScheduleType(
                                        'same'
                                    )
                                }
                            >

                                <Text
                                    style={[
                                        styles.scheduleTypeTitle,
                                        scheduleType ===
                                        'same' &&
                                        styles.scheduleTypeTitleSelected,
                                    ]}
                                >
                                    Same Schedule
                                </Text>

                                <Text
                                    style={[
                                        styles.scheduleTypeDescription,
                                        scheduleType ===
                                        'same' &&
                                        styles.scheduleTypeDescriptionSelected,
                                    ]}
                                >
                                    All services can use the same dates
                                </Text>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.scheduleTypeCard,
                                    scheduleType ===
                                    'different' &&
                                    styles.scheduleTypeCardSelected,
                                ]}
                                onPress={() =>
                                    setScheduleType(
                                        'different'
                                    )
                                }
                            >

                                <Text
                                    style={[
                                        styles.scheduleTypeTitle,
                                        scheduleType ===
                                        'different' &&
                                        styles.scheduleTypeTitleSelected,
                                    ]}
                                >
                                    Different Schedule
                                </Text>

                                <Text
                                    style={[
                                        styles.scheduleTypeDescription,
                                        scheduleType ===
                                        'different' &&
                                        styles.scheduleTypeDescriptionSelected,
                                    ]}
                                >
                                    Each service can have its own dates
                                </Text>

                            </TouchableOpacity>

                        </View>

                    </View>

                )}

                {/* SAME SCHEDULE */}

                {scheduleType ===
                    'same' && (
                        <>

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
                                    Select Dates
                                </Text>

                                <Text
                                    style={
                                        styles.sectionSubtitle
                                    }
                                >
                                    You can select multiple dates
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
                                                commonDates.includes(
                                                    dateStr
                                                );

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
                                                        addCommonDate(
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

                                                    {isTodayDate(date) && (
                                                        <Text
                                                            style={[
                                                                styles.todayBadge,
                                                                isSelected && styles.todayBadgeSelected,
                                                            ]}
                                                        >
                                                            TODAY
                                                        </Text>
                                                    )}

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
                                                                month: 'short',
                                                            }
                                                        )}
                                                    </Text>

                                                </TouchableOpacity>
                                            );
                                        }
                                    )}

                                </View>

                            </View>

                            {selectedServices.map(
                                renderCommonService
                            )}

                            {commonDates.length > 0 &&
                                shouldShowScheduleButton && (
                                    <TouchableOpacity
                                        style={
                                            styles.addScheduleButton
                                        }
                                        onPress={
                                            addSameSchedule
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.addScheduleButtonText
                                            }
                                        >
                                            {scheduleButtonText}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                        </>
                    )}

                {/* DIFFERENT SCHEDULE */}

                {scheduleType ===
                    'different' && (
                        <>

                            {selectedServices.map(
                                renderDifferentService
                            )}

                            {shouldShowScheduleButton && (
                                <TouchableOpacity
                                    style={
                                        styles.addScheduleButton
                                    }
                                    onPress={
                                        addDifferentSchedule
                                    }
                                >
                                    <Text
                                        style={
                                            styles.addScheduleButtonText
                                        }
                                    >
                                        {scheduleButtonText}
                                    </Text>
                                </TouchableOpacity>
                            )}

                        </>
                    )}

                {/* ADDED SCHEDULE */}

                {addedSlots.length >
                    0 && (
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
                                Added Schedule
                            </Text>

                            {addedSlots.map(
                                slot => (

                                    <View
                                        key={
                                            slot.id
                                        }
                                        style={
                                            styles.addedSlotCard
                                        }
                                    >

                                        <View
                                            style={
                                                styles.addedSlotTop
                                            }
                                        >

                                            <View
                                                style={
                                                    styles.addedSlotInfo
                                                }
                                            >

                                                <Text
                                                    style={
                                                        styles.addedSlotService
                                                    }
                                                >
                                                    {
                                                        slot.serviceName
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.addedSlotDate
                                                    }
                                                >
                                                    {
                                                        slot.date
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.addedSlotDetails
                                                    }
                                                >
                                                    {
                                                        slot.time
                                                    }{' '}
                                                    •{' '}
                                                    {
                                                        slot.hours
                                                    }{' '}
                                                    hrs
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.addedSlotProfessional
                                                    }
                                                >
                                                    {
                                                        slot.professionalName ||
                                                        'Select Any Professional'
                                                    }
                                                </Text>

                                            </View>

                                            <Text
                                                style={
                                                    styles.addedSlotAmount
                                                }
                                            >
                                                ₹
                                                {
                                                    slot.amount
                                                }
                                            </Text>

                                        </View>

                                    </View>
                                )
                            )}

                        </View>
                    )}

                <View
                    style={
                        styles.bottomSpacing
                    }
                />

            </Animated.ScrollView>

            {/* BOTTOM TOTAL */}

            {addedSlots.length >
                0 && (
                    <View
                        style={
                            styles.bottomBar
                        }
                    >

                        <View>

                            <Text
                                style={
                                    styles.bottomTotalLabel
                                }
                            >
                                Total Amount
                            </Text>

                            <Text
                                style={
                                    styles.bottomTotal
                                }
                            >
                                ₹
                                {
                                    getTotalAmount()
                                }
                            </Text>

                            <Text
                                style={
                                    styles.bottomGST
                                }
                            >
                                Including GST
                            </Text>

                        </View>

                        <TouchableOpacity
                            style={
                                styles.reviewButton
                            }
                            onPress={
                                openBillSummary
                            }
                        >

                            <Text
                                style={
                                    styles.reviewButtonText
                                }
                            >
                                Review & Confirm
                            </Text>

                        </TouchableOpacity>

                    </View>
                )}

            {renderProfessionalModal()}
            {renderBillSummary()}


            <Modal
                visible={showPaymentModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => { }}
            >
                <View style={styles.paymentModalOverlay}>

                    <View style={styles.paymentModalCard}>

                        {/* Success Circle */}
                        <View style={styles.paymentSuccessCircle}>
                            <Text style={styles.paymentSuccessCheck}>
                                ✓
                            </Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.paymentSuccessTitle}>
                            Payment Successful
                        </Text>

                        <Text style={styles.paymentSuccessSubtitle}>
                            Your payment has been completed successfully.
                        </Text>

                        {/* Amount */}
                        <View style={styles.paymentAmountBox}>
                            <Text style={styles.paymentAmountLabel}>
                                Amount Paid
                            </Text>

                            <Text style={styles.paymentAmount}>
                                ₹{Number(totalAmt || 0).toLocaleString('en-IN')}
                            </Text>
                        </View>

                        {/* Razorpay Payment ID */}
                        <View style={styles.paymentIdBox}>
                            <Text style={styles.paymentIdLabel}>
                                Payment ID
                            </Text>

                            <Text style={styles.paymentIdValue}>
                                {paymentResponse?.razorpay_payment_id || 'N/A'}
                            </Text>
                        </View>

                        {/* Success Message */}
                        <View style={styles.paymentInfoBox}>
                            <View style={styles.paymentSmallCheck}>
                                <Text style={styles.paymentSmallCheckText}>
                                    ✓
                                </Text>
                            </View>

                            <Text style={styles.paymentInfoText}>
                                Your booking payment has been received successfully.
                            </Text>
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.paymentContinueButton}
                            onPress={async () => {

                                setShowPaymentModal(false);

                                

                                navigation.replace(
                                    'BookingConfirmationScreen',
                                    {
                                        bookingId: orderID,
                                        slots: addedSlots,

                                        bookingRows: addedSlots,

                                        totalAmount: totalAmt,

                                        totalHours: getTotalHours(),

                                        selectedServices,

                                        customerDetails: {
                                            name: customerName,
                                            mobile: customerMobile,
                                        },

                                        addressDetails,

                                        address,

                                        scheduleType,

                                        paymentDetails: paymentResponse,
                                    }
                                );
                            }}
                        >
                            <Text style={styles.paymentContinueText}>
                                Continue
                            </Text>

                            <Text style={styles.paymentArrow}>
                                →
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </Modal>


            {isPaymentLoading && (
                <View style={styles.loaderOverlay}>
                    <ServiceOrbitLoader />

                    <Text style={styles.loaderText}>
                        Confirming your payment...
                    </Text>
                </View>
            )}




        </View>
    );
};

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    header: {
        height: 60,
        backgroundColor: '#d6bceb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: COLORS.txtColor,
    },

    headerTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    headerRight: {
        width: 40,
    },

    content: {
        flex: 1,
    },

    sectionContainer: {
        marginHorizontal: 16,
        marginTop: 18,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
        marginBottom: 12,
    },

    /*
    |--------------------------------------------------------------------------
    | SCHEDULE TYPE
    |--------------------------------------------------------------------------
    */

    scheduleTypeContainer: {
        flexDirection: 'row',
        gap: 10,
    },

    scheduleTypeCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        backgroundColor: '#FFFFFF',
    },

    scheduleTypeCardSelected: {
        backgroundColor: COLORS.goldLight,
        borderColor: COLORS.goldLight,
    },

    scheduleTypeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    scheduleTypeTitleSelected: {
        color: '#FFFFFF',
    },

    scheduleTypeDescription: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 5,
        lineHeight: 16,
    },

    scheduleTypeDescriptionSelected: {
        color: '#FFFFFF',
    },

    /*
    |--------------------------------------------------------------------------
    | DATES
    |--------------------------------------------------------------------------
    */

    datesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    dateCard: {
        width: (width - 32 - 40) / 5,
        minHeight: 82,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    dateCardSelected: {
        backgroundColor: COLORS.goldLight,
        borderColor: COLORS.goldLight,
    },

    dateDay: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textLight,
    },

    dateNumber: {
        fontSize: 21,
        fontWeight: '800',
        color: COLORS.txtColor,
        marginVertical: 2,
    },

    dateMonth: {
        fontSize: 10,
        color: COLORS.textLight,
    },

    dateTextSelected: {
        color: '#FFFFFF',
    },

    /*
    |--------------------------------------------------------------------------
    | SERVICE
    |--------------------------------------------------------------------------
    */

    serviceScheduleCard: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 14,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    serviceScheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    serviceScheduleImage: {
        width: 55,
        height: 55,
        borderRadius: 10,
        backgroundColor: COLORS.goldFade,
    },

    serviceScheduleInfo: {
        flex: 1,
        marginLeft: 12,
    },

    serviceScheduleName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    dateServiceBlock: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },

    dateBlockTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.goldLight,
        marginBottom: 10,
    },

    smallLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.txtColor,
        marginTop: 12,
        marginBottom: 7,
    },

    /*
    |--------------------------------------------------------------------------
    | HOURS
    |--------------------------------------------------------------------------
    */

    hoursContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    hoursCard: {
        width: '23%',
        minHeight: 55,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
    },

    hoursCardSelected: {
        backgroundColor: COLORS.goldLight,
        borderColor: COLORS.goldLight,
    },

    hoursText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    hoursTextSelected: {
        color: '#FFFFFF',
    },

    hoursAmount: {
        fontSize: 11,
        fontWeight: '700',
        color: '#76577F',
        marginTop: 3,
    },

    hoursAmountSelected: {
        color: '#FFFFFF',
    },

    selectedAmountText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.goldLight,
        marginTop: 7,
    },

    /*
    |--------------------------------------------------------------------------
    | TIME
    |--------------------------------------------------------------------------
    */

    smallTimeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
    },

    smallTimeCard: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },

    smallTimeCardSelected: {
        backgroundColor: COLORS.goldLight,
        borderColor: COLORS.goldLight,
    },

    smallTimeText: {
        fontSize: 10,
        color: COLORS.txtColor,
        fontWeight: '600',
    },

    smallTimeTextSelected: {
        color: '#FFFFFF',
    },

    /*
    |--------------------------------------------------------------------------
    | PROFESSIONAL
    |--------------------------------------------------------------------------
    */

    professionalColumn: {
        justifyContent: 'space-between',
    },

    professionalMiniWrapper: {
        width: '48%',
        marginBottom: 10,
    },

    professionalMiniCard: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 9,
        backgroundColor: '#FFFFFF',
    },

    professionalMiniCardSelected: {
        borderColor: COLORS.goldLight,
        backgroundColor: COLORS.goldFade,
    },

    professionalMiniImage: {
        width: 45,
        height: 45,
        borderRadius: 23,
        alignSelf: 'center',
        marginBottom: 6,
    },

    professionalMiniName: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.txtColor,
        textAlign: 'center',
    },

    miniRating: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },

    miniRatingText: {
        fontSize: 9,
        color: COLORS.textLight,
        marginLeft: 3,
    },

    miniLastBooking: {
        fontSize: 9,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 4,
    },

    miniViewText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.goldLight,
        textAlign: 'center',
        marginTop: 6,
    },

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT DATE
    |--------------------------------------------------------------------------
    */

    differentDatesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
    },

    differentDateCard: {
        width: 54,
        height: 65,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    differentDateCardSelected: {
        backgroundColor: COLORS.goldLight,
        borderColor: COLORS.goldLight,
    },

    differentDateDay: {
        fontSize: 9,
        color: COLORS.textLight,
    },

    differentDateNumber: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    differentDateMonth: {
        fontSize: 9,
        color: COLORS.textLight,
    },

    differentDateTextSelected: {
        color: '#FFFFFF',
    },

    /*
    |--------------------------------------------------------------------------
    | ADD BUTTON
    |--------------------------------------------------------------------------
    */

    addScheduleButton: {
        marginHorizontal: 16,
        marginTop: 18,
        height: 50,
        borderRadius: 13,
        backgroundColor: COLORS.goldLight,
        justifyContent: 'center',
        alignItems: 'center',
    },

    addScheduleButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    /*
    |--------------------------------------------------------------------------
    | ADDED SLOT
    |--------------------------------------------------------------------------
    */

    addedSlotCard: {
        padding: 13,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 9,
        backgroundColor: '#FFFFFF',
    },

    addedSlotTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    addedSlotInfo: {
        flex: 1,
    },

    addedSlotService: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    addedSlotDate: {
        fontSize: 11,
        color: COLORS.goldLight,
        marginTop: 3,
    },

    addedSlotDetails: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: 3,
    },

    addedSlotProfessional: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: 3,
    },

    addedSlotAmount: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.goldLight,
    },

    bottomSpacing: {
        height: 120,
    },

    /*
    |--------------------------------------------------------------------------
    | BOTTOM BAR
    |--------------------------------------------------------------------------
    */

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    bottomTotalLabel: {
        fontSize: 10,
        color: COLORS.textLight,
    },

    bottomTotal: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.goldLight,
    },

    bottomGST: {
        fontSize: 9,
        color: COLORS.textLight,
    },

    reviewButton: {
        backgroundColor: COLORS.goldLight,
        paddingHorizontal: 20,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    reviewButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },

    /*
    |--------------------------------------------------------------------------
    | PROFESSIONAL MODAL
    |--------------------------------------------------------------------------
    */

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    professionalModalContent: {
        backgroundColor: '#FFFFFF',
        maxHeight: height * 0.85,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 18,
    },

    billModalContent: {
        backgroundColor: '#FFFFFF',
        height: height * 0.90,
        maxHeight: height * 0.90,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 18,
        paddingHorizontal: 18,
        paddingBottom: 0,
        overflow: 'hidden',
    },

    modalHandle: {
        width: 45,
        height: 4,
        borderRadius: 3,
        backgroundColor: '#DDD',
        alignSelf: 'center',
        marginBottom: 15,
    },

    professionalModalHeader: {
        alignItems: 'center',
    },

    modalProfessionalImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 10,
    },

    modalProfessionalName: {
        fontSize: 19,
        fontWeight: '800',
        color: COLORS.txtColor,
    },

    modalRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7,
    },

    modalRatingText: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 5,
        color: COLORS.textLight,
    },

    modalStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.goldFade,
        borderRadius: 14,
    },

    modalStat: {
        flex: 1,
        alignItems: 'center',
    },

    modalStatValue: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.txtColor,
        textAlign: 'center',
    },

    modalStatLabel: {
        fontSize: 9,
        color: COLORS.textLight,
        marginTop: 3,
        textAlign: 'center',
    },

    modalStatDivider: {
        width: 1,
        height: 35,
        backgroundColor: COLORS.border,
    },

    modalSection: {
        marginTop: 20,
    },

    modalSectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.txtColor,
        marginBottom: 9,
    },

    modalSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
    },

    modalSlotTag: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: COLORS.goldFade,
    },

    modalSlotTagText: {
        fontSize: 10,
        color: COLORS.goldLight,
        fontWeight: '600',
    },

    modalAboutText: {
        fontSize: 12,
        lineHeight: 19,
        color: COLORS.textLight,
    },

    modalCloseButton: {
        height: 45,
        borderRadius: 12,
        backgroundColor: '#F1EDF3',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    modalCloseText: {
        color: COLORS.goldLight,
        fontSize: 13,
        fontWeight: '700',
    },

    /*
    |--------------------------------------------------------------------------
    | BILL SUMMARY
    |--------------------------------------------------------------------------
    */

    billHeader: {
        marginBottom: 12,
    },

    billTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.txtColor,
    },

    billSubtitle: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 3,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER DETAILS
    |--------------------------------------------------------------------------
    */

    customerSummaryCard: {
        backgroundColor: COLORS.goldFade,
        borderRadius: 14,
        padding: 14,
        marginBottom: 18,
    },

    customerSummaryTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.txtColor,
        marginBottom: 10,
    },

    customerSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    customerSummaryAddressRow: {
        marginTop: 2,
    },

    customerSummaryLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        width: 100,
    },

    customerSummaryValue: {
        flex: 1,
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.txtColor,
        textAlign: 'right',
    },

    customerAddressValue: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.txtColor,
        lineHeight: 18,
        marginTop: 4,
    },

    billSectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.txtColor,
        marginBottom: 8,
    },

    /*
    |--------------------------------------------------------------------------
    | BILL SERVICE
    |--------------------------------------------------------------------------
    */

    billSlotItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    billSlotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    billSlotHeaderLeft: {
        flex: 1,
    },

    billSlotService: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    billSlotDate: {
        fontSize: 10,
        color: COLORS.goldLight,
        marginTop: 3,
    },

    billSlotAmount: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.goldLight,
    },

    billSlotDetails: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: 5,
    },

    billSlotProfessional: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: 4,
    },

    billDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },

    billCalculation: {
        gap: 9,
    },

    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    billLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },

    billValue: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.txtColor,
    },

    billTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    billTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.txtColor,
    },

    billTotalSubtext: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: 3,
    },

    billTotalAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.goldLight,
    },

    billConfirmButton: {
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.goldLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
    },

    billConfirmText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    billArrow: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: '#FFFFFF',
        marginLeft: 8,
    },

    billScroll: {
        flex: 1,
        width: '100%',
    },

    billScrollContent: {
        paddingBottom: 30,
        paddingTop: 4,
        flexGrow: 0,
    },

    todayBadge: {
        fontSize: 8,
        fontWeight: '800',
        color: COLORS.goldLight,
        marginBottom: 2,
    },

    todayBadgeSelected: {
        color: '#FFFFFF',
    },

    differentTodayBadge: {
        fontSize: 7,
        fontWeight: '800',
        color: COLORS.goldLight,
        marginBottom: 1,
    },

    miniAvailabilityText: {
        fontSize: 8,
        fontWeight: '700',
        color: COLORS.success,
        textAlign: 'center',
        marginTop: 5,
        lineHeight: 12,
    },

    miniUnavailableText: {
        color: COLORS.red,
    },

    professionalHintText: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 3,
    },

    noAvailabilityText: {
        fontSize: 11,
        color: COLORS.red,
        marginTop: 5,
        lineHeight: 16,
    },

    subSectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.txtColor,
        marginTop: 14,
        marginBottom: 7,
    },
    headerSafeArea: {
        backgroundColor: '#d6bceb',
    },

    header: {
        height:
            Platform.OS === 'ios'
                ? 52
                : 56,

        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'space-between',

        paddingHorizontal: 16,

        backgroundColor: '#d6bceb',
    },

    backButton: {
        width: 40,
        height: 40,

        justifyContent: 'center',
        alignItems: 'center',

        borderRadius: 20,
    },

    backIcon: {
        width: 23,
        height: 23,

        resizeMode: 'contain',

        tintColor: '#403746',
    },

    headerTitleContainer: {
        flex: 1,

        alignItems: 'center',

        justifyContent: 'center',

        marginHorizontal: 10,
    },

    headerTitle: {
        fontSize: 18,

        fontWeight: '700',

        color: '#403746',

        textAlign: 'center',
    },

    headerRight: {
        width: 40,
        height: 40,
    },

    hoursCardDisabled: {
        backgroundColor: '#F3F3F3',
        borderColor: '#E5E5E5',
        opacity: 0.55,
    },

    hoursTextDisabled: {
        color: '#999999',
    },

    hoursAmountDisabled: {
        color: '#999999',
    },



    billModalContent: {
        backgroundColor: '#FFFFFF',

        height: height * 0.90,
        maxHeight: height * 0.90,

        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,

        paddingTop: 18,
        paddingHorizontal: 18,
        paddingBottom: 0,

        overflow: 'hidden',
    },

    billHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingBottom: 14,
    },

    billHeaderTextContainer: {
        flex: 1,
    },

    billTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#76577F',
    },

    billSubtitle: {
        fontSize: 13,
        color: '#777777',
        marginTop: 4,
    },

    billCloseButton: {
        width: 36,
        height: 36,

        borderRadius: 18,

        backgroundColor: '#F4EFF6',

        alignItems: 'center',
        justifyContent: 'center',

        marginLeft: 10,
    },

    billCloseButtonText: {
        fontSize: 25,
        lineHeight: 27,
        fontWeight: '400',

        color: '#76577F',
    },

    billScroll: {
        flex: 1,
        width: '100%',
    },

    billScrollContent: {
        paddingTop: 4,
        paddingBottom: 30,
    },

    billSection: {
        marginBottom: 18,
    },

    billSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333333',

        marginBottom: 10,
    },

    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',

        paddingVertical: 7,
    },

    billLabel: {
        width: '30%',

        fontSize: 13,
        color: '#777777',
    },

    billValue: {
        width: '67%',

        fontSize: 13,
        fontWeight: '600',
        color: '#333333',

        textAlign: 'right',
    },

    billAddressValue: {
        lineHeight: 19,
    },

    scheduleTypeBillCard: {
        backgroundColor: '#F7F3F8',

        borderRadius: 12,

        paddingVertical: 12,
        paddingHorizontal: 14,
    },

    scheduleTypeBillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#76577F',
    },

    billServiceCard: {
        backgroundColor: '#F8F8F8',

        borderRadius: 14,

        padding: 14,

        marginBottom: 10,

        borderWidth: 1,
        borderColor: '#EEEEEE',
    },

    billServiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',

        marginBottom: 10,
    },

    billServiceName: {
        flex: 1,

        fontSize: 15,
        fontWeight: '700',
        color: '#333333',

        marginRight: 10,
    },

    billServiceAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#76577F',
    },

    billDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',

        paddingVertical: 4,
    },

    billDetailLabel: {
        fontSize: 12,
        color: '#888888',
    },

    billDetailValue: {
        maxWidth: '65%',

        fontSize: 12,
        fontWeight: '600',
        color: '#444444',

        textAlign: 'right',
    },

    emptyBillCard: {
        backgroundColor: '#F8F8F8',

        borderRadius: 12,

        padding: 16,
    },

    emptyBillText: {
        textAlign: 'center',

        fontSize: 13,
        color: '#888888',
    },

    billCalculationCard: {
        backgroundColor: '#F8F8F8',

        borderRadius: 14,

        padding: 15,

        borderWidth: 1,
        borderColor: '#EEEEEE',
    },

    billCalculationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        paddingVertical: 7,
    },

    billCalculationLabel: {
        fontSize: 13,
        color: '#666666',
    },

    billCalculationValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
    },

    discountText: {
        color: '#4CAF50',
    },

    billCalculationDivider: {
        height: 1,

        backgroundColor: '#E5E5E5',

        marginVertical: 8,
    },

    totalBillRow: {
        flexDirection: 'row',

        justifyContent: 'space-between',
        alignItems: 'center',

        paddingTop: 10,
    },

    totalBillLabel: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333333',
    },

    totalBillSmallText: {
        fontSize: 10,
        color: '#999999',

        marginTop: 3,
    },

    totalBillValue: {
        fontSize: 21,
        fontWeight: '800',

        color: '#76577F',
    },

    confirmBookingSection: {
        marginTop: 2,
        marginBottom: 5,
    },

    confirmBookingButton: {
        height: 54,

        borderRadius: 14,

        backgroundColor: '#76577F',

        alignItems: 'center',
        justifyContent: 'center',

        elevation: 3,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },

    confirmBookingButtonText: {
        color: '#FFFFFF',

        fontSize: 16,
        fontWeight: '700',
    },

    billFlatList: {
        flex: 1,
        width: '100%',
    },

    billFlatListContent: {
        paddingTop: 4,
        paddingBottom: 35,
    },

    billBottomSection: {
        marginTop: 5,
        paddingBottom: 20,
    },

    confirmButtonDisabled: {
        opacity: 0.7,
    },

    bookingButtonLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },


    paymentModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    paymentModalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },

    paymentSuccessCircle: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: '#25B864',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },

    paymentSuccessCheck: {
        color: '#FFFFFF',
        fontSize: 46,
        fontWeight: '700',
        marginTop: -3,
    },

    paymentSuccessTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2A2030',
        marginBottom: 7,
        textAlign: 'center',
    },

    paymentSuccessSubtitle: {
        fontSize: 14,
        color: '#817687',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 22,
    },

    paymentAmountBox: {
        width: '100%',
        backgroundColor: '#F7F3F9',
        borderRadius: 17,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },

    paymentAmountLabel: {
        fontSize: 12,
        color: '#817687',
        marginBottom: 4,
    },

    paymentAmount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#76577F',
    },

    paymentIdBox: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E8E2EB',
        borderRadius: 15,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
    },

    paymentIdLabel: {
        fontSize: 11,
        color: '#8A7D90',
        marginBottom: 5,
    },

    paymentIdValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#302635',
    },

    paymentInfoBox: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFFAF3',
        borderRadius: 14,
        padding: 12,
        marginBottom: 20,
    },

    paymentSmallCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#25B864',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 9,
    },

    paymentSmallCheckText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    paymentInfoText: {
        flex: 1,
        fontSize: 12,
        color: '#53615A',
        lineHeight: 18,
    },

    paymentContinueButton: {
        width: '100%',
        height: 54,
        borderRadius: 16,
        backgroundColor: '#76577F',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#76577F',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },

    paymentContinueText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    paymentArrow: {
        color: '#FFFFFF',
        fontSize: 22,
        marginLeft: 10,
    },


    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999,
    },

    loaderText: {
        marginTop: 18,
        fontSize: 15,
        fontWeight: '600',
        color: '#76577F',
    },
});

export default SelectSlotScreenV1;