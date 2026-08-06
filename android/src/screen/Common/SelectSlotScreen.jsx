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
    // States
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedHours, setSelectedHours] = useState(null);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [addedSlots, setAddedSlots] = useState([]);
    const [showProfessionalModal, setShowProfessionalModal] = useState(false);
    const [selectedProfessionalDetails, setSelectedProfessionalDetails] = useState(null);
    const [showBillSummary, setShowBillSummary] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const billModalSlideAnim = useRef(new Animated.Value(height)).current;

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

    // Generate next 7 days (starting from tomorrow)
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
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
    const hoursOptions = ['1 Hour', '2 Hours', '3 Hours', '4 Hours', '5 Hours', '6 Hours','7 Hours','8 Hours'];

    // Service price per hour
    const PRICE_PER_HOUR = 499;

    // Professionals data
    const professionals = [
        {
            id: 'p1',
            name: 'Rajesh Kumar',
            image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=6C5CE7&color=fff&size=100',
            rating: 4.9,
            jobsCompleted: 1240,
            isActive: true,
            experience: '8 years',
            availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM'],
        },
        {
            id: 'p2',
            name: 'Priya Sharma',
            image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=FD79A8&color=fff&size=100',
            rating: 4.8,
            jobsCompleted: 890,
            isActive: true,
            experience: '6 years',
            availableSlots: ['10:00 AM', '01:00 PM', '03:00 PM'],
        },
        {
            id: 'p3',
            name: 'Amit Patel',
            image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=0984E3&color=fff&size=100',
            rating: 4.7,
            jobsCompleted: 650,
            isActive: true,
            experience: '5 years',
            availableSlots: ['09:00 AM', '12:00 PM', '04:00 PM'],
        },
        {
            id: 'p4',
            name: 'Sunita Reddy',
            image: 'https://ui-avatars.com/api/?name=Sunita+Reddy&background=00B894&color=fff&size=100',
            rating: 4.9,
            jobsCompleted: 1560,
            isActive: true,
            experience: '10 years',
            availableSlots: ['09:00 AM', '12:00 PM', '04:00 PM'],
        },
        {
            id: 'p5',
            name: 'Vikram Singh',
            image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=E17055&color=fff&size=100',
            rating: 4.6,
            jobsCompleted: 450,
            isActive: true,
            experience: '4 years',
            availableSlots: ['10:00 AM', '01:00 PM', '05:00 PM'],
        },
    ];
    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    const activeProfessionals = professionals.filter(p => p.isActive);

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

    const openProfessionalModal = (professional) => {
        setSelectedProfessionalDetails(professional);
        setShowProfessionalModal(true);
        setTimeout(() => animateModalIn(modalSlideAnim), 100);
    };

    const closeProfessionalModal = () => {
        animateModalOut(modalSlideAnim, () => {
            setShowProfessionalModal(false);
            setSelectedProfessionalDetails(null);
        });
    };

    const openBillSummary = () => {
        if (addedSlots.length === 0) {
            Alert.alert('No Slots Added', 'Please add at least one slot to proceed');
            return;
        }
        setShowBillSummary(true);
        setTimeout(() => animateModalIn(billModalSlideAnim), 100);
    };

    const closeBillSummary = () => {
        animateModalOut(billModalSlideAnim, () => {
            setShowBillSummary(false);
        });
    };

    const toggleDateSelection = (date) => {
        const dateStr = date.toDateString();
        if (selectedDate === dateStr) {
            setSelectedDate(null);
        } else {
            setSelectedDate(dateStr);
        }
    };

    const addSlot = () => {
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
        if (!selectedProfessional) {
            Alert.alert('Select Professional', 'Please select a professional');
            return;
        }

        const professional = professionals.find(p => p.id === selectedProfessional);
        const hours = parseInt(selectedHours);
        const amount = hours * PRICE_PER_HOUR;

        const newSlot = {
            id: Date.now().toString(),
            date: selectedDate,
            time: selectedTime,
            hours: selectedHours,
            professionalId: selectedProfessional,
            professionalName: professional?.name,
            professionalImage: professional?.image,
            amount: amount,
            hoursNum: hours,
        };

        // Check for duplicate slot on same date
        const existingSlot = addedSlots.find(s => s.date === selectedDate);
        if (existingSlot) {
            Alert.alert('Slot Exists', 'A slot already exists for this date. Please remove it first.');
            return;
        }

        setAddedSlots([...addedSlots, newSlot]);

        // Reset selections
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedHours(null);
        setSelectedProfessional(null);
    };

    const removeSlot = (slotId) => {
        setAddedSlots(addedSlots.filter(s => s.id !== slotId));
    };

    const getTotalAmount = () => {
        return addedSlots.reduce((sum, slot) => sum + slot.amount, 0);
    };

    const getTotalHours = () => {
        return addedSlots.reduce((sum, slot) => sum + slot.hoursNum, 0);
    };

    const handleConfirmBooking = () => {
        closeBillSummary();
        setTimeout(() => {
            Alert.alert('Success', 'Booking confirmed successfully!');
            navigation.goBack();
        }, 300);
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

    const renderProfessionalGrid = ({ item }) => {
        const isSelected = selectedProfessional === item.id;
        const isAvailable = !selectedTime || item.availableSlots.includes(selectedTime);

        return (
            <TouchableOpacity
                style={[
                    styles.professionalGridCard,
                    isSelected && styles.professionalGridCardSelected,
                    !isAvailable && styles.professionalGridCardUnavailable,
                ]}
                onPress={() => {
                    if (!selectedDate) {
                        Alert.alert('Select Date First', 'Please select a date before choosing a professional');
                        return;
                    }
                    if (!selectedTime) {
                        Alert.alert('Select Time First', 'Please select a time slot before choosing a professional');
                        return;
                    }
                    if (!isAvailable) {
                        Alert.alert('Not Available', `${item.name} is not available at ${selectedTime}`);
                        return;
                    }
                    setSelectedProfessional(isSelected ? null : item.id);
                }}
                activeOpacity={0.8}
            >
                <Image source={{ uri: item.image }} style={styles.professionalGridImage} />
                <View style={styles.professionalGridInfo}>
                    <Text style={styles.professionalGridName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.professionalGridRating}>
                        {renderStars(item.rating)}
                        <Text style={styles.professionalGridRatingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.professionalGridJobs}>{item.jobsCompleted} jobs</Text>
                </View>
                {isSelected && (
                    <View style={styles.professionalGridCheck}>

                        <Image
                            source={require('../../asset/checked.png')} // Update the path as needed
                            style={{
                                width: 12,
                                height: 12,
                                resizeMode: 'contain',
                                tintColor: COLORS.white


                            }}
                        />
                    </View>
                )}
                {!isAvailable && (
                    <View style={styles.professionalGridUnavailableBadge}>
                        <Text style={styles.professionalGridUnavailableText}>Unavailable</Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.professionalGridViewButton}
                    onPress={() => navigation.navigate('ProfessionalDetailsScreen', { professional: item })}
                >

                    <Image
                        source={require('../../asset/eye_open.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold


                        }}
                    />

                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    // Professional Details Modal
    const renderProfessionalModal = () => (
        <Modal
            transparent={true}
            visible={showProfessionalModal}
            animationType="none"
            onRequestClose={closeProfessionalModal}
        >
            <TouchableWithoutFeedback onPress={closeProfessionalModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { transform: [{ translateY: modalSlideAnim }] }
                            ]}
                        >
                            <View style={styles.modalHandle} />

                            {selectedProfessionalDetails && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalProfessionalHeader}>
                                        <Image
                                            source={{ uri: selectedProfessionalDetails.image }}
                                            style={styles.modalProfessionalImage}
                                        />
                                        <Text style={styles.modalProfessionalName}>
                                            {selectedProfessionalDetails.name}
                                        </Text>
                                        <View style={styles.modalProfessionalRating}>
                                            {renderStars(selectedProfessionalDetails.rating)}
                                            <Text style={styles.modalProfessionalRatingText}>
                                                {selectedProfessionalDetails.rating}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalStats}>
                                        <View style={styles.modalStat}>
                                            <Text style={styles.modalStatValue}>
                                                {selectedProfessionalDetails.jobsCompleted}
                                            </Text>
                                            <Text style={styles.modalStatLabel}>Jobs Completed</Text>
                                        </View>
                                        <View style={styles.modalStatDivider} />
                                        <View style={styles.modalStat}>
                                            <Text style={styles.modalStatValue}>
                                                {selectedProfessionalDetails.experience}
                                            </Text>
                                            <Text style={styles.modalStatLabel}>Experience</Text>
                                        </View>
                                        <View style={styles.modalStatDivider} />
                                        <View style={styles.modalStat}>
                                            <Text style={styles.modalStatValue}>
                                                {selectedProfessionalDetails.rating}
                                            </Text>
                                            <Text style={styles.modalStatLabel}>Rating</Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Available Time Slots</Text>
                                        <View style={styles.modalSlotsContainer}>
                                            {selectedProfessionalDetails.availableSlots.map((slot, index) => (
                                                <View key={index} style={styles.modalSlotTag}>
                                                    <Text style={styles.modalSlotTagText}>{slot}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>About</Text>
                                        <Text style={styles.modalAboutText}>
                                            {selectedProfessionalDetails.name} is a professional with {selectedProfessionalDetails.experience} of experience in home services.
                                            They have completed {selectedProfessionalDetails.jobsCompleted} jobs with an average rating of {selectedProfessionalDetails.rating}.
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.modalSelectButton}
                                        onPress={() => {
                                            if (selectedDate && selectedTime) {
                                                setSelectedProfessional(selectedProfessionalDetails.id);
                                                closeProfessionalModal();
                                            } else {
                                                Alert.alert('Select Date & Time', 'Please select date and time first');
                                            }
                                        }}
                                    >
                                        <Text style={styles.modalSelectButtonText}>Select Professional</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            )}

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeProfessionalModal}>
                                <Text style={styles.modalCloseText}>Close</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Bill Summary Modal
    const renderBillSummary = () => (
        <Modal
            transparent={true}
            visible={showBillSummary}
            animationType="none"
            onRequestClose={closeBillSummary}
        >
            <TouchableWithoutFeedback onPress={closeBillSummary}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.billModalContent,
                                { transform: [{ translateY: billModalSlideAnim }] }
                            ]}
                        >
                            <View style={styles.modalHandle} />

                            <View style={styles.billHeader}>
                                <Text style={styles.billTitle}>Bill Summary</Text>
                                <Text style={styles.billSubtitle}>Review your booking details</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {addedSlots.map((slot) => (
                                    <View key={slot.id} style={styles.billSlotItem}>
                                        <View style={styles.billSlotHeader}>
                                            <Text style={styles.billSlotDate}>
                                                {new Date(slot.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </Text>
                                            <Text style={styles.billSlotAmount}>₹{slot.amount}</Text>
                                        </View>
                                        <Text style={styles.billSlotDetails}>
                                            {slot.time} • {slot.hours} • {slot.professionalName}
                                        </Text>
                                    </View>
                                ))}

                                <View style={styles.billDivider} />

                                <View style={styles.billCalculation}>
                                    <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>Total Hours</Text>
                                        <Text style={styles.billValue}>{getTotalHours()} hrs</Text>
                                    </View>
                                    {/* <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>Price per Hour</Text>
                                        <Text style={styles.billValue}>₹{PRICE_PER_HOUR}</Text>
                                    </View> */}
                                    <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>Service Fee</Text>
                                        <Text style={styles.billValue}>₹0</Text>
                                    </View>
                                    <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>GST (18%)</Text>
                                        <Text style={styles.billValue}>₹{Math.round(getTotalAmount() * 0.18)}</Text>
                                    </View>
                                </View>

                                <View style={styles.billDivider} />

                                <View style={styles.billTotalRow}>
                                    <View>
                                        <Text style={styles.billTotalLabel}>Total Amount</Text>
                                        <Text style={styles.billTotalSubtext}>Including all taxes</Text>
                                    </View>
                                    <Text style={styles.billTotalAmount}>₹{Math.round(getTotalAmount() * 1.18)}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.billConfirmButton}
                                    onPress={()=>navigation.replace('BookingConfirmationScreen', { slots: addedSlots, totalAmount: Math.round(getTotalAmount() * 1.18) })  }
                                >
                                    <Text style={styles.billConfirmText}>Confirm Booking</Text>

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
                                onPress={closeBillSummary}
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
                <Text style={styles.headerTitle}>Select Slot</Text>
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
                {/* Select Date - Starting from Tomorrow */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <Text style={styles.sectionSubtitle}>Choose your preferred date</Text>
                    <View style={styles.datesContainer}>
                        {availableDates.map((date, index) => {
                            const dateStr = date.toDateString();
                            const isSelected = selectedDate === dateStr;
                            const hasSlot = addedSlots.some(s => s.date === dateStr);
                            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dateCard,
                                        isSelected && styles.dateCardSelected,
                                        hasSlot && styles.dateCardHasSlot,
                                    ]}
                                    onPress={() => toggleDateSelection(date)}
                                >
                                    <Text style={[
                                        styles.dateDay,
                                        isSelected && styles.dateTextSelected,
                                    ]}>{dayNames[date.getDay()]}</Text>
                                    <Text style={[
                                        styles.dateNumber,
                                        isSelected && styles.dateTextSelected,
                                    ]}>{date.getDate()}</Text>
                                    <Text style={[
                                        styles.dateMonth,
                                        isSelected && styles.dateTextSelected,
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
                    {selectedDate && (
                        <Text style={styles.selectedDateInfo}>
                            Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </Text>
                    )}
                </View>

                {/* Select Time */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Time</Text>
                    <Text style={styles.sectionSubtitle}>Choose your preferred time slot</Text>
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
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Duration</Text>
                    <Text style={styles.sectionSubtitle}>Choose service duration</Text>
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

                {/* Professional Grid */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Choose Professional</Text>
                    <Text style={styles.sectionSubtitle}>Select your preferred professional</Text>

                    {!selectedDate && (
                        <View style={styles.warningBox}>

                            <Image
                                source={require('../../asset/information.png')} // Update the path as needed
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.warning


                                }}
                            />
                            <Text style={styles.warningText}>Select a date first</Text>
                        </View>
                    )}
                    {selectedDate && !selectedTime && (
                        <View style={styles.warningBox}>
                            <Image
                                source={require('../../asset/information.png')} // Update the path as needed
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.warning
                                }}
                            />
                            <Text style={styles.warningText}>Select a time first</Text>
                        </View>
                    )}

                    <FlatList
                        data={activeProfessionals}
                        renderItem={renderProfessionalGrid}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        scrollEnabled={false}
                        contentContainerStyle={styles.professionalGrid}
                    />
                </View>

                {/* Add Slot Button */}
                <TouchableOpacity
                    style={[
                        styles.addSlotButton,
                        (!selectedDate || !selectedTime || !selectedHours || !selectedProfessional) && styles.addSlotButtonDisabled,
                    ]}
                    onPress={addSlot}
                    disabled={!selectedDate || !selectedTime || !selectedHours || !selectedProfessional}
                >

                    <Image
                        source={require('../../asset/add.png')} // Update the path as needed
                        style={{
                            width: 22,
                            height: 22,
                            resizeMode: 'contain',
                            tintColor: COLORS.white


                        }}
                    />
                    <Text style={styles.addSlotButtonText}>Add Slot</Text>
                </TouchableOpacity>

                {/* Added Slots */}
                {addedSlots.length > 0 && (
                    <View style={styles.addedSlotsContainer}>
                        <Text style={styles.addedSlotsTitle}>Added Slots</Text>
                        {addedSlots.map((slot) => (
                            <View key={slot.id} style={styles.addedSlotCard}>
                                <View style={styles.addedSlotInfo}>
                                    <Text style={styles.addedSlotDate}>
                                        {new Date(slot.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                    <Text style={styles.addedSlotDetails}>
                                        {slot.time} • {slot.hours} • {slot.professionalName}
                                    </Text>
                                    <Text style={styles.addedSlotAmount}>₹{slot.amount}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.removeSlotButton}
                                    onPress={() => removeSlot(slot.id)}
                                >

                                    <Image
                                        source={require('../../asset/delete.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.red


                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Total Amount - Clickable */}
                {addedSlots.length > 0 && (
                    <TouchableOpacity
                        style={styles.totalContainer}
                        onPress={openBillSummary}
                        activeOpacity={0.8}
                    >
                        <View style={styles.totalRow}>
                            <View>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalSubtext}>{addedSlots.length} slot(s) • {getTotalHours()} hrs</Text>
                            </View>
                            <View style={styles.totalRight}>
                                <Text style={styles.totalGrandValue}>₹{Math.round(getTotalAmount() * 1.18)}</Text>
                                
                                <Image
                                    source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                <View style={styles.footerSpacer} />
            </Animated.ScrollView>

            {/* Professional Details Modal */}
            {renderProfessionalModal()}

            {/* Bill Summary Modal */}
            {renderBillSummary()}
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
        justifyContent: 'space-between',
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
    // Dates
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
        position: 'relative',
    },
    dateCardSelected: {
        backgroundColor: '#C9A84C',
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
        fontSize: 13,
        color: '#C9A84C',
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
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
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E8E3D8',
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
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E8E3D8',
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
    // Professional Grid
    professionalGrid: {
        paddingVertical: 4,
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
        minHeight: 120,
    },
    professionalGridCardSelected: {
        borderColor: '#C9A84C',
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
        marginTop: 2,
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
        marginTop: 1,
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
        bottom: 4,
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
    addSlotButtonDisabled: {
        opacity: 0.5,
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
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    addedSlotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
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
        marginTop: 2,
    },
    addedSlotAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#C9A84C',
        marginTop: 2,
    },
    removeSlotButton: {
        padding: 8,
    },
    // Total Amount
    totalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    totalSubtext: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    totalRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    totalGrandValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#C9A84C',
    },
    footerSpacer: {
        height: 20,
    },
    // Modal
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
    billModalContent: {
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
    modalAboutText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    modalSelectButton: {
        backgroundColor: '#C9A84C',
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
        color: '#999',
        fontWeight: '500',
    },
    // Bill Summary Modal
    billHeader: {
        marginBottom: 16,
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
    billSlotItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    billSlotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billSlotDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    billSlotAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#C9A84C',
    },
    billSlotDetails: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    billDivider: {
        height: 1,
        backgroundColor: '#F0EDE8',
        marginVertical: 12,
    },
    billCalculation: {
        gap: 6,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billLabel: {
        fontSize: 14,
        color: '#666666',
    },
    billValue: {
        fontSize: 14,
        fontWeight: '500',
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
        color: '#C9A84C',
    },
    billConfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#C9A84C',
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