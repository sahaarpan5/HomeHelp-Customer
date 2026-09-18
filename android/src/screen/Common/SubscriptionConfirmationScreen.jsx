import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Animated,
    Alert,
    Share,
    Modal,
    TextInput,
    ActivityIndicator,
    Clipboard,
    Platform,
    Linking,
    Image,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const SubscriptionConfirmationScreen = ({ navigation, route }) => {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [invoiceSent, setInvoiceSent] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Get data from route params
    const subscriptionData =  {
        planName: 'Home Cleaning Pro',
        months: 3,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        amount: 29940,
        discount: 2994,
        customerName: 'Rahul Sharma',
        customerEmail: 'rahul@email.com',
        customerPhone: '+91 98765 43210',
        location: '123, Main Street, Mumbai, Maharashtra - 400001',
        maxHoursPerDay: 4,
        pricePerMonth: '₹9,980',
        invoiceNumber: 'INV-2027-001',
        transactionId: 'TXN-2027-00123',
    };

    useEffect(() => {
        // Success animation sequence
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

        // Fade and slide animations
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

        // Pulse animation for status indicator
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Navigation Handlers
    const handleGoToDashboard = () => {
         navigation.replace('DashboardScreen')
    };

    const handleGoToMyBookings = () => {
        navigation.replace('MyBookingsScreen')
    };

    const handleGoToAccount = () => {
        navigation.replace('ProfileScreen')
    };

    // Generate Invoice Text
    const generateInvoiceText = () => {
        return `
🧹 CLEANHOME PRO - INVOICE
${'='.repeat(40)}

Invoice #: ${subscriptionData.invoiceNumber}
Date: ${formatDate(new Date())}
Status: ✅ PAID & ACTIVE

${'-'.repeat(40)}
BILL TO:
${subscriptionData.customerName}
${subscriptionData.customerEmail}
${subscriptionData.customerPhone}
${subscriptionData.location}

${'-'.repeat(40)}
SUBSCRIPTION DETAILS:
Plan: ${subscriptionData.planName}
Duration: ${subscriptionData.months} months
Hours per Day: ${subscriptionData.maxHoursPerDay} hrs
Start Date: ${formatDate(subscriptionData.startDate)}
End Date: ${formatDate(subscriptionData.endDate)}

${'-'.repeat(40)}
PAYMENT BREAKDOWN:
Subtotal (${subscriptionData.months} months): ₹${subscriptionData.months * 9980}
${subscriptionData.discount > 0 ? `Discount: -₹${subscriptionData.discount}` : ''}
${'-'.repeat(40)}
TOTAL PAID: ₹${subscriptionData.amount}

${'='.repeat(40)}
Thank you for choosing CleanHome Pro!
For support: support@cleanhomepro.com
${'='.repeat(40)}
    `;
    };

    // Send Invoice via Email
    const sendInvoiceEmail = async () => {
        if (!emailAddress || !emailAddress.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const invoiceText = generateInvoiceText();
            const subject = `Invoice ${subscriptionData.invoiceNumber} - CleanHome Pro Subscription`;
            const body = `
        Dear ${subscriptionData.customerName},

        Thank you for subscribing to CleanHome Pro! 🎉

        Your subscription has been successfully activated.

        SUBSCRIPTION DETAILS:
        • Plan: ${subscriptionData.planName}
        • Duration: ${subscriptionData.months} months
        • Amount Paid: ₹${subscriptionData.amount}
        • Valid Until: ${formatDate(subscriptionData.endDate)}

        ${invoiceText}

        Best regards,
        CleanHome Pro Team
      `;

            await new Promise(resolve => setTimeout(resolve, 1500));

            setInvoiceSent(true);

            Alert.alert(
                '✅ Invoice Ready!',
                `Invoice for ${subscriptionData.customerName} is ready to send to ${emailAddress}`,
                [
                    {
                        text: '📋 Copy Invoice',
                        onPress: () => {
                            Clipboard.setString(generateInvoiceText());
                            Alert.alert('Copied!', 'Invoice copied to clipboard');
                        }
                    },
                    {
                        text: '📧 Send Email',
                        onPress: () => {
                            const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            Linking.openURL(emailUrl).catch(() => {
                                Alert.alert(
                                    'Email Client',
                                    'Please manually send the invoice to the customer',
                                    [{ text: 'OK' }]
                                );
                            });
                        }
                    },
                    {
                        text: 'Done',
                        onPress: () => {
                            setShowInvoiceModal(false);
                            setEmailAddress('');
                            setInvoiceSent(false);
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to prepare invoice. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Share Invoice
    const shareInvoice = async () => {
        try {
            const invoiceText = generateInvoiceText();

            await Share.share({
                message: invoiceText,
                title: `Invoice ${subscriptionData.invoiceNumber}`,
            });

            setShowShareModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to share invoice');
        }
    };

    // Copy Invoice to Clipboard
    const copyInvoice = () => {
        const invoiceText = generateInvoiceText();
        Clipboard.setString(invoiceText);
        Alert.alert(
            '✅ Copied!',
            'Invoice copied to clipboard. You can now paste it anywhere.',
            [
                {
                    text: 'Share Now',
                    onPress: () => shareInvoice()
                },
                { text: 'OK' }
            ]
        );
        setShowInvoiceModal(false);
    };

    // Share Subscription Link
    const shareSubscription = async () => {
        try {
            const message = `
🧹 Subscription Confirmation - CleanHome Pro

✅ Subscription Active!
📋 Plan: ${subscriptionData.planName}
📅 Duration: ${subscriptionData.months} months
💰 Amount: ₹${subscriptionData.amount}
📧 Email: ${subscriptionData.customerEmail}
📍 Location: ${subscriptionData.location}

Track your subscription: 
https://cleanhomepro.com/subscription/${subscriptionData.invoiceNumber}

Thank you for choosing CleanHome Pro! 🌟
      `;

            await Share.share({
                message: message,
                title: 'My CleanHome Pro Subscription',
            });

            setShowShareModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to share subscription details');
        }
    };

    const handleCancelSubscription = () => {
        Alert.alert(
            '⚠️ Cancel Subscription',
            'Are you sure you want to cancel your subscription?',
            [
                { text: 'No, Keep It', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            '🔄 Cancellation Process',
                            'We\'re sorry to see you go! Would you like to:',
                            [
                                { text: 'Just Cancel' },
                                { text: 'Pause Instead' },
                                { text: 'Downgrade Plan' },
                                { text: 'Go Back', style: 'cancel' },
                            ]
                        );
                    }
                },
            ]
        );
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Cancellation Policy Modal
    const CancellationPolicyModal = () => (
        <Modal
            visible={showCancellationPolicy}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCancellationPolicy(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, styles.policyModalContent]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>📋 Cancellation Policy</Text>
                        <TouchableOpacity onPress={() => setShowCancellationPolicy(false)}>

                            <Image
                                source={require('../../asset/close.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: "#666"


                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.policySection}>
                            <View style={styles.policyIconContainer}>

                                <Image
                                    source={require('../../asset/time-outline.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.policyContent}>
                                <Text style={styles.policyTitle}>Cancellation Window</Text>
                                <Text style={styles.policyText}>
                                    You can cancel your subscription at any time. Cancellations made within 24 hours of the next billing cycle will be processed immediately.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.policySection}>
                            <View style={styles.policyIconContainer}>

                                <Image
                                    source={require('../../asset/rupee.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.policyContent}>
                                <Text style={styles.policyTitle}>Refund Policy</Text>
                                <Text style={styles.policyText}>
                                    • Full refund if cancelled within 7 days of purchase
                                </Text>
                                <Text style={styles.policyText}>
                                    • Pro-rata refund for unused period after 7 days
                                </Text>
                                <Text style={styles.policyText}>
                                    • Refunds processed within 5-7 business days
                                </Text>
                            </View>
                        </View>

                        <View style={styles.policySection}>
                            <View style={styles.policyIconContainer}>

                                <Image
                                    source={require('../../asset/calendar.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.policyContent}>
                                <Text style={styles.policyTitle}>Billing Cycle</Text>
                                <Text style={styles.policyText}>
                                    • Current subscription: {subscriptionData.months} months
                                </Text>
                                <Text style={styles.policyText}>
                                    • Next billing date: {formatDate(new Date(new Date().setMonth(new Date().getMonth() + subscriptionData.months)))}
                                </Text>
                                <Text style={styles.policyText}>
                                    • Cancellation takes effect from next billing cycle
                                </Text>
                            </View>
                        </View>

                        <View style={styles.policySection}>
                            <View style={styles.policyIconContainer}>

                                <Image
                                    source={require('../../asset/terms-and-conditions.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <View style={styles.policyContent}>
                                <Text style={styles.policyTitle}>Terms & Conditions</Text>
                                <Text style={styles.policyText}>
                                    • No cancellation fees apply
                                </Text>
                                <Text style={styles.policyText}>
                                    • Services continue until end of paid period
                                </Text>
                                <Text style={styles.policyText}>
                                    • Auto-renewal can be disabled anytime
                                </Text>
                                <Text style={styles.policyText}>
                                    • Partial month charges are pro-rated
                                </Text>
                            </View>
                        </View>

                        <View style={styles.policyFooter}>

                            <Image
                                source={require('../../asset/shiled-outline.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.success


                                }}
                            />
                            <Text style={styles.policyFooterText}>
                                For any questions, contact our support team
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.policyCloseButton}
                            onPress={() => setShowCancellationPolicy(false)}
                        >
                            <Text style={styles.policyCloseButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // Invoice Modal
    const InvoiceModal = () => (
        <Modal
            visible={showInvoiceModal}
            transparent
            animationType="slide"
            onRequestClose={() => {
                setShowInvoiceModal(false);
                setEmailAddress('');
                setInvoiceSent(false);
            }}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>📧 Send Invoice</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setShowInvoiceModal(false);
                                setEmailAddress('');
                                setInvoiceSent(false);
                            }}
                        >

                            <Image
                                source={require('../../asset/close.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: "#666"


                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.invoicePreview}>
                        <View style={styles.invoiceIconContainer}>

                            <Image
                                source={require('../../asset/receipt.png')} // Update the path as needed
                                style={{
                                    width: 40,
                                    height: 40,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold


                                }}
                            />
                        </View>
                        <Text style={styles.invoicePreviewTitle}>
                            Invoice #{subscriptionData.invoiceNumber}
                        </Text>
                        <Text style={styles.invoicePreviewAmount}>
                            ₹{subscriptionData.amount}
                        </Text>
                        <View style={styles.invoicePreviewStatus}>
                            <View style={styles.statusDotSmall} />
                            <Text style={styles.invoicePreviewStatusText}>Paid & Active</Text>
                        </View>
                    </View>

                    <View style={styles.emailInputContainer}>
                        <Text style={styles.emailInputLabel}>Recipient Email</Text>
                        <View style={styles.emailInputWrapper}>

                            <Image
                                source={require('../../asset/mail.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: "#999",
                                    marginRight: 10,


                                }}
                            />
                            <TextInput
                                style={styles.emailInput}
                                placeholder="Enter email address"
                                value={emailAddress}
                                onChangeText={setEmailAddress}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <Text style={styles.emailHelper}>
                            Invoice will be shared as text with full details
                        </Text>
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.copyButton]}
                            onPress={copyInvoice}
                        >

                            <Image
                                source={require('../../asset/copy.png')} // Update the path as needed
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold,



                                }}
                            />
                            <Text style={styles.copyButtonText}>Copy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.sendButton]}
                            onPress={sendInvoiceEmail}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>

                                    <Image
                                        source={require('../../asset/share.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.txtColor,



                                        }}
                                    />
                                    <Text style={styles.sendButtonText}>Send Email</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.shareInvoiceButton}
                        onPress={() => {
                            setShowInvoiceModal(false);
                            setTimeout(() => setShowShareModal(true), 300);
                        }}
                    >

                        <Image
                            source={require('../../asset/share.png')} // Update the path as needed
                            style={{
                                width: 18,
                                height: 18,
                                resizeMode: 'contain',
                                tintColor: "#666",



                            }}
                        />
                        <Text style={styles.shareInvoiceText}>Share invoice instead</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Share Modal
    const ShareModal = () => (
        <Modal
            visible={showShareModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowShareModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>📤 Share Subscription</Text>
                        <TouchableOpacity onPress={() => setShowShareModal(false)}>

                            <Image
                                source={require('../../asset/close.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: "#666",



                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.shareOptions}>
                        <TouchableOpacity
                            style={styles.shareOption}
                            onPress={shareSubscription}
                        >
                            <View style={[styles.shareIconWrapper, { backgroundColor: '#E8F5FE' }]}>

                                <Image
                                    source={require('../../asset/share.png')} // Update the path as needed
                                    style={{
                                        width: 28,
                                        height: 28,
                                        resizeMode: 'contain',
                                        tintColor: "#0984E3",



                                    }}
                                />
                            </View>
                            <View style={styles.shareOptionContent}>
                                <Text style={styles.shareOptionTitle}>Share via Social</Text>
                                <Text style={styles.shareOptionDesc}>Share on WhatsApp, Instagram, etc.</Text>
                            </View>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: "#ccc",



                                }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shareOption}
                            onPress={() => {
                                setShowShareModal(false);
                                setTimeout(() => setShowInvoiceModal(true), 300);
                            }}
                        >
                            <View style={[styles.shareIconWrapper, { backgroundColor: '#FDF6E9' }]}>

                                <Image
                                    source={require('../../asset/receipt.png')} // Update the path as needed
                                    style={{
                                        width: 28,
                                        height: 28,
                                        resizeMode: 'contain',
                                        tintColor: "#76577F",



                                    }}
                                />
                            </View>
                            <View style={styles.shareOptionContent}>
                                <Text style={styles.shareOptionTitle}>Share Invoice</Text>
                                <Text style={styles.shareOptionDesc}>Share invoice as text</Text>
                            </View>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: "#ccc",



                                }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shareOption}
                            onPress={() => {
                                const invoiceText = generateInvoiceText();
                                Clipboard.setString(invoiceText);
                                Alert.alert(
                                    '✅ Copied!',
                                    'Invoice copied to clipboard',
                                    [
                                        {
                                            text: 'Share Now',
                                            onPress: () => shareInvoice()
                                        },
                                        { text: 'OK' }
                                    ]
                                );
                                setShowShareModal(false);
                            }}
                        >
                            <View style={[styles.shareIconWrapper, { backgroundColor: '#F0F7EE' }]}>

                                <Image
                                    source={require('../../asset/copy.png')} // Update the path as needed
                                    style={{
                                        width: 28,
                                        height: 28,
                                        resizeMode: 'contain',
                                        tintColor: "#2ECC71",



                                    }}
                                />
                            </View>
                            <View style={styles.shareOptionContent}>
                                <Text style={styles.shareOptionTitle}>Copy Invoice</Text>
                                <Text style={styles.shareOptionDesc}>Copy to clipboard</Text>
                            </View>

                            <Image
                                source={require('../../asset/arrow-forward.png')} // Update the path as needed
                                style={{
                                    width: 12,
                                    height: 12,
                                    resizeMode: 'contain',
                                    tintColor: "#ccc",



                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.shareFooter}>
                        <Text style={styles.shareFooterText}>
                            Share your subscription confirmation with anyone
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#d6bceb" />

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
                            tintColor: "#403746",



                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription Confirmed</Text>
                <TouchableOpacity onPress={() => setShowShareModal(true)}>

                    <Image
                        source={require('../../asset/share.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: "#403746",



                        }}
                    />
                </TouchableOpacity>
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
                                tintColor: COLORS.white,



                            }}
                        />
                    </Animated.View>
                    <Text style={styles.successTitle}>Subscription Active! 🎉</Text>
                    <Text style={styles.successSubtitle}>Your subscription has been activated successfully</Text>
                    <View style={styles.subscriptionIdContainer}>
                        <Text style={styles.subscriptionIdLabel}>Subscription ID</Text>
                        <Text style={styles.subscriptionIdValue}>SUB-2027-001</Text>
                    </View>
                </View>

                {/* Quick Action Buttons - Dashboard, My Bookings, Account */}
                <View style={styles.quickActionsMainContainer}>
                    <TouchableOpacity
                        style={styles.quickActionMainCard}
                        onPress={handleGoToDashboard}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.quickActionMainIcon, { backgroundColor: '#E8F5FE' }]}>

                            <Image
                                source={require('../../asset/home.png')} // Update the path as needed
                                style={{
                                    width: 28,
                                    height: 28,
                                    resizeMode: 'contain',
                                    tintColor: "#0984E3",



                                }}
                            />
                        </View>
                        <Text style={styles.quickActionMainTitle}>Dashboard</Text>
                        <Text style={styles.quickActionMainSubtitle}>Overview</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionMainCard}
                        onPress={handleGoToMyBookings}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.quickActionMainIcon, { backgroundColor: '#FDF6E9' }]}>

                            <Image
                                source={require('../../asset/calendar.png')} // Update the path as needed
                                style={{
                                    width: 28,
                                    height: 28,
                                    resizeMode: 'contain',
                                    tintColor: "#76577F",



                                }}
                            />
                        </View>
                        <Text style={styles.quickActionMainTitle}>My Bookings</Text>
                        <Text style={styles.quickActionMainSubtitle}>View all</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionMainCard}
                        onPress={handleGoToAccount}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.quickActionMainIcon, { backgroundColor: '#F0F7EE' }]}>

                            <Image
                                source={require('../../asset/person-outline.png')} // Update the path as needed
                                style={{
                                    width: 28,
                                    height: 28,
                                    resizeMode: 'contain',
                                    tintColor: "#2ECC71",



                                }}
                            />
                        </View>
                        <Text style={styles.quickActionMainTitle}>Account</Text>
                        <Text style={styles.quickActionMainSubtitle}>Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Invoice Action Card */}
                <TouchableOpacity
                    style={styles.invoiceActionCard}
                    onPress={() => setShowInvoiceModal(true)}
                    activeOpacity={0.9}
                >
                    <View style={styles.invoiceActionLeft}>
                        <View style={styles.invoiceActionIcon}>

                            <Image
                                source={require('../../asset/receipt.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.gold,



                                }}
                            />
                        </View>
                        <View style={styles.invoiceActionContent}>
                            <Text style={styles.invoiceActionTitle}>View & Send Invoice</Text>
                            <Text style={styles.invoiceActionSubtitle}>
                                Invoice #{subscriptionData.invoiceNumber}
                            </Text>
                        </View>
                    </View>

                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: "#999",



                        }}
                    />
                </TouchableOpacity>

                {/* Professional Services Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>🧹 Professional Services</Text>
                    <View style={styles.servicesGrid}>
                        <View style={styles.serviceCard}>
                            <View style={[styles.serviceIcon, { backgroundColor: '#E8F5FE' }]}>

                                <Image
                                    source={require('../../asset/people.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: "#0984E3",



                                    }}
                                />
                            </View>
                            <Text style={styles.serviceTitle}>Trained Staff</Text>
                            <Text style={styles.serviceDesc}>Certified professionals</Text>
                        </View>
                        <View style={styles.serviceCard}>
                            <View style={[styles.serviceIcon, { backgroundColor: '#F0F7EE' }]}>

                                <Image
                                    source={require('../../asset/shiled-outline.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: "#2ECC71",



                                    }}
                                />
                            </View>
                            <Text style={styles.serviceTitle}>Insured Service</Text>
                            <Text style={styles.serviceDesc}>100% coverage</Text>
                        </View>
                        <View style={styles.serviceCard}>
                            <View style={[styles.serviceIcon, { backgroundColor: '#FDF6E9' }]}>

                                <Image
                                    source={require('../../asset/time-outline.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: "#C9A84C",



                                    }}
                                />
                            </View>
                            <Text style={styles.serviceTitle}>Punctual</Text>
                            <Text style={styles.serviceDesc}>On-time service</Text>
                        </View>
                        <View style={styles.serviceCard}>
                            <View style={[styles.serviceIcon, { backgroundColor: '#FDEDEC' }]}>

                                <Image
                                    source={require('../../asset/heart.png')} // Update the path as needed
                                    style={{
                                        width: 24,
                                        height: 24,
                                        resizeMode: 'contain',
                                        tintColor: "#E17055",



                                    }}
                                />
                            </View>
                            <Text style={styles.serviceTitle}>Eco-Friendly</Text>
                            <Text style={styles.serviceDesc}>Green products</Text>
                        </View>
                    </View>
                </View>

                {/* Work Hard Section */}
                <View style={styles.workHardContainer}>
                    <View style={styles.workHardHeader}>

                        <Image
                            source={require('../../asset/trophy.png')} // Update the path as needed
                            style={{
                                width: 24,
                                height: 24,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold,



                            }}
                        />
                        <Text style={styles.workHardTitle}>Our Commitment</Text>
                    </View>
                    <View style={styles.workHardGrid}>
                        <View style={styles.workHardItem}>
                            <Text style={styles.workHardNumber}>500+</Text>
                            <Text style={styles.workHardLabel}>Happy Clients</Text>
                        </View>
                        <View style={styles.workHardItem}>
                            <Text style={styles.workHardNumber}>4.9★</Text>
                            <Text style={styles.workHardLabel}>Average Rating</Text>
                        </View>
                        <View style={styles.workHardItem}>
                            <Text style={styles.workHardNumber}>98%</Text>
                            <Text style={styles.workHardLabel}>Satisfaction</Text>
                        </View>
                    </View>
                    <View style={styles.workHardFooter}>

                        <Image
                            source={require('../../asset/shiled-outline.png')} // Update the path as needed
                            style={{
                                width: 16,
                                height: 16,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold,



                            }}
                        />
                        <Text style={styles.workHardFooterText}>
                            We work hard to earn your trust. 24/7 support available.
                        </Text>
                    </View>
                </View>

                {/* Subscription Details */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>📋 Subscription Details</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/home.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Plan</Text>
                                <Text style={styles.detailValue}>{subscriptionData.planName}</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/calendar-outline.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Duration</Text>
                                <Text style={styles.detailValue}>{subscriptionData.months} month(s)</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/time-outline.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Hours per Day</Text>
                                <Text style={styles.detailValue}>{subscriptionData.maxHoursPerDay} hrs</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/rupee.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Price</Text>
                                <Text style={styles.detailValue}>{subscriptionData.pricePerMonth}/month</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Customer Details */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>👤 Customer Details</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/person-outline.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Name</Text>
                                <Text style={styles.detailValue}>{subscriptionData.customerName}</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/mail.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Email</Text>
                                <Text style={styles.detailValue}>{subscriptionData.customerEmail}</Text>
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
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Phone</Text>
                                <Text style={styles.detailValue}>{subscriptionData.customerPhone}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>📍 Service Location</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/location-outline.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.blue,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Address</Text>
                                <Text style={[styles.detailValue, styles.locationText]}>{subscriptionData.location}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Date Range */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>📅 Subscription Period</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/play-circle-outline.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.purple,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Start Date</Text>
                                <Text style={styles.detailValue}>{formatDate(subscriptionData.startDate)}</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/stop-button.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.red,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>End Date</Text>
                                <Text style={styles.detailValue}>{formatDate(subscriptionData.endDate)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment Summary */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>💰 Payment Summary</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/rupee.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.textLight,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Subtotal</Text>
                                <Text style={styles.detailValue}>₹{subscriptionData.months * 9980}</Text>
                            </View>
                        </View>
                        {/* {subscriptionData.discount > 0 && (
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <Ionicons name="pricetag-outline" size={18} color={COLORS.success} />
                                    
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: COLORS.success }]}>Discount</Text>
                                    <Text style={[styles.detailValue, { color: COLORS.success }]}>-₹{subscriptionData.discount}</Text>
                                </View>
                            </View>
                        )} */}
                        <View style={styles.totalDivider} />
                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>

                                <Image
                                    source={require('../../asset/credit-card.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold,



                                    }}
                                />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Total Paid</Text>
                                <Text style={[styles.detailValue, styles.totalAmount]}>₹{subscriptionData.amount}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Status Badge */}
                <View style={styles.statusContainer}>
                    <Animated.View
                        style={[
                            styles.statusBadge,
                            {
                                transform: [{ scale: pulseAnim }],
                            }
                        ]}
                    >
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>● Active</Text>
                        <Text style={styles.statusSubtext}>| Auto-renew on</Text>
                    </Animated.View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={styles.rescheduleButton} onPress={handleGoToMyBookings}>

                        <Image
                            source={require('../../asset/calendar-outline.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold,



                            }}
                        />
                        <Text style={styles.rescheduleButtonText}>My Bookings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>

                        <Image
                            source={require('../../asset/close-circle.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.red,



                            }}
                        />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Cancellation Policy - After Cancel Button */}
                <TouchableOpacity
                    style={styles.cancellationPolicyCard}
                    onPress={() => setShowCancellationPolicy(true)}
                    activeOpacity={0.9}
                >
                    <View style={styles.cancellationPolicyLeft}>
                        <View style={styles.cancellationPolicyIcon}>

                            <Image
                                source={require('../../asset/terms-and-conditions.png')} // Update the path as needed
                                style={{
                                    width: 22,
                                    height: 22,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.red,



                                }}
                            />
                        </View>
                        <View style={styles.cancellationPolicyContent}>
                            <Text style={styles.cancellationPolicyTitle}>View Cancellation Policy</Text>
                            <Text style={styles.cancellationPolicySubtitle}>
                                Read terms & conditions before cancelling
                            </Text>
                        </View>
                    </View>
                    
                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 12,
                            height: 12,
                            resizeMode: 'contain',
                            tintColor: "#999",



                        }}
                    />
                </TouchableOpacity>

                {/* Auto Renew Info */}
                <View style={styles.autoRenewContainer}>
                    
                    <Image
                        source={require('../../asset/refresh.png')} // Update the path as needed
                        style={{
                            width: 18,
                            height: 18,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold,



                        }}
                    />
                    <Text style={styles.autoRenewText}>Auto-renewal enabled</Text>
                    <View style={styles.autoRenewDot} />
                    <Text style={styles.autoRenewNext}>
                        Next: {formatDate(new Date(new Date().setMonth(new Date().getMonth() + subscriptionData.months)))}
                    </Text>
                </View>

                <View style={styles.footerSpacer} />
            </Animated.ScrollView>

            {/* Modals */}
            <InvoiceModal />
            <ShareModal />
            <CancellationPolicyModal />
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
    subscriptionIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        backgroundColor: '#F8F6F0',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },
    subscriptionIdLabel: {
        fontSize: 12,
        color: '#666666',
    },
    subscriptionIdValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#76577F',
    },
    // Quick Actions Main Row
    quickActionsMainContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        marginBottom: 8,
    },
    quickActionMainCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionMainIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionMainTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    quickActionMainSubtitle: {
        fontSize: 10,
        color: '#999999',
        marginTop: 2,
    },
    // Invoice Action Card
    invoiceActionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    invoiceActionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    invoiceActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8F6F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    invoiceActionContent: {
        flex: 1,
    },
    invoiceActionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    invoiceActionSubtitle: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    // Cancellation Policy Card
    cancellationPolicyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#FDEDEC',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cancellationPolicyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cancellationPolicyIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FDEDEC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cancellationPolicyContent: {
        flex: 1,
    },
    cancellationPolicyTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    cancellationPolicySubtitle: {
        fontSize: 11,
        color: '#999999',
        marginTop: 1,
    },
    // Professional Services
    sectionContainer: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    serviceCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    serviceIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    serviceDesc: {
        fontSize: 11,
        color: '#666666',
        marginTop: 2,
    },
    // Work Hard Section
    workHardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    workHardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    workHardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    workHardGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    workHardItem: {
        alignItems: 'center',
    },
    workHardNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#76577F',
    },
    workHardLabel: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    workHardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0EDE8',
    },
    workHardFooterText: {
        fontSize: 12,
        color: '#666666',
        flex: 1,
    },
    // Details Card
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
    locationText: {
        fontSize: 13,
        lineHeight: 18,
    },
    totalAmount: {
        color: '#76577F',
        fontWeight: '700',
        fontSize: 16,
    },
    totalDivider: {
        height: 1,
        backgroundColor: '#F0EDE8',
        marginVertical: 4,
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
    statusSubtext: {
        fontSize: 12,
        color: '#666666',
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
        borderColor: '#E8E3D8',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E17055',
    },
    // Auto Renew
    autoRenewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 10,
    },
    autoRenewText: {
        fontSize: 13,
        color: '#666666',
    },
    autoRenewDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D4D4D4',
    },
    autoRenewNext: {
        fontSize: 12,
        color: '#999999',
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    policyModalContent: {
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    // Invoice Preview
    invoicePreview: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F8F6F0',
        borderRadius: 14,
        marginBottom: 20,
    },
    invoiceIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    invoicePreviewTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 4,
    },
    invoicePreviewAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#76577F',
        marginTop: 4,
    },
    invoicePreviewStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#E6F9F0',
        borderRadius: 12,
    },
    statusDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2ECC71',
    },
    invoicePreviewStatusText: {
        fontSize: 12,
        color: '#2ECC71',
        fontWeight: '600',
    },
    // Email Input
    emailInputContainer: {
        marginBottom: 20,
    },
    emailInputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    emailInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    emailIcon: {
        marginRight: 10,
    },
    emailInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1A1A1A',
    },
    emailHelper: {
        fontSize: 12,
        color: '#999999',
        marginTop: 6,
    },
    // Modal Actions
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    copyButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#76577F',
    },
    copyButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#76577F',
    },
    sendButton: {
        backgroundColor: '#d6bceb',
    },
    sendButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#403746',
    },
    shareInvoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
    },
    shareInvoiceText: {
        fontSize: 13,
        color: '#666666',
    },
    // Share Options
    shareOptions: {
        gap: 12,
    },
    shareOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    shareIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    shareOptionContent: {
        flex: 1,
    },
    shareOptionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    shareOptionDesc: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    shareFooter: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0EDE8',
        alignItems: 'center',
    },
    shareFooterText: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
    },
    // Cancellation Policy Styles
    policySection: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    policyIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    policyContent: {
        flex: 1,
    },
    policyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    policyText: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 2,
    },
    policyFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: '#E6F9F0',
        borderRadius: 12,
    },
    policyFooterText: {
        fontSize: 13,
        color: '#2ECC71',
        fontWeight: '500',
    },
    policyCloseButton: {
        backgroundColor: '#d6bceb',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    policyCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#403746',
    },
});

export default SubscriptionConfirmationScreen;