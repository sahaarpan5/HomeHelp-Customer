import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import API from '../../util/API';
import {
    useFocusEffect
} from '@react-navigation/native';
import Loader from '../../util/Loader';


const { width, height } = Dimensions.get('window');

const ManageAddressScreen = ({ navigation }) => {
    // States
    const [addresses, setAddresses] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [newAddressType, setNewAddressType] = useState('Home');
    const [newAddress, setNewAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAddressUpdating, setIsAddressUpdating] = useState(false);
    const [editAddressType, setEditAddressType] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editAddressId, setEditAddressId] = useState(null);
    const [editFlatNo, setEditFlatNo] = useState('');
    const [editLandmark, setEditLandmark] = useState('');
    const [editPincode, setEditPincode] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editState, setEditState] = useState('');
    const [editIsDefault, setEditIsDefault] = useState(false);
    const [editLatt, setEditLatt] = useState(false);
    const [editLong, setEditLong] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;

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


    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [])
    );


    const fetchAddresses = async () => {
        try {
            setIsLoading(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found. Please login again.'
                );
                return;
            }

            const response = await axios.get(
                API.CUSTOMER_ADDRESSES,
                {
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'Customer Addresses:',
                response.data
            );

            if (response.data?.success === true) {

                const apiAddresses =
                    response.data?.addresses || [];

                const formattedAddresses =
                    apiAddresses.map((item) => ({
                        id: item.addressId,
                        type: item.addressTitle,
                        address: item.addressLine1,
                        addressLine2: item.addressLine2,
                        pinCode: item.pinCode,
                        city: item.city,
                        state: item.state,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        landmark: item.landMark,
                        isDefault: item.isDefault,
                    }));

                setAddresses(formattedAddresses);

            } else {
                setAddresses([]);
            }

        } catch (error) {

            console.log(
                'Fetch addresses error:',
                error
            );

            console.log(
                'Fetch addresses response:',
                error.response?.data
            );

            Alert.alert(
                'Error',
                error.response?.data?.message ||
                'Unable to load addresses.'
            );

        } finally {
            setIsLoading(false);
        }
    };

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
        setEditFlatNo(item.addressLine2 || '');
        setEditLandmark(item.landmark || '');
        setEditPincode(item.pinCode || '');
        setEditCity(item.city || '');
        setEditState(item.state || '');
        setEditLatt(item.latitude || '');
        setEditLong(item.longitude || '');
        setEditIsDefault(item.isDefault || false);
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




    const handleEditAddress = async () => {

        if (!editFlatNo.trim()) {
            Alert.alert('Error', 'Please enter a flat number');
            return;
        }
        if (!editLandmark.trim()) {
            Alert.alert('Error', 'Please enter a landmark');
            return;
        }

        if (!editPincode.trim()) {
            Alert.alert('Error', 'Please enter a pincode');
            return;
        }
        try {
            setIsAddressUpdating(true);

            // --------------------------------
            // GET TOKEN
            // --------------------------------

            const token =
                await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found. Please login again.'
                );
                return;
            }

            // --------------------------------
            // FIND SELECTED ADDRESS
            // --------------------------------



            console.log('Address ID:', editAddressId);




            // --------------------------------
            // PUT REQUEST BODY
            // --------------------------------

            const requestBody = {
                addressTitle: editAddressType || '',

                addressLine1: editAddress || '',

                addressLine2:
                    editFlatNo || '',

                pinCode:
                    editPincode || '',

                city:
                    editCity || '',

                state:
                    editState || '',

                latitude:
                    editLatt || 0,

                longitude:
                    editLong || 0,

                isDefault: editIsDefault || false,

                landMark:
                    editLandmark || '',
            };

            console.log(
                'Set Default Address Request:',
                requestBody
            );

            // --------------------------------
            // UPDATE ADDRESS API
            // --------------------------------

            const response = await axios.put(
                `${API.CUSTOMER_ADDRESS}/${editAddressId}`,
                requestBody,
                {
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'Set Default Address Response:',
                response.data
            );

            // --------------------------------
            // SUCCESS
            // --------------------------------

            if (response.data?.success === true) {

                // Refresh from API.
                // Backend will return default address first.
                setShowEditModal(false);
                await fetchAddresses();



            } else {

                Alert.alert(
                    'Error',
                    response.data?.message ||
                    'Unable to set default address.'
                );
            }

        } catch (error) {

            console.log(
                'Set default address error:',
                error
            );

            console.log(
                'Set default address response:',
                error.response?.data
            );

            Alert.alert(
                'Error',
                error.response?.data?.message ||
                'Unable to set default address.'
            );

        } finally {
            setIsAddressUpdating(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        console.log('Delete Address ID:', id);

        try {
            setIsLoading(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found. Please login again.'
                );
                return;
            }

            const response = await axios.delete(
                `${API.CUSTOMER_DELETE_ADDRESS}/${id}`,
                {
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Delete Address Response:', response.data);

            if (response.data?.success === true) {
                Alert.alert(
                    'Success',
                    response.data?.message || 'Address deleted successfully.'
                );

                // Refresh address list
                await fetchAddresses();
            } else {
                Alert.alert(
                    'Error',
                    response.data?.message || 'Unable to delete address.'
                );
            }

        } catch (error) {
            console.log('Delete Address Error:', error);
            console.log('Delete Address Response:', error.response?.data);

            Alert.alert(
                'Error',
                error.response?.data?.message || 'Unable to delete address.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteAddress = (id) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDeleteAddress(id),
                },
            ]
        );
    };

    const handleSetDefault = async (id) => {
        try {
            setIsLoading(true);

            // --------------------------------
            // GET TOKEN
            // --------------------------------

            const token =
                await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found. Please login again.'
                );
                return;
            }

            // --------------------------------
            // FIND SELECTED ADDRESS
            // --------------------------------

            const selectedItem = addresses.find(
                item => item.id === id
            );

            console.log('Address ID:', id);
            console.log('Selected Address:', selectedItem);

            if (!selectedItem) {
                Alert.alert(
                    'Error',
                    'Address not found.'
                );
                return;
            }

            // --------------------------------
            // PUT REQUEST BODY
            // --------------------------------

            const requestBody = {
                addressTitle: selectedItem.type || '',

                addressLine1: selectedItem.address || '',

                addressLine2:
                    selectedItem.addressLine2 || '',

                pinCode:
                    selectedItem.pinCode || '',

                city:
                    selectedItem.city || '',

                state:
                    selectedItem.state || '',

                latitude:
                    selectedItem.latitude || 0,

                longitude:
                    selectedItem.longitude || 0,

                isDefault: true,

                landMark:
                    selectedItem.landmark || '',
            };

            console.log(
                'Set Default Address Request:',
                requestBody
            );

            // --------------------------------
            // UPDATE ADDRESS API
            // --------------------------------

            const response = await axios.put(
                `${API.CUSTOMER_ADDRESS}/${id}`,
                requestBody,
                {
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'Set Default Address Response:',
                response.data
            );

            // --------------------------------
            // SUCCESS
            // --------------------------------

            if (response.data?.success === true) {

                // Refresh from API.
                // Backend will return default address first.
                await fetchAddresses();

                Alert.alert(
                    'Success',
                    response.data?.message ||
                    'Default address updated successfully.'
                );

            } else {

                Alert.alert(
                    'Error',
                    response.data?.message ||
                    'Unable to set default address.'
                );
            }

        } catch (error) {

            console.log(
                'Set default address error:',
                error
            );

            console.log(
                'Set default address response:',
                error.response?.data
            );

            Alert.alert(
                'Error',
                error.response?.data?.message ||
                'Unable to set default address.'
            );

        } finally {
            setIsLoading(false);
        }
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
                return COLORS.green;
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
                        onPress={() => confirmDeleteAddress(item.id)}
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
                                    editable={false}
                                    numberOfLines={3}
                                />

                                <Text style={[styles.modalLabel, { marginTop: 10 }]}>House/Flat Number</Text>
                                <TextInput
                                    style={[styles.modalInput, { minHeight: 50 }]}
                                    placeholder="Enter your house/flat number"
                                    placeholderTextColor="#999"
                                    value={editFlatNo}
                                    onChangeText={setEditFlatNo}
                                    multiline

                                    numberOfLines={3}
                                />



                                <Text style={[styles.modalLabel, { marginTop: 10 }]}>Landmark</Text>
                                <TextInput
                                    style={[styles.modalInput, { minHeight: 50 }]}
                                    placeholder="Enter your landmark"
                                    placeholderTextColor="#999"
                                    value={editLandmark}
                                    onChangeText={setEditLandmark}
                                    multiline

                                    numberOfLines={3}
                                />

                                <Text style={[styles.modalLabel, { marginTop: 10 }]}>Pincode</Text>
                                <TextInput
                                    style={[styles.modalInput, { minHeight: 50 }]}
                                    placeholder="Enter your pincode"
                                    placeholderTextColor="#999"
                                    value={editPincode}
                                    onChangeText={setEditPincode}
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
                                    {isAddressUpdating ? 'Updating...' : 'Update Address'}
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
                <Text style={styles.headerTitle}>Manage Address</Text>
            </View>


            {isLoading && (
                <View style={styles.loaderOverlay}>
                    <Loader />
                </View>
            )}

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
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddAddressScreen')}>

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
        backgroundColor: '#76577F',
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
    loaderOverlay: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: 'rgba(255,255,255,0.7)',
        zIndex: 999,
    },
});

export default ManageAddressScreen;