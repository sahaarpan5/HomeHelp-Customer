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
    ActivityIndicator,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const AddAddressScreen = ({ navigation }) => {
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
    ]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Address Form States
    const [addressType, setAddressType] = useState('Home');
    const [houseFlat, setHouseFlat] = useState('');
    const [landmark, setLandmark] = useState('');
    const [selectedAddress, setSelectedAddress] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Mock search results
    const searchResults = [
        { id: '1', address: '123, Main Street, Andheri East, Mumbai' },
        { id: '2', address: '456, Park Avenue, Bandra West, Mumbai' },
        { id: '3', address: '789, Lake View, Powai, Mumbai' },
        { id: '4', address: '321, Beach Road, Juhu, Mumbai' },
        { id: '5', address: '567, Hill Road, Malabar Hill, Mumbai' },
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

    const openSearchModal = () => {
        setShowSearchModal(true);
        setSearchText('');
        setTimeout(() => animateModalIn(), 100);
    };

    const closeSearchModal = () => {
        animateModalOut(() => {
            setShowSearchModal(false);
        });
    };

    const handleSearchAddress = (address) => {
        setSelectedAddress(address);
        setShowMap(true);
        closeSearchModal();
    };

    const handleUseCurrentLocation = () => {
        setIsLoading(true);
        // Simulate getting current location
        setTimeout(() => {
            setSelectedAddress('Current Location, Mumbai');
            setIsLoading(false);
            setShowMap(true);
        }, 1500);
    };

    const handleConfirmLocation = () => {
        setShowAddForm(true);
        setShowMap(false);
    };

    const handleBackToMap = () => {
        setShowAddForm(false);
        setShowMap(true);
    };

    const handleSubmitAddress = () => {
        if (!houseFlat.trim()) {
            Alert.alert('Error', 'Please enter house/flat number');
            return;
        }
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select an address');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            const newAddress = {
                id: Date.now().toString(),
                type: addressType,
                address: `${houseFlat}, ${selectedAddress}${landmark ? `, ${landmark}` : ''}`,
                isDefault: addresses.length === 0,
            };
            setAddresses([...addresses, newAddress]);
            setIsSubmitting(false);
            Alert.alert('Success', 'Address added successfully');
            navigation.goBack();
        }, 1500);
    };

    // Search Modal
    const renderSearchModal = () => (
        <Modal
            transparent={true}
            visible={showSearchModal}
            animationType="none"
            onRequestClose={closeSearchModal}
        >
            <TouchableWithoutFeedback onPress={closeSearchModal}>
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
                                <Text style={styles.modalTitle}>Search Address</Text>
                                <Text style={styles.modalSubtitle}>Find your location</Text>
                            </View>

                            <View style={styles.searchContainer}>

                                <Image
                                    source={require('../../asset/search.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.textLight


                                    }}
                                />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search for area, street, landmark..."
                                    placeholderTextColor="#999"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchText('')}>

                                        <Image
                                            source={require('../../asset/close-circle.png')} // Update the path as needed
                                            style={{
                                                width: 20,
                                                height: 20,
                                                resizeMode: 'contain',
                                                tintColor: COLORS.textLight


                                            }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.currentLocationButton}
                                onPress={handleUseCurrentLocation}
                            >

                                <Image
                                    source={require('../../asset/location-outline.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                                <Text style={styles.currentLocationText}>Use Current Location</Text>
                                {isLoading && <ActivityIndicator size="small" color={COLORS.gold} />}
                            </TouchableOpacity>

                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.searchResultItem}
                                        onPress={() => handleSearchAddress(item.address)}
                                    >
                                       
                                        <Image
                                            source={require('../../asset/location-outline.png')} // Update the path as needed
                                            style={{
                                                width: 20,
                                                height: 20,
                                                resizeMode: 'contain',
                                                tintColor: COLORS.gold


                                            }}
                                        />
                                        <Text style={styles.searchResultText}>{item.address}</Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    searchText.length > 0 ? (
                                        <View style={styles.noResults}>
                                            <Text style={styles.noResultsText}>No results found</Text>
                                        </View>
                                    ) : null
                                }
                            />

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeSearchModal}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // Map View - Static Image (No external dependency)
    const renderMapView = () => (
        <View style={styles.mapContainer}>
            <View style={styles.mapHeader}>
                <TouchableOpacity onPress={() => setShowMap(false)} style={styles.mapBackButton}>

                    <Image
                        source={require('../../asset/arrow-back.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.dark


                        }}
                    />
                </TouchableOpacity>
                <Text style={styles.mapHeaderTitle}>Select Location</Text>
                <View style={styles.mapHeaderRight} />
            </View>

            <View style={styles.mapPlaceholder}>
                <Image
                    source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=14&size=400x400&markers=color:red%7C19.0760,72.8777' }}
                    style={styles.mapImage}
                    resizeMode="cover"
                />
                <View style={styles.mapMarkerOverlay}>
                    <View style={styles.mapMarkerPin}>
                        <View style={styles.mapMarkerDot} />
                    </View>
                </View>
                <View style={styles.mapOverlayText}>

                    <Image
                        source={require('../../asset/location-outline.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.white


                        }}
                    />
                    <Text style={styles.mapOverlayTitle}>Drag to move pin</Text>
                </View>
            </View>

            <View style={styles.mapBottomBar}>
                <View style={styles.mapAddressPreview}>

                    <Image
                        source={require('../../asset/location-outline.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: COLORS.gold


                        }}
                    />
                    <Text style={styles.mapAddressText} numberOfLines={2}>
                        {selectedAddress || 'Tap to select location'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.confirmLocationButton}
                    onPress={handleConfirmLocation}
                    disabled={!selectedAddress}
                >
                    <Text style={styles.confirmLocationText}>Confirm Location</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Address Form
    const renderAddressForm = () => (
        <View style={styles.formContainer}>
            <View style={styles.formHeader}>
                <TouchableOpacity onPress={handleBackToMap} style={styles.formBackButton}>
                    <Image
                        source={require('../../asset/arrow-back.png')} // Update the path as needed
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.dark
                        }}
                    />
                    
                </TouchableOpacity>
                <Text style={styles.formHeaderTitle}>Add Address Details</Text>
                <View style={styles.formHeaderRight} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}
            >
                <View style={styles.formCard}>
                    <Text style={styles.formLabel}>Selected Address</Text>
                    <View style={styles.selectedAddressContainer}>
                        <Image
                            source={require('../../asset/location-outline.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.gold


                            }}
                        />
                        <Text style={styles.selectedAddressText}>{selectedAddress}</Text>
                    </View>
                    <TouchableOpacity onPress={handleBackToMap} style={styles.changeLocationButton}>
                        <Text style={styles.changeLocationText}>Change Location</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formLabel}>House / Flat Number</Text>
                    <TextInput
                        style={styles.formInput}
                        placeholder="Enter house/flat number"
                        placeholderTextColor="#999"
                        value={houseFlat}
                        onChangeText={setHouseFlat}
                    />
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formLabel}>Landmark (Optional)</Text>
                    <TextInput
                        style={styles.formInput}
                        placeholder="Nearby landmark"
                        placeholderTextColor="#999"
                        value={landmark}
                        onChangeText={setLandmark}
                    />
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formLabel}>Address Type</Text>
                    <View style={styles.typeSelector}>
                        {addressTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeOption,
                                    addressType === type && styles.typeOptionSelected,
                                ]}
                                onPress={() => setAddressType(type)}
                            >
                                <Text style={[
                                    styles.typeOptionText,
                                    addressType === type && styles.typeOptionTextSelected,
                                ]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitAddress}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Adding...' : 'Save Address'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
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
                <Text style={styles.headerTitle}>Add Address</Text>
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
                {!showMap && !showAddForm ? (
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionCard} onPress={openSearchModal}>
                            <View style={[styles.optionIcon, { backgroundColor: COLORS.gold + '15' }]}>

                                <Image
                                    source={require('../../asset/search.png')} // Update the path as needed
                                    style={{
                                        width: 32,
                                        height: 32,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.gold


                                    }}
                                />
                            </View>
                            <Text style={styles.optionTitle}>Search Address</Text>
                            <Text style={styles.optionSubtitle}>Find your location by searching</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionCard} onPress={handleUseCurrentLocation}>
                            <View style={[styles.optionIcon, { backgroundColor: COLORS.blue + '15' }]}>
                                <Image
                                    source={require('../../asset/location-outline.png')} // Update the path as needed
                                    style={{
                                        width: 32,
                                        height: 32,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.blue
                                    }}
                                />
                            </View>
                            <Text style={styles.optionTitle}>Use Current Location</Text>
                            <Text style={styles.optionSubtitle}>Automatically detect your location</Text>
                            {isLoading && <ActivityIndicator style={styles.locationLoader} color={COLORS.blue} />}
                        </TouchableOpacity>
                    </View>
                ) : showMap ? (
                    renderMapView()
                ) : (
                    renderAddressForm()
                )}
            </Animated.View>

            {/* Search Modal */}
            {renderSearchModal()}
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
        paddingTop: 20,
    },
    // Options Container
    optionsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    optionCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    optionIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    locationLoader: {
        marginTop: 8,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        marginLeft: 10,
        paddingVertical: 0,
    },
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#F8F6F0',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    currentLocationText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    searchResultText: {
        fontSize: 14,
        color: '#1A1A1A',
        flex: 1,
    },
    noResults: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: '#666666',
    },
    modalCloseButton: {
        alignItems: 'center',
        marginTop: 8,
        paddingVertical: 8,
    },
    modalCloseText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    // Map View - Static Image
    mapContainer: {
        flex: 1,
        marginHorizontal: -16,
    },
    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    mapBackButton: {
        padding: 4,
    },
    mapHeaderTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    mapHeaderRight: {
        width: 32,
    },
    mapPlaceholder: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#E8E3D8',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapMarkerOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
    },
    mapMarkerPin: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#C9A84C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    mapMarkerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
    },
    mapOverlayText: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    mapOverlayTitle: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    mapBottomBar: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    mapAddressPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    mapAddressText: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    confirmLocationButton: {
        backgroundColor: '#C9A84C',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmLocationText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Address Form
    formContainer: {
        flex: 1,
        marginHorizontal: -16,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDE8',
    },
    formBackButton: {
        padding: 4,
    },
    formHeaderTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    formHeaderRight: {
        width: 32,
    },
    formContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 14,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#F0EDE8',
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    selectedAddressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F8F6F0',
        padding: 12,
        borderRadius: 10,
    },
    selectedAddressText: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
    },
    changeLocationButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    changeLocationText: {
        fontSize: 13,
        color: '#C9A84C',
        fontWeight: '500',
    },
    formInput: {
        backgroundColor: '#F8F6F0',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 10,
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
    submitButton: {
        backgroundColor: '#C9A84C',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 24,
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
});

export default AddAddressScreen;