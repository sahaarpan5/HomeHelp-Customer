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

const ManagePaymentScreen = ({ navigation }) => {
    // States
    const [cards, setCards] = useState([
        {
            id: '1',
            type: 'Visa',
            number: '**** 4532',
            expiry: '12/26',
            cardHolder: 'Rahul Sharma',
            isDefault: true,
            color: '#1A1F71',
        },
        {
            id: '2',
            type: 'Mastercard',
            number: '**** 6789',
            expiry: '08/27',
            cardHolder: 'Rahul Sharma',
            isDefault: false,
            color: '#EB001B',
        },
    ]);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Card Form States
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;

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

    const openAddCardModal = () => {
        setShowAddCardModal(true);
        setCardNumber('');
        setCardHolder('');
        setExpiryMonth('');
        setExpiryYear('');
        setCvv('');
        setTimeout(() => animateModalIn(), 100);
    };

    const closeAddCardModal = () => {
        animateModalOut(() => {
            setShowAddCardModal(false);
        });
    };

    const handleDeleteCard = (id) => {
        Alert.alert(
            'Delete Card',
            'Are you sure you want to delete this card?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setIsLoading(true);
                        setTimeout(() => {
                            const filteredCards = cards.filter((item) => item.id !== id);
                            setCards(filteredCards);
                            setIsLoading(false);
                            Alert.alert('Success', 'Card deleted successfully');
                        }, 1000);
                    },
                },
            ]
        );
    };

    const handleSetDefault = (id) => {
        const updatedCards = cards.map((item) => ({
            ...item,
            isDefault: item.id === id,
        }));
        setCards(updatedCards);
    };

    const handleAddCard = () => {
        const cleanedNumber = cardNumber.replace(/\s/g, '');
        if (cleanedNumber.length < 16) {
            Alert.alert('Error', 'Please enter a valid 16-digit card number');
            return;
        }
        if (!cardHolder.trim()) {
            Alert.alert('Error', 'Please enter card holder name');
            return;
        }
        if (!expiryMonth.trim() || parseInt(expiryMonth) > 12 || parseInt(expiryMonth) < 1) {
            Alert.alert('Error', 'Please enter a valid expiry month (01-12)');
            return;
        }
        if (!expiryYear.trim() || expiryYear.length !== 2) {
            Alert.alert('Error', 'Please enter a valid expiry year (YY)');
            return;
        }
        if (!cvv.trim() || cvv.length < 3) {
            Alert.alert('Error', 'Please enter a valid CVV');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            const lastFour = cleanedNumber.slice(-4);
            const newCard = {
                id: Date.now().toString(),
                type: 'Card',
                number: `**** ${lastFour}`,
                expiry: `${expiryMonth}/${expiryYear}`,
                cardHolder: cardHolder,
                isDefault: cards.length === 0,
                color: COLORS.gold,
            };
            setCards([...cards, newCard]);
            setIsSubmitting(false);
            closeAddCardModal();
            Alert.alert('Success', 'Card added successfully');
        }, 1500);
    };

    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : text;
    };

    const renderCardItem = ({ item }) => (
        <View style={styles.cardItem}>
            <View style={styles.cardRow}>
                <View style={styles.cardLeft}>
                    <View style={[styles.cardIcon, { backgroundColor: item.color + '15' }]}>

                        <Image
                            source={require('../../asset/credit-card.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: item.color


                            }}
                        />
                    </View>
                    <View>
                        <Text style={styles.cardNumber}>{item.number}</Text>
                        <Text style={styles.cardExpiry}>Expires {item.expiry}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    {item.isDefault && (
                        <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteCard(item.id)}
                    >

                        <Image
                            source={require('../../asset/delete.png')} // Update the path as needed
                            style={{
                                width: 18,
                                height: 18,
                                resizeMode: 'contain',
                                tintColor: COLORS.red


                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {!item.isDefault && (
                <TouchableOpacity
                    style={styles.setDefaultBtn}
                    onPress={() => handleSetDefault(item.id)}
                >
                    <Text style={styles.setDefaultBtnText}>Set as Default</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Add Card Modal
    const renderAddCardModal = () => (
        <Modal
            transparent={true}
            visible={showAddCardModal}
            animationType="none"
            onRequestClose={closeAddCardModal}
        >
            <TouchableWithoutFeedback onPress={closeAddCardModal}>
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
                                <Text style={styles.modalTitle}>Add New Card</Text>
                                <Text style={styles.modalSubtitle}>Enter your card details</Text>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalForm}>
                                    <Text style={styles.modalLabel}>Card Number</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="1234 5678 9012 3456"
                                        placeholderTextColor="#999"
                                        value={cardNumber}
                                        onChangeText={(text) => {
                                            const formatted = formatCardNumber(text);
                                            setCardNumber(formatted);
                                        }}
                                        keyboardType="numeric"
                                        maxLength={19}
                                    />
                                </View>

                                <View style={styles.modalForm}>
                                    <Text style={styles.modalLabel}>Card Holder Name</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="John Doe"
                                        placeholderTextColor="#999"
                                        value={cardHolder}
                                        onChangeText={setCardHolder}
                                    />
                                </View>

                                <View style={styles.modalRow}>
                                    <View style={[styles.modalForm, { flex: 1, marginRight: 8 }]}>
                                        <Text style={styles.modalLabel}>Expiry Month</Text>
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="MM"
                                            placeholderTextColor="#999"
                                            value={expiryMonth}
                                            onChangeText={setExpiryMonth}
                                            keyboardType="numeric"
                                            maxLength={2}
                                        />
                                    </View>
                                    <View style={[styles.modalForm, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.modalLabel}>Expiry Year</Text>
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="YY"
                                            placeholderTextColor="#999"
                                            value={expiryYear}
                                            onChangeText={setExpiryYear}
                                            keyboardType="numeric"
                                            maxLength={2}
                                        />
                                    </View>
                                    <View style={[styles.modalForm, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.modalLabel}>CVV</Text>
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="123"
                                            placeholderTextColor="#999"
                                            value={cvv}
                                            onChangeText={setCvv}
                                            keyboardType="numeric"
                                            maxLength={4}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleAddCard}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {isSubmitting ? 'Adding...' : 'Add Card'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeAddCardModal}>
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
                <Text style={styles.headerTitle}>Payment Methods</Text>
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                <FlatList
                    data={cards}
                    renderItem={renderCardItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.headerContainer}>
                            <Text style={styles.subHeader}>Saved Cards</Text>
                            <Text style={styles.cardCount}>{cards.length} cards saved</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>

                            <Image
                                source={require('../../asset/credit-card.png')} // Update the path as needed
                                style={{
                                    width: 64,
                                    height: 64,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight


                                }}
                            />
                            <Text style={styles.emptyTitle}>No Cards Added</Text>
                            <Text style={styles.emptyText}>Add your first card to make payments</Text>
                        </View>
                    }
                />
            </Animated.View>

            {/* Add Card Button - Floating */}
            <TouchableOpacity style={styles.addButton} onPress={openAddCardModal}>
                
                <Image
                    source={require('../../asset/add.png')} // Update the path as needed
                    style={{
                        width: 28,
                        height: 28,
                        resizeMode: 'contain',
                        tintColor: COLORS.white


                    }}
                />
                <Text style={styles.addButtonText}>Add Card</Text>
            </TouchableOpacity>

            {/* Add Card Modal */}
            {renderAddCardModal()}
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
        paddingBottom: 100,
    },
    listContent: {
        paddingVertical: 16,
    },
    headerContainer: {
        marginBottom: 16,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    cardCount: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    // Card Item - Small & Professional
    cardItem: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        letterSpacing: 1,
    },
    cardExpiry: {
        fontSize: 11,
        color: '#999999',
        marginTop: 1,
    },
    cardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    defaultBadge: {
        backgroundColor: '#76577F',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    defaultBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    deleteBtn: {
        padding: 4,
    },
    setDefaultBtn: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    setDefaultBtnText: {
        fontSize: 12,
        color: '#76577F',
        fontWeight: '500',
    },
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    // Add Button
    addButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#76577F',
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
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
        maxHeight: height * 0.8,
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
        marginBottom: 20,
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
    modalForm: {
        marginBottom: 16,
    },
    modalRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
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
    submitButton: {
        backgroundColor: '#76577F',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
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

export default ManagePaymentScreen;