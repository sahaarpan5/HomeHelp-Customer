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

const SubscriptionSlotScreen = ({ navigation, route }) => {
    // States
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Customer Details
    const [customerName, setCustomerName] = useState('Rahul Sharma');
    const [customerEmail, setCustomerEmail] = useState('rahul@email.com');
    const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
    const [tempCustomerName, setTempCustomerName] = useState(customerName);
    const [tempCustomerEmail, setTempCustomerEmail] = useState(customerEmail);
    const [tempCustomerPhone, setTempCustomerPhone] = useState(customerPhone);

    // Location Details
    const [location, setLocation] = useState('123, Main Street, Mumbai, Maharashtra - 400001');
    const [tempLocation, setTempLocation] = useState(location);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;

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

    // Get subscription data from route params
    const subscriptionData =  {
        name: 'Home Cleaning',
        monthlyPrice: 9980,
        pricePerMonth: '₹9,980',
        maxHoursPerDay: 4,
    };

    // Generate months
    const generateMonths = () => {
        const months = [];
        const currentDate = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate);
            date.setMonth(currentDate.getMonth() + i);
            months.push({
                id: i + 1,
                month: date.toLocaleString('default', { month: 'long' }),
                year: date.getFullYear(),
                date: date,
                isCurrent: i === 0,
            });
        }
        return months;
    };

    const availableMonths = generateMonths();

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

    const animateModalIn = () => {
        modalSlideAnim.setValue(height);
        Animated.spring(modalSlideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const animateModalOut = (callback) => {
        Animated.timing(modalSlideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (callback) callback();
        });
    };

    const openCustomerModal = () => {
        setTempCustomerName(customerName);
        setTempCustomerEmail(customerEmail);
        setTempCustomerPhone(customerPhone);
        setShowCustomerModal(true);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeCustomerModal = () => {
        animateModalOut(() => {
            setShowCustomerModal(false);
        });
    };

    const openLocationModal = () => {
        setTempLocation(location);
        setShowLocationModal(true);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeLocationModal = () => {
        animateModalOut(() => {
            setShowLocationModal(false);
        });
    };

    const toggleMonthSelection = (month) => {
        if (selectedMonths.some(m => m.id === month.id)) {
            setSelectedMonths(selectedMonths.filter(m => m.id !== month.id));
        } else {
            setSelectedMonths([...selectedMonths, month]);
        }
    };

    const getEndDate = () => {
        if (selectedMonths.length === 0) return null;
        const lastMonth = selectedMonths[selectedMonths.length - 1];
        const endDate = new Date(lastMonth.date);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        return endDate;
    };

    const getTotalAmount = () => {
        const total = selectedMonths.length * subscriptionData.monthlyPrice;
        let discount = 0;
        if (selectedMonths.length >= 6) {
            discount = total * 0.15;
        } else if (selectedMonths.length >= 3) {
            discount = total * 0.1;
        }
        return { total, discount, finalAmount: total - discount };
    };

    const handleSaveCustomer = () => {
        if (!tempCustomerName.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }
        if (!tempCustomerEmail.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (!tempCustomerPhone.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }
        setCustomerName(tempCustomerName);
        setCustomerEmail(tempCustomerEmail);
        setCustomerPhone(tempCustomerPhone);
        closeCustomerModal();
        Alert.alert('Success', 'Customer details updated successfully');
    };

    const handleSaveLocation = () => {
        if (!tempLocation.trim()) {
            Alert.alert('Error', 'Please enter your address');
            return;
        }
        setLocation(tempLocation);
        closeLocationModal();
        Alert.alert('Success', 'Location updated successfully');
    };

    const handleConfirm = () => {
        if (selectedMonths.length === 0) {
            Alert.alert('Select Months', 'Please select at least one month');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            const endDate = getEndDate();
            const { total, discount, finalAmount } = getTotalAmount();

            Alert.alert(
                'Subscription Confirmed! 🎉',
                `Plan: ${subscriptionData.name}\nMonths: ${selectedMonths.length}\nStart: ${selectedMonths[0].date.toLocaleDateString()}\nEnd: ${endDate?.toLocaleDateString()}\nCustomer: ${customerName}\nLocation: ${location}\nTotal: ₹${total}${discount > 0 ? `\nDiscount: -₹${discount}` : ''}\nAmount: ₹${finalAmount}`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('SubscriptionConfirmationScreen', {
                            subscribed: true,
                            startDate: selectedMonths[0].date,
                            endDate: endDate,
                            months: selectedMonths.length,
                            amount: finalAmount
                        })
                    }
                ]
            );
        }, 1500);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderMonthItem = ({ item }) => {
        const isSelected = selectedMonths.some(m => m.id === item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.monthCard,
                    isSelected && styles.monthCardSelected,
                ]}
                onPress={() => toggleMonthSelection(item)}
                activeOpacity={0.7}
            >
                <View style={styles.monthCardLeft}>
                    <Text style={[
                        styles.monthName,
                        isSelected && styles.monthTextSelected,
                    ]}>{item.month}</Text>
                    <Text style={[
                        styles.monthYear,
                        isSelected && styles.monthTextSelected,
                    ]}>{item.year}</Text>
                </View>
                <View style={styles.monthCardRight}>
                    {item.isCurrent && !isSelected && (
                        <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                    )}
                    {isSelected && (
                        <View style={styles.selectedBadge}>

                            <Image
                                source={require('../../asset/checked.png')} // Update the path as needed
                                style={{
                                    width: 16,
                                    height: 16,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Customer Modal
    const renderCustomerModal = () => (
        <Modal
            transparent={true}
            visible={showCustomerModal}
            animationType="none"
            onRequestClose={closeCustomerModal}
        >
            <TouchableWithoutFeedback onPress={closeCustomerModal}>
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
                                <View style={[styles.modalIconContainer, { backgroundColor: COLORS.gold + '15' }]}>

                                    <Image
                                        source={require('../../asset/person-outline.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.gold


                                        }}
                                    />
                                </View>
                                <Text style={styles.modalTitle}>Edit Customer Details</Text>
                                <Text style={styles.modalSubtitle}>Update your personal information</Text>
                            </View>

                            <View style={styles.modalForm}>
                                <Text style={styles.modalLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#999"
                                    value={tempCustomerName}
                                    onChangeText={setTempCustomerName}
                                />
                            </View>

                            <View style={styles.modalForm}>
                                <Text style={styles.modalLabel}>Email Address</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#999"
                                    value={tempCustomerEmail}
                                    onChangeText={setTempCustomerEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.modalForm}>
                                <Text style={styles.modalLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="#999"
                                    value={tempCustomerPhone}
                                    onChangeText={setTempCustomerPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleSaveCustomer}
                            >
                                <Text style={styles.modalSaveButtonText}>Save Changes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeCustomerModal}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Location Modal
    const renderLocationModal = () => (
        <Modal
            transparent={true}
            visible={showLocationModal}
            animationType="none"
            onRequestClose={closeLocationModal}
        >
            <TouchableWithoutFeedback onPress={closeLocationModal}>
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
                                <View style={[styles.modalIconContainer, { backgroundColor: COLORS.blue + '15' }]}>

                                    <Image
                                        source={require('../../asset/location-outline.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.blue


                                        }}
                                    />
                                </View>
                                <Text style={styles.modalTitle}>Edit Location</Text>
                                <Text style={styles.modalSubtitle}>Update your service address</Text>
                            </View>

                            <View style={styles.modalForm}>
                                <Text style={styles.modalLabel}>Service Address</Text>
                                <TextInput
                                    style={[styles.modalInput, styles.modalTextArea]}
                                    placeholder="Enter your full address"
                                    placeholderTextColor="#999"
                                    value={tempLocation}
                                    onChangeText={setTempLocation}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleSaveLocation}
                            >
                                <Text style={styles.modalSaveButtonText}>Save Location</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeLocationModal}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const endDate = getEndDate();
    const { total, discount, finalAmount } = getTotalAmount();

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
                <Text style={styles.headerTitle}>Select Duration</Text>
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
                {/* Plan Info */}
                <View style={styles.planInfoCard}>
                    <Text style={styles.planName}>{subscriptionData.name}</Text>
                    <Text style={styles.planPrice}>{subscriptionData.pricePerMonth}/month</Text>
                    <Text style={styles.planHours}>⏱ {subscriptionData.maxHoursPerDay} hrs/day</Text>
                </View>

                {/* Customer Details */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>👤 Customer Details</Text>
                        <TouchableOpacity onPress={openCustomerModal}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailsRow}>
                        
                        <Image
                            source={require('../../asset/person-outline.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.detailsValue}>{customerName}</Text>
                    </View>
                   
                    <View style={styles.detailsRow}>
                        <Image
                            source={require('../../asset/telephone.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold
                            }}
                        />
                        <Text style={styles.detailsValue}>{customerPhone}</Text>
                    </View>
                </View>

                {/* Location Details */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsTitle}>📍 Service Location</Text>
                        <TouchableOpacity onPress={openLocationModal}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailsRow}>
                        <Image
                            source={require('../../asset/location-outline.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.blue
                            }}
                        />
                        <Text style={[styles.detailsValue, styles.locationText]}>{location}</Text>
                    </View>
                </View>

                {/* Select Months */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Months</Text>
                    <Text style={styles.sectionSubtitle}>Choose the duration for your subscription</Text>

                    <FlatList
                        data={availableMonths}
                        renderItem={renderMonthItem}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        contentContainerStyle={styles.monthsList}
                    />
                </View>

                {/* Selection Summary */}
                {selectedMonths.length > 0 && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryTitle}>📋 Subscription Summary</Text>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Plan</Text>
                            <Text style={styles.summaryValue}>{subscriptionData.name}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Duration</Text>
                            <Text style={styles.summaryValue}>{selectedMonths.length} month(s)</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Start Date</Text>
                            <Text style={styles.summaryValue}>
                                {selectedMonths[0]?.date ? formatDate(selectedMonths[0].date) : '-'}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>End Date</Text>
                            <Text style={styles.summaryValue}>
                                {endDate ? formatDate(endDate) : '-'}
                            </Text>
                        </View>

                        <View style={styles.summaryDivider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{total}</Text>
                        </View>

                        {discount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Discount</Text>
                                <Text style={[styles.summaryValue, { color: COLORS.success }]}>-₹{discount}</Text>
                            </View>
                        )}

                        {discount > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountBadgeText}>
                                    {selectedMonths.length >= 6 ? '15% OFF' : '10% OFF'} Applied
                                </Text>
                            </View>
                        )}

                        <View style={styles.summaryTotalRow}>
                            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                            <Text style={styles.summaryTotalValue}>₹{finalAmount}</Text>
                        </View>
                    </View>
                )}

                {/* Confirm Button */}
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        selectedMonths.length === 0 && styles.confirmButtonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={selectedMonths.length === 0 || isLoading}
                >
                    <Text style={styles.confirmButtonText}>
                        {isLoading ? 'Processing...' : 'Confirm Subscription'}
                    </Text>
                    {!isLoading && (
                        <Image
                            source={require('../../asset/right-arrow.png')}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.white
                            }}
                        />
                    )}
                </TouchableOpacity>

                <View style={styles.footerSpacer} />
            </Animated.ScrollView>

            {/* Customer Modal */}
            {renderCustomerModal()}

            {/* Location Modal */}
            {renderLocationModal()}
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
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Plan Info
    planInfoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    planName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    planPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#C9A84C',
        marginTop: 4,
    },
    planHours: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    // Details Cards
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    changeText: {
        fontSize: 13,
        color: '#C9A84C',
        fontWeight: '600',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
    },
    detailsValue: {
        fontSize: 14,
        color: '#1A1A1A',
        flex: 1,
    },
    locationText: {
        fontSize: 13,
        lineHeight: 18,
    },
    // Section
    sectionContainer: {
        marginBottom: 16,
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
    // Months
    monthsList: {
        gap: 10,
    },
    monthCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E8E3D8',
        marginBottom: 8,
    },
    monthCardSelected: {
        borderColor: '#C9A84C',
        backgroundColor: '#F8F6F0',
    },
    monthCardLeft: {
        flex: 1,
    },
    monthName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    monthTextSelected: {
        color: '#C9A84C',
    },
    monthYear: {
        fontSize: 13,
        color: '#666666',
        marginTop: 1,
    },
    monthCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currentBadge: {
        backgroundColor: '#C9A84C',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    currentBadgeText: {
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    selectedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Summary
    summaryContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
        paddingVertical: 4,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666666',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F0EDE8',
        marginVertical: 8,
    },
    discountBadge: {
        backgroundColor: '#E6F9F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginVertical: 4,
    },
    discountBadgeText: {
        fontSize: 11,
        color: '#2ECC71',
        fontWeight: '600',
    },
    summaryTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0EDE8',
        marginTop: 4,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#C9A84C',
    },
    // Confirm Button
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#C9A84C',
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonDisabled: {
        opacity: 0.5,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
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
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },
    modalForm: {
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    modalInput: {
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    modalTextArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    modalSaveButton: {
        backgroundColor: '#C9A84C',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    modalSaveButtonText: {
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
        color: '#999',
        fontWeight: '500',
    },
});

export default SubscriptionSlotScreen;