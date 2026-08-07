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
    TextInput,
    Alert,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';

import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const BookingScheduleScreen = ({ navigation, route }) => {
    // States
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceEmail, setInvoiceEmail] = useState('rahul@email.com');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const celebratingFlatListRef = useRef(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

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

    // Sample data
    const bookingData = {
        serviceName: 'Home Cleaning',
        provider: 'Susanta Ghosh',
        providerImage: require('../../asset/demo-user.png'),
        date: '15 Jan 2027',
        day: 'Friday',
        startTime: '09:00 AM',
        endTime: '02:30 PM',
        address: '123, Main Street, Mumbai',
        customerName: 'Rahul Sharma',
        mobileNumber: '+91 98765 43210',
        amount: '₹499',
        email: 'rahul@email.com',
        bookingId: 'BK-2027-001',
        otp: '4826',
        rating: 4.8,
        jobsCompleted: 1240,
        servicesCount: 1,
    };

    // Celebrating Professionals
    const celebratingProfessionals = [
        { id: '1', name: '-', video: require('../../asset/videos/pr-1.mp4'), role: '-' },
        { id: '2', name: '-', video: require('../../asset/videos/demo1.mp4'), role: '-' },
        { id: '2', name: '-', video: require('../../asset/videos/pr-3.mp4'), role: '-' },


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

    const openInvoiceModal = () => {
        setShowInvoiceModal(true);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeInvoiceModal = () => {
        animateModalOut(() => {
            setShowInvoiceModal(false);
        });
    };

    const openShareModal = () => {
        setShowShareModal(true);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeShareModal = () => {
        animateModalOut(() => {
            setShowShareModal(false);
        });
    };

    const openCancelModal = () => {
        setShowCancelModal(false);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeCancelModal = () => {
        animateModalOut(() => {
            setShowCancelModal(false);
        });
    };

    const handleSendInvoice = () => {
        if (!invoiceEmail.trim()) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', `Invoice sent to ${invoiceEmail}`);
            setTimeout(() => closeInvoiceModal(), 1000);
        }, 1500);
    };

    const handleShareBooking = () => {
        Alert.alert('Share Booking', 'Booking link copied to clipboard!');
        closeShareModal();
    };

    const handleCancelBooking = () => {
        Alert.alert('Cancel Booking', 'Your booking has been cancelled successfully!');
        closeCancelModal();
        navigation.goBack();
    };

    const handleReschedule = () => {
        Alert.alert('Reschedule', 'Redirecting to reschedule page...');
    };

    const handleCall = () => {
        Linking.openURL(`tel:${bookingData.mobileNumber}`).catch(() => {
            Alert.alert('Error', 'Unable to make call');
        });
    };

    const handleEditAddress = () => {
        Alert.alert('Edit Address', 'Address edit option coming soon...');
    };

    const handleEditCustomer = () => {
        Alert.alert('Edit Customer', 'Customer details edit option coming soon...');
    };

    const handleOnlinePayment = () => {
        Alert.alert('Online Payment', 'Redirecting to payment page...');
    };

    const handleCopyOTP = () => {
        Alert.alert('OTP Copied', 'OTP copied to clipboard!');
    };

    // Invoice Modal
    const renderInvoiceModal = () => (
        <Modal
            transparent={true}
            visible={showInvoiceModal}
            animationType="none"
            onRequestClose={closeInvoiceModal}
        >
            <TouchableWithoutFeedback onPress={closeInvoiceModal}>
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
                                        source={require('../../asset/mail.png')} // Update the path as needed
                                        style={{
                                            width: 32,
                                            height: 32,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.gold


                                        }}
                                    />
                                </View>
                                <Text style={styles.modalTitle}>Send Invoice</Text>
                                <Text style={styles.modalSubtitle}>
                                    Enter your email address to receive the invoice
                                </Text>
                            </View>

                            <View style={styles.invoiceModalInputContainer}>

                                <Image
                                    source={require('../../asset/mail.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.textLight


                                    }}
                                />
                                <TextInput
                                    style={styles.invoiceModalInput}
                                    placeholder="Enter your email address"
                                    placeholderTextColor="#999"
                                    value={invoiceEmail}
                                    onChangeText={setInvoiceEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.modalPrimaryButton}
                                onPress={handleSendInvoice}
                                disabled={isLoading}
                            >
                                <Text style={styles.modalPrimaryButtonText}>
                                    {isLoading ? 'Sending...' : 'Send Invoice'}
                                </Text>

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

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeInvoiceModal}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Share Modal
    const renderShareModal = () => (
        <Modal
            transparent={true}
            visible={showShareModal}
            animationType="none"
            onRequestClose={closeShareModal}
        >
            <TouchableWithoutFeedback onPress={closeShareModal}>
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
                                        source={require('../../asset/share.png')} // Update the path as needed
                                        style={{
                                            width: 32,
                                            height: 32,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.blue


                                        }}
                                    />
                                </View>
                                <Text style={styles.modalTitle}>Share Booking</Text>
                                <Text style={styles.modalSubtitle}>
                                    Share this booking with someone else
                                </Text>
                            </View>

                            <View style={styles.shareOptions}>
                                <TouchableOpacity style={styles.shareOption}>
                                    <View style={[styles.shareIcon, { backgroundColor: '#25D366' }]}>

                                        <Image
                                            source={require('../../asset/whatsapp.png')} // Update the path as needed
                                            style={{
                                                width: 28,
                                                height: 28,
                                                resizeMode: 'contain',
                                                tintColor: COLORS.white


                                            }}
                                        />
                                    </View>
                                    <Text style={styles.shareOptionText}>WhatsApp</Text>
                                </TouchableOpacity>

                            </View>

                            <TouchableOpacity
                                style={styles.modalPrimaryButton}
                                onPress={handleShareBooking}
                            >
                                <Text style={styles.modalPrimaryButtonText}>Copy Booking Link</Text>

                                <Image
                                    source={require('../../asset/copy.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white


                                    }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeShareModal}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Cancel Modal
    const renderCancelModal = () => (
        <Modal
            transparent={true}
            visible={showCancelModal}
            animationType="none"
            onRequestClose={closeCancelModal}
        >
            <TouchableWithoutFeedback onPress={closeCancelModal}>
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
                                <View style={[styles.modalIconContainer, { backgroundColor: COLORS.red + '15' }]}>
                                    {/* <Ionicons name="alert-circle-outline" size={32} color={COLORS.red} /> */}
                                </View>
                                <Text style={styles.modalTitle}>Cancel Booking</Text>
                                <Text style={styles.modalSubtitle}>
                                    Are you sure you want to cancel this booking?
                                </Text>
                            </View>

                            <View style={styles.cancelReasons}>
                                <TouchableOpacity style={styles.cancelReason}>
                                    <Text style={styles.cancelReasonText}>Change of plans</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelReason}>
                                    <Text style={styles.cancelReasonText}>Found another service</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelReason}>
                                    <Text style={styles.cancelReasonText}>Service not needed</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelReason}>
                                    <Text style={styles.cancelReasonText}>Other reason</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.cancelActions}>
                                <TouchableOpacity
                                    style={[styles.cancelActionButton, styles.cancelButton]}
                                    onPress={handleCancelBooking}
                                >
                                    <Text style={styles.cancelActionText}>Yes, Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelActionButton, styles.keepButton]}
                                    onPress={closeCancelModal}
                                >
                                    <Text style={styles.keepButtonText}>Keep Booking</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const renderCelebratingProfessional = ({ item, index }) => (
        <View style={styles.celebratingCard}>
            <View style={styles.celebratingImageWrapper}>
                {/* <Image source={{ uri: item.image }} style={styles.celebratingImage} /> */}


                <Video
                    source={item.video}
                    style={styles.celebratingVideo}
                    resizeMode="cover"
                    repeat
                    muted
                    paused={currentVideoIndex !== index}
                />



            </View>

        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#C9A84C" />

            {/* Header - Gold Background */}
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
                <Text style={styles.headerTitle}>{bookingData.serviceName}</Text>
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
                {/* Booking Scheduled */}
                <View style={styles.scheduledContainer}>
                    <View style={styles.scheduledIcon}>

                        <Image
                            source={require('../../asset/calendar-check.png')} // Update the path as needed
                            style={{
                                width: 28,
                                height: 28,
                                resizeMode: 'contain',
                                tintColor: COLORS.white


                            }}
                        />
                    </View>
                    <View>
                        <Text style={styles.scheduledTitle}>Booking Scheduled</Text>
                        <Text style={styles.scheduledSubtitle}>{bookingData.date} • {bookingData.day}</Text>
                    </View>
                </View>

                {/* OTP Section */}
                <View style={styles.otpContainer}>
                    <View style={styles.otpHeader}>

                        <Image
                            source={require('../../asset/key.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.otpTitle}>Share OTP when professional arrives</Text>
                    </View>
                    <View style={styles.otpBox}>
                        <Text style={styles.otpValue}>{bookingData.otp}</Text>
                        <TouchableOpacity style={styles.otpCopyButton} onPress={handleCopyOTP}>

                            <Image
                                source={require('../../asset/copy.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                            <Text style={styles.otpCopyText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Booked for someone else */}
                <TouchableOpacity style={styles.shareBookingButton} onPress={openShareModal}>

                    <Image
                        source={require('../../asset/share.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold


                        }}
                    />
                    <Text style={styles.shareBookingText}>Booked for someone else? Share the booking</Text>

                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: COLORS.textLight


                        }}
                    />
                </TouchableOpacity>

                {/* Email Invoice */}
                <TouchableOpacity style={styles.emailInvoiceButton} onPress={openInvoiceModal}>

                    <Image
                        source={require('../../asset/mail.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold


                        }}
                    />
                    <Text style={styles.emailInvoiceText}>Email Invoice</Text>
                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: COLORS.textLight


                        }}
                    />
                </TouchableOpacity>

                {/* Professional Details */}
                <View style={styles.professionalContainer}>
                    <Text style={styles.sectionTitle}>Professional Details</Text>
                    <TouchableOpacity style={styles.professionalCard} onPress={() => navigation.navigate('ProfessionalDetailsScreen', { provider: bookingData.provider })}>
                        <Image source={ bookingData.providerImage } style={styles.professionalImage} />
                        <View style={styles.professionalInfo}>
                            <Text style={styles.professionalName}>{bookingData.provider}</Text>
                            <View style={styles.professionalRating}>

                                <Image
                                    source={require('../../asset/star-fill.png')} // Update the path as needed
                                    style={{
                                        width: 12,
                                        height: 12,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange


                                    }}
                                />
                                <Text style={styles.professionalRatingText}>{bookingData.rating}</Text>
                                <Text style={styles.professionalJobs}>• {bookingData.jobsCompleted} jobs completed</Text>
                            </View>
                        </View>
                        <View style={styles.professionalActions}>
                            <TouchableOpacity style={styles.professionalActionButton} onPress={handleCall}>

                                <Image
                                    source={require('../../asset/telephone.png')} // Update the path as needed
                                    style={{
                                        width: 22,
                                        height: 22,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.professionalActionButton}>
                                <Ionicons name="chatbubble-outline" size={22} color={COLORS.gold} />
                            </TouchableOpacity> */}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Booking Details */}
                <View style={styles.bookingDetailsContainer}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>
                    <View style={styles.bookingDetailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>

                                <Image
                                    source={require('../../asset/location-outline.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Address</Text>
                                <Text style={styles.detailValue}>{bookingData.address}</Text>
                            </View>
                            <TouchableOpacity onPress={handleEditAddress}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>

                                <Image
                                    source={require('../../asset/person-outline.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Customer</Text>
                                <Text style={styles.detailValue}>{bookingData.customerName}</Text>
                            </View>
                            <TouchableOpacity onPress={handleEditCustomer}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>
                                <Image
                                    source={require('../../asset/telephone.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Mobile</Text>
                                <Text style={styles.detailValue}>{bookingData.mobileNumber}</Text>
                            </View>
                            <TouchableOpacity onPress={handleEditCustomer}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.detailRow, styles.detailRowLast]}>
                            <View style={styles.detailIconBox}>

                                <Image
                                    source={require('../../asset/check-mark.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Services</Text>
                                <Text style={styles.detailValue}>{bookingData.servicesCount} service</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment Section - Professional */}
                <View style={styles.paymentContainer}>
                    <Text style={styles.sectionTitle}>Payment</Text>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentHeader}>
                            <View style={styles.paymentIconBox}>

                                <Image
                                    source={require('../../asset/credit-card.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white


                                    }}
                                />
                            </View>
                            <Text style={styles.paymentHeaderTitle}>Payment Details</Text>
                        </View>

                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Service Charge</Text>
                            <Text style={styles.paymentValue}>{bookingData.amount}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>GST (18%)</Text>
                            <Text style={styles.paymentValue}>₹89.82</Text>
                        </View>
                        <View style={styles.paymentDivider} />
                        <View style={[styles.paymentRow, styles.paymentTotal]}>
                            <Text style={styles.paymentTotalLabel}>Total Amount</Text>
                            <Text style={styles.paymentTotalValue}>₹588.82</Text>
                        </View>

                        <TouchableOpacity style={styles.paymentButton} onPress={handleOnlinePayment}>

                            <Image
                                source={require('../../asset/lock.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                            <Text style={styles.paymentButtonText}>Pay Online Now</Text>
                        </TouchableOpacity>

                        <Text style={styles.paymentSecureText}>

                            <Image
                                source={require('../../asset/shield.png')} // Update the path as needed
                                style={{
                                    width: 14,
                                    height: 14,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.success


                                }}
                            />
                            {' '}Secure payment with multiple options
                        </Text>
                    </View>
                </View>

                {/* Reschedule & Cancel */}
                <View style={styles.rescheduleCancelContainer}>
                    <Text style={styles.sectionTitle}>Manage Booking</Text>
                    <View style={styles.rescheduleCancelCard}>
                        <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>

                            <Image
                                source={require('../../asset/calendar-outline.png')} // Update the path as needed
                                style={{
                                    width: 22,
                                    height: 22,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold


                                }}
                            />
                            <View>
                                <Text style={styles.rescheduleTitle}>Reschedule Booking</Text>
                                <Text style={styles.rescheduleSubtitle}>Change date or time</Text>
                            </View>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight,
                                    marginLeft: 'auto',


                                }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBookingButton} onPress={openCancelModal}>

                            <Image
                                source={require('../../asset/close-circle.png')} // Update the path as needed
                                style={{
                                    width: 22,
                                    height: 22,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.red,



                                }}
                            />
                            <View>
                                <Text style={styles.cancelBookingTitle}>Cancel Booking</Text>
                                <Text style={styles.cancelBookingSubtitle}>View cancellation policy</Text>
                            </View>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight,
                                    marginLeft: 'auto',



                                }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.policyLink}>
                            <Text style={styles.policyLinkText}>📋 View Cancellation Policy</Text>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold,
                                    marginLeft: 'auto',



                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Celebrating Professionals */}
                

                {/* Appreciation Section */}
                <View style={styles.appreciationContainer}>
                    <Text style={styles.appreciationTitle}>Our professionals work hard.</Text>
                    <Text style={styles.appreciationSubtitle}>Your small gesture makes a difference.</Text>

                    <View style={styles.appreciationTips}>
                        <View style={styles.appreciationTip}>
                            <View style={[styles.appreciationTipIcon, { backgroundColor: COLORS.gold }]}>

                                <Image
                                    source={require('../../asset/happy.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white,
                                        



                                    }}
                                />
                            </View>
                            <View style={styles.appreciationTipContent}>
                                <Text style={styles.appreciationTipTitle}>Welcome them with a smile</Text>
                                <Text style={styles.appreciationTipDesc}>A warm greeting makes them feel valued</Text>
                            </View>
                        </View>

                        <View style={styles.appreciationTip}>
                            <View style={[styles.appreciationTipIcon, { backgroundColor: COLORS.blue }]}>

                                <Image
                                    source={require('../../asset/drop.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white,
                                        



                                    }}
                                />
                            </View>
                            <View style={styles.appreciationTipContent}>
                                <Text style={styles.appreciationTipTitle}>Offer them a glass of water</Text>
                                <Text style={styles.appreciationTipDesc}>Stay hydrated during the service</Text>
                            </View>
                        </View>

                        <View style={styles.appreciationTip}>
                            <View style={[styles.appreciationTipIcon, { backgroundColor: COLORS.purple }]}>

                                <Image
                                    source={require('../../asset/home.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white,
                                       



                                    }}
                                />
                            </View>
                            <View style={styles.appreciationTipContent}>
                                <Text style={styles.appreciationTipTitle}>Provide washroom access</Text>
                                <Text style={styles.appreciationTipDesc}>Small gesture of respect and care</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.footerSpacer} />
            </Animated.ScrollView>

            {/* Invoice Modal */}
            {renderInvoiceModal()}

            {/* Share Modal */}
            {renderShareModal()}

            {/* Cancel Modal */}
            {renderCancelModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Scheduled Section
    scheduledContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    scheduledIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduledTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    scheduledSubtitle: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    // OTP Section
    otpContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#F8F6F0',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    otpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    otpTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    otpBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    otpValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#C9A84C',
        letterSpacing: 6,
    },
    otpCopyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#C9A84C',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },
    otpCopyText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Share Booking
    shareBookingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
        marginTop: 4,
    },
    shareBookingText: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        marginLeft: 12,
        fontWeight: '500',
    },
    // Email Invoice
    emailInvoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    emailInvoiceText: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        marginLeft: 12,
        fontWeight: '500',
    },
    // Professional Details
    professionalContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    professionalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    professionalImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    professionalInfo: {
        flex: 1,
        marginLeft: 14,
    },
    professionalName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    professionalRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    professionalRatingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    professionalJobs: {
        fontSize: 12,
        color: '#666666',
    },
    professionalActions: {
        flexDirection: 'row',
        gap: 10,
    },
    professionalActionButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F8F6F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    // Booking Details
    bookingDetailsContainer: {
        marginTop: 16,
    },
    bookingDetailsCard: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    detailRowLast: {
        borderBottomWidth: 0,
    },
    detailIconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        color: '#999999',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    detailValue: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
        marginTop: 1,
    },
    editText: {
        fontSize: 13,
        color: '#C9A84C',
        fontWeight: '600',
    },
    // Payment Section - Professional
    paymentContainer: {
        marginTop: 16,
    },
    paymentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    paymentIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#C9A84C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentHeaderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    paymentLabel: {
        fontSize: 13,
        color: '#666666',
    },
    paymentValue: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    paymentDivider: {
        height: 1,
        backgroundColor: '#F0EDE8',
        marginVertical: 8,
    },
    paymentTotal: {
        paddingVertical: 4,
    },
    paymentTotalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    paymentTotalValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#C9A84C',
    },
    paymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#C9A84C',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 12,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    paymentButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    paymentSecureText: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        marginTop: 10,
    },
    // Reschedule & Cancel
    rescheduleCancelContainer: {
        marginTop: 16,
    },
    rescheduleCancelCard: {
        backgroundColor: 'transparent',
    },
    rescheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    rescheduleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 12,
    },
    rescheduleSubtitle: {
        fontSize: 11,
        color: '#666666',
        marginLeft: 12,
        marginTop: 1,
    },
    rescheduleArrow: {
        marginLeft: 'auto',
    },
    cancelBookingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    cancelBookingTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E17055',
        marginLeft: 12,
    },
    cancelBookingSubtitle: {
        fontSize: 11,
        color: '#666666',
        marginLeft: 12,
        marginTop: 1,
    },
    cancelArrow: {
        marginLeft: 'auto',
    },
    policyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    policyLinkText: {
        fontSize: 13,
        color: '#C9A84C',
        fontWeight: '500',
    },
    // Celebrating Professionals
    celebratingContainer: {
        marginTop: 16,
    },
    celebratingSubtitle: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 10,
    },
    celebratingList: {
        paddingVertical: 4,
    },
    celebratingCard: {
        width: width * 0.8,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        marginRight: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    celebratingImageWrapper: {
        width: width * 0.8,
        height: width * 0.6,
        borderRadius: 20,
        overflow: 'hidden',   // Required for rounded corners
        backgroundColor: '#000',
    },
    celebratingImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    celebratingBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    celebratingName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 8,
        textAlign: 'center',
    },
    celebratingRole: {
        fontSize: 11,
        color: '#666666',
        textAlign: 'center',
        marginTop: 2,
    },
    // Appreciation Section
    appreciationContainer: {
        marginTop: 16,
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    appreciationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    appreciationSubtitle: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    appreciationTips: {
        marginTop: 14,
        gap: 10,
    },
    appreciationTip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    appreciationTipIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appreciationTipContent: {
        flex: 1,
    },
    appreciationTipTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    appreciationTipDesc: {
        fontSize: 11,
        color: '#999999',
        marginTop: 1,
    },
    footerSpacer: {
        height: 30,
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
        alignItems: 'center',
        marginBottom: 20,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
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
    modalPrimaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#C9A84C',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        width: '100%',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modalPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalCloseButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
    },
    modalCloseText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    invoiceModalInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E3D8',
        width: '100%',
    },
    invoiceModalInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        marginLeft: 10,
        paddingVertical: 0,
    },
    // Share Modal
    shareOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
        justifyContent: 'center',
    },
    shareOption: {
        alignItems: 'center',
        width: (width - 80) / 4,
    },
    shareIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    shareOptionText: {
        fontSize: 11,
        color: '#666666',
    },
    // Cancel Modal
    cancelReasons: {
        gap: 10,
        marginBottom: 16,
        width: '100%',
    },
    cancelReason: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8F6F0',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    cancelReasonText: {
        fontSize: 14,
        color: '#1A1A1A',
    },
    cancelActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelActionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#E17055',
    },
    cancelActionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    keepButton: {
        backgroundColor: '#F8F6F0',
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    keepButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
     celebratingVideo: {
        width: '100%',
        height: '100%',
    },
});

export default BookingScheduleScreen;