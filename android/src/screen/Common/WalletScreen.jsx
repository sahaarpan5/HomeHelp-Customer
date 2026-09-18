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

const WalletScreen = ({ navigation }) => {
    // States
    const [isLoading, setIsLoading] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

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

    // Sample wallet data
    const walletData = {
        balance: '₹2,450',
    };

    // Wallet Activity Data
    const walletActivities = [
        {
            id: '1',
            type: 'credit',
            title: 'Referral Bonus',
            description: 'Earned from Rahul\'s booking',
            amount: '+₹200',
            date: '15 Jan 2027, 10:30 AM',
            icon: require('../../asset/gift.png'),
            color: COLORS.blue,
        },
        {
            id: '2',
            type: 'debit',
            title: 'Service Payment',
            description: 'Paid for Home Cleaning',
            amount: '-₹499',
            date: '10 Jan 2027, 02:15 PM',
            icon: require('../../asset/credit-card.png'),
            color: COLORS.red,
        },
        {
            id: '3',
            type: 'credit',
            title: 'Referral Bonus',
            description: 'Earned from Priya\'s booking',
            amount: '+₹200',
            date: '8 Jan 2027, 11:00 AM',
            icon: require('../../asset/gift.png'),
            color: COLORS.txtColor,
        },

        {
            id: '5',
            type: 'debit',
            title: 'Service Payment',
            description: 'Paid for Sofa Cleaning',
            amount: '-₹399',
            date: '3 Jan 2027, 04:20 PM',
            icon: require('../../asset/credit-card.png'),
            color: COLORS.purple,
        },
        {
            id: '6',
            type: 'credit',
            title: 'Referral Bonus',
            description: 'Earned from Amit\'s booking',
            amount: '+₹200',
            date: '1 Jan 2027, 12:00 PM',
            icon: require('../../asset/gift.png'),
            color: COLORS.green,
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

    const handleAddMoney = () => {
        Alert.alert('Add Money', 'Add money to wallet coming soon...');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#d6bceb" />

            {/* Header - Left Aligned */}
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
                <Text style={styles.headerTitle}>Wallet</Text>
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
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Wallet Balance</Text>
                    <Text style={styles.balanceAmount}>{walletData.balance}</Text>

                    <TouchableOpacity style={styles.addMoneyButton} onPress={handleAddMoney}>

                        <Image
                            source={require('../../asset/add.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.txtColor


                            }}
                        />
                        <Text style={styles.addMoneyText}>Add Money</Text>
                    </TouchableOpacity>
                </View>

                {/* Wallet Activity */}
                <View style={styles.activityContainer}>
                    <Text style={styles.activitySectionTitle}>Wallet Activity</Text>

                    {walletActivities.map((item) => (
                        <View key={item.id} style={styles.activityItem}>
                            <View style={[styles.activityIcon, { backgroundColor: item.color + '15' }]}>
                                
                                <Image
                                    source={item.icon}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        resizeMode: 'contain',
                                        tintColor: item.color, // Remove if your PNGs are already colored
                                    }}
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityName}>{item.title}</Text>
                                <Text style={styles.activityDesc}>{item.description}</Text>
                                <Text style={styles.activityDate}>{item.date}</Text>
                            </View>
                            <Text style={[
                                styles.activityAmount,
                                item.type === 'credit' ? styles.creditAmount : styles.debitAmount
                            ]}>
                                {item.amount}
                            </Text>
                        </View>
                    ))}
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
        backgroundColor: '#d6bceb',
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
        color: '#403746',
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Balance Card
    balanceCard: {
        backgroundColor: '#76577F',
        borderRadius: 16,
        padding: 24,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '500',
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFF',
        marginTop: 4,
        marginBottom: 20,
    },
    addMoneyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#d6bceb',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C4B0D3',
    },
    addMoneyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#403746',
    },
    // Wallet Activity
    activityContainer: {
        marginTop: 20,
    },
    activitySectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    activityContent: {
        flex: 1,
    },
    activityName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    activityDesc: {
        fontSize: 12,
        color: '#666666',
        marginTop: 1,
    },
    activityDate: {
        fontSize: 11,
        color: '#999999',
        marginTop: 2,
    },
    activityAmount: {
        fontSize: 15,
        fontWeight: '600',
    },
    creditAmount: {
        color: '#76577F',
    },
    debitAmount: {
        color: '#E17055',
    },
    footerSpacer: {
        height: 20,
    },
});

export default WalletScreen;