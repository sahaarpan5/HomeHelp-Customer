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
    TextInput,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const ViewCartScreen = ({ navigation, route }) => {
    // States
    const [selectedServices, setSelectedServices] = useState([
        {
            id: 'c1',
            name: 'Living Room Deep Cleaning',
            price: '₹299',
            coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            duration: '2 hours',
        },
       
    ]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [selectedTip, setSelectedTip] = useState(null);
    const [customTip, setCustomTip] = useState('');
    const [showCustomTip, setShowCustomTip] = useState(false);
    const [showAllCoupons, setShowAllCoupons] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [customerName, setCustomerName] = useState('Rahul Sharma');
    const [customerMobile, setCustomerMobile] = useState('+91 98765 43210');
    const [address, setAddress] = useState('123, Main Street, Mumbai, Maharashtra - 400001');

    // Slot Selection States - Day wise
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedHours, setSelectedHours] = useState(null);

    // Store slot selections per day
    const [slotSelections, setSlotSelections] = useState({});

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const couponModalSlideAnim = useRef(new Animated.Value(height)).current;

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

    // Generate next 7 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const availableDates = generateDates();

    // Time slots
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

    // Hours options
    const hoursOptions = ['1 Hour', '2 Hours', '3 Hours', '4 Hours', '5 Hours', '6 Hours'];

    // Available coupons
    const availableCoupons = [
        { id: '1', code: 'SAVE20', discount: '20%', description: 'Get 20% off on all services' },
        { id: '2', code: 'FIRST50', discount: '₹50', description: '₹50 off on first booking' },
        { id: '3', code: 'WELCOME10', discount: '10%', description: '10% off for new users' },
        { id: '4', code: 'FLAT100', discount: '₹100', description: '₹100 off on orders above ₹500' },
    ];

    // People also like services
    const peopleAlsoLike = [
        
        {
            id: 'p2',
            name: 'House Maid',
            price: '₹599',
            image: require('../../asset/sofa-clean.png'),
            rating: 4.7,
        },
        {
            id: 'p3',
            name: 'Bathroom Cleaning',
            price: '₹349',
            image: require('../../asset/bathroom-clean.png'),
            rating: 4.6,
        },
        {
            id: 'p4',
            name: 'Kitchen & Utensil cleaning',
            price: '₹449',
             image: require('../../asset/kitchen-clean.png'),
            rating: 4.5,
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

    const openSlotModal = () => {
        // Reset selections when opening
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedHours(null);
        setShowSlotModal(true);
        setTimeout(() => animateModalIn(modalSlideAnim), 100);
    };

    const closeSlotModal = () => {
        animateModalOut(modalSlideAnim, () => {
            setShowSlotModal(false);
        });
    };

    const openCouponModal = () => {
        setShowAllCoupons(true);
        setTimeout(() => animateModalIn(couponModalSlideAnim), 100);
    };

    const closeCouponModal = () => {
        animateModalOut(couponModalSlideAnim, () => {
            setShowAllCoupons(false);
        });
    };

    const toggleDateSelection = (date) => {
        const dateStr = date.toDateString();
        setSelectedDate(dateStr);
        // Load existing selection for this date
        if (slotSelections[dateStr]) {
            setSelectedTime(slotSelections[dateStr].time);
            setSelectedHours(slotSelections[dateStr].hours);
        } else {
            setSelectedTime(null);
            setSelectedHours(null);
        }
    };

    const saveSlotSelection = () => {
        if (!selectedDate) {
            Alert.alert('Select Date', 'Please select a date');
            return;
        }
        if (!selectedTime) {
            Alert.alert('Select Time', 'Please select a time slot');
            return;
        }
        if (!selectedHours) {
            Alert.alert('Select Hours', 'Please select duration hours');
            return;
        }

        const dateObj = availableDates.find(d => d.toDateString() === selectedDate);
        const dateStr = dateObj ? dateObj.toDateString() : selectedDate;

        setSlotSelections({
            ...slotSelections,
            [dateStr]: {
                time: selectedTime,
                hours: selectedHours,
            },
        });

        Alert.alert('Slot Added', `Slot added for ${dateObj ? dateObj.toLocaleDateString() : selectedDate}`);
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedHours(null);
    };

    const removeSlotSelection = (dateStr) => {
        const newSelections = { ...slotSelections };
        delete newSelections[dateStr];
        setSlotSelections(newSelections);
    };

    const removeService = (serviceId) => {
        Alert.alert(
            'Remove Service',
            'Are you sure you want to remove this service?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const updated = selectedServices.filter(item => item.id !== serviceId);
                        setSelectedServices(updated);
                    },
                },
            ]
        );
    };

    const addMoreService = (service) => {
        Alert.alert('Add Service', `${service.name} added to cart`);
    };

    const applyCoupon = () => {
        if (!couponCode.trim()) {
            Alert.alert('Error', 'Please enter a coupon code');
            return;
        }
        const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
        if (coupon) {
            setAppliedCoupon(coupon);
            Alert.alert('Coupon Applied', `${coupon.discount} discount applied!`);
            closeCouponModal();
        } else {
            Alert.alert('Invalid Coupon', 'Please enter a valid coupon code');
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handleTipSelect = (amount) => {
        setSelectedTip(amount);
        setShowCustomTip(false);
        setCustomTip('');
    };

    const handleCustomTip = () => {
        if (customTip && parseInt(customTip) > 0) {
            setSelectedTip(parseInt(customTip));
            setShowCustomTip(false);
        } else {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
        }
    };

    const handleProceedToCheckout = () => {
        if (Object.keys(slotSelections).length === 0) {
            Alert.alert('Select Slots', 'Please add at least one time slot');
            return;
        }
        Alert.alert('Success', 'Booking confirmed!');
        closeSlotModal();
    };

    const getTotal = () => {
        const subtotal = selectedServices.reduce((sum, item) => {
            const price = parseInt(item.price.replace('₹', ''));
            return sum + price;
        }, 0);

        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discount.includes('%')) {
                const percentage = parseInt(appliedCoupon.discount);
                discount = (subtotal * percentage) / 100;
            } else {
                discount = parseInt(appliedCoupon.discount.replace('₹', ''));
            }
        }

        const tip = selectedTip || 0;
        const total = subtotal - discount + tip;
        return { subtotal, discount, tip, total };
    };

    const { subtotal, discount, tip, total } = getTotal();

    const renderPeopleAlsoLike = ({ item }) => (
        <TouchableOpacity style={styles.peopleLikeCard} onPress={() => addMoreService(item)}>
            <Image source={item.image} style={styles.peopleLikeImage} />
            <View style={styles.peopleLikeInfo}>
                <Text style={styles.peopleLikeName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.peopleLikeRating}>
                    <Image
                        source={require('../../asset/star-fill.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: COLORS.orange


                        }}
                    />

                    <Text style={styles.peopleLikeRatingText}>{item.rating}</Text>
                </View>
                <Text style={styles.peopleLikePrice}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.peopleLikeAddButton}>

                <Image
                    source={require('../../asset/plus.png')} // Update the path as needed
                    style={{
                        width: 16,
                        height: 16,
                        resizeMode: 'contain',
                        tintColor: COLORS.white


                    }}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // Coupon Modal
    const renderCouponModal = () => (
        <Modal
            transparent={true}
            visible={showAllCoupons}
            animationType="none"
            onRequestClose={closeCouponModal}
        >
            <TouchableWithoutFeedback onPress={closeCouponModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { transform: [{ translateY: couponModalSlideAnim }] }
                            ]}
                        >
                            <View style={styles.modalHandle} />
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Available Coupons</Text>
                                <Text style={styles.modalSubtitle}>Choose a coupon to apply</Text>
                            </View>
                            <FlatList
                                data={availableCoupons}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.couponCard}
                                        onPress={() => {
                                            setCouponCode(item.code);
                                            applyCoupon();
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.couponCardCode}>{item.code}</Text>
                                            <Text style={styles.couponCardDesc}>{item.description}</Text>
                                        </View>
                                        <Text style={styles.couponCardDiscount}>{item.discount}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={closeCouponModal}
                            >
                                <Text style={styles.modalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Slot Selection Modal
    const renderSlotModal = () => (
        <Modal
            transparent={true}
            visible={showSlotModal}
            animationType="none"
            onRequestClose={closeSlotModal}
        >
            <TouchableWithoutFeedback onPress={closeSlotModal}>
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
                                <Text style={styles.modalTitle}>Select Time Slots</Text>
                                <Text style={styles.modalSubtitle}>Choose date, time and duration</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Select Dates */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Select Date</Text>
                                    <Text style={styles.modalSectionSubtitle}>Choose a date to add time slot</Text>
                                    <View style={styles.datesContainer}>
                                        {availableDates.map((date, index) => {
                                            const dateStr = date.toDateString();
                                            const isSelected = selectedDate === dateStr;
                                            const isToday = index === 0;
                                            const hasSlot = slotSelections[dateStr];
                                            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.dateCard,
                                                        isSelected && styles.dateCardSelected,
                                                        isToday && !isSelected && styles.dateCardToday,
                                                        hasSlot && styles.dateCardHasSlot,
                                                    ]}
                                                    onPress={() => toggleDateSelection(date)}
                                                >
                                                    <Text style={[
                                                        styles.dateDay,
                                                        isSelected && styles.dateTextSelected,
                                                        isToday && !isSelected && styles.dateTextToday,
                                                        hasSlot && styles.dateTextHasSlot,
                                                    ]}>{dayNames[date.getDay()]}</Text>
                                                    <Text style={[
                                                        styles.dateNumber,
                                                        isSelected && styles.dateTextSelected,
                                                        isToday && !isSelected && styles.dateTextToday,
                                                        hasSlot && styles.dateTextHasSlot,
                                                    ]}>{date.getDate()}</Text>
                                                    <Text style={[
                                                        styles.dateMonth,
                                                        isSelected && styles.dateTextSelected,
                                                        isToday && !isSelected && styles.dateTextToday,
                                                        hasSlot && styles.dateTextHasSlot,
                                                    ]}>{date.toLocaleString('default', { month: 'short' })}</Text>
                                                    {hasSlot && (
                                                        <View style={styles.dateSlotIndicator}>

                                                            <Image
                                                                source={require('../../asset/checked.png')} // Update the path as needed
                                                                style={{
                                                                    width: 10,
                                                                    height: 10,
                                                                    resizeMode: 'contain',
                                                                    tintColor: COLORS.white


                                                                }}
                                                            />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Selected Date Info */}
                                {selectedDate && (
                                    <View style={styles.selectedDateInfo}>
                                        <Text style={styles.selectedDateText}>
                                            Setting slot for: <Text style={styles.selectedDateHighlight}>
                                                {new Date(selectedDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </Text>
                                        </Text>
                                    </View>
                                )}

                                {/* Select Time */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Select Time</Text>
                                    <Text style={styles.modalSectionSubtitle}>Choose your preferred time slot</Text>
                                    <View style={styles.timeContainer}>
                                        {timeSlots.map((time) => (
                                            <TouchableOpacity
                                                key={time}
                                                style={[
                                                    styles.timeCard,
                                                    selectedTime === time && styles.timeCardSelected,
                                                ]}
                                                onPress={() => setSelectedTime(time)}
                                            >
                                                <Text style={[
                                                    styles.timeText,
                                                    selectedTime === time && styles.timeTextSelected,
                                                ]}>{time}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Select Hours */}
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Select Duration</Text>
                                    <Text style={styles.modalSectionSubtitle}>Choose service duration</Text>
                                    <View style={styles.hoursContainer}>
                                        {hoursOptions.map((hours) => (
                                            <TouchableOpacity
                                                key={hours}
                                                style={[
                                                    styles.hoursCard,
                                                    selectedHours === hours && styles.hoursCardSelected,
                                                ]}
                                                onPress={() => setSelectedHours(hours)}
                                            >
                                                <Text style={[
                                                    styles.hoursText,
                                                    selectedHours === hours && styles.hoursTextSelected,
                                                ]}>{hours}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Add Slot Button */}
                                <TouchableOpacity
                                    style={styles.addSlotButton}
                                    onPress={saveSlotSelection}
                                >
                                    <Text style={styles.addSlotButtonText}>Add Slot</Text>

                                    <Image
                                        source={require('../../asset/add.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.white


                                        }}
                                    />
                                </TouchableOpacity>

                                {/* Added Slots List */}
                                {Object.keys(slotSelections).length > 0 && (
                                    <View style={styles.addedSlotsContainer}>
                                        <Text style={styles.addedSlotsTitle}>Added Slots</Text>
                                        {Object.entries(slotSelections).map(([dateStr, data]) => {
                                            const dateObj = new Date(dateStr);
                                            return (
                                                <View key={dateStr} style={styles.addedSlotCard}>
                                                    <View style={styles.addedSlotInfo}>
                                                        <Text style={styles.addedSlotDate}>
                                                            {dateObj.toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </Text>
                                                        <Text style={styles.addedSlotDetails}>
                                                            {data.time} • {data.hours}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={() => removeSlotSelection(dateStr)}
                                                        style={styles.removeSlotButton}
                                                    >

                                                        <Image
                                                            source={require('../../asset/close.png')} // Update the path as needed
                                                            style={{
                                                                width: 18,
                                                                height: 18,
                                                                resizeMode: 'contain',
                                                                tintColor: COLORS.red


                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Proceed Button */}
                                <TouchableOpacity
                                    style={styles.proceedButton}
                                    onPress={handleProceedToCheckout}
                                >
                                    <Text style={styles.proceedButtonText}>Confirm & Proceed</Text>

                                    <Image
                                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                        style={{
                                            width: 16,
                                            height: 16,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.white


                                        }}
                                    />
                                </TouchableOpacity>
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={closeSlotModal}
                            >
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
                <Text style={styles.headerTitle}>Your Cart</Text>
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
                {/* Selected Services */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Selected Services</Text>
                    {selectedServices.map((service) => (
                        <View key={service.id} style={styles.selectedServiceCard}>
                            <Image source={{ uri: service.coverImage }} style={styles.selectedServiceImage} />
                            <View style={styles.selectedServiceInfo}>
                                <Text style={styles.selectedServiceName}>{service.name}</Text>
                                <Text style={styles.selectedServicePrice}>{service.price}</Text>
                               
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeService(service.id)}
                            >

                                <Image
                                    source={require('../../asset/close.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.red


                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Add More Service */}
                <TouchableOpacity style={styles.addMoreButton}>

                    <Image
                        source={require('../../asset/add.png')} // Update the path as needed
                        style={{
                            width: 22,
                            height: 22,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold


                        }}
                    />
                    <Text style={styles.addMoreText}>Add More Services</Text>
                </TouchableOpacity>

                {/* Apply Coupon */}
                <View style={styles.couponContainer}>
                    <Text style={styles.sectionTitle}>Apply Coupon</Text>
                    <View style={styles.couponInputContainer}>
                        <TextInput
                            style={styles.couponInput}
                            placeholder="Enter coupon code"
                            placeholderTextColor="#999"
                            value={couponCode}
                            onChangeText={setCouponCode}
                            editable={!appliedCoupon}
                            autoCapitalize="characters"
                        />
                        {appliedCoupon ? (
                            <TouchableOpacity style={styles.removeCouponButton} onPress={removeCoupon}>

                                <Image
                                    source={require('../../asset/close.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.red


                                    }}
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.applyCouponButton} onPress={applyCoupon}>
                                <Text style={styles.applyCouponText}>Apply</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {appliedCoupon && (
                        <View style={styles.appliedCoupon}>

                            <Image
                                source={require('../../asset/checked.png')} // Update the path as needed
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.success


                                }}
                            />
                            <Text style={styles.appliedCouponText}>
                                {appliedCoupon.code} - {appliedCoupon.discount} off
                            </Text>
                        </View>
                    )}
                </View>

                {/* View All Coupons - Opens Modal */}
                <TouchableOpacity style={styles.viewCouponsButton} onPress={openCouponModal}>
                    <Text style={styles.viewCouponsText}>View All Coupons</Text>

                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 16,
                            height: 16,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold


                        }}
                    />
                </TouchableOpacity>

                {/* People Also Like */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>People Also Like</Text>
                    <FlatList
                        data={peopleAlsoLike}
                        renderItem={renderPeopleAlsoLike}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.peopleLikeList}
                    />
                </View>

                {/* Customer Details - Single Line */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                    <View style={styles.customerCard}>
                        <View style={styles.customerRow}>

                            <Image
                                source={require('../../asset/person-outline.png')} // Update the path as needed
                                style={{
                                    width: 16,
                                    height: 16,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold


                                }}
                            />
                            <Text style={styles.customerValue}>{customerName}</Text>
                            <View style={styles.customerDivider} />

                            <Image
                                source={require('../../asset/telephone.png')} // Update the path as needed
                                style={{
                                    width: 16,
                                    height: 16,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold


                                }}
                            />
                            <Text style={styles.customerValue}>{customerMobile}</Text>
                            <TouchableOpacity>
                                <Text style={styles.changeText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Address */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Service Address</Text>
                    <TouchableOpacity style={styles.addressCard}>
                        <View style={styles.addressRow}>

                            <Image
                                source={require('../../asset/location-outline.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold


                                }}
                            />
                            <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
                        </View>
                        <Text style={styles.changeAddressText}>Change</Text>
                    </TouchableOpacity>
                </View>

                {/* Tip Section */}
            

                {/* Bill Summary */}
                {/* <View style={styles.totalContainer}>
                    <Text style={styles.totalTitle}>Bill Summary</Text>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>₹{subtotal}</Text>
                    </View>
                    {discount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Discount</Text>
                            <Text style={[styles.totalValue, styles.discountValue]}>-₹{discount}</Text>
                        </View>
                    )}
                    {tip > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tip</Text>
                            <Text style={styles.totalValue}>₹{tip}</Text>
                        </View>
                    )}
                    <View style={styles.totalDivider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalGrandLabel}>Total</Text>
                        <Text style={styles.totalGrandValue}>₹{total}</Text>
                    </View>
                </View> */}

                {/* Select Date & Time Button - After Bill Summary */}
                <TouchableOpacity style={styles.selectSlotButton} onPress={()=>navigation.replace("SelectSlotScreen")}>
                    
                    <Image
                        source={require('../../asset/calendar.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.white


                        }}
                    />
                    <Text style={styles.selectSlotText}>Select Date & Time</Text>
                    {Object.keys(slotSelections).length > 0 && (
                        <View style={styles.slotCountBadge}>
                            <Text style={styles.slotCountText}>{Object.keys(slotSelections).length}</Text>
                        </View>
                    )}
                    
                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 18,
                            height: 18,
                            resizeMode: 'contain',
                            tintColor: COLORS.white


                        }}
                    />
                </TouchableOpacity>

                <View style={styles.footerSpacer} />
            </Animated.ScrollView>

            {/* Coupon Modal */}
            {renderCouponModal()}

            {/* Slot Modal */}
            {renderSlotModal()}
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
        borderBottomColor: '#F0EDE8',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fffcfc',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    // Selected Services
    selectedServiceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    selectedServiceImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    selectedServiceInfo: {
        flex: 1,
        marginLeft: 12,
    },
    selectedServiceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    selectedServicePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#C9A84C',
        marginTop: 2,
    },
    selectedServiceDuration: {
        fontSize: 11,
        color: '#666666',
        marginTop: 1,
    },
    removeButton: {
        padding: 4,
    },
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    addMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#C9A84C',
    },
    // Coupon
    couponContainer: {
        marginTop: 16,
    },
    couponInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        paddingHorizontal: 14,
        height: 48,
    },
    couponInput: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
    },
    applyCouponButton: {
        backgroundColor: '#C9A84C',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    applyCouponText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    removeCouponButton: {
        padding: 4,
    },
    appliedCoupon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    appliedCouponText: {
        fontSize: 13,
        color: '#2ECC71',
        fontWeight: '500',
    },
    viewCouponsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
    },
    viewCouponsText: {
        fontSize: 13,
        color: '#C9A84C',
        fontWeight: '500',
    },
    // People Also Like
    peopleLikeList: {
        paddingVertical: 4,
    },
    peopleLikeCard: {
        width: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    peopleLikeImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
    },
    peopleLikeInfo: {
        marginTop: 6,
    },
    peopleLikeName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    peopleLikeRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 2,
    },
    peopleLikeRatingText: {
        fontSize: 11,
        color: '#666666',
    },
    peopleLikePrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#C9A84C',
        marginTop: 2,
    },
    peopleLikeAddButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#C9A84C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Customer Details
    customerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    customerValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    customerDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#E8E3D8',
        marginHorizontal: 4,
    },
    changeText: {
        fontSize: 12,
        color: '#C9A84C',
        fontWeight: '500',
        marginLeft: 'auto',
    },
    // Address
    addressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    addressText: {
        fontSize: 13,
        color: '#1A1A1A',
        flex: 1,
    },
    changeAddressText: {
        fontSize: 12,
        color: '#C9A84C',
        fontWeight: '500',
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    // Select Slot Button - After Bill Summary
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
    // Tip
    tipNote: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 10,
    },
    tipOptions: {
        flexDirection: 'row',
        gap: 10,
    },
    tipOption: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E8E3D8',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    tipOptionSelected: {
        borderColor: '#C9A84C',
        backgroundColor: '#C9A84C',
    },
    tipOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    tipOptionTextSelected: {
        color: '#FFFFFF',
    },
    customTipContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    customTipInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    customTipApply: {
        backgroundColor: '#C9A84C',
        paddingHorizontal: 18,
        borderRadius: 10,
        justifyContent: 'center',
    },
    customTipApplyText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Total
    totalContainer: {
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    totalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666666',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    discountValue: {
        color: '#2ECC71',
    },
    totalDivider: {
        height: 1,
        backgroundColor: '#F0EDE8',
        marginVertical: 8,
    },
    totalGrandLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    totalGrandValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#C9A84C',
    },
    footerSpacer: {
        height: 20,
    },
    // Modal Styles
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
        maxHeight: height * 0.85,
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
        marginBottom: 16,
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
    modalSection: {
        marginBottom: 16,
    },
    modalSectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    modalSectionSubtitle: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 10,
    },
    // Dates
    datesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dateCard: {
        width: (width - 80) / 7,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#F8F6F0',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    dateCardSelected: {
        backgroundColor: '#C9A84C',
        borderColor: '#C9A84C',
    },
    dateCardToday: {
        borderColor: '#C9A84C',
    },
    dateCardHasSlot: {
        borderColor: '#2ECC71',
        backgroundColor: '#E6F9F0',
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
    dateTextToday: {
        color: '#C9A84C',
    },
    dateTextHasSlot: {
        color: '#2ECC71',
    },
    dateSlotIndicator: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDateInfo: {
        backgroundColor: '#F8F6F0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    selectedDateText: {
        fontSize: 13,
        color: '#666666',
        textAlign: 'center',
    },
    selectedDateHighlight: {
        color: '#C9A84C',
        fontWeight: '600',
    },
    // Time
    timeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeCard: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F8F6F0',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    timeCardSelected: {
        backgroundColor: '#C9A84C',
        borderColor: '#C9A84C',
    },
    timeText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    timeTextSelected: {
        color: '#FFFFFF',
    },
    // Hours
    hoursContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    hoursCard: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F8F6F0',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    hoursCardSelected: {
        backgroundColor: '#C9A84C',
        borderColor: '#C9A84C',
    },
    hoursText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    hoursTextSelected: {
        color: '#FFFFFF',
    },
    // Add Slot Button
    addSlotButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#C9A84C',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 4,
    },
    addSlotButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Added Slots
    addedSlotsContainer: {
        marginTop: 16,
    },
    addedSlotsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    addedSlotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F6F0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    addedSlotInfo: {
        flex: 1,
    },
    addedSlotDate: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    addedSlotDetails: {
        fontSize: 12,
        color: '#666666',
        marginTop: 1,
    },
    removeSlotButton: {
        padding: 4,
    },
    // Proceed Button
    proceedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#C9A84C',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 16,
    },
    proceedButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Coupon Card
    couponCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F6F0',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    couponCardCode: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    couponCardDesc: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    couponCardDiscount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#C9A84C',
    },
    modalCloseButton: {
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },
    modalCloseText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
});

export default ViewCartScreen;