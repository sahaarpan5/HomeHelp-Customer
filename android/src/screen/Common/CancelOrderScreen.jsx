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
} from 'react-native';


const { width, height } = Dimensions.get('window');

const CancelOrderScreen = ({ navigation, route }) => {
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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

    // Sample booking data
    const bookingData = {
        serviceName: 'Home Deep Cleaning',
        provider: 'CleanMaster Services',
        providerImage: 'https://ui-avatars.com/api/?name=CleanMaster&background=C9A84C&color=fff&size=100',
        date: '15 Jan 2027',
        day: 'Friday',
        startTime: '09:00 AM',
        endTime: '02:30 PM',
        address: '123, Main Street, Mumbai',
        customerName: 'Rahul Sharma',
        mobileNumber: '+91 98765 43210',
        amount: '₹0',
    };

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

    const handleBookAgain = () => {
        Alert.alert('Book Again', 'Redirecting to booking page...');
    };

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
                {/* Cancellation Icon & Message */}
                <View style={styles.cancelContainer}>
                    <View style={styles.cancelIconWrapper}>
                        <View style={styles.cancelIcon}>

                            <Image
                                source={require('../../asset/close-circle.png')} // Update the path as needed
                                style={{
                                    width: 40,
                                    height: 40,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </View>
                    </View>
                    <Text style={styles.cancelTitle}>Booking Canceled</Text>
                    <Text style={styles.cancelSubtitle}>We hope to see you again in future.</Text>
                    <View style={styles.cancelDivider} />
                </View>

                {/* Book Again Button */}
                <TouchableOpacity style={styles.bookAgainButton} onPress={handleBookAgain}>
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

                {/* Booking Details - Compact White Card */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>
                    <View style={styles.detailsCard}>
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
                                <Text style={styles.detailValue}>
                                    {bookingData.date} • {bookingData.day} • {bookingData.startTime} - {bookingData.endTime}
                                </Text>
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
                                <Text style={styles.detailValue} numberOfLines={1}>{bookingData.address}</Text>
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
                                <Text style={styles.detailValue}>
                                    {bookingData.customerName} • {bookingData.mobileNumber}
                                </Text>
                            </View>
                        </View>

                        {/* Row 4: Amount - ₹0 */}
                        <View style={[styles.detailRow, styles.detailRowLast]}>
                            <View style={[styles.detailIconBox, { backgroundColor: COLORS.red + '15' }]}>
                                
                                <Image
                                    source={require('../../asset/rupee.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.red


                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: COLORS.red }]}>Amount</Text>
                                <Text style={[styles.detailValue, styles.refundAmount]}>₹0</Text>
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
    // Cancel Section
    cancelContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'transparent',
    },
    cancelIconWrapper: {
        marginBottom: 12,
    },
    cancelIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E17055',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E17055',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    cancelTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    cancelSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 2,
        textAlign: 'center',
    },
    cancelDivider: {
        width: 40,
        height: 3,
        backgroundColor: '#E17055',
        borderRadius: 2,
        marginTop: 12,
    },
    // Book Again Button
    bookAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    // Details Section - Compact White Card
    detailsContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        overflow: 'hidden',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    detailRowLast: {
        borderBottomWidth: 0,
    },
    detailIconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#F8F6F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
    },
    refundAmount: {
        color: '#E17055',
        fontWeight: '700',
        fontSize: 15,
    },
    footerSpacer: {
        height: 30,
    },
});

export default CancelOrderScreen;