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

const ManageAddressScreen = ({ navigation }) => {
    // States
    const [addresses, setAddresses] = useState([
        {
            id: '1',
            type: 'Home',
            address: '123, Main Street, Mumbai, Maharashtra - 400001',
            isDefault: true,
        },
        {
            id: '2',
            type: 'Office',
            address: '456, Park Avenue, Mumbai, Maharashtra - 400002',
            isDefault: false,
        },
        {
            id: '3',
            type: 'Other',
            address: '789, Lake View, Mumbai, Maharashtra - 400003',
            isDefault: false,
        },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [newAddressType, setNewAddressType] = useState('Home');
    const [newAddress, setNewAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editAddressType, setEditAddressType] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editAddressId, setEditAddressId] = useState(null);

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

    // Address type options
    const addressTypes = ['Home', 'Office', 'Other'];

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

    const openAddModal = () => {
        setShowAddModal(true);
        setNewAddressType('Home');
        setNewAddress('');
        setTimeout(() => animateModalIn(), 100);
    };

    const closeAddModal = () => {
        animateModalOut(() => {
            setShowAddModal(false);
        });
    };

    const openEditModal = (item) => {
        setSelectedAddress(item);
        setEditAddressId(item.id);
        setEditAddressType(item.type);
        setEditAddress(item.address);
        setShowEditModal(true);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeEditModal = () => {
        animateModalOut(() => {
            setShowEditModal(false);
            setSelectedAddress(null);
        });
    };

    const handleAddAddress = () => {
        if (!newAddress.trim()) {
            Alert.alert('Error', 'Please enter an address');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const newAddressObj = {
                id: Date.now().toString(),
                type: newAddressType,
                address: newAddress,
                isDefault: addresses.length === 0,
            };
            setAddresses([...addresses, newAddressObj]);
            setIsLoading(false);
            closeAddModal();
            Alert.alert('Success', 'Address added successfully');
        }, 1000);
    };

    const handleEditAddress = () => {
        if (!editAddress.trim()) {
            Alert.alert('Error', 'Please enter an address');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const updatedAddresses = addresses.map((item) => {
                if (item.id === editAddressId) {
                    return {
                        ...item,
                        type: editAddressType,
                        address: editAddress,
                    };
                }
                return item;
            });
            setAddresses(updatedAddresses);
            setIsLoading(false);
            closeEditModal();
            Alert.alert('Success', 'Address updated successfully');
        }, 1000);
    };

    const handleDeleteAddress = (id) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setIsLoading(true);
                        setTimeout(() => {
                            const filteredAddresses = addresses.filter((item) => item.id !== id);
                            setAddresses(filteredAddresses);
                            setIsLoading(false);
                            Alert.alert('Success', 'Address deleted successfully');
                        }, 1000);
                    },
                },
            ]
        );
    };

    const handleSetDefault = (id) => {
        const updatedAddresses = addresses.map((item) => ({
            ...item,
            isDefault: item.id === id,
        }));
        setAddresses(updatedAddresses);
    };

    const getAddressTypeIcon = (type) => {
        switch (type) {
            case 'Home':
                return require('../../asset/home.png');

            case 'Office':
                return require('../../asset/briefcase.png');

            case 'Other':
                return require('../../asset/location-outline.png');

            default:
                return require('../../asset/location-outline.png');
        }
    };
    const getAddressTypeColor = (type) => {
        switch (type) {
            case 'Home':
                return COLORS.gold;
            case 'Office':
                return COLORS.blue;
            case 'Other':
                return COLORS.purple;
            default:
                return COLORS.textLight;
        }
    };

    const renderAddressItem = ({ item }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                    <View style={[styles.addressTypeIcon, { backgroundColor: getAddressTypeColor(item.type) + '15' }]}>
                        <Image
                            source={getAddressTypeIcon(item.type)}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: getAddressTypeColor(item.type), // Remove if PNGs are already colored
                            }}
                        />
                    </View>
                    <Text style={styles.addressType}>{item.type}</Text>
                    {item.isDefault && (
                        <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                    )}
                </View>
                <View style={styles.addressActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openEditModal(item)}
                    >

                        <Image
                            source={require('../../asset/pencil.png')} // Update the path as needed
                            style={{
                                width: 14,
                                height: 14,
                                resizeMode: 'contain',
                                tintColor: COLORS.blue


                            }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteAddress(item.id)}
                    >

                        <Image
                            source={require('../../asset/delete.png')} // Update the path as needed
                            style={{
                                width: 14,
                                height: 14,
                                resizeMode: 'contain',
                                tintColor: COLORS.red


                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.addressText}>{item.address}</Text>
            {!item.isDefault && (
                <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(item.id)}
                >
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // Add Address Modal
    const renderAddModal = () => (
        <Modal
            transparent={true}
            visible={showAddModal}
            animationType="none"
            onRequestClose={closeAddModal}
        >
            <TouchableWithoutFeedback onPress={closeAddModal}>
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
                                <Text style={styles.modalTitle}>Add New Address</Text>
                                <Text style={styles.modalSubtitle}>Enter your address details</Text>
                            </View>

                            <View style={styles.modalForm}>
                                <Text style={styles.modalLabel}>Address Type</Text>
                                <View style={styles.typeSelector}>
                                    {addressTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeOption,
                                                newAddressType === type && styles.typeOptionSelected,
                                            ]}
                                            onPress={() => setNewAddressType(type)}
                                        >
                                            <Text style={[
                                                styles.typeOptionText,
                                                newAddressType === type && styles.typeOptionTextSelected,
                                            ]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.modalLabel}>Address</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your full address"
                                    placeholderTextColor="#999"
                                    value={newAddress}
                                    onChangeText={setNewAddress}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.modalPrimaryButton}
                                onPress={handleAddAddress}
                                disabled={isLoading}
                            >
                                <Text style={styles.modalPrimaryButtonText}>
                                    {isLoading ? 'Adding...' : 'Add Address'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeAddModal}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Edit Address Modal
    const renderEditModal = () => (
        <Modal
            transparent={true}
            visible={showEditModal}
            animationType="none"
            onRequestClose={closeEditModal}
        >
            <TouchableWithoutFeedback onPress={closeEditModal}>
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
                                <Text style={styles.modalTitle}>Edit Address</Text>
                                <Text style={styles.modalSubtitle}>Update your address details</Text>
                            </View>

                            <View style={styles.modalForm}>
                                <Text style={styles.modalLabel}>Address Type</Text>
                                <View style={styles.typeSelector}>
                                    {addressTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeOption,
                                                editAddressType === type && styles.typeOptionSelected,
                                            ]}
                                            onPress={() => setEditAddressType(type)}
                                        >
                                            <Text style={[
                                                styles.typeOptionText,
                                                editAddressType === type && styles.typeOptionTextSelected,
                                            ]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.modalLabel}>Address</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your full address"
                                    placeholderTextColor="#999"
                                    value={editAddress}
                                    onChangeText={setEditAddress}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.modalPrimaryButton}
                                onPress={handleEditAddress}
                                disabled={isLoading}
                            >
                                <Text style={styles.modalPrimaryButtonText}>
                                    {isLoading ? 'Updating...' : 'Update Address'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeEditModal}>
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
                            tintColor: COLORS.white


                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Address</Text>
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
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.headerContainer}>
                            <Text style={styles.subHeader}>Saved Addresses</Text>
                            <Text style={styles.addressCount}>{addresses.length} addresses saved</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>

                            <Image
                                source={require('../../asset/location-outline.png')} // Update the path as needed
                                style={{
                                    width: 64,
                                    height: 64,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight


                                }}
                            />
                            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
                            <Text style={styles.emptyText}>Add your first address to get started</Text>
                        </View>
                    }
                />
            </Animated.View>

            {/* Add Address Button - Floating */}
            <TouchableOpacity style={styles.addButton} onPress={()=>navigation.navigate('AddAddressScreen')}>

                <Image
                    source={require('../../asset/add.png')} // Update the path as needed
                    style={{
                        width: 28,
                        height: 28,
                        resizeMode: 'contain',
                        tintColor: COLORS.white


                    }}
                />
                <Text style={styles.addButtonText}>Add Address</Text>
            </TouchableOpacity>

            {/* Add Address Modal */}
            {renderAddModal()}

            {/* Edit Address Modal */}
            {renderEditModal()}
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
    addressCount: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    // Address Card
    addressCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    addressTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addressTypeIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressType: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    defaultBadge: {
        backgroundColor: '#C9A84C',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    addressActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    setDefaultButton: {
        alignSelf: 'flex-start',
    },
    setDefaultText: {
        fontSize: 13,
        color: '#C9A84C',
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
        backgroundColor: '#C9A84C',
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
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    typeOption: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E8E3D8',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    typeOptionSelected: {
        borderColor: '#C9A84C',
        backgroundColor: '#C9A84C',
    },
    typeOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    typeOptionTextSelected: {
        color: '#FFFFFF',
    },
    modalInput: {
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1A1A1A',
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    modalPrimaryButton: {
        backgroundColor: '#C9A84C',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modalPrimaryButtonText: {
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

export default ManageAddressScreen;