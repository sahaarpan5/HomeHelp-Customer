import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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
    ActivityIndicator,
} from 'react-native';
import API from '../../util/API';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const { width, height } = Dimensions.get('window');

const ViewCartScreen = ({ navigation, route }) => {
    // States
    const {
        selectedServices: servicesFromRoute = [],
        customername = '',
        customemob = '',
    } = route.params || {};
    const [selectedServices, setSelectedServices] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [selectedTip, setSelectedTip] = useState(null);
    const [customTip, setCustomTip] = useState('');
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [selectedCustomerMob, setSelectedCustomerMob] = useState('');
    const [showCustomTip, setShowCustomTip] = useState(false);
    const [showAllCoupons, setShowAllCoupons] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressLoading, setAddressLoading] = useState(true);
    const [peopleAlsoLike, setPeopleAlsoLike] = useState([]);
    const [peopleAlsoLikeLoading, setPeopleAlsoLikeLoading] = useState(true);
    const [address, setAddress] = useState('');

    //address edit
    const [showEditAddressModal, setShowEditAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const [editAddressTitle, setEditAddressTitle] = useState('');
    const [editAddressLine1, setEditAddressLine1] = useState('');
    const [editAddressLine2, setEditAddressLine2] = useState('');
    const [editAddressLandmark, setEditAddressLandmark] = useState('');
    const [editAddressCity, setEditAddressCity] = useState('');
    const [editAddressState, setEditAddressState] = useState('');
    const [editAddressPinCode, setEditAddressPinCode] = useState('');


    const [editAddressId, setEditAddressId] = useState('');
    const [editAddressType, setEditAddressType] = useState('');

    const [editAddress, setEditAddress] = useState('');
    const [editFlatNo, setEditFlatNo] = useState('');
    const [editLandmark, setEditLandmark] = useState('');

    const [editPincode, setEditPincode] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editState, setEditState] = useState('');

    const [editLatt, setEditLatt] = useState(0);
    const [editLong, setEditLong] = useState(0);
    const [editIsDefault, setEditIsDefault] = useState(false);

    const [isAddressUpdating, setIsAddressUpdating] = useState(false);

    // Slot Selection States - Day wise
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedHours, setSelectedHours] = useState(null);

    // Store slot selections per day
    const [slotSelections, setSlotSelections] = useState({});

    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerNameInput, setCustomerNameInput] = useState('');
    const [customerMobileInput, setCustomerMobileInput] = useState('');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const couponModalSlideAnim = useRef(new Animated.Value(height)).current;

    const COLORS = {
        gold: '#76577F',
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
        if (servicesFromRoute.length > 0) {
            setSelectedServices(servicesFromRoute);
        }
        setSelectedCustomerMob(customemob);
        setSelectedCustomerName(customername);

    }, []);

    useEffect(() => {
        fetchPeopleAlsoLike();
    }, [selectedServices]);



    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [])
    );





    const fetchAddresses = async () => {
        try {
            setAddressLoading(true);

            const token = await AsyncStorage.getItem('token');

            const response = await axios.get(
                API.CUSTOMER_ADDRESSES,
                {
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const addresses = Array.isArray(response.data?.addresses)
                ? response.data.addresses
                : [];

            setSavedAddresses(addresses);

            // Select default address initially
            const defaultAddress = addresses.find(
                item => item.isDefault === true
            );

            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
                setAddress(formatAddress(defaultAddress));
            }

        } catch (error) {
            console.log(
                'Address API Error:',
                error?.response?.data || error.message
            );
        } finally {
            setAddressLoading(false);
        }
    };

    const formatAddress = (item) => {
        if (!item) return '';

        return [
            item.addressLine1,
            item.addressLine2,
            item.city,
            item.state,
            item.pinCode,
        ]
            .filter(Boolean)
            .join(', ');
    };

    const openAddressModal = () => {
        setShowAddressModal(true);
    };

    const handleAddressSelect = (item) => {
        setSelectedAddress(item);
        setAddress(formatAddress(item));
        setShowAddressModal(false);
    };




    const fetchPeopleAlsoLike = async () => {
        try {
            setPeopleAlsoLikeLoading(true);

            const token = await AsyncStorage.getItem('token');

            const response = await axios.get(
                API.CUSTOMER_SERVICES,
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const services = Array.isArray(response.data)
                ? response.data
                : [];

            const selectedServiceNames = selectedServices.map(
                item => item.name?.trim().toLowerCase()
            );

            const filteredServices = services.filter(
                item =>
                    !selectedServiceNames.includes(
                        item.serviceName?.trim().toLowerCase()
                    )
            );

            const formattedServices = filteredServices.map(item => ({
                id: item.serviceId,
                name: item.serviceName,
                image: { uri: item.imageUrl },
                icon: { uri: item.icon },
            }));

            setPeopleAlsoLike(formattedServices);

        } catch (error) {
            console.log(
                'People Also Like API Error:',
                error?.response?.data || error.message
            );

            setPeopleAlsoLike([]);
        } finally {
            setPeopleAlsoLikeLoading(false);
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

    const removeService = (serviceName) => {
        Alert.alert(
            'Remove Service',
            'Are you sure you want to remove this service?',
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
                            // Remove from current cart state
                            const updatedCart = selectedServices.filter(
                                item =>
                                    item.name?.trim().toLowerCase() !==
                                    serviceName?.trim().toLowerCase()
                            );

                            setSelectedServices(updatedCart);

                            // Remove from AsyncStorage cart
                            await AsyncStorage.setItem(
                                'selectedServices',
                                JSON.stringify(updatedCart)
                            );
                            if (updatedCart.length === 0) {
                                navigation.goBack();
                            }

                            console.log('Service removed from cart:', serviceName);
                        } catch (error) {
                            console.log('Remove Service Error:', error);
                        }
                    },
                },
            ]
        );
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


    const addMoreService = async (service) => {
        try {
            const token = await AsyncStorage.getItem('token');

            // Get complete service details
            const response = await axios.get(
                `${API.CUSTOMER_SERVICE_DETAILS}/${service.id}`,
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;

            // Get active pricing
            const activePricing = Array.isArray(data.pricing)
                ? data.pricing.filter(
                    item =>
                        item.isActive === true ||
                        item.isActive === 'true' ||
                        item.isActive === 1
                )
                : [];

            // Get hourly price
            const hourlyPricing = activePricing.find(
                item => item.pricingType === 1
            );

            // Create complete cart service
            const serviceToAdd = {
                id: data.serviceId,
                name: data.serviceName,
                price: hourlyPricing
                    ? `₹${hourlyPricing.price}`
                    : 'Price unavailable',
                coverImage: {
                    uri: data.imageUrl,
                },
                image: {
                    uri: data.imageUrl,
                },
                duration: '1 hour',
                description:
                    hourlyPricing?.pricingDescription ||
                    data.workProfile ||
                    data.serviceName,
                whatIsCovered: Array.isArray(data.included)
                    ? data.included.map(item => item.includedService)
                    : [],
            };

            // Check duplicate by service name
            const alreadyExists = selectedServices.some(
                item =>
                    item.name?.trim().toLowerCase() ===
                    serviceToAdd.name?.trim().toLowerCase()
            );

            if (alreadyExists) {
                return;
            }

            // Add to selected services
            const updatedServices = [
                ...selectedServices,
                serviceToAdd,
            ];

            setSelectedServices(updatedServices);

            // Save cart
            await AsyncStorage.setItem(
                'selectedServices',
                JSON.stringify(updatedServices)
            );

            // Remove from People Also Like
            setPeopleAlsoLike(prev =>
                prev.filter(
                    item =>
                        item.name?.trim().toLowerCase() !==
                        serviceToAdd.name?.trim().toLowerCase()
                )
            );

        } catch (error) {
            console.log(
                'Add People Also Like Error:',
                error?.response?.data || error.message
            );
        }
    };

    const renderPeopleAlsoLike = ({ item }) => (
        <View style={styles.peopleLikeCard}>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                    navigation.navigate('ServiceBookingScreen', {
                        serviceId: item.id,
                    })
                }
            >
                <Image
                    source={item.image}
                    style={styles.peopleLikeImage}
                />
            </TouchableOpacity>

            <View style={styles.peopleLikeInfo}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.navigate('ServiceBookingScreen', {
                            serviceId: item.id,
                        })
                    }
                >
                    <Text
                        style={styles.peopleLikeName}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.peopleLikeAddButton}
                activeOpacity={0.7}
                onPress={() => addMoreService(item)}
            >
                <Image
                    source={require('../../asset/plus.png')}
                    style={{
                        width: 16,
                        height: 16,
                        resizeMode: 'contain',
                        tintColor: COLORS.white,
                    }}
                />
            </TouchableOpacity>

        </View>
    );


    const openCustomerModal = () => {
        setCustomerNameInput(selectedCustomerName);
        setCustomerMobileInput(selectedCustomerMob);
        setShowCustomerModal(true);
    };

    const closeCustomerModal = () => {
        setShowCustomerModal(false);
    };

    const saveCustomerDetails = () => {
        const name = customerNameInput.trim();
        const mobile = customerMobileInput.trim();

        if (!name) {
            Alert.alert('Required', 'Please enter customer name');
            return;
        }

        if (!mobile) {
            Alert.alert('Required', 'Please enter mobile number');
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setSelectedCustomerName(name);
        setSelectedCustomerMob(mobile);

        setShowCustomerModal(false);
    };


    const handleEditAddress = async () => {

        // --------------------------------
        // VALIDATION
        // --------------------------------

        if (!editAddress.trim()) {
            Alert.alert('Error', 'Please enter Address Line 1');
            return;
        }

        if (!editLandmark.trim()) {
            Alert.alert('Error', 'Please enter a landmark');
            return;
        }

        if (!editPincode.trim()) {
            Alert.alert('Error', 'Please enter a pincode');
            return;
        }

        if (!/^[0-9]{6}$/.test(editPincode.trim())) {
            Alert.alert('Error', 'Please enter a valid 6-digit pincode');
            return;
        }

        try {
            setIsAddressUpdating(true);

            // --------------------------------
            // GET TOKEN
            // --------------------------------

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found. Please login again.'
                );
                return;
            }

            // --------------------------------
            // REQUEST BODY
            // --------------------------------

            const requestBody = {
                addressTitle: editAddressType || '',

                addressLine1: editAddress.trim(),

                addressLine2: editFlatNo.trim(),

                pinCode: editPincode.trim(),

                city: editCity || '',

                state: editState || '',

                latitude: editLatt || 0,

                longitude: editLong || 0,

                isDefault: editIsDefault || false,

                landMark: editLandmark.trim(),
            };

            console.log('Address ID:', editAddressId);
            console.log('Update Address Request:', requestBody);

            // --------------------------------
            // PUT API
            // --------------------------------

            const response = await axios.put(
                `${API.CUSTOMER_ADDRESS}/${editAddressId}`,
                requestBody,
                {
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'Update Address Response:',
                response.data
            );

            // --------------------------------
            // SUCCESS
            // --------------------------------

            if (response.data?.success === true) {

                Alert.alert(
                    'Success',
                    'Address updated successfully.'
                );

                setShowEditAddressModal(false);

                // Refresh addresses from backend
                await fetchAddresses();

            } else {

                Alert.alert(
                    'Error',
                    response.data?.message ||
                    'Unable to update address.'
                );
            }

        } catch (error) {

            console.log(
                'Update address error:',
                error
            );

            console.log(
                'Update address response:',
                error.response?.data
            );

            Alert.alert(
                'Error',
                error.response?.data?.message ||
                'Unable to update address.'
            );

        } finally {
            setIsAddressUpdating(false);
        }
    };


    const handleOpenEditAddress = (item) => {
        setEditingAddress(item);

        setEditAddressId(item.addressId || '');
        setEditAddressType(item.addressTitle || '');

        setEditAddress(item.addressLine1 || '');
        setEditFlatNo(item.addressLine2 || '');
        setEditLandmark(item.landMark || '');

        setEditPincode(item.pinCode || '');
        setEditCity(item.city || '');
        setEditState(item.state || '');

        setEditLatt(item.latitude || 0);
        setEditLong(item.longitude || 0);
        setEditIsDefault(item.isDefault || false);

        setShowAddressModal(false);

        setTimeout(() => {
            setShowEditAddressModal(true);
        }, 300);
    };

    const saveEditedAddress = () => {
        if (!editAddressLine1.trim()) {
            Alert.alert('Required', 'Please enter address');
            return;
        }

        if (!editAddressCity.trim()) {
            Alert.alert('Required', 'Please enter city');
            return;
        }

        if (!editAddressState.trim()) {
            Alert.alert('Required', 'Please enter state');
            return;
        }

        if (!/^[0-9]{6}$/.test(editAddressPinCode.trim())) {
            Alert.alert('Invalid PIN', 'Please enter a valid 6-digit PIN code');
            return;
        }

        const updatedAddress = {
            ...editingAddress,
            addressTitle: editAddressTitle.trim(),
            addressLine1: editAddressLine1.trim(),
            addressLine2: editAddressLine2.trim(),
            landMark: editAddressLandmark.trim(),
            city: editAddressCity.trim(),
            state: editAddressState.trim(),
            pinCode: editAddressPinCode.trim(),
        };

        // Update selected address
        setSelectedAddress(updatedAddress);

        // Update displayed address
        setAddress(formatAddress(updatedAddress));

        // Update address in saved address list
        setSavedAddresses(prev =>
            prev.map(item =>
                item.addressId === updatedAddress.addressId
                    ? updatedAddress
                    : item
            )
        );

        setShowEditAddressModal(false);
    };

    const rendereditAddressModal = () => (
        <Modal
            transparent
            visible={showEditAddressModal}
            animationType="slide"
            onRequestClose={() => setShowEditAddressModal(false)}
        >
            <View style={styles.addressModalOverlay}>

                <TouchableWithoutFeedback
                    onPress={() => setShowEditAddressModal(false)}
                >
                    <View style={styles.addressModalBackground} />
                </TouchableWithoutFeedback>

                <View style={styles.editAddressBottomSheet}>

                    {/* Handle */}

                    <View style={styles.addressModalHandle} />

                    {/* Header */}

                    <View style={styles.addressModalHeader}>

                        <View>
                            <Text style={styles.addressModalTitle}>
                                Edit Address
                            </Text>

                            <Text style={styles.addressModalSubtitle}>
                                Update your address details
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() =>
                                setShowEditAddressModal(false)
                            }
                        >
                            <Image
                                source={require('../../asset/close.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: '#666',
                                }}
                            />
                        </TouchableOpacity>

                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* Address Title */}


                        {/* Address Line 1 */}

                        <Text style={styles.editInputLabel}>
                            Selected Address
                        </Text>

                        <TextInput
                            style={[styles.editAddressInput, { height: 100 }]}
                            value={editAddress}
                            onChangeText={setEditAddress}
                            placeholder="Enter address"
                            placeholderTextColor="#999"
                            multiline
                        />

                        {/* Address Line 2 */}

                        <Text style={styles.editInputLabel}>
                            House / Flat Number
                        </Text>

                        <TextInput
                            style={styles.editAddressInput}
                            value={editFlatNo}
                            onChangeText={setEditFlatNo}
                            placeholder="Enter flat / floor / building"
                            placeholderTextColor="#999"
                            multiline
                        />

                        {/* Landmark */}

                        <Text style={styles.editInputLabel}>
                            Landmark
                        </Text>

                        <TextInput
                            style={styles.editAddressInput}
                            value={editLandmark}
                            onChangeText={setEditLandmark}
                            placeholder="Enter landmark"
                            placeholderTextColor="#999"
                        />

                        {/* City */}



                        {/* State */}



                        {/* PIN */}

                        <Text style={styles.editInputLabel}>
                            PIN Code
                        </Text>

                        <TextInput
                            style={[
                                styles.editAddressInput,

                            ]}
                            value={editPincode}

                            onChangeText={setEditPincode}
                            placeholder="Enter Pincode"
                            placeholderTextColor="#999"
                        />

                        {/* SAVE */}

                        <TouchableOpacity
                            style={styles.saveEditedAddressButton}
                            onPress={handleEditAddress}
                            disabled={isAddressUpdating}
                        >

                            {isAddressUpdating ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <Text style={styles.saveEditedAddressText}>
                                    Edit Address
                                </Text>
                            )}

                        </TouchableOpacity>

                    </ScrollView>

                </View>

            </View>
        </Modal>
    );
    const renderAddressModal = () => (
        <Modal
            transparent
            visible={showAddressModal}
            animationType="slide"
            onRequestClose={() => setShowAddressModal(false)}
        >
            <View style={styles.addressModalOverlay}>

                <TouchableWithoutFeedback
                    onPress={() => setShowAddressModal(false)}
                >
                    <View style={styles.addressModalBackground} />
                </TouchableWithoutFeedback>

                <View style={styles.addressBottomSheet}>

                    {/* Handle */}
                    <View style={styles.addressModalHandle} />

                    {/* Header */}
                    <View style={styles.addressModalHeader}>
                        <View>
                            <Text style={styles.addressModalTitle}>
                                Select Address
                            </Text>

                            <Text style={styles.addressModalSubtitle}>
                                Choose where you want the service
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowAddressModal(false)}
                        >
                            <Image
                                source={require('../../asset/close.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: '#666',
                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Address List */}
                    {addressLoading ? (
                        <View style={styles.addressLoader}>
                            <ActivityIndicator
                                size="small"
                                color="#76577F"
                            />

                            <Text style={styles.addressLoadingText}>
                                Loading addresses...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={savedAddresses}
                            keyExtractor={item => item.addressId}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingBottom: 10,
                            }}
                            renderItem={({ item }) => {

                                const isSelected =
                                    selectedAddress?.addressId === item.addressId;

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.savedAddressCard,
                                            isSelected &&
                                            styles.savedAddressCardSelected,
                                        ]}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            handleAddressSelect(item)
                                        }
                                    >

                                        {/* Location Icon */}
                                        <View
                                            style={[
                                                styles.addressIconContainer,
                                                isSelected &&
                                                styles.addressIconContainerSelected,
                                            ]}
                                        >
                                            <Image
                                                source={require('../../asset/location-outline.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    resizeMode: 'contain',
                                                    tintColor: isSelected
                                                        ? '#FFFFFF'
                                                        : '#76577F',
                                                }}
                                            />
                                        </View>

                                        {/* Address Details */}
                                        <View style={styles.savedAddressInfo}>

                                            <View style={styles.addressTitleRow}>
                                                <Text style={styles.savedAddressTitle}>
                                                    {item.addressTitle}
                                                </Text>

                                                {item.isDefault && (
                                                    <View style={styles.defaultBadge}>
                                                        <Text style={styles.defaultBadgeText}>
                                                            Default
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            <Text
                                                style={styles.savedAddressText}
                                                numberOfLines={3}
                                            >
                                                {formatAddress(item)}
                                            </Text>

                                            {item.landMark ? (
                                                <Text
                                                    style={styles.savedAddressLandmark}
                                                    numberOfLines={1}
                                                >
                                                    Landmark: {item.landMark}
                                                </Text>
                                            ) : null}

                                            {/* Edit Address */}
                                            <TouchableOpacity
                                                style={styles.editAddressButton}
                                                onPress={() => handleOpenEditAddress(item)}
                                            >
                                                <Image
                                                    source={require('../../asset/pencil.png')}
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        resizeMode: 'contain',
                                                        tintColor: '#76577F',
                                                    }}
                                                />

                                                <Text style={styles.editAddressText}>
                                                    Edit
                                                </Text>
                                            </TouchableOpacity>

                                        </View>

                                        {/* Radio */}
                                        <View
                                            style={[
                                                styles.addressRadio,
                                                isSelected &&
                                                styles.addressRadioSelected,
                                            ]}
                                        >
                                            {isSelected && (
                                                <View
                                                    style={
                                                        styles.addressRadioInner
                                                    }
                                                />
                                            )}
                                        </View>

                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}

                    {/* Add New Address */}
                    <TouchableOpacity
                        style={styles.addNewAddressButton}
                        onPress={() => {
                            setShowAddressModal(false);

                            navigation.navigate('AddAddressScreen');
                        }}
                    >
                        <View style={styles.addNewAddressIcon}>
                            <Image
                                source={require('../../asset/add.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: '#76577F',
                                }}
                            />
                        </View>

                        <Text style={styles.addNewAddressText}>
                            Add New Address
                        </Text>

                        <Image
                            source={require('../../asset/arrow-forward.png')}
                            style={{
                                width: 18,
                                height: 18,
                                resizeMode: 'contain',
                                tintColor: '#76577F',
                            }}
                        />
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
    const renderCusModal = () => (
        <Modal
            transparent
            visible={showCustomerModal}
            animationType="fade"
            onRequestClose={closeCustomerModal}
        >
            <TouchableWithoutFeedback onPress={closeCustomerModal}>
                <View style={styles.customerModalOverlay}>

                    <TouchableWithoutFeedback>
                        <View style={styles.customerModalContent}>

                            <Text style={styles.customerModalTitle}>
                                Customer Details
                            </Text>

                            <Text style={styles.customerModalSubtitle}>
                                Enter customer name and mobile number
                            </Text>

                            {/* Customer Name */}
                            <Text style={styles.customerInputLabel}>
                                Customer Name
                            </Text>

                            <TextInput
                                style={styles.customerInput}
                                placeholder="Enter customer name"
                                placeholderTextColor="#999"
                                value={customerNameInput}
                                onChangeText={setCustomerNameInput}
                                autoCapitalize="words"
                            />

                            {/* Mobile Number */}
                            <Text style={styles.customerInputLabel}>
                                Mobile Number
                            </Text>

                            <TextInput
                                style={styles.customerInput}
                                placeholder="Enter mobile number"
                                placeholderTextColor="#999"
                                value={customerMobileInput}
                                onChangeText={setCustomerMobileInput}
                                keyboardType="number-pad"
                                maxLength={10}
                            />

                            {/* Buttons */}
                            <View style={styles.customerModalButtons}>

                                <TouchableOpacity
                                    style={styles.customerCancelButton}
                                    onPress={closeCustomerModal}
                                >
                                    <Text style={styles.customerCancelText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.customerSaveButton}
                                    onPress={saveCustomerDetails}
                                >
                                    <Text style={styles.customerSaveText}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                            </View>

                        </View>
                    </TouchableWithoutFeedback>

                </View>
            </TouchableWithoutFeedback>
        </Modal>
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
                    {selectedServices.map((service, index) => (
                        <View
                            key={`${service.name}-${index}`}
                            style={styles.selectedServiceCard}
                        >
                            <Image
                                source={service.coverImage}
                                style={styles.selectedServiceImage}
                            />

                            <View style={styles.selectedServiceInfo}>
                                <Text style={styles.selectedServiceName}>
                                    {service.name}
                                </Text>

                                <Text style={styles.selectedServicePrice}>
                                    {service.price} / hour
                                </Text>


                            </View>

                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeService(service.name)}
                            >
                                <Image
                                    source={require('../../asset/close.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.red,
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Add More Service */}
                {/* <TouchableOpacity style={styles.addMoreButton}>

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
                </TouchableOpacity> */}

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
                    {peopleAlsoLikeLoading ? (
                        <View style={styles.peopleAlsoLikeLoader}>
                            <ActivityIndicator
                                size="small"
                                color="#76577F"
                            />
                            <Text style={styles.loadingText}>
                                Loading services...
                            </Text>
                        </View>
                    ) : peopleAlsoLike.length > 0 ? (
                        <FlatList
                            data={peopleAlsoLike}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            renderItem={renderPeopleAlsoLike}
                        />
                    ) : null}
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
                            <Text style={styles.customerValue}>{selectedCustomerName}</Text>
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
                            <Text style={styles.customerValue}>{selectedCustomerMob}</Text>
                            <TouchableOpacity onPress={openCustomerModal}>
                                <Text style={styles.changeText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Address */}
                {addressLoading ? (
                    <ActivityIndicator
                        size="small"
                        color="#76577F"
                    />
                ) : (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Service Address</Text>
                        <TouchableOpacity style={styles.addressCard} onPress={openAddressModal}>
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
                )}






                {/* Select Date & Time Button - After Bill Summary */}
                <TouchableOpacity
                    style={styles.selectSlotButton}
                    onPress={() => {
                        navigation.navigate('SelectSlotScreen', {
                            selectedServices: selectedServices,

                            customerDetails: {
                                name: selectedCustomerName,
                                mobile: selectedCustomerMob,
                            },

                            addressDetails: selectedAddress,

                            address: address,

                            slotSelections: slotSelections,
                        });
                    }}
                >
                    <Image
                        source={require('../../asset/calendar.png')}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.white,
                        }}
                    />

                    <Text style={styles.selectSlotText}>
                        Select Date & Time
                    </Text>

                    {Object.keys(slotSelections).length > 0 && (
                        <View style={styles.slotCountBadge}>
                            <Text style={styles.slotCountText}>
                                {Object.keys(slotSelections).length}
                            </Text>
                        </View>
                    )}

                    <Image
                        source={require('../../asset/arrow-forward.png')}
                        style={{
                            width: 18,
                            height: 18,
                            resizeMode: 'contain',
                            tintColor: COLORS.white,
                        }}
                    />
                </TouchableOpacity>

                <View style={styles.footerSpacer} />
            </Animated.ScrollView>

            {/* Coupon Modal */}
            {renderCouponModal()}

            {/* Slot Modal */}
            {renderSlotModal()}
            {renderCusModal()}
            {renderAddressModal()}
            {rendereditAddressModal()}


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
        borderBottomColor: '#F0EDE8',
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
        color: '#76577F',
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
        backgroundColor: '#76577F',
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
        color: '#76577F',
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
        color: '#76577F',
        marginTop: 2,
    },
    peopleLikeAddButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#403746',
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
        color: '#76577F',
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
        color: '#76577F',
        fontWeight: '500',
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    // Select Slot Button - After Bill Summary
    selectSlotButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#76577F',
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
        color: '#76577F',
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
    peopleAlsoLikeLoader: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        marginTop: 8,
        fontSize: 13,
        color: '#76577F',
    },

    customerModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    customerModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 22,
    },

    customerModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },

    customerModalSubtitle: {
        fontSize: 13,
        color: '#777777',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 22,
    },

    customerInputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#403746',
        marginBottom: 7,
        marginTop: 10,
    },

    customerInput: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E0DCE3',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#1A1A1A',
        backgroundColor: '#FAFAFA',
    },

    customerModalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 24,
    },

    customerCancelButton: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#76577F',
        alignItems: 'center',
        justifyContent: 'center',
    },

    customerCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#76577F',
    },

    customerSaveButton: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        backgroundColor: '#76577F',
        alignItems: 'center',
        justifyContent: 'center',
    },

    customerSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    addressModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    addressModalBackground: {
        flex: 1,
    },

    addressBottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 25,
        maxHeight: height * 0.78,
    },

    addressModalHandle: {
        width: 42,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D8D8D8',
        alignSelf: 'center',
        marginBottom: 16,
    },

    addressModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    addressModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    addressModalSubtitle: {
        fontSize: 12,
        color: '#777777',
        marginTop: 3,
    },

    addressLoader: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },

    addressLoadingText: {
        marginTop: 8,
        fontSize: 13,
        color: '#76577F',
    },

    savedAddressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },

    savedAddressCardSelected: {
        backgroundColor: '#F7F1FA',
        borderColor: '#76577F',
    },

    addressIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#EFE8F2',
        alignItems: 'center',
        justifyContent: 'center',
    },

    addressIconContainerSelected: {
        backgroundColor: '#76577F',
    },

    savedAddressInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },

    addressTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    savedAddressTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    defaultBadge: {
        marginLeft: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: '#E8F7EE',
    },

    defaultBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#2E9B57',
    },

    savedAddressText: {
        fontSize: 12,
        lineHeight: 17,
        color: '#555555',
    },

    savedAddressLandmark: {
        fontSize: 11,
        color: '#888888',
        marginTop: 4,
    },

    addressRadio: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#BDBDBD',
        alignItems: 'center',
        justifyContent: 'center',
    },

    addressRadioSelected: {
        borderColor: '#76577F',
    },

    addressRadioInner: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: '#76577F',
    },

    addNewAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#76577F',
        paddingHorizontal: 12,
        marginTop: 8,
    },

    addNewAddressIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F0E8F4',
        alignItems: 'center',
        justifyContent: 'center',
    },

    addNewAddressText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '600',
        color: '#76577F',
    },

    editAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 7,
        paddingVertical: 3,
    },

    editAddressText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#76577F',
    },


    editAddressBottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 25,
        maxHeight: height * 0.88,
    },

    editInputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#403746',
        marginBottom: 6,
        marginTop: 10,
    },

    editAddressInput: {
        height: 46,
        borderWidth: 1,
        borderColor: '#E2DDE5',
        borderRadius: 10,
        paddingHorizontal: 13,
        fontSize: 14,
        color: '#1A1A1A',
        backgroundColor: '#FAFAFA',
    },

    saveEditedAddressButton: {
        height: 48,
        borderRadius: 11,
        backgroundColor: '#76577F',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
    },

    saveEditedAddressText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    editAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 7,
        paddingVertical: 3,
    },

    editAddressText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#76577F',
    },

    disabledInput: {
        backgroundColor: '#76577F',
        color: '#FFF',
    },
});

export default ViewCartScreen;