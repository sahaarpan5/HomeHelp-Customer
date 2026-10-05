import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
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
  BackHandler,
} from 'react-native';

import { CommonActions } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');

const BookingConfirmationScreen = ({ navigation, route }) => {


  const {
    bookingId,
    slots = [],
    bookingRows = [],
    totalAmount = 0,
    totalHours = 0,
    selectedServices = [],
    customerDetails = {},
    addressDetails = {},
    address = '',
    scheduleType = '',
    paymentDetails = {},
  } = route.params || {};
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

  // Sample booking data


  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleDashboard();
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const handleDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'DashboardScreen',
          },
        ],
      }),
    );
  };

  const handleMyBookings = () => {
    navigation.replace('MyBookingsScreen');
  };

  const handleAccount = () => {
    navigation.replace('ProfileScreen');
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive' },
      ]
    );
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Redirecting to reschedule page...');
  };

  const handleCancellationPolicy = () => {
    Alert.alert('Cancellation Policy', 'Viewing cancellation policy...');
  };



  // Slot Professional Details
  const renderSlotProfessional = (slot, index) => (
    <View key={index} style={styles.slotItem}>
      <View style={styles.slotDot} />

      <View style={styles.slotContent}>

        <Text style={styles.slotDate}>
          {slot.date}
        </Text>

        <Text style={styles.slotTime}>
          {slot.time}
        </Text>

        {slot.startTime && slot.endTime && (
          <Text style={styles.slotTime}>
            {slot.startTime} - {slot.endTime}
          </Text>
        )}

        <TouchableOpacity
          style={styles.slotProfessionalRow}
          onPress={() =>
            navigation.navigate(
              'ProfessionalDetailsScreen',
              {
                professional:
                  slot.professional,
              }
            )
          }
        >
          <Image
            source={require('../../asset/profile-one.png')}
            style={styles.slotProfessionalImage}
          />

          <Text style={styles.slotProfessional}>
            with{' '}
            {slot.professionalName ||
              slot.professional?.name ||
              'Select Any Professional'}
          </Text>
        </TouchableOpacity>

      </View>

      {index < slots.length - 1 && (
        <View style={styles.slotLine} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#d6bceb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleDashboard}
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
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
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
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >

            <Image
              source={require('../../asset/checked.png')} // Update the path as needed
              style={{
                width: 48,
                height: 48,
                resizeMode: 'contain',
                tintColor: COLORS.white


              }}
            />
          </Animated.View>
          <Text style={styles.successTitle}>Booking Confirmed! 🎉</Text>
          <Text style={styles.successSubtitle}>Your booking has been confirmed successfully</Text>
          <View style={styles.bookingIdContainer}>
            <Text style={styles.bookingIdLabel}>Booking ID</Text>
            <Text style={styles.bookingIdValue}> {bookingId || 'N/A'}</Text>
          </View>


          <View style={styles.bookingIdContainer}>
            <Text style={styles.bookingIdLabel}>Payment ID</Text>
            <Text style={styles.bookingIdValue}> {paymentDetails?.razorpay_payment_id || 'N/A'}</Text>
          </View>
        </View>

        {/* Quick Action Buttons - Dashboard, My Bookings, Account */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleDashboard}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.gold + '15' }]}>

              <Image
                source={require('../../asset/home.png')} // Update the path as needed
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: 'contain',
                  tintColor: COLORS.green


                }}
              />
            </View>
            <Text style={styles.quickActionTitle}>Dashboard</Text>
            <Text style={styles.quickActionSubtitle}>Go to home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={handleMyBookings}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.blue + '15' }]}>

              <Image
                source={require('../../asset/calendar.png')} // Update the path as needed
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: 'contain',
                  tintColor: COLORS.blue


                }}
              />
            </View>
            <Text style={styles.quickActionTitle}>My Bookings</Text>
            <Text style={styles.quickActionSubtitle}>View all bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={handleAccount}>
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.purple + '15' }]}>

              <Image
                source={require('../../asset/person-outline.png')} // Update the path as needed
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: 'contain',
                  tintColor: COLORS.purple


                }}
              />
            </View>
            <Text style={styles.quickActionTitle}>Account</Text>
            <Text style={styles.quickActionSubtitle}>Manage profile</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Services */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Selected Services</Text>
          <View style={styles.servicesCard}>
            {selectedServices.map((service, index) => (
              <View
                key={index}
                style={[
                  styles.serviceItem,
                  index === selectedServices.length - 1 &&
                  styles.serviceItemLast,
                ]}
              >
                <View style={styles.serviceLeft}>
                  <View style={styles.serviceDot} />

                  <View>
                    <Text style={styles.serviceName}>
                      {service.name ||
                        service.serviceName ||
                        'Service'}
                    </Text>

                    {service.hours && (
                      <Text style={styles.serviceQuantity}>
                        {service.hours} hour
                        {Number(service.hours) > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </View>

                {service.amount != null && (
                  <Text style={styles.servicePrice}>
                    ₹{Number(service.amount).toLocaleString('en-IN')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* All Slots - Moved after Services */}
        {slots.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>All Slots</Text>
            <View style={styles.slotsCard}>
              {slots.map((slot, index) =>
                renderSlotProfessional(slot, index)
              )}
            </View>
          </View>
        )}

        {/* Payment Details */}
        <TouchableOpacity
          style={styles.paymentToggle}
          onPress={() => setShowPaymentDetails(!showPaymentDetails)}
        >
          <View style={styles.paymentToggleLeft}>

            <Image
              source={require('../../asset/credit-card.png')} // Update the path as needed
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
                tintColor: COLORS.txtColor


              }}
            />
            <Text style={styles.paymentToggleText}>Payment Details</Text>
          </View>
          <Image
            source={
              showPaymentDetails
                ? require('../../asset/minus.png')
                : require('../../asset/plus.png')
            }
            style={{
              width: 16,
              height: 16,
              resizeMode: 'contain',
              tintColor: COLORS.textLight, // Remove if your PNGs are already colored
            }}
          />
        </TouchableOpacity>

        {showPaymentDetails && (
          <View style={styles.paymentCard}>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>
                Amount Paid
              </Text>

              <Text style={styles.paymentValue}>
                ₹{Number(totalAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.paymentDivider} />

            <View style={styles.paymentTotalRow}>
              <View>
                <Text style={styles.paymentTotalLabel}>
                  Total Amount
                </Text>

                <Text style={styles.paymentTotalSubtext}>
                  Payment completed successfully
                </Text>
              </View>

              <Text style={styles.paymentTotalValue}>
                ₹{Number(totalAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.paymentMethodRow}>

              <Image
                source={require('../../asset/credit-card.png')}
                style={{
                  width: 16,
                  height: 16,
                  resizeMode: 'contain',
                  tintColor: COLORS.textLight,
                }}
              />

              <Text style={styles.paymentMethodText}>
                Razorpay
              </Text>
            </View>

            <View style={styles.paymentMethodRow}>

              <Text style={styles.paymentMethodText}>
                Payment ID:{' '}
                {paymentDetails?.razorpay_payment_id || 'N/A'}
              </Text>

            </View>

          </View>
        )}

        {/* Booking Details - Removed Date, Added Customer Name & Mobile */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>

                <Image
                  source={require('../../asset/person-outline.png')} // Update the path as needed
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    tintColor: COLORS.txtColor


                  }}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Customer Name</Text>
                <Text style={styles.detailValue}>{customerDetails?.name || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>

                <Image
                  source={require('../../asset/telephone.png')} // Update the path as needed
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    tintColor: COLORS.txtColor


                  }}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Mobile Number</Text>
                <Text style={styles.detailValue}>{customerDetails?.mobile || 'N/A'}</Text>
              </View>
            </View>
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <View style={styles.detailIcon}>

                <Image
                  source={require('../../asset/location-outline.png')} // Update the path as needed
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    tintColor: COLORS.txtColor


                  }}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{address || addressDetails?.address || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{paymentDetails?.razorpay_payment_id
              ? 'Confirmed'
              : 'Pending'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>

            <Image
              source={require('../../asset/calendar.png')} // Update the path as needed
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
                tintColor: COLORS.txtColor


              }}
            />
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelBooking}>

            <Image
              source={require('../../asset/close-circle.png')} // Update the path as needed
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
                tintColor: COLORS.red


              }}
            />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Cancellation Policy Link */}
        <TouchableOpacity style={styles.policyLink} onPress={handleCancellationPolicy}>

          <Image
            source={require('../../asset/google-docs.png')} // Update the path as needed
            style={{
              width: 18,
              height: 18,
              resizeMode: 'contain',
              tintColor: COLORS.txtColor


            }}
          />
          <Text style={styles.policyLinkText}>View Cancellation Policy</Text>

          <Image
            source={require('../../asset/arrow-forward.png')} // Update the path as needed
            style={{
              width: 14,
              height: 14,
              resizeMode: 'contain',
              tintColor: COLORS.textLight


            }}
          />
        </TouchableOpacity>

        {/* Our Professionals Work Hard Section */}
        <View style={styles.appreciationContainer}>
          <Text style={styles.appreciationTitle}>Our professionals work hard.</Text>
          <Text style={styles.appreciationSubtitle}>Your small gesture makes a difference.</Text>

          <View style={styles.appreciationTips}>
            <View style={styles.appreciationTip}>
              <View style={[styles.appreciationTipIcon, { backgroundColor: COLORS.goldDark }]}>

                <Image
                  source={require('../../asset/happy.png')} // Update the path as needed
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    tintColor: COLORS.white


                  }}
                />
              </View>
              <View style={styles.appreciationTipContent}>
                <Text style={styles.appreciationTipTitle}>Welcome them with a smile</Text>
                <Text style={styles.appreciationTipDesc}>A warm greeting makes them feel valued</Text>
              </View>
            </View>

            <View style={styles.appreciationTip}>
              <View style={[styles.appreciationTipIcon, { backgroundColor: COLORS.purple }]}>

                <Image
                  source={require('../../asset/drop.png')} // Update the path as needed
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    tintColor: COLORS.white


                  }}
                />
              </View>
              <View style={styles.appreciationTipContent}>
                <Text style={styles.appreciationTipTitle}>Offer them a glass of water</Text>
                <Text style={styles.appreciationTipDesc}>Stay hydrated during the service</Text>
              </View>
            </View>

            <View style={styles.appreciationTip}>
              <View style={[styles.appreciationTipIcon, { backgroundColor: COLORS.green }]}>

                <Image
                  source={require('../../asset/home.png')} // Update the path as needed
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    tintColor: COLORS.white


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
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
  // Success Section
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#76577F',
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
    marginTop: 12,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  bookingIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#F8F6F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bookingIdLabel: {
    fontSize: 12,
    color: '#666666',
  },
  bookingIdValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C9A84C',
  },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EDE8',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  // Section
  sectionContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  // Services
  servicesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0EDE8',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  serviceItemLast: {
    borderBottomWidth: 0,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9A84C',
  },
  serviceName: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  serviceQuantity: {
    fontSize: 12,
    color: '#666666',
    marginTop: 1,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C9A84C',
  },
  // Slots
  slotsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0EDE8',
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    position: 'relative',
  },
  slotDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C9A84C',
    marginTop: 4,
    marginRight: 12,
    zIndex: 1,
  },
  slotLine: {
    position: 'absolute',
    left: 4,
    top: 18,
    width: 2,
    height: 16,
    backgroundColor: '#C9A84C',
  },
  slotContent: {
    flex: 1,
  },
  slotDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  slotTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 1,
  },
  slotProfessionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  slotProfessionalImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  slotProfessional: {
    fontSize: 12,
    color: '#76577F',
  },
  // Payment
  paymentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F0EDE8',
  },
  paymentToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F0EDE8',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  discountValue: {
    color: '#2ECC71',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#F0EDE8',
    marginVertical: 8,
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  paymentTotalSubtext: {
    fontSize: 11,
    color: '#666666',
    marginTop: 1,
  },
  paymentTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#76577F',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#666666',
  },
  // Booking Details - Updated
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0EDE8',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F6F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    marginTop: 2,
  },
  // Status
  statusContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E6F9F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71',
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#76577F',
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#76577F',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#76577F',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E17055',
  },
  // Cancellation Policy Link
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  policyLinkText: {
    fontSize: 14,
    color: '#76577F',
    fontWeight: '500',
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
    height: 20,
  },
});

export default BookingConfirmationScreen;