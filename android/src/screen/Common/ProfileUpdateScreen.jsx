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
    TextInput,
    Alert,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const ProfileUpdateScreen = ({ navigation }) => {
    // States
    const [profileImage, setProfileImage] = useState('https://ui-avatars.com/api/?name=Arpan+Saha&background=C9A84C&color=fff&size=200');
    const [name, setName] = useState('Arpan Saha');
    const [email, setEmail] = useState('arpan@email.com');
    const [phone, setPhone] = useState('+91 98765 43210');
    const [dob, setDob] = useState('15 Jan 1990');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

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

    // Unique field identifiers
    const FIELDS = {
        NAME: 'name',
        EMAIL: 'email',
        PHONE: 'phone',
        DOB: 'dob',
    };

    // Refs for TextInput
    const nameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const phoneInputRef = useRef(null);
    const dobInputRef = useRef(null);

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

    const handleUpdateProfile = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            nameInputRef.current?.focus();
            return;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            emailInputRef.current?.focus();
            return;
        }
        if (!phone.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            phoneInputRef.current?.focus();
            return;
        }
        if (!dob.trim()) {
            Alert.alert('Error', 'Please enter your date of birth');
            dobInputRef.current?.focus();
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        }, 1500);
    };

    const handleImageUpload = () => {
        Alert.alert(
            'Update Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: () => Alert.alert('Camera', 'Camera opened') },
                { text: 'Choose from Gallery', onPress: () => Alert.alert('Gallery', 'Gallery opened') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const renderField = (fieldId, label, value, onChange, icon, placeholder, keyboardType = 'default', secure = false, fieldRef = null, returnKeyType = 'next', onSubmitEditing = null) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={[
                styles.fieldWrapper,
                focusedField === fieldId && styles.fieldWrapperFocused,
            ]}>
                <View style={styles.fieldIconContainer}>
                    <Image
                        source={icon}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor:
                                focusedField === fieldId
                                    ? COLORS.gold
                                    : COLORS.textLight, // Remove if PNG is already colored
                        }}
                    />
                </View>
                <TextInput
                    ref={fieldRef}
                    style={styles.fieldInput}
                    placeholder={placeholder}
                    placeholderTextColor="#B0B0B0"
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboardType}
                    secureTextEntry={secure}
                    onFocus={() => setFocusedField(fieldId)}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize={label === 'Email Address' ? 'none' : 'sentences'}
                    editable={true}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                />
            </View>
        </View>
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
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                    <Text style={styles.saveButtonText}>Save</Text>
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
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Image */}
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={handleImageUpload} activeOpacity={0.8}>
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        <View style={styles.imageEditBadge}>

                            <Image
                                source={require('../../asset/camera.png')} // Update the path as needed
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white


                                }}
                            />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.imageHint}>Tap to change photo</Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    {renderField(
                        FIELDS.NAME,
                        'Full Name',
                        name,
                        setName,
                        require('../../asset/person-outline.png'),
                        'Enter your full name',
                        'default',
                        false,
                        nameInputRef,
                        'next',
                        () => emailInputRef.current?.focus()
                    )}

                    {renderField(
                        FIELDS.EMAIL,
                        'Email Address',
                        email,
                        setEmail,
                        require('../../asset/mail.png'),
                        'Enter your email',
                        'email-address',
                        false,
                        emailInputRef,
                        'next',
                        () => phoneInputRef.current?.focus()
                    )}

                    {renderField(
                        FIELDS.PHONE,
                        'Phone Number',
                        phone,
                        setPhone,
                        require('../../asset/telephone.png'),
                        'Enter phone number',
                        'phone-pad',
                        false,
                        phoneInputRef,
                        'next',
                        () => dobInputRef.current?.focus()
                    )}

                    {/* Date of Birth - Editable Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Date of Birth</Text>
                        <View style={[
                            styles.fieldWrapper,
                            focusedField === FIELDS.DOB && styles.fieldWrapperFocused,
                        ]}>
                            <View style={styles.fieldIconContainer}>

                                <Image
                                    source={require('../../asset/calendar-outline.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor:
                                            focusedField === FIELDS.DOB
                                                ? COLORS.gold
                                                : COLORS.textLight, // Remove if your PNG is already colored
                                    }}
                                />
                            </View>
                            <TextInput
                                ref={dobInputRef}
                                style={styles.fieldInput}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#B0B0B0"
                                value={dob}
                                onChangeText={setDob}
                                keyboardType="default"
                                onFocus={() => setFocusedField(FIELDS.DOB)}
                                onBlur={() => setFocusedField(null)}
                                editable={true}
                                returnKeyType="done"
                                onSubmitEditing={() => {
                                    dobInputRef.current?.blur();
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* Update Button */}
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateProfile}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.updateButtonText}>
                        {isLoading ? 'Updating...' : 'Update Profile'}
                    </Text>

                    <Image
                        source={require('../../asset/arrow-forward.png')} // Update the path as needed
                        style={{
                            width: 14,
                            height: 14,
                            resizeMode: 'contain',
                            tintColor: COLORS.white,
                            marginLeft: 8,


                        }}
                    />
                </TouchableOpacity>
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
    saveButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    // Image Section
    imageSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    imageEditBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#C9A84C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    imageHint: {
        fontSize: 13,
        color: '#666666',
        marginTop: 10,
        fontWeight: '400',
    },
    // Form Card
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0EDE8',
    },
    fieldGroup: {
        marginVertical: 8,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    fieldWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E8E3D8',
        paddingHorizontal: 14,
        height: 52,
    },
    fieldWrapperFocused: {
        borderColor: '#C9A84C',
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(201, 168, 76, 0.1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
    fieldIconContainer: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    fieldInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        paddingVertical: 10,
        fontWeight: '500',
    },
    // Update Button
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C9A84C',
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 24,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    updateButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    updateButtonIcon: {
        marginLeft: 8,
    },
});

export default ProfileUpdateScreen;