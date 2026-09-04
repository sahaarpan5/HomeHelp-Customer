import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    Animated,
    TextInput,
    Alert,
    Modal,
    TouchableWithoutFeedback,
    PermissionsAndroid,
    Platform,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API from '../../util/API';
import Loader from '../../util/Loader';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';

const { width, height } = Dimensions.get('window');

const ProfileUpdateScreen = ({ navigation }) => {
    // States
    const [profileImage, setProfileImage] = useState(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [isUpdateLoading, setIsUpdateLoading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [isProfileUpdateLoading, setIsProfileUpdateLoading] = useState(false);
    const [documentUploadProgress, setDocumentUploadProgress] = useState(0);


    // Only ONE field can be focused at a time
    const [focusedField, setFocusedField] = useState(null);

    const [tempData, setTempData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
    });

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const COLORS = {
        gold: '#C9A84C',
        white: '#FFFFFF',
        dark: '#1A1A1A',
        textLight: '#666666',
        lightBg: '#F8F6F0',
        border: '#E8E3D8',
    };

    // Refs for TextInput
    const firstNameInputRef = useRef(null);
    const lastNameInputRef = useRef(null);
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

    useEffect(() => {
        fetchProfile();
    }, []);


    const formatDateWithSlashes = (text) => {
        // Remove all non-numeric characters
        const cleaned = text.replace(/\D/g, '');

        // Format as DD/MM/YYYY
        let formatted = '';
        if (cleaned.length > 0) {
            // Add first two digits (day)
            formatted = cleaned.substring(0, 2);

            // Add slash after day if there are more digits
            if (cleaned.length > 2) {
                formatted += '/';
                // Add month (next two digits)
                formatted += cleaned.substring(2, 4);

                // Add slash after month if there are more digits
                if (cleaned.length > 4) {
                    formatted += '/';
                    // Add year (remaining digits, max 4)
                    formatted += cleaned.substring(4, 8);
                }
            }
        }

        // Limit to 10 characters (DD/MM/YYYY)
        return formatted.substring(0, 10);
    };

    // Add this function before your component
    const handleDateChange = (text) => {
        // If user is deleting, just update the text
        if (text.length < dob.length) {
            setDob(text);
            return;
        }

        // Format the date with slashes
        const formattedDate = formatDateWithSlashes(text);
        setDob(formattedDate);
    };

    const handleSelectPhoto = async () => {
        try {
            // Close photo modal
            setShowPhotoModal(false);

            // ==============================
            // OPEN GALLERY
            // ==============================

            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 1,
                selectionLimit: 1,
            });

            console.log('GALLERY RESULT:', result);

            // User cancelled gallery
            if (result.didCancel) {
                console.log('User cancelled gallery');
                return;
            }

            // Gallery error
            if (result.errorCode) {
                console.log(
                    'GALLERY ERROR:',
                    result.errorCode,
                    result.errorMessage
                );

                Alert.alert(
                    'Gallery Error',
                    result.errorMessage ||
                    'Unable to open gallery.'
                );

                return;
            }

            const asset = result.assets?.[0];

            if (!asset?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to get selected image.'
                );
                return;
            }

            console.log(
                'SELECTED IMAGE URI:',
                asset.uri
            );

            // ==============================
            // OPEN CROP SCREEN
            // ==============================

            const croppedImage =
                await ImagePicker.openCropper({
                    path: asset.uri,

                    // Square profile image
                    width: 800,
                    height: 800,

                    cropping: true,

                    // Circular crop overlay
                    cropperCircleOverlay: true,

                    mediaType: 'photo',

                    compressImageQuality: 0.9,

                    includeBase64: false,

                    freeStyleCropEnabled: false,

                    cropperToolbarTitle: 'Crop Profile Photo',

                    cropperChooseText: 'Use Photo',
                    cropperCancelText: 'Cancel',

                    showCropGuidelines: true,
                    showCropFrame: true,
                });

            console.log(
                'CROPPED GALLERY IMAGE:',
                croppedImage
            );

            // ==============================
            // SET CROPPED IMAGE
            // ==============================

            if (croppedImage?.path) {


                // API call AFTER crop confirmation
                await updateProfileWithImage(
                    croppedImage.path
                );

                console.log(
                    'PROFILE IMAGE UPDATED:',
                    croppedImage.path
                );
            }

        } catch (error) {
            console.log(
                'SELECT GALLERY IMAGE ERROR:',
                error
            );

            // User cancelled crop
            if (
                error?.code === 'E_PICKER_CANCELLED'
            ) {
                console.log(
                    'User cancelled image cropping'
                );
                return;
            }

            Alert.alert(
                'Error',
                error?.message ||
                'Something went wrong while selecting the photo.'
            );
        }
    };

    const handleTakePhoto = async () => {
        try {
            // Close photo selection modal
            setShowPhotoModal(false);

            // Android camera permission
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message:
                            'Genius Home Help needs camera permission to take your profile photo.',
                        buttonPositive: 'Allow',
                        buttonNegative: 'Cancel',
                    }
                );

                if (
                    granted !== PermissionsAndroid.RESULTS.GRANTED
                ) {
                    Alert.alert(
                        'Permission Required',
                        'Camera permission is required to take a photo.'
                    );
                    return;
                }
            }

            // Open camera
            const result = await launchCamera({
                mediaType: 'photo',
                cameraType: 'back',
                quality: 1,
                saveToPhotos: false,
            });

            console.log('CAMERA RESULT:', result);

            // User cancelled camera
            if (result.didCancel) {
                console.log('User cancelled camera');
                return;
            }

            // Camera error
            if (result.errorCode) {
                console.log(
                    'CAMERA ERROR:',
                    result.errorCode,
                    result.errorMessage
                );

                Alert.alert(
                    'Camera Error',
                    result.errorMessage ||
                    'Unable to open camera.'
                );

                return;
            }

            const asset = result.assets?.[0];

            if (!asset?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to get captured image.'
                );
                return;
            }

            console.log('CAPTURED IMAGE URI:', asset.uri);

            // ==============================
            // OPEN CROP SCREEN
            // ==============================

            const croppedImage =
                await ImagePicker.openCropper({
                    path: asset.uri,

                    // Profile photo should be square
                    width: 800,
                    height: 800,

                    cropping: true,
                    cropperCircleOverlay: true,

                    mediaType: 'photo',

                    compressImageQuality: 0.9,

                    includeBase64: false,

                    freeStyleCropEnabled: false,

                    cropperToolbarTitle: 'Crop Profile Photo',

                    cropperChooseText: 'Use Photo',
                    cropperCancelText: 'Cancel',

                    showCropGuidelines: true,
                    showCropFrame: true,
                });

            console.log(
                'CROPPED IMAGE:',
                croppedImage
            );

            if (!croppedImage?.path) {
                return;
            }

            // ==============================
            // SET CROPPED IMAGE
            // ==============================

            await updateProfileWithImage(
                croppedImage.path
            );

            console.log(
                'PROFILE IMAGE UPDATED:',
                croppedImage.path
            );

        } catch (error) {
            console.log(
                'TAKE PHOTO ERROR:',
                error
            );

            // User cancelled crop
            if (
                error?.code === 'E_PICKER_CANCELLED'
            ) {
                console.log('User cancelled crop');
                return;
            }

            Alert.alert(
                'Error',
                error?.message ||
                'Something went wrong while taking the photo.'
            );
        }
    };


    const updateProfileWithImage = async (imagePath) => {
        try {
            // ==============================
            // VALIDATION
            // ==============================

            if (!firstName.trim()) {
                Alert.alert('Error', 'Please enter your first name');
                return;
            }

            if (!lastName.trim()) {
                Alert.alert('Error', 'Please enter your last name');
                return;
            }

            if (!email.trim()) {
                Alert.alert('Error', 'Please enter your email');
                return;
            }

            if (!phone.trim()) {
                Alert.alert('Error', 'Please enter your phone number');
                return;
            }

            if (!dob.trim()) {
                Alert.alert('Error', 'Please enter your date of birth');
                return;
            }

            if (!gender) {
                Alert.alert('Error', 'Please select gender');
                return;
            }

            const dobParts = dob.split('/');

            if (
                dobParts.length !== 3 ||
                dobParts[0].length !== 2 ||
                dobParts[1].length !== 2 ||
                dobParts[2].length !== 4
            ) {
                Alert.alert(
                    'Error',
                    'Please enter date of birth in DD/MM/YYYY format'
                );
                return;
            }

            setIsProfileUpdateLoading(true);
            setDocumentUploadProgress(0);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found'
                );
                return;
            }

            // ==============================
            // DOB
            // ==============================

            const apiDob = convertDobToApiFormat(dob);

            // ==============================
            // FORM DATA
            // ==============================

            const formData = new FormData();

            formData.append(
                'FirstName',
                firstName.trim()
            );

            formData.append(
                'LastName',
                lastName.trim()
            );

            formData.append(
                'Gender',
                gender
            );

            formData.append(
                'Dob',
                apiDob
            );

            formData.append(
                'Email',
                email.trim()
            );

            // ==============================
            // CROPPED IMAGE
            // ==============================

            if (imagePath) {
                const imageName =
                    imagePath.split('/').pop() ||
                    `profile_${Date.now()}.jpg`;

                const extension =
                    imageName
                        .split('.')
                        .pop()
                        ?.toLowerCase() || 'jpg';

                let mimeType = 'image/jpeg';

                if (extension === 'png') {
                    mimeType = 'image/png';
                } else if (extension === 'webp') {
                    mimeType = 'image/webp';
                }

                formData.append('ProfileImage', {
                    uri: imagePath,
                    name: imageName,
                    type: mimeType,
                });

                console.log(
                    'CROPPED IMAGE UPLOADING:',
                    imagePath
                );
            }

            console.log('PROFILE UPDATE STARTED');

            // ==============================
            // API CALL
            // ==============================

            const response = await fetch(
                API.CUSTOMER_PROFILE,
                {
                    method: 'PUT',
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                    onUploadProgress: progressEvent => {
                        if (
                            progressEvent.total
                        ) {
                            const progress =
                                Math.round(
                                    (
                                        progressEvent.loaded *
                                        100
                                    ) /
                                    progressEvent.total
                                );

                            console.log(
                                `Document upload ${progress}%`
                            );

                            setDocumentUploadProgress(
                                progress
                            );
                        }
                    },
                }
            );

            const responseText =
                await response.text();

            console.log(
                'PROFILE UPDATE STATUS:',
                response.status
            );

            console.log(
                'PROFILE UPDATE RESPONSE:',
                responseText
            );

            let data = null;

            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.log(
                    'JSON PARSE ERROR:',
                    error
                );
            }

            if (!response.ok) {
                if (response.status === 401) {
                    Alert.alert(
                        'Session Expired',
                        'Please login again.'
                    );
                } else {
                    Alert.alert(
                        'Error',
                        data?.message ||
                        `Profile update failed (${response.status})`
                    );
                }

                return;
            }

            // ==============================
            // SUCCESS
            // ==============================

            if (data?.success) {
                console.log(
                    'PROFILE UPDATED SUCCESSFULLY'
                );

                // Keep cropped image visible
                setProfileImage(imagePath);
                setDocumentUploadProgress(100);

                // Update temp data
                setTempData({
                    firstName,
                    lastName,
                    email,
                    phone,
                    dob,
                    gender,
                });

                setIsEditing(false);
                setFocusedField(null);

                Alert.alert(
                    'Success',
                    data.message ||
                    'Profile updated successfully.'
                );
            } else {
                Alert.alert(
                    'Error',
                    data?.message ||
                    'Unable to update profile.'
                );
            }

        } catch (error) {
            console.log(
                'PROFILE UPDATE ERROR:',
                error
            );

            Alert.alert(
                'Error',
                error?.message ||
                'Something went wrong while updating profile.'
            );
        } finally {
            setIsProfileUpdateLoading(false);
            setTimeout(() => {
                setDocumentUploadProgress(0);
            }, 500);
        }
    };




    const fetchProfile = async () => {
        try {


            const token = await AsyncStorage.getItem('token');

            console.log('TOKEN:', token ? 'Token Found' : 'Token Not Found');
            console.log('PROFILE API URL:', API.CUSTOMER_PROFILE);

            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            setIsLoading(true);

            const response = await fetch(API.CUSTOMER_PROFILE, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('HTTP STATUS:', response.status);
            console.log('HTTP OK:', response.ok);

            // IMPORTANT: Get raw response first
            const responseText = await response.text();

            console.log('RAW PROFILE RESPONSE:', responseText);

            if (!response.ok) {
                console.log('PROFILE API FAILED');

                if (response.status === 401) {
                    Alert.alert(
                        'Session Expired',
                        'Your session has expired. Please login again.'
                    );
                } else {
                    Alert.alert(
                        'Error',
                        `Profile API failed. Status: ${response.status}`
                    );
                }

                return;
            }

            // Convert raw response to JSON
            let data;

            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.log('JSON PARSE ERROR:', jsonError);
                console.log('SERVER RESPONSE:', responseText);

                Alert.alert(
                    'Error',
                    'Invalid response received from server.'
                );

                return;
            }

            console.log('PROFILE DATA:', data);
            console.log('PROFILE SUCCESS:', data?.success);
            console.log('FIRST NAME:', data?.firstName);
            console.log('LAST NAME:', data?.lastName);
            console.log('EMAIL:', data?.email);
            console.log('MOBILE:', data?.mobileNo);
            console.log('GENDER:', data?.gender);
            console.log('DOB:', data?.dob);
            console.log('IMAGE:', data?.profileImage);

            if (data?.success !== true) {
                Alert.alert(
                    'Error',
                    data?.message || 'Unable to fetch profile'
                );
                return;
            }

            // ==============================
            // PROFILE DATA
            // ==============================

            const profileFirstName = data.firstName || '';
            const profileLastName = data.lastName || '';
            const profileEmail = data.email || '';
            const profilePhone = data.mobileNo || '';
            const profileGender = data.gender || '';

            // ==============================
            // DOB
            // API:
            // 1994-10-28T00:00:00
            //
            // Display:
            // 28/10/1994
            // ==============================

            let profileDob = '';

            if (data.dob) {
                const date = new Date(data.dob);

                if (!isNaN(date.getTime())) {
                    const day = String(
                        date.getDate()
                    ).padStart(2, '0');

                    const month = String(
                        date.getMonth() + 1
                    ).padStart(2, '0');

                    const year = date.getFullYear();

                    profileDob = `${day}/${month}/${year}`;
                }
            }

            // ==============================
            // SET SCREEN DATA
            // ==============================

            setFirstName(profileFirstName);
            setLastName(profileLastName);
            setEmail(profileEmail);
            setPhone(profilePhone);
            setDob(profileDob);
            setGender(profileGender);

            // ==============================
            // SAVE ORIGINAL DATA
            // ==============================

            setTempData({
                firstName: profileFirstName,
                lastName: profileLastName,
                email: profileEmail,
                phone: profilePhone,
                dob: profileDob,
                gender: profileGender,
            });

            // ==============================
            // PROFILE IMAGE
            // ==============================

            if (data.profileImage) {
                setProfileImage(data.profileImage);
                setProfileImage(
                    data.profileImage.startsWith('http')
                        ? data.profileImage
                        : `https://www.geniushomehelp.com/${data.profileImage}`
                );
            } else {
                const fullName =
                    `${profileFirstName} ${profileLastName}`.trim();

                setProfileImage(
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        fullName || 'User'
                    )}&background=C9A84C&color=fff&size=200`
                );
            }

            console.log('PROFILE DATA SET SUCCESSFULLY');

        } catch (error) {
            console.log('FETCH PROFILE ERROR:', error);
            console.log('ERROR MESSAGE:', error?.message);

            Alert.alert(
                'Error',
                error?.message || 'Something went wrong while loading profile.'
            );
        } finally {
            setIsLoading(false);
        }
    };
    const convertDobToApiFormat = (dateString) => {
        // DD/MM/YYYY -> YYYY-MM-DD

        if (!dateString) {
            return '';
        }

        const parts = dateString.split('/');

        if (parts.length !== 3) {
            return '';
        }

        const [day, month, year] = parts;

        return `${year}-${month}-${day}`;
    };


    const handleUpdateProfile = async () => {
        // ==============================
        // VALIDATION
        // ==============================

        if (!firstName.trim()) {
            Alert.alert('Error', 'Please enter your first name');
            firstNameInputRef.current?.focus();
            return;
        }

        if (!lastName.trim()) {
            Alert.alert('Error', 'Please enter your last name');
            lastNameInputRef.current?.focus();
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

        if (!gender) {
            Alert.alert('Error', 'Please select gender');
            return;
        }

        // Validate DOB format
        const dobParts = dob.split('/');

        if (
            dobParts.length !== 3 ||
            dobParts[0].length !== 2 ||
            dobParts[1].length !== 2 ||
            dobParts[2].length !== 4
        ) {
            Alert.alert(
                'Error',
                'Please enter date of birth in DD/MM/YYYY format'
            );
            dobInputRef.current?.focus();
            return;
        }

        try {
            setIsUpdateLoading(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found'
                );
                return;
            }

            // ==============================
            // CONVERT DOB
            // ==============================

            const apiDob = convertDobToApiFormat(dob);

            console.log('DOB Display:', dob);
            console.log('DOB API:', apiDob);

            // ==============================
            // CREATE FORM DATA
            // ==============================

            const formData = new FormData();

            formData.append('FirstName', firstName.trim());
            formData.append('LastName', lastName.trim());
            formData.append('Gender', gender);
            formData.append('Dob', apiDob);
            formData.append('Email', email.trim());

            // ==============================
            // PROFILE IMAGE
            // ==============================

            /*
             * Only append ProfileImage when it is a
             * newly selected local image.
             *
             * Existing API image:
             * App_Data/CustomerProfile/12/xxxxx.png
             *
             * should NOT be sent back as a file.
             */

            if (
                profileImage &&
                (
                    profileImage.startsWith('file://') ||
                    profileImage.startsWith('content://')
                )
            ) {
                const imageName = profileImage.split('/').pop();

                const extension =
                    imageName?.split('.').pop()?.toLowerCase() || 'jpg';

                let mimeType = 'image/jpeg';

                if (extension === 'png') {
                    mimeType = 'image/png';
                } else if (extension === 'jpg' || extension === 'jpeg') {
                    mimeType = 'image/jpeg';
                } else if (extension === 'webp') {
                    mimeType = 'image/webp';
                }

                formData.append('ProfileImage', {
                    uri: profileImage,
                    name: imageName || `profile.${extension}`,
                    type: mimeType,
                });
            }

            console.log('UPDATE PROFILE DATA:', {
                FirstName: firstName.trim(),
                LastName: lastName.trim(),
                Gender: gender,
                Dob: apiDob,
                Email: email.trim(),
                ProfileImage: profileImage,
            });

            // ==============================
            // API CALL
            // ==============================

            const response = await fetch(API.CUSTOMER_PROFILE, {
                method: 'PUT',
                headers: {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                    // DO NOT manually set Content-Type.
                    // React Native will add the multipart boundary.
                },
                body: formData,
            });

            const responseText = await response.text();

            console.log(
                'UPDATE PROFILE STATUS:',
                response.status
            );

            console.log(
                'UPDATE PROFILE RESPONSE:',
                responseText
            );

            let data = null;

            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.log(
                    'Unable to parse update response:',
                    error
                );
            }

            // ==============================
            // API ERROR
            // ==============================

            if (!response.ok) {
                if (response.status === 401) {
                    Alert.alert(
                        'Session Expired',
                        'Please login again.'
                    );
                } else {
                    Alert.alert(
                        'Error',
                        data?.message ||
                        `Profile update failed (${response.status})`
                    );
                }

                return;
            }

            // ==============================
            // SUCCESS
            // ==============================

            if (data?.success) {
                console.log(
                    'PROFILE UPDATED SUCCESSFULLY:',
                    data
                );

                // Update screen with API response
                setFirstName(data.firstName || firstName);
                setLastName(data.lastName || lastName);
                setEmail(data.email || email);
                setPhone(data.mobileNo || phone);
                setGender(data.gender || gender);

                // Convert API DOB back to DD/MM/YYYY
                if (data.dob) {
                    const apiDate = new Date(data.dob);

                    if (!isNaN(apiDate.getTime())) {
                        const day = String(
                            apiDate.getDate()
                        ).padStart(2, '0');

                        const month = String(
                            apiDate.getMonth() + 1
                        ).padStart(2, '0');

                        const year = apiDate.getFullYear();

                        setDob(
                            `${day}/${month}/${year}`
                        );
                    }
                }

                // Update profile image
                if (data.profileImage) {
                    const imageUrl =
                        data.profileImage.startsWith('http')
                            ? data.profileImage
                            : `https://www.geniushomehelp.com/${data.profileImage}`;

                    setProfileImage(imageUrl);
                }

                // Update temp/original data
                setTempData({
                    firstName: data.firstName || firstName,
                    lastName: data.lastName || lastName,
                    email: data.email || email,
                    phone: data.mobileNo || phone,
                    dob: data.dob
                        ? (() => {
                            const date = new Date(data.dob);

                            if (!isNaN(date.getTime())) {
                                const day = String(
                                    date.getDate()
                                ).padStart(2, '0');

                                const month = String(
                                    date.getMonth() + 1
                                ).padStart(2, '0');

                                const year = date.getFullYear();

                                return `${day}/${month}/${year}`;
                            }

                            return dob;
                        })()
                        : dob,
                    gender: data.gender || gender,
                });

                setIsEditing(false);
                setFocusedField(null);

                Alert.alert(
                    'Success',
                    data.message ||
                    'Profile updated successfully.'
                );
            } else {
                Alert.alert(
                    'Error',
                    data?.message ||
                    'Unable to update profile.'
                );
            }

        } catch (error) {
            console.log(
                'UPDATE PROFILE ERROR:',
                error
            );

            Alert.alert(
                'Error',
                error?.message ||
                'Something went wrong while updating profile.'
            );
        } finally {
            setIsUpdateLoading(false);
        }
    };

    // Handle focus - only one field at a time
    const handleInputFocus = (field) => {
        setFocusedField(field);
    };

    // Handle blur
    const handleInputBlur = () => {
        setFocusedField(null);
    };



    const handleImageUpload = () => {
        setShowPhotoModal(true);
    };

    const handleEditPress = () => {
        setIsEditing(true);

        setFirstName(tempData.firstName);
        setLastName(tempData.lastName);
        setEmail(tempData.email);
        setPhone(tempData.phone);
        setDob(tempData.dob);
        setGender(tempData.gender);

        setFocusedField(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);

        setFirstName(tempData.firstName);
        setLastName(tempData.lastName);
        setEmail(tempData.email);
        setPhone(tempData.phone);
        setDob(tempData.dob);
        setGender(tempData.gender);

        setFocusedField(null);

        // Make sure no input remains focused
        firstNameInputRef.current?.blur();
        lastNameInputRef.current?.blur();
        emailInputRef.current?.blur();
        phoneInputRef.current?.blur();
        dobInputRef.current?.blur();
    };

    const renderGenderSelection = () => (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>

            <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map((option) => {
                    const isSelected = gender === option;

                    return (
                        <TouchableOpacity
                            key={option}
                            activeOpacity={0.7}
                            disabled={!isEditing}
                            onPress={() => {
                                if (isEditing) {
                                    setGender(option);
                                    console.log('Selected Gender:', option);
                                }
                            }}
                            style={[
                                styles.genderOption,
                                isSelected && styles.genderOptionSelected,
                                !isEditing && styles.genderOptionDisabled,
                            ]}
                        >
                            <View
                                style={[
                                    styles.radioCircle,
                                    isSelected && styles.radioCircleSelected,
                                ]}
                            >
                                {isSelected && (
                                    <View style={styles.radioCircleInner} />
                                )}
                            </View>

                            <Text
                                style={[
                                    styles.genderText,
                                    isSelected && styles.genderTextSelected,
                                    !isEditing && styles.genderTextDisabled,
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#C9A84C"
            />


            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={require('../../asset/arrow-back.png')}
                        style={{
                            width: 24,
                            height: 24,
                            resizeMode: 'contain',
                            tintColor: COLORS.white,
                        }}
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Profile</Text>

                {!isEditing ? (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEditPress}
                    >
                        <Image
                            source={require('../../asset/pencil.png')}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.white,
                            }}
                        />

                        <Text style={styles.editButtonText}>
                            Edit
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[
                                styles.headerActionButton,
                                styles.cancelButton,
                            ]}
                            onPress={handleCancelEdit}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.headerActionButton,
                                styles.saveButton,
                            ]}
                            onPress={handleUpdateProfile}
                        >
                            <Text style={styles.saveButtonText}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Animated.ScrollView
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            {
                                translateY: slideAnim,
                            },
                        ],
                    },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Image */}
                <View style={styles.imageSection}>
                    <TouchableOpacity
                        onPress={handleImageUpload}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.profileImage}
                        />


                        <View style={styles.imageEditBadge}>
                            <Image
                                source={require('../../asset/camera.png')}
                                style={{
                                    width: 18,
                                    height: 18,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.white,
                                }}
                            />
                        </View>

                    </TouchableOpacity>

                    <Text style={styles.imageHint}>
                        {isEditing
                            ? 'Tap to change photo'
                            : 'Profile Photo'}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>

                    {/* ================= FIRST NAME ================= */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>
                            First Name
                        </Text>

                        <View
                            style={[
                                styles.fieldWrapper,
                                focusedField === 'firstName' &&
                                styles.fieldWrapperFocused,
                                !isEditing &&
                                styles.fieldWrapperDisabled,
                            ]}
                        >
                            <View style={styles.fieldIconContainer}>
                                <Image
                                    source={require('../../asset/person-outline.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor:
                                            focusedField ===
                                                'firstName'
                                                ? COLORS.gold
                                                : COLORS.textLight,
                                    }}
                                />
                            </View>

                            <TextInput
                                ref={firstNameInputRef}
                                style={[
                                    styles.fieldInput,
                                    !isEditing &&
                                    styles.fieldInputDisabled,
                                ]}
                                placeholder="Enter your first name"
                                placeholderTextColor="#B0B0B0"
                                value={firstName}
                                onChangeText={setFirstName}

                                onBlur={handleInputBlur}
                                editable={isEditing}
                                returnKeyType="next"
                                blurOnSubmit={false}

                            />
                        </View>
                    </View>

                    {/* ================= LAST NAME ================= */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>
                            Last Name
                        </Text>

                        <View
                            style={[
                                styles.fieldWrapper,
                                focusedField === 'lastName' &&
                                styles.fieldWrapperFocused,
                                !isEditing &&
                                styles.fieldWrapperDisabled,
                            ]}
                        >
                            <View style={styles.fieldIconContainer}>
                                <Image
                                    source={require('../../asset/person-outline.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor:
                                            focusedField ===
                                                'lastName'
                                                ? COLORS.gold
                                                : COLORS.textLight,
                                    }}
                                />
                            </View>

                            <TextInput
                                ref={lastNameInputRef}
                                style={[
                                    styles.fieldInput,
                                    !isEditing &&
                                    styles.fieldInputDisabled,
                                ]}
                                placeholder="Enter your last name"
                                placeholderTextColor="#B0B0B0"
                                value={lastName}
                                onChangeText={setLastName}

                                onBlur={handleInputBlur}
                                editable={isEditing}
                                returnKeyType="next"
                                blurOnSubmit={false}

                            />
                        </View>
                    </View>

                    {/* ================= EMAIL ================= */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>
                            Email Address
                        </Text>

                        <View
                            style={[
                                styles.fieldWrapper,
                                focusedField === 'email' &&
                                styles.fieldWrapperFocused,
                                !isEditing &&
                                styles.fieldWrapperDisabled,
                            ]}
                        >
                            <View style={styles.fieldIconContainer}>
                                <Image
                                    source={require('../../asset/mail.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor:
                                            focusedField === 'email'
                                                ? COLORS.gold
                                                : COLORS.textLight,
                                    }}
                                />
                            </View>

                            <TextInput
                                ref={emailInputRef}
                                style={[
                                    styles.fieldInput,
                                    !isEditing &&
                                    styles.fieldInputDisabled,
                                ]}
                                placeholder="Enter your email"
                                placeholderTextColor="#B0B0B0"
                                value={email}
                                onChangeText={setEmail}

                                onBlur={handleInputBlur}
                                editable={isEditing}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                                blurOnSubmit={false}

                            />
                        </View>
                    </View>

                    {/* ================= PHONE ================= */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>
                            Phone Number
                        </Text>

                        <View
                            style={[
                                styles.fieldWrapper,
                                focusedField === 'phone' &&
                                styles.fieldWrapperFocused,
                                !isEditing &&
                                styles.fieldWrapperDisabled,
                            ]}
                        >
                            <View style={styles.fieldIconContainer}>
                                <Image
                                    source={require('../../asset/telephone.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor:
                                            focusedField === 'phone'
                                                ? COLORS.gold
                                                : COLORS.textLight,
                                    }}
                                />
                            </View>

                            <TextInput
                                ref={phoneInputRef}
                                style={[

                                    styles.fieldInputDisabled,
                                ]}
                                placeholder="Enter phone number"
                                placeholderTextColor="#B0B0B0"
                                value={phone}
                                onChangeText={setPhone}

                                onBlur={handleInputBlur}

                                keyboardType="phone-pad"
                                returnKeyType="next"
                                blurOnSubmit={false}

                            />
                        </View>
                    </View>

                    {/* ================= DATE OF BIRTH ================= */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>
                            Date of Birth
                        </Text>

                        <View
                            style={[
                                styles.fieldWrapper,
                                focusedField === 'dob' &&
                                styles.fieldWrapperFocused,
                                !isEditing &&
                                styles.fieldWrapperDisabled,
                            ]}
                        >
                            <View style={styles.fieldIconContainer}>
                                <Image
                                    source={require('../../asset/calendar-outline.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor:
                                            focusedField === 'dob'
                                                ? COLORS.gold
                                                : COLORS.textLight,
                                    }}
                                />
                            </View>

                            <TextInput
                                ref={dobInputRef}
                                style={[
                                    styles.fieldInput,
                                    !isEditing &&
                                    styles.fieldInputDisabled,
                                ]}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#B0B0B0"
                                value={dob}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                                onBlur={handleInputBlur}
                                editable={isEditing}
                                returnKeyType="done"

                            />
                        </View>
                        <Text style={styles.dateHint}>Format: DD/MM/YYYY (e.g., 15/01/1990)</Text>
                    </View>

                    {/* Gender */}
                    {renderGenderSelection()}
                </View>

                {/* Update Button */}
                {isEditing && (
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdateProfile}
                        disabled={isUpdateLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.updateButtonText}>
                            {isUpdateLoading
                                ? 'Updating...'
                                : 'Update Profile'}
                        </Text>

                        <Image
                            source={require('../../asset/arrow-forward.png')}
                            style={{
                                width: 14,
                                height: 14,
                                resizeMode: 'contain',
                                tintColor: COLORS.white,
                                marginLeft: 8,
                            }}
                        />
                    </TouchableOpacity>
                )}
            </Animated.ScrollView>

            {isLoading && (
                <View style={styles.loaderOverlay}>
                    <Loader />
                </View>
            )}

            <Modal
                visible={showPhotoModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPhotoModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowPhotoModal(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContainer}>
                                {/* Modal Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Update Photo</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowPhotoModal(false)}
                                        style={styles.modalCloseButton}
                                    >
                                        <Image
                                            source={require('../../asset/close.png')}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                resizeMode: 'contain',
                                                tintColor: '#666666',
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Modal Options */}
                                <View style={styles.modalOptions}>
                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={handleTakePhoto}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.modalIconContainer, { backgroundColor: '#F0E6FF' }]}>
                                            <Image
                                                source={require('../../asset/camera.png')}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    resizeMode: 'contain',
                                                    tintColor: '#6C5CE7',
                                                }}
                                            />
                                        </View>
                                        <View style={styles.modalOptionTextContainer}>
                                            <Text style={styles.modalOptionTitle}>Take Photo</Text>
                                            <Text style={styles.modalOptionSubtitle}>Capture using camera</Text>
                                        </View>
                                        <Image
                                            source={require('../../asset/arrow-forward.png')}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                resizeMode: 'contain',
                                                tintColor: '#BDBDBD',
                                            }}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={handleSelectPhoto}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.modalIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                            <Image
                                                source={require('../../asset/gallery.png')}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    resizeMode: 'contain',
                                                    tintColor: '#F39C12',
                                                }}
                                            />
                                        </View>
                                        <View style={styles.modalOptionTextContainer}>
                                            <Text style={styles.modalOptionTitle}>Choose from Gallery</Text>
                                            <Text style={styles.modalOptionSubtitle}>Select from photos</Text>
                                        </View>
                                        <Image
                                            source={require('../../asset/arrow-forward.png')}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                resizeMode: 'contain',
                                                tintColor: '#BDBDBD',
                                            }}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalOption, styles.modalOptionCancel]}
                                        onPress={() => setShowPhotoModal(false)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            <Modal
                visible={isProfileUpdateLoading}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
            >
                <View style={styles.documentLoadingFullScreen}>
                    <View style={styles.experienceLoadingBox}>
                        <ActivityIndicator
                            size="large"
                            color="#FF8C00"
                        />

                        <Text style={styles.experienceLoadingTitle}>
                            Updating Profile Image....
                        </Text>

                        <Text style={styles.experienceLoadingProgress}>
                            {documentUploadProgress}%
                        </Text>

                        <Text style={styles.experienceLoadingSubtitle}>
                            Please wait...
                        </Text>
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

    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },

    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 4,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerActionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        marginLeft: 8,
    },

    cancelButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.3)',
    },

    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    saveButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
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
        shadowOffset: {
            width: 0,
            height: 4,
        },
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
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

    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },

    fieldWrapperDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
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

    fieldInputDisabled: {
        color: '#666666',
    },

    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },

    genderOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8F6F0',
        borderWidth: 2,
        borderColor: '#E8E3D8',
        alignItems: 'center',
        marginHorizontal: 4,
    },

    genderOptionSelected: {
        backgroundColor: 'rgba(201, 168, 76, 0.1)',
        borderColor: '#C9A84C',
    },

    genderOptionDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
    },

    genderText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },

    genderTextSelected: {
        color: '#C9A84C',
        fontWeight: '600',
    },

    genderTextDisabled: {
        color: '#666666',
    },

    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C9A84C',
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 24,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: {
            width: 0,
            height: 4,
        },
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
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#BDBDBD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },

    radioCircleSelected: {
        borderColor: '#C9A84C',
    },

    radioCircleInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#C9A84C',
    },
    dateHint: {
        fontSize: 11,
        color: '#999999',
        marginTop: 4,
        fontStyle: 'italic',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalOptions: {
        paddingVertical: 10,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#FAFAFA',
        marginBottom: 8,
    },
    modalOptionCancel: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    modalIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    modalOptionTextContainer: {
        flex: 1,
    },
    modalOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    modalOptionSubtitle: {
        fontSize: 13,
        color: '#999999',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E17055',
        textAlign: 'center',
    },
    documentLoadingFullScreen: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    experienceLoadingBox: {
        width: 220,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 25,
        paddingHorizontal: 20,
        alignItems: 'center',
        elevation: 10,
    },

    experienceLoadingTitle: {
        marginTop: 15,
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
    },

    experienceLoadingProgress: {
        marginTop: 8,
        fontSize: 22,
        fontWeight: '700',
        color: '#FF8C00',
    },

    experienceLoadingSubtitle: {
        marginTop: 5,
        fontSize: 13,
        color: '#777',
    },
});

export default ProfileUpdateScreen;