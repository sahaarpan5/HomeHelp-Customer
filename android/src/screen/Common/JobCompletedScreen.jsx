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
} from 'react-native';
import Video from 'react-native-video';


const { width, height } = Dimensions.get('window');

const JobCompletedScreen = ({ navigation, route }) => {
    // States
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [selectedTip, setSelectedTip] = useState(null);
    const [customTip, setCustomTip] = useState('');
    const [showCustomTip, setShowCustomTip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tempRating, setTempRating] = useState(0);
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceEmail, setInvoiceEmail] = useState('rahul@email.com');
    const [currentAppreciationIndex, setCurrentAppreciationIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const celebratingFlatListRef = useRef(null);

    // Refs
    const appreciationFlatListRef = useRef(null);

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
    const jobData = {
        serviceName: 'Home Deep Cleaning',
        provider: 'Rahul Ghosh',
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
    };

    // Celebrating Professionals
    const celebratingProfessionals = [
        { id: '1', name: '-', video: require('../../asset/videos/pr-1.mp4'), role: '-' },
        { id: '2', name: '-', video: require('../../asset/videos/pr-2.mp4'), role: '-' },
        { id: '2', name: '-', video: require('../../asset/videos/pr-3.mp4'), role: '-' },


    ];

    // Appreciation Images
    const appreciationImages = [
        {
            id: '1',
            icon: require('../../asset/happy.png'),
            title: 'Welcome them with a smile',
            description: 'A warm greeting makes them feel valued',
            color: COLORS.gold,
            image: require('../../asset/smile.jpg'),
        },
        {
            id: '2',
            icon: require('../../asset/drop.png'),
            title: 'Offer them a glass of water',
            description: 'Stay hydrated during the service',
            color: COLORS.blue,
            image: require('../../asset/water-glass.jpg'),
        },
        {
            id: '3',
            icon: require('../../asset/home.png'),
            title: 'Provide washroom access',
            description: 'Small gesture of respect and care',
            color: COLORS.purple,
            image: require('../../asset/washroom.jpg'),
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

        // Auto scroll for appreciation images
        const appreciationInterval = setInterval(() => {
            if (appreciationImages.length > 0) {
                setCurrentAppreciationIndex((prev) =>
                    prev === appreciationImages.length - 1 ? 0 : prev + 1
                );
            }
        }, 4000);

        return () => {
            clearInterval(appreciationInterval);
        };
    }, []);

    // Auto scroll effect for appreciation images
    useEffect(() => {
        if (appreciationFlatListRef.current && appreciationImages.length > 0) {
            try {
                const containerWidth = width - 40;
                const offset = currentAppreciationIndex * (containerWidth + 16);
                appreciationFlatListRef.current.scrollToOffset({
                    offset: offset,
                    animated: true,
                });
            } catch (error) {
                console.log('Scroll error:', error);
            }
        }
    }, [currentAppreciationIndex]);

    useEffect(() => {
        setIsPlaying(true);
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

    const openRatingModal = () => {
        setIsRatingModalVisible(true);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeRatingModal = () => {
        animateModalOut(() => {
            setIsRatingModalVisible(false);
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

    const handleRating = (value) => {
        setRating(value);
    };

    const handleSubmitFeedback = () => {
        if (rating === 0) {
            Alert.alert('Please Rate', 'Please rate the service before submitting feedback');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            closeRatingModal();
            Alert.alert('Thank You!', 'Your feedback has been submitted successfully');
        }, 1500);
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

    const handlePayNow = () => {
        if (!selectedTip) {
            Alert.alert('Select Tip', 'Please select a tip amount or enter custom amount');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Thank you for your generous tip! 💝');
        }, 1500);
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

    const StarRating = ({ rating, onRating, size = 36 }) => {
        const stars = [1, 2, 3, 4, 5];

        return (
            <View style={styles.starRatingContainer}>
                {stars.map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onRating(star)}
                        onPressIn={() => setTempRating(star)}
                        onPressOut={() => setTempRating(0)}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={
                                star <= (tempRating || rating)
                                    ? require('../../asset/star-fill.png')
                                    : require('../../asset/star-outline.png')
                            }
                            style={{
                                width: size,
                                height: size,
                                resizeMode: 'contain',
                                tintColor: star <= (tempRating || rating)
                                    ? COLORS.orange
                                    : '#D4D4D4',
                                marginHorizontal: 2,
                            }}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderCelebratingProfessional = ({ item ,index}) => (
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

                {/* <Video
                    source={require('../../asset/videos/pr-1.mp4')}
                    style={{ width: 250, height: 250 }}
                    resizeMode="cover"
                    paused={false}
                    repeat
                    controls
                /> */}

            </View>

        </View>
    );

    // Rating Modal
    const renderRatingModal = () => (
        <Modal
            transparent={true}
            visible={isRatingModalVisible}
            animationType="none"
            onRequestClose={closeRatingModal}
        >
            <TouchableWithoutFeedback onPress={closeRatingModal}>
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
                                <View style={[styles.modalIconContainer, { backgroundColor: COLORS.orange + '15' }]}>

                                    <Image
                                        source={require('../../asset/star-fill.png')} // Update the path as needed
                                        style={{
                                            width: 32,
                                            height: 32,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.orange


                                        }}
                                    />
                                </View>
                                <Text style={styles.modalTitle}>Rate Your Experience</Text>
                                <Text style={styles.modalSubtitle}>
                                    How was your service with {jobData.provider}?
                                </Text>
                            </View>

                            <StarRating rating={rating} onRating={handleRating} size={44} />

                            <View style={styles.modalFeedbackContainer}>
                                <Text style={styles.modalFeedbackLabel}>Your Feedback</Text>
                                <TextInput
                                    style={styles.modalFeedbackInput}
                                    placeholder="Share your experience with us..."
                                    placeholderTextColor="#999"
                                    value={feedback}
                                    onChangeText={setFeedback}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.modalPrimaryButton,
                                    rating === 0 && styles.modalPrimaryButtonDisabled,
                                ]}
                                onPress={handleSubmitFeedback}
                                disabled={rating === 0 || isLoading}
                            >
                                <Text style={styles.modalPrimaryButtonText}>
                                    {isLoading ? 'Submitting...' : 'Submit Feedback'}
                                </Text>

                                <Image
                                    source={require('../../asset/right-arrow.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white


                                    }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeRatingModal}>
                                <Text style={styles.modalCloseText}>Skip</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

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
                                        width: 16,
                                        height: 16,
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

    // Appreciation Card with Real Image
    const renderAppreciationItem = ({ item }) => (
        <View style={styles.appreciationImageCard}>
            <Image source={item.image} style={styles.appreciationImage} />
            <View style={styles.appreciationImageOverlay}>
                <View style={[styles.appreciationImageIcon, { backgroundColor: item.color + '80' }]}>
                    <Image
                        source={item.icon}
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.white, // Remove this if your PNGs already have the desired color
                        }}
                    />
                </View>
                <Text style={styles.appreciationImageTitle}>{item.title}</Text>
                <Text style={styles.appreciationImageDesc}>{item.description}</Text>
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
                <Text style={styles.headerTitle}>{jobData.serviceName}</Text>
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
                {/* Success Section */}
                <View style={styles.successContainer}>
                    <View style={styles.successIconWrapper}>
                        <View style={styles.successIcon}>

                            <Image
                                source={require('../../asset/checked.png')} // Update the path as needed
                                style={{
                                    width: 32,
                                    height: 32,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </View>
                    </View>
                    <Text style={styles.successTitle}>Job Completed!</Text>
                    <Text style={styles.successSubtitle}>Thank you for choosing HomeHelp</Text>
                    <View style={styles.successDivider} />
                </View>

                {/* Book Again Button */}
                <TouchableOpacity style={styles.bookAgainButton}>
                    <Text style={styles.bookAgainText}>Book Again</Text>

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

                {/* Invoice Button */}
                <TouchableOpacity style={styles.invoiceButton} onPress={openInvoiceModal}>
                    <View style={styles.invoiceButtonLeft}>

                        <Image
                            source={require('../../asset/invoice.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.invoiceButtonText}>Get Invoice</Text>
                    </View>

                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 16,
                            height: 16,
                            resizeMode: 'contain',
                            tintColor: COLORS.textLight


                        }}
                    />
                </TouchableOpacity>

                {/* Service Partner */}
                <View style={styles.partnerContainer}>
                    <Text style={styles.sectionTitle}>Service Partner</Text>
                    <View style={styles.partnerCard}>
                        <Image source={jobData.providerImage} style={styles.partnerImage} />
                        <View style={styles.partnerInfo}>
                            <Text style={styles.partnerName}>{jobData.provider}</Text>
                            <Text style={styles.partnerService}>{jobData.serviceName}</Text>
                            <View style={styles.partnerRating}>

                                <Image
                                    source={require('../../asset/star-fill.png')} // Update the path as needed
                                    style={{
                                        width: 14,
                                        height: 14,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange


                                    }}
                                />
                                <Image
                                    source={require('../../asset/star-fill.png')} // Update the path as needed
                                    style={{
                                        width: 14,
                                        height: 14,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange


                                    }}
                                />
                                <Image
                                    source={require('../../asset/star-fill.png')} // Update the path as needed
                                    style={{
                                        width: 14,
                                        height: 14,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange


                                    }}
                                />
                                <Image
                                    source={require('../../asset/star-fill.png')} // Update the path as needed
                                    style={{
                                        width: 14,
                                        height: 14,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange


                                    }}
                                />
                                <Image
                                    source={require('../../asset/star-half.png')} // Update the path as needed
                                    style={{
                                        width: 14,
                                        height: 14,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange


                                    }}
                                />
                                <Text style={styles.partnerRatingText}>4.8</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.partnerCallButton}>

                            <Image
                                source={require('../../asset/telephone.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rating Button */}
                <TouchableOpacity style={styles.ratingButton} onPress={openRatingModal}>
                    <View style={styles.ratingButtonLeft}>

                        <Image
                            source={require('../../asset/star-outline.png')} // Update the path as needed
                            style={{
                                width: 22,
                                height: 22,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <View>
                            <Text style={styles.ratingButtonTitle}>Rate & Review</Text>
                            <Text style={styles.ratingButtonSubtitle}>Share your experience</Text>
                        </View>
                    </View>

                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 16,
                            height: 16,
                            resizeMode: 'contain',
                            tintColor: COLORS.textLight


                        }}
                    />
                </TouchableOpacity>

                {/* Tip Section */}
                <View style={styles.tipContainer}>
                    <Text style={styles.sectionTitle}>Tip the Professional</Text>
                    <Text style={styles.tipNote}>100% goes to the professional</Text>

                    <View style={styles.tipOptions}>
                        {[50, 75, 100].map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.tipOption,
                                    selectedTip === amount && styles.tipOptionSelected,
                                ]}
                                onPress={() => handleTipSelect(amount)}
                            >
                                <Text style={[
                                    styles.tipOptionText,
                                    selectedTip === amount && styles.tipOptionTextSelected,
                                ]}>₹{amount}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[
                                styles.tipOption,
                                showCustomTip && styles.tipOptionSelected,
                            ]}
                            onPress={() => {
                                setShowCustomTip(true);
                                setSelectedTip(null);
                            }}
                        >
                            <Text style={[
                                styles.tipOptionText,
                                showCustomTip && styles.tipOptionTextSelected,
                            ]}>Custom</Text>
                        </TouchableOpacity>
                    </View>

                    {showCustomTip && (
                        <View style={styles.customTipContainer}>
                            <TextInput
                                style={styles.customTipInput}
                                placeholder="Enter amount"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={customTip}
                                onChangeText={setCustomTip}
                            />
                            <TouchableOpacity
                                style={styles.customTipApply}
                                onPress={handleCustomTip}
                            >
                                <Text style={styles.customTipApplyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {selectedTip && (
                        <TouchableOpacity
                            style={styles.payNowButton}
                            onPress={handlePayNow}
                            disabled={isLoading}
                        >
                            <Text style={styles.payNowText}>
                                {isLoading ? 'Processing...' : `Pay ₹${selectedTip} as Tip`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Booking Details - Short & Compact */}
                <View style={styles.bookingDetailsContainer}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>
                    <View style={styles.bookingDetailsCard}>
                        {/* Row 1: Date & Time */}
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>

                                <Image
                                    source={require('../../asset/calendar-outline.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailValue}>{jobData.date} • {jobData.day}</Text>
                                <Text style={styles.detailSubValue}>{jobData.startTime} - {jobData.endTime}</Text>
                            </View>
                        </View>

                        {/* Row 2: Address */}
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
                                <Text style={styles.detailValue} numberOfLines={1}>{jobData.address}</Text>
                            </View>
                        </View>

                        {/* Row 3: Customer & Mobile */}
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
                                <Text style={styles.detailValue}>{jobData.customerName}</Text>
                                <Text style={styles.detailSubValue}>{jobData.mobileNumber}</Text>
                            </View>
                        </View>

                        {/* Row 4: Amount */}
                        <View style={[styles.detailRow, styles.detailRowLast]}>
                            <View style={[styles.detailIconBox, { backgroundColor: COLORS.gold + '15' }]}>

                                <Image
                                    source={require('../../asset/rupee.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailValue}><Text style={styles.amountValue}>{jobData.amount}</Text></Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Celebrating Professionals */}
                <View style={styles.celebratingContainer}>
                    <Text style={styles.sectionTitle}>Celebrating Professionals</Text>
                    {/* <Text style={styles.celebratingSubtitle}>Meet our team of experts</Text> */}
                    <FlatList
                        ref={celebratingFlatListRef}
                        data={celebratingProfessionals}
                        renderItem={renderCelebratingProfessional}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(
                                e.nativeEvent.contentOffset.x / (width * 0.7)
                            );
                            setCurrentVideoIndex(index);
                        }}
                    />
                </View>

                {/* Appreciation Section with Auto-Scroll Images - Increased Height */}


                <View style={styles.appreciationContainer}>
                    <Text style={styles.appreciationTitle}>Our professionals work hard.</Text>
                    <Text style={styles.appreciationSubtitle}>Your small gesture makes a difference.</Text>

                    <View style={styles.appreciationTips}>
                        <View style={styles.appreciationTip}>
                            <View style={[styles.appreciationTipIcon, { backgroundColor: COLORS.gold }]}>


                                <Image
                                    source={require('../../asset/happy.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white, // Remove this if your PNGs already have the desired color
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
                                    source={require('../../asset/drop.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white, // Remove this if your PNGs already have the desired color
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
                                    source={require('../../asset/home.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white, // Remove this if your PNGs already have the desired color
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

            {/* Rating Modal */}
            {renderRatingModal()}

            {/* Invoice Modal */}
            {renderInvoiceModal()}
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
    // Success Section
    successContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'transparent',
    },
    successIconWrapper: {
        marginBottom: 12,
    },
    successIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2ECC71',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    successSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 2,
    },
    successDivider: {
        width: 40,
        height: 3,
        backgroundColor: '#C9A84C',
        borderRadius: 2,
        marginTop: 12,
    },
    // Book Again Button
    bookAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: '#C9A84C',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        marginTop: 4,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    bookAgainText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        flex:1
    },
    // Invoice Button
    invoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        paddingVertical: 16,
        paddingHorizontal: 4,
        marginTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    invoiceButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    invoiceButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    // Partner Section
    partnerContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 5,
    },
    partnerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    partnerImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    partnerInfo: {
        flex: 1,
        marginLeft: 14,
    },
    partnerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    partnerService: {
        fontSize: 13,
        color: '#666666',
        marginTop: 1,
    },
    partnerRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 2,
    },
    partnerRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 4,
    },
    partnerCallButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#C9A84C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Rating Button
    ratingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        paddingVertical: 16,
        paddingHorizontal: 4,
        marginTop: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    ratingButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ratingButtonTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    ratingButtonSubtitle: {
        fontSize: 12,
        color: '#666666',
        marginTop: 1,
    },
    // Tip Section
    tipContainer: {
        marginTop: 16,
    },
    tipNote: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 10,
    },
    tipOptions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    tipOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
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
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    tipOptionTextSelected: {
        color: '#FFFFFF',
    },
    customTipContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    customTipInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    customTipApply: {
        backgroundColor: '#C9A84C',
        paddingHorizontal: 20,
        borderRadius: 10,
        justifyContent: 'center',
    },
    customTipApplyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    payNowButton: {
        backgroundColor: '#C9A84C',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    payNowText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Booking Details - Short & Compact
    bookingDetailsContainer: {
        marginTop: 16,
    },
    bookingDetailsCard: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
        overflow: 'visible',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
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
    detailValue: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    detailSubValue: {
        fontSize: 12,
        color: '#666666',
        marginTop: 1,
    },
    amountValue: {
        color: '#C9A84C',
        fontWeight: '700',
        fontSize: 15,
    },
    // Celebrating Professionals
    celebratingContainer: {
        marginTop: 16,
    },
    celebratingSubtitle: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 5,
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
    // Appreciation Section with Auto-Scroll Images - Increased Height
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
    appreciationCarousel: {
        marginTop: 4,
    },
    appreciationImageCard: {
        width: width - 40,
        height: 200,
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
    },
    appreciationImage: {
        width: '100%',
        height: '100%',
    },
    appreciationImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    appreciationImageIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    appreciationImageTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    appreciationImageDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
    },
    appreciationDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 14,
    },
    appreciationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D4D4D4',
    },
    appreciationDotActive: {
        backgroundColor: '#C9A84C',
        width: 24,
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
        minHeight: height * 0.45,
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
    modalPrimaryButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0.1,
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
    modalFeedbackContainer: {
        marginBottom: 16,
        width: '100%',
    },
    modalFeedbackLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    modalFeedbackInput: {
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1A1A1A',
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#E8E3D8',
        width: '100%',
    },
    starRatingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 4,
    },
    starIcon: {
        marginHorizontal: 2,
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
    celebratingVideo: {
        width: '100%',
        height: '100%',
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
});

export default JobCompletedScreen;