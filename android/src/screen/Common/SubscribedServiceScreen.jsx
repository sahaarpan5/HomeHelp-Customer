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
    Image,
    Linking,
    Clipboard,
    ImageBackground,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const COLORS = {
    gold: '#76577F',
    white: '#FFFFFF',
    dark: '#1A1A1A',
    textLight: '#666666',
    lightBg: '#F8F6F0',
    border: '#E8E3D8',
    success: '#2ECC71',
    blue: '#0984E3',
    red: '#E17055',
    orange: '#FDCB6E',
};

const SubscribedServiceScreen = ({ navigation, route }) => {
    // States
    const [showShareModal, setShowShareModal] = useState(false);
    const [isAutoRenew, setIsAutoRenew] = useState(true);

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Service Data
    const serviceData = {
        id: 'SUB-2027-001',
        serviceName: 'Premium Home Cleaning',
        coverImage: require('../../asset/housemaid.png'),
        professional: {
            name: 'Priya Patel',
            role: 'Senior Cleaning Specialist',
            rating: 4.9,
            jobsCompleted: 384,
            experience: '5 years',
            avatar: require('../../asset/start.png'),
            verified: true,
        },
        startDate: new Date(2027, 0, 15),
        endDate: new Date(2027, 3, 15),
        nextService: new Date(2027, 0, 22),
        hoursPerDay: 4,
        totalAmount: 26946,
        discount: 2994,
        invoiceNumber: 'INV-2027-001',
        benefits: [
            'Trained & Certified Staff',
            '100% Insured Service',
            'Flexible Scheduling',
            'Eco-Friendly Products',
            'Quality Guarantee',
            'Satisfaction Promise',
        ],
        billing: {
            plan: 'Premium Home Cleaning Pro',
            duration: '3 months',
            subtotal: 29940,
            discount: 2994,
            total: 26946,
            nextBilling: new Date(2027, 3, 15),
        },
    };

    const shareItems = [
        {
            icon: require('../../asset/whatsapp.png'),
            color: '#25D366',
            label: 'WhatsApp',
        },

        {
            icon: require('../../asset/copy.png'),
            color: '#666',
            label: 'Copy',
        },
    ];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    // Format Date
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatShortDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Toggle Auto Renew
    const toggleAutoRenew = () => {
        Alert.alert(
            isAutoRenew ? 'Disable Auto-Renew?' : 'Enable Auto-Renew?',
            isAutoRenew
                ? 'Your subscription will not renew automatically.'
                : 'Your subscription will renew automatically.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: isAutoRenew ? 'Disable' : 'Enable',
                    onPress: () => {
                        setIsAutoRenew(!isAutoRenew);
                        Alert.alert(
                            isAutoRenew ? 'Auto-Renew Disabled' : 'Auto-Renew Enabled',
                            isAutoRenew
                                ? 'You will be notified before expiry.'
                                : 'Auto-renewal activated.'
                        );
                    }
                }
            ]
        );
    };

    // Cancel Subscription
    const handleCancel = () => {
        Alert.alert(
            'Cancel Subscription',
            'Are you sure you want to cancel?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Cancellation Options',
                            'Choose how to proceed:',
                            [
                                { text: 'Cancel Now', onPress: () => Alert.alert('Cancelled', 'Subscription cancelled.') },
                                { text: 'Cancel After Period', onPress: () => Alert.alert('Scheduled', 'Will end on ' + formatDate(serviceData.endDate)) },
                                { text: 'Pause', onPress: () => Alert.alert('Paused', 'Subscription paused.') },
                                { text: 'Go Back', style: 'cancel' },
                            ]
                        );
                    }
                },
            ]
        );
    };

    // Send Invoice
    const handleSendInvoice = () => {
        const invoice = `
🧹 CLEANHOME PRO - INVOICE
${'='.repeat(40)}
Invoice: ${serviceData.invoiceNumber}
Date: ${formatDate(new Date())}
Status: ✅ PAID

Customer: Rahul Sharma
Email: rahul@email.com
Phone: +91 98765 43210

Plan: ${serviceData.serviceName}
Duration: 3 months
Hours/Day: ${serviceData.hoursPerDay} hrs
Start: ${formatDate(serviceData.startDate)}
End: ${formatDate(serviceData.endDate)}

Subtotal: ₹${serviceData.billing.subtotal}
Discount: -₹${serviceData.discount}
Total: ₹${serviceData.billing.total}

Thank you for choosing CleanHome Pro!
    `;

        Alert.alert(
            'Send Invoice',
            'How to share?',
            [
                { text: 'Copy', onPress: () => { Clipboard.setString(invoice); Alert.alert('Copied!'); } },
                { text: 'Email', onPress: () => Linking.openURL('mailto:?subject=Invoice&body=' + encodeURIComponent(invoice)) },
                { text: 'Share', onPress: () => Share.share({ message: invoice }) },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    // Help & Support
    const handleHelp = () => {
        Alert.alert(
            'Help & Support',
            'How can we help?',
            [
                { text: '📞 Call', onPress: () => Linking.openURL('tel:+919876543210') },
                { text: '📧 Email', onPress: () => Linking.openURL('mailto:support@cleanhomepro.com') },
                { text: '💬 Chat', onPress: () => Alert.alert('Connecting to agent...') },
                { text: '📖 FAQ', onPress: () => Alert.alert('FAQ', '1. How to cancel?\n2. Reschedule service?\n3. Refund policy?') },
                { text: 'Close', style: 'cancel' },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.gold} />

            {/* Header */}


            <Animated.ScrollView style={[styles.content, { opacity: fadeAnim }]}>

                {/* Cover Image */}
                <ImageBackground
                    source={serviceData.coverImage}
                    style={styles.coverImage}
                    imageStyle={styles.coverImageStyle}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>

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
                        
                        <TouchableOpacity onPress={() => setShowShareModal(true)}>

                            <Image
                                source={require('../../asset/share.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.coverOverlay}>
                        <View style={styles.coverContent}>
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Active</Text>
                            </View>
                            <Text style={styles.coverTitle}>{serviceData.serviceName}</Text>
                            <Text style={styles.coverSubtitle}>Premium Service</Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* Service ID */}
                <View style={styles.idSection}>
                    <Text style={styles.idLabel}>ID: </Text>
                    <Text style={styles.idValue}>{serviceData.id}</Text>
                </View>

                {/* Service Details */}
                <View style={styles.detailsGrid}>
                    <View style={styles.detailCard}>

                        <Image
                            source={require('../../asset/calendar.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.detailLabel}>Start Date</Text>
                        <Text style={styles.detailValue}>{formatDate(serviceData.startDate)}</Text>
                    </View>
                    <View style={styles.detailCard}>

                        <Image
                            source={require('../../asset/calendar.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.detailLabel}>End Date</Text>
                        <Text style={styles.detailValue}>{formatDate(serviceData.endDate)}</Text>
                    </View>
                    <View style={styles.detailCard}>

                        <Image
                            source={require('../../asset/time-outline.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.detailLabel}>Next Service</Text>
                        <Text style={styles.detailValue}>{formatDate(serviceData.nextService)}</Text>
                    </View>
                    <View style={styles.detailCard}>

                        <Image
                            source={require('../../asset/hourglass-outline.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.detailLabel}>Hours/Day</Text>
                        <Text style={styles.detailValue}>{serviceData.hoursPerDay} hrs</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.invoiceBtn]} onPress={handleSendInvoice}>

                        <Image
                            source={require('../../asset/receipt.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.invoiceBtnText}>Send Invoice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.helpBtn]} onPress={handleHelp}>

                        <Image
                            source={require('../../asset/support.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.blue


                            }}
                        />
                        <Text style={styles.helpBtnText}>Help & Support</Text>
                    </TouchableOpacity>
                </View>

                {/* Professional */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>

                        <Image
                            source={require('../../asset/person-outline.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.sectionTitle}>Assigned Professional</Text>
                    </View>
                    <TouchableOpacity style={styles.proCard} onPress={() => navigation.navigate('ProfessionalDetailsScreen')}>
                        <View style={styles.proHeader}>
                            <Image source={serviceData.professional.avatar} style={styles.proAvatar} />
                            <View style={styles.proInfo}>
                                <View style={styles.proNameRow}>
                                    <Text style={styles.proName}>{serviceData.professional.name}</Text>

                                    <Image
                                        source={require('../../asset/checked.png')} // Update the path as needed
                                        style={{
                                            width: 16,
                                            height: 16,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.blue


                                        }}
                                    />
                                </View>
                                <Text style={styles.proRole}>{serviceData.professional.role}</Text>
                                <Text style={styles.proExp}>{serviceData.professional.experience} experience</Text>
                            </View>
                        </View>
                        <View style={styles.proStats}>
                            <View style={styles.proStat}>

                                <Image
                                    source={require('../../asset/star-fill.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.orange


                                    }}
                                />
                                <Text style={styles.proStatText}>{serviceData.professional.rating} ★</Text>
                                <Text style={styles.proStatLabel}>Rating</Text>
                            </View>
                            <View style={styles.proDivider} />
                            <View style={styles.proStat}>

                                <Image
                                    source={require('../../asset/check.png')} // Update the path as needed
                                    style={{
                                        width: 16,
                                        height: 16,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.success


                                    }}
                                />
                                <Text style={styles.proStatText}>{serviceData.professional.jobsCompleted}</Text>
                                <Text style={styles.proStatLabel}>Jobs Done</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Auto Renew */}
                <View style={styles.section}>
                    <View style={styles.autoCard}>
                        <View style={styles.autoLeft}>
                            <Image
                                source={require('../../asset/refresh.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: isAutoRenew ? COLORS.success : COLORS.red,
                                }}
                            />
                            <View>
                                <Text style={styles.autoTitle}>{isAutoRenew ? 'Auto-Renew Enabled' : 'Auto-Renew Disabled'}</Text>
                                <Text style={styles.autoSub}>{isAutoRenew ? 'Will renew automatically' : 'Will not renew'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.autoToggle, { backgroundColor: isAutoRenew ? COLORS.success : '#D4D4D4' }]}
                            onPress={toggleAutoRenew}
                        >
                            <View style={[styles.autoDot, { transform: [{ translateX: isAutoRenew ? 22 : 0 }] }]} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>

                        <Image
                            source={require('../../asset/close-circle.png')} // Update the path as needed
                            style={{
                                width: 24,
                                height: 24,
                                resizeMode: 'contain',
                                tintColor: COLORS.red


                            }}
                        />
                        <Text style={styles.cancelText}>Cancel Subscription</Text>

                        <Image
                            source={require('../../asset/right-arrow.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: "#999"


                            }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Benefits */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>

                        <Image
                            source={require('../../asset/gift.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.sectionTitle}>Benefits</Text>
                    </View>
                    <View style={styles.benefitsGrid}>
                        {serviceData.benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>

                                <Image
                                    source={require('../../asset/checked.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.success


                                    }}
                                />
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Billing */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>

                        <Image
                            source={require('../../asset/receipt.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.sectionTitle}>Billing Details</Text>
                    </View>
                    <View style={styles.billingCard}>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Plan</Text>
                            <Text style={styles.billValue}>{serviceData.billing.plan}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Duration</Text>
                            <Text style={styles.billValue}>{serviceData.billing.duration}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Subtotal</Text>
                            <Text style={styles.billValue}>₹{serviceData.billing.subtotal}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, { color: COLORS.success }]}>Discount</Text>
                            <Text style={[styles.billValue, { color: COLORS.success }]}>-₹{serviceData.billing.discount}</Text>
                        </View>
                        <View style={styles.billDivider} />
                        <View style={styles.billRow}>
                            <Text style={[styles.billLabel, styles.billTotalLabel]}>Total Paid</Text>
                            <Text style={[styles.billValue, styles.billTotalValue]}>₹{serviceData.billing.total}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Next Billing</Text>
                            <Text style={styles.billValue}>{formatShortDate(serviceData.billing.nextBilling)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.spacer} />
            </Animated.ScrollView>

            {/* Share Modal */}
            <Modal visible={showShareModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Share Service</Text>
                            <TouchableOpacity onPress={() => setShowShareModal(false)}>

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
                        <View style={styles.shareGrid}>
                            {shareItems.map((item, index) => (
                                <TouchableOpacity key={index} style={styles.shareItem}>
                                    <View
                                        style={[
                                            styles.shareIcon,
                                            { backgroundColor: item.color + '15' },
                                        ]}
                                    >
                                        <Image
                                            source={item.icon}
                                            style={{
                                                width: 28,
                                                height: 28,
                                                resizeMode: 'contain',
                                                tintColor: item.color, // Remove if images already have their colors
                                            }}
                                        />
                                    </View>

                                    <Text style={styles.shareLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 20,
        paddingBottom: 16,
        
        backgroundColor: 'rgba(0,0,0,0.4)',
        
       
        
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // Cover Image
    coverImage: {
        width: width,
        height: 250,
        marginHorizontal: -16,
    },
    coverImageStyle: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    coverOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        padding: 20,
    },
    coverContent: {
        marginBottom: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(46, 204, 113, 0.9)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
        marginBottom: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    coverTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    coverSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    // ID
    idSection: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    idLabel: {
        fontSize: 13,
        color: '#999',
    },
    idValue: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    // Details Grid
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    detailCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E3D8',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 2,
    },
    // Action Buttons
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    invoiceBtn: {
        borderColor: '#76577F',
    },
    invoiceBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#76577F',
    },
    helpBtn: {
        borderColor: '#0984E3',
    },
    helpBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0984E3',
    },
    // Section
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    // Professional
    proCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    proHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    proInfo: {
        flex: 1,
        marginLeft: 14,
    },
    proNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    proName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    proRole: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    proExp: {
        fontSize: 12,
        color: '#999',
        marginTop: 1,
    },
    proStats: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E8E3D8',
    },
    proStat: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    proDivider: {
        width: 1,
        backgroundColor: '#E8E3D8',
    },
    proStatText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    proStatLabel: {
        fontSize: 11,
        color: '#999',
    },
    // Auto Renew
    autoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E3D8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    autoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    autoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    autoSub: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    autoToggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    autoDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    // Cancel
    cancelBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FDEDEC',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E17055',
        flex: 1,
    },
    // Benefits
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    benefitText: {
        fontSize: 12,
        color: '#1A1A1A',
    },
    // Billing
    billingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    billLabel: {
        fontSize: 13,
        color: '#666',
    },
    billValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    billDivider: {
        height: 1,
        backgroundColor: '#E8E3D8',
        marginVertical: 8,
    },
    billTotalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    billTotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#76577F',
    },
    spacer: {
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
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
    shareGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    shareItem: {
        alignItems: 'center',
        gap: 6,
        width: 70,
    },
    shareIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});

export default SubscribedServiceScreen;