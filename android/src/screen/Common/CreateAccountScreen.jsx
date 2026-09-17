import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
    Alert,
    Modal,
    TouchableWithoutFeedback,
    Image,
} from 'react-native';
import API from '../../util/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';


const { width, height } = Dimensions.get('window');

const CreateAccountScreen = ({ navigation, route }) => {
    // States
    const [phoneNumber, setPhoneNumber] = useState('');
    const [token, setToken] = useState('');
    const [mobileVerified, setMobileVerified] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [step, setStep] = useState('phone');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [googleLogin, setGoogleLogin] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    // Profile Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailID, setEmailID] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Refs
    const otpInputs = useRef([]);
    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const emailRef = useRef(null);
    const dobRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const cardSlideAnim = useRef(new Animated.Value(50)).current;
    const cardOpacityAnim = useRef(new Animated.Value(0)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Logo Animation Values
    const phoneLogoScale = useRef(new Animated.Value(0.5)).current;
    const phoneLogoRotate = useRef(new Animated.Value(0)).current;
    const phoneLogoBounce = useRef(new Animated.Value(0)).current;

    const otpLogoScale = useRef(new Animated.Value(0.5)).current;
    const otpLogoRotate = useRef(new Animated.Value(0)).current;
    const otpLogoBounce = useRef(new Animated.Value(0)).current;

    const profileLogoScale = useRef(new Animated.Value(0.5)).current;
    const profileLogoRotate = useRef(new Animated.Value(0)).current;
    const profileLogoBounce = useRef(new Animated.Value(0)).current;

    // Account Icon Animation
    const accountIconScale = useRef(new Animated.Value(0.3)).current;
    const accountIconRotate = useRef(new Animated.Value(0)).current;
    const accountIconBounce = useRef(new Animated.Value(0)).current;

    const COLORS = {
        gold: '#d6bceb',
        goldLight: '#76577F',
        goldDark: '#C4B0D3',
        goldFade: 'rgba(179, 154, 199, 0.1)',
        goldFadeStrong: 'rgba(179, 154, 199, 0.2)',
        white: '#FFFFFF',
        dark: '#1A1A1A',
        textLight: '#666666',
        lightBg: '#F8F6F0',
        border: '#E8E3D8',
        success: '#2ECC71',
        shadow: 'rgba(201, 168, 76, 0.15)',
        purple: '#6C5CE7',
        pink: '#FD79A8',
        blue: '#0984E3',
        green: '#00B894',
    };


    useEffect(() => {
        const mobileNo = route.params?.mobileNo;
        const verified = route.params?.mobileVerified;
        const token = route.params?.token
        const firstName = route.params?.firstName;
        const lastName = route.params?.lastName;
        const emailID = route.params?.email;
        const profileImage = route.params?.profileImage;
        const googleLogin = route.params?.googleLogin;
        setFirstName(firstName || '');
        setLastName(lastName || '');
        setEmailID(emailID || '');
        setProfileImage(profileImage || null);
        setGoogleLogin(googleLogin || false);

        console.log('Mobile No:', mobileNo);
        console.log('Mobile Verified:', verified);

        if (mobileNo) {
            setPhoneNumber(mobileNo);
        }
        if (token) {
            setToken(token);
        }

        if (verified === true) {
            setMobileVerified(true);
            setStep('profile');
            animateProgress();
        }
    }, [route.params]);

    useEffect(() => {
        // Initial animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(cardOpacityAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(cardSlideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Start logo animations
        animatePhoneLogo();
        animateOTPLogo();
        animateProfileLogo();
        animateAccountIcon();

        // Shimmer animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Account Icon Animation
    const animateAccountIcon = () => {
        Animated.sequence([
            Animated.spring(accountIconScale, {
                toValue: 1.3,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(accountIconScale, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(accountIconRotate, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(accountIconBounce, {
                toValue: 1,
                friction: 2,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.spring(accountIconBounce, {
                        toValue: 1.05,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                    Animated.spring(accountIconBounce, {
                        toValue: 1,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                ]),
                { iterations: -1 }
            ).start();
        });
    };

    // Phone Logo Animation
    const animatePhoneLogo = () => {
        Animated.sequence([
            Animated.spring(phoneLogoScale, {
                toValue: 1.2,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(phoneLogoScale, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(phoneLogoRotate, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(phoneLogoBounce, {
                toValue: 1,
                friction: 2,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.spring(phoneLogoBounce, {
                        toValue: 1.05,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                    Animated.spring(phoneLogoBounce, {
                        toValue: 1,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                ]),
                { iterations: -1 }
            ).start();
        });
    };

    // OTP Logo Animation
    const animateOTPLogo = () => {
        Animated.sequence([
            Animated.spring(otpLogoScale, {
                toValue: 1.2,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(otpLogoScale, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(otpLogoRotate, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(otpLogoBounce, {
                toValue: 1,
                friction: 2,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.spring(otpLogoBounce, {
                        toValue: 1.05,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                    Animated.spring(otpLogoBounce, {
                        toValue: 1,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                ]),
                { iterations: -1 }
            ).start();
        });
    };

    // Profile Logo Animation
    const animateProfileLogo = () => {
        Animated.sequence([
            Animated.spring(profileLogoScale, {
                toValue: 1.2,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(profileLogoScale, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(profileLogoRotate, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(profileLogoBounce, {
                toValue: 1,
                friction: 2,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.spring(profileLogoBounce, {
                        toValue: 1.05,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                    Animated.spring(profileLogoBounce, {
                        toValue: 1,
                        friction: 2,
                        tension: 50,
                        useNativeDriver: true,
                    }),
                ]),
                { iterations: -1 }
            ).start();
        });
    };

    // Re-animate logo when step changes
    useEffect(() => {
        if (step === 'phone') {
            animatePhoneLogo();
        } else if (step === 'profile') {
            animateProfileLogo();
        }
    }, [step]);

    useEffect(() => {
        let interval;
        if (timer > 0 && isOtpModalVisible) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, isOtpModalVisible]);

    const handlePhoneChange = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length <= 10) {
            setPhoneNumber(cleaned);
        }
    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 3) {
            otpInputs.current[index + 1].focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1].focus();
        }
    };

    const validatePassword = (pass) => {
        if (pass.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        if (!/[A-Z]/.test(pass)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(pass)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(pass)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true, message: 'Password is strong' };
    };

    const handleDateChange = (text) => {
        const cleaned = text.replace(/[^0-9/]/g, '');
        let formatted = cleaned;
        if (cleaned.length === 2 && !cleaned.includes('/')) {
            formatted = cleaned + '/';
        } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
            formatted = cleaned + '/';
        }
        setDateOfBirth(formatted);
    };

    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    };



    const sendOTP = async () => {
        if (phoneNumber.length !== 10) {
            Alert.alert(
                'Invalid Number',
                'Please enter a valid 10-digit mobile number'
            );
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post(API.SEND_OTP, {
                mobileNo: phoneNumber,
                loginType: 'Customer',
            });

            console.log('SEND OTP RESPONSE:', response.data);

            if (response.data?.success === true) {
                Alert.alert(
                    'OTP Sent',
                    response.data?.message || 'Unable to send OTP'
                );
                setTimer(30);
                setCanResend(false);
                setOtp(['', '', '', '']);

                setIsOtpModalVisible(true);
                animateModalIn();

                setTimeout(() => {
                    otpInputs.current[0]?.focus();
                }, 300);
            } else {
                Alert.alert(
                    'OTP Failed',
                    response.data?.message || 'Unable to send OTP'
                );
            }

        } catch (error) {
            console.log(
                'SEND OTP ERROR:',
                error?.response?.data || error?.message
            );

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to send OTP. Please try again.'
            );

        } finally {
            setIsLoading(false);
        }
    };




    const verifyOTP = async () => {
        const otpString = otp.join('');

        if (otpString.length !== 4) {
            Alert.alert(
                'Invalid OTP',
                'Please enter the complete 4-digit OTP'
            );
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post(API.VERIFY_OTP, {
                mobileNo: phoneNumber,
                otp: otpString,
                loginType: 'Customer',
            });

            console.log('VERIFY OTP RESPONSE:', response.data);

            if (response.data?.success === true) {

                setIsOtpModalVisible(false);
                setStep('profile');
                animateProgress();
                setToken(response.data?.token);

                // New customer → Signup

            } else {
                Alert.alert(
                    'OTP Verification Failed',
                    response.data?.message || 'Invalid OTP'
                );
            }

        } catch (error) {

            console.log(
                'VERIFY OTP ERROR:',
                error?.response?.data || error?.message
            );

            Alert.alert(
                'Verification Failed',
                error?.response?.data?.message ||
                'Unable to verify OTP. Please try again.'
            );

        } finally {
            setIsLoading(false);
        }
    };

    const resendOTP = async () => {
        setIsOtpModalVisible(false);
        try {
            setIsLoading(true);

            const response = await axios.post(API.SEND_OTP, {
                mobileNo: phoneNumber,
                loginType: 'Customer',
            });

            console.log('SEND OTP RESPONSE:', response.data);

            if (response.data?.success === true) {
                setTimer(30);
                setCanResend(false);
                setOtp(['', '', '', '']);

                setIsOtpModalVisible(true);
                animateModalIn();

                setTimeout(() => {
                    otpInputs.current[0]?.focus();
                }, 300);
            } else {
                Alert.alert(
                    'OTP Failed',
                    response.data?.message || 'Unable to send OTP'
                );
            }

        } catch (error) {
            console.log(
                'SEND OTP ERROR:',
                error?.response?.data || error?.message
            );

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to send OTP. Please try again.'
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

    const closeOtpModal = () => {
        animateModalOut(() => {
            setIsOtpModalVisible(false);
            setOtp(['', '', '', '']);
        });
    };

    const animateProgress = () => {
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
        }).start();
    };


    const downloadGoogleImage = async (imageUrl) => {
        try {
            console.log('Downloading Google image:', imageUrl);

            const fileName = `google_profile_${Date.now()}.jpg`;
            const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

            const result = await RNFS.downloadFile({
                fromUrl: imageUrl,
                toFile: filePath,
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
                    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                },
            }).promise;

            console.log('Google image download status:', result.statusCode);
            console.log('Google image path:', filePath);

            if (result.statusCode !== 200) {
                throw new Error(
                    `Image download failed: ${result.statusCode}`
                );
            }

            return {
                uri: `file://${filePath}`,
                name: fileName,
                type: 'image/jpeg',
            };

        } catch (error) {
            console.log(
                'Google image download error:',
                error
            );

            return null;
        }
    };

    const handleCreateAccount = async () => {
        if (!firstName.trim()) {
            Alert.alert('Required', 'Please enter your first name');
            firstNameRef.current?.focus();
            return;
        }
        if (!lastName.trim()) {
            Alert.alert('Required', 'Please enter your last name');
            lastNameRef.current?.focus();
            return;
        }
        if (!emailID) {
            Alert.alert('Required', 'Please enter your email id');
            emailRef.current?.focus();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailID.trim())) {
            Alert.alert('Validation', 'Please enter a valid email id');
            emailRef.current?.focus();
            return;
        }
        if (!gender) {
            Alert.alert('Required', 'Please select your gender');
            return;
        }

        if (!password) {
            Alert.alert('Required', 'Please enter a password');
            passwordRef.current?.focus();
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            Alert.alert('Password Requirements', passwordValidation.message);
            passwordRef.current?.focus();
            return;
        }

        if (!confirmPassword) {
            Alert.alert('Required', 'Please confirm your password');
            confirmPasswordRef.current?.focus();
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
            confirmPasswordRef.current?.focus();
            return;
        }
        console.log('token', token);

        try {
            setIsLoading(true);



            const requestBody = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: emailID.trim(),
                password: password,
                gender: gender,
            };

            console.log('CREATE ACCOUNT REQUEST:', requestBody);

            const response = await axios.post(
                API.REGISTER_CUSTOMER,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'CREATE ACCOUNT RESPONSE:',
                response.data
            );

            if (response.data?.success === true) {

                // Save new token
                // if (response.data?.token) {
                //     await AsyncStorage.setItem(
                //         'token',
                //         response.data.token
                //     );
                // }

                // // Save User ID
                // if (response.data?.userId) {
                //     await AsyncStorage.setItem(
                //         'userId',
                //         String(response.data.userId)
                //     );
                // }

                // // Save Customer ID
                // if (response.data?.customerId) {
                //     await AsyncStorage.setItem(
                //         'customerId',
                //         String(response.data.customerId)
                //     );
                // }

                // await AsyncStorage.setItem(
                //     'customerMob',
                //     String(phoneNumber)
                // );

                // Alert.alert(
                //     'Success',
                //     response.data?.message ||
                //     'Customer registered successfully.'
                // );

                // navigation.replace('DashboardScreen');
                // animateProgress();



                const responseData = response.data;

                // Save token
                if (responseData?.token) {
                    await AsyncStorage.setItem(
                        'token',
                        responseData.token
                    );
                }

                if (responseData?.userId) {
                    await AsyncStorage.setItem(
                        'userId',
                        String(responseData.userId)
                    );
                }

                if (responseData?.customerId) {
                    await AsyncStorage.setItem(
                        'customerId',
                        String(responseData.customerId)
                    );
                }

                await AsyncStorage.setItem(
                    'customerMob',
                    String(phoneNumber)
                );

                // ==================================================
                // GOOGLE REGISTRATION
                // ==================================================

                if (googleLogin === true) {

                    const googleProfileImage =
                        profileImage || route.params?.profileImage;

                    console.log(
                        'Google Profile Image:',
                        googleProfileImage
                    );

                    try {

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

                        // Google registration DOB should be blank
                        formData.append(
                            'Dob',
                            ''
                        );

                        formData.append(
                            'Email',
                            emailID.trim()
                        );

                        // ------------------------------------------
                        // DOWNLOAD GOOGLE PROFILE IMAGE
                        // ------------------------------------------

                        if (
                            googleProfileImage &&
                            googleProfileImage.startsWith('http')
                        ) {

                            const imageFile =
                                await downloadGoogleImage(
                                    googleProfileImage
                                );

                            if (imageFile) {

                                formData.append(
                                    'ProfileImage',
                                    {
                                        uri: imageFile.uri,
                                        name: imageFile.name,
                                        type: imageFile.type,
                                    }
                                );

                                console.log(
                                    'Google image added to FormData'
                                );
                            }
                        }

                        // ------------------------------------------
                        // CALL EDIT PROFILE API
                        // ------------------------------------------

                        const profileResponse =
                            await fetch(
                                API.CUSTOMER_PROFILE,
                                {
                                    method: 'PUT',

                                    headers: {
                                        Accept: '*/*',
                                        Authorization:
                                            `Bearer ${responseData.token}`,
                                    },

                                    body: formData,
                                }
                            );

                        const profileResponseText =
                            await profileResponse.text();

                        console.log(
                            'Edit Profile Response:',
                            profileResponseText
                        );

                        let profileData = null;

                        try {
                            profileData =
                                JSON.parse(profileResponseText);
                        } catch (error) {
                            console.log(
                                'Profile response is not JSON'
                            );
                        }

                        if (!profileResponse.ok) {
                            throw new Error(
                                profileData?.message ||
                                `Profile update failed: ${profileResponse.status}`
                            );
                        }

                        if (profileData?.success === true) {

                            Alert.alert(
                                'Success',
                                'Account created successfully.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () =>
                                            navigation.replace(
                                                'DashboardScreen'
                                            ),
                                    },
                                ]
                            );

                        } else {

                            Alert.alert(
                                'Error',
                                profileData?.message ||
                                'Profile update failed.'
                            );
                        }

                    } catch (error) {

                        console.log(
                            'Google profile update error:',
                            error
                        );

                        Alert.alert(
                            'Error',
                            error.message ||
                            'Failed to update Google profile.'
                        );
                    }

                    return;
                }

                // ==================================================
                // NORMAL REGISTRATION
                // ==================================================

                Alert.alert(
                    'Success',
                    responseData?.message ||
                    'Customer registered successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                                navigation.replace(
                                    'DashboardScreen'
                                ),
                        },
                    ]
                );

            } else {

                Alert.alert(
                    'Create Account Failed',
                    response.data?.message ||
                    'Unable to create account.'
                );
            }

        } catch (error) {

            console.log(
                'CREATE ACCOUNT ERROR:',
                error?.response?.data || error?.message
            );

            Alert.alert(
                'Create Account Failed',
                error?.response?.data?.message ||
                'Something went wrong. Please try again.'
            );

        } finally {
            setIsLoading(false);
        }
    };

    const renderAccountIcon = () => {
        const rotateInterpolate = accountIconRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <Animated.View
                style={[
                    styles.accountIconWrapper,
                    {
                        transform: [
                            { scale: accountIconScale },
                            { rotate: rotateInterpolate },
                            {
                                translateY: accountIconBounce.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -6],
                                })
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.accountIconContainer}>

                    <Image
                        source={require('../../asset/person-add.png')} // Update the path as needed
                        style={{
                            width: 28,
                            height: 28,
                            resizeMode: 'contain',
                            tintColor: '#403746'


                        }}
                    />
                </View>
            </Animated.View>
        );
    };

    const renderPhoneLogo = () => {
        const rotateInterpolate = phoneLogoRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <Animated.View
                style={[
                    styles.logoWrapper,
                    {
                        transform: [
                            { scale: phoneLogoScale },
                            { rotate: rotateInterpolate },
                            {
                                translateY: phoneLogoBounce.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8],
                                })
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.logoContainer}>

                    <Image
                        source={require('../../asset/telephone.png')} // Update the path as needed
                        style={{
                            width: 32,
                            height: 32,
                            resizeMode: 'contain',
                            tintColor:  '#403746'


                        }}
                    />
                </View>
            </Animated.View>
        );
    };

    const renderOTPLogo = () => {
        const rotateInterpolate = otpLogoRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <Animated.View
                style={[
                    styles.logoWrapper,
                    {
                        transform: [
                            { scale: otpLogoScale },
                            { rotate: rotateInterpolate },
                            {
                                translateY: otpLogoBounce.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8],
                                })
                            },
                        ],
                    },
                ]}
            >
                <View style={[styles.logoContainer, { backgroundColor: COLORS.goldLight }]}>

                    <Image
                        source={require('../../asset/shield.png')} // Update the path as needed
                        style={{
                            width: 32,
                            height: 32,
                            resizeMode: 'contain',
                            tintColor:  COLORS.gold


                        }}
                    />
                </View>
            </Animated.View>
        );
    };

    const renderProfileLogo = () => {
        const rotateInterpolate = profileLogoRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });

        return (
            <Animated.View
                style={[
                    styles.logoWrapper,
                    {
                        transform: [
                            { scale: profileLogoScale },
                            { rotate: rotateInterpolate },
                            {
                                translateY: profileLogoBounce.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -8],
                                })
                            },
                        ],
                    },
                ]}
            >
                <View style={[styles.logoContainer, { backgroundColor: COLORS.goldDark }]}>

                    <Image
                        source={require('../../asset/person-outline.png')} // Update the path as needed
                        style={{
                            width: 32,
                            height: 32,
                            resizeMode: 'contain',
                            tintColor:  '#403746'


                        }}
                    />
                </View>
            </Animated.View>
        );
    };

    const renderOtpModal = () => (
        <Modal
            transparent={true}
            visible={isOtpModalVisible}
            animationType="none"
            onRequestClose={closeOtpModal}
        >
            <TouchableWithoutFeedback >
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
                                <View style={[styles.modalIconContainer, { backgroundColor: COLORS.goldLight + '20' }]}>
                                    {renderOTPLogo()}
                                </View>
                                <Text style={styles.modalTitle}>Verify OTP</Text>
                                <Text style={styles.modalSubtitle}>
                                    Enter the 4-digit code sent to <Text style={styles.modalHighlight}>{phoneNumber}</Text>
                                </Text>
                            </View>

                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => (otpInputs.current[index] = ref)}
                                        style={[
                                            styles.otpInput,
                                            focusedInput === `otp-${index}` && styles.otpInputFocused,
                                            digit && styles.otpInputFilled,
                                        ]}
                                        keyboardType="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                        onFocus={() => setFocusedInput(`otp-${index}`)}
                                        onBlur={() => setFocusedInput(null)}
                                        editable={!isLoading}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </View>

                            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                                <TouchableOpacity
                                    style={[
                                        styles.modalPrimaryButton,
                                        otp.join('').length !== 4 && styles.modalPrimaryButtonDisabled,
                                    ]}
                                    onPress={verifyOTP}
                                    disabled={otp.join('').length !== 4 || isLoading}
                                >
                                    <Text style={styles.modalPrimaryButtonText}>
                                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                                    </Text>

                                    <Image
                                        source={require('../../asset/right-arrow.png')} // Update the path as needed
                                        style={{
                                            width: 20,
                                            height: 20,
                                            resizeMode: 'contain',
                                            tintColor:  '#403746'


                                        }}
                                    />
                                </TouchableOpacity>
                            </Animated.View>

                            <View style={styles.resendContainer}>

                                <Image
                                    source={require('../../asset/time-outline.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor:  '#403746'


                                    }}
                                />
                                <Text style={styles.resendText}>
                                    {canResend ? "Didn't receive OTP? " : `Resend in ${timer}s`}
                                </Text>
                                {canResend && (
                                    <TouchableOpacity onPress={resendOTP}>
                                        <Text style={styles.resendLink}>Resend OTP</Text>
                                    </TouchableOpacity>
                                )}
                            </View>


                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const renderPhoneStep = () => (
        <Animated.View
            style={[
                styles.stepContainer,
                {
                    opacity: cardOpacityAnim,
                    transform: [{ translateY: cardSlideAnim }],
                }
            ]}
        >
            <View style={styles.welcomeContainer}>
                <View style={styles.welcomeHeader}>
                    {renderAccountIcon()}
                    <Text style={styles.welcomeTitle}>Create Account</Text>
                </View>
                <Text style={styles.welcomeSubtitle}>
                    Join HomeHelp and connect with verified professionals
                </Text>
            </View>

            <View style={styles.stepCard}>
                <View style={styles.cardShimmer}>
                    <Animated.View
                        style={[
                            styles.shimmerEffect,
                            {
                                transform: [{
                                    translateX: shimmerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-width, width],
                                    }),
                                }],
                            },
                        ]}
                    />
                </View>

                <View style={styles.stepHeader}>
                    {renderPhoneLogo()}
                    <View>
                        <Text style={styles.stepTitle}>Step 1 of 3</Text>
                        <Text style={styles.stepSubtitle}>Mobile Verification</Text>
                    </View>
                </View>

                <Text style={styles.stepDescription}>
                    Enter your mobile number to get started
                </Text>

                <View style={styles.phoneInputContainer}>
                    <View style={styles.countryCode}>
                        <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="9876543210"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        maxLength={10}
                        value={phoneNumber}
                        onChangeText={handlePhoneChange}
                        editable={!isLoading}
                    />
                    {phoneNumber.length === 10 && (
                        <View style={styles.validIcon}>

                            <Image
                                source={require('../../asset/checked.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.success


                                }}
                            />
                        </View>
                    )}
                </View>

                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            phoneNumber.length !== 10 && styles.primaryButtonDisabled,
                        ]}
                        onPress={sendOTP}
                        disabled={phoneNumber.length !== 10 || isLoading}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </Text>

                        <Image
                            source={require('../../asset/right-arrow.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor:  '#403746'


                            }}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Text style={styles.backToLoginText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderProfileStep = () => (
        <Animated.View
            style={[
                styles.stepContainer,
                {
                    opacity: cardOpacityAnim,
                    transform: [{ translateY: cardSlideAnim }],
                }
            ]}
        >
            <View style={styles.welcomeContainer}>
                <View style={styles.welcomeHeader}>
                    {renderAccountIcon()}
                    <Text style={styles.welcomeTitle}>Complete Your Profile</Text>
                </View>
                <Text style={styles.welcomeSubtitle}>
                    Tell us a bit about yourself
                </Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>Step 3 of 3 • Profile Complete</Text>
            </View>

            <View style={styles.stepCard}>
                <View style={styles.cardShimmer}>
                    <Animated.View
                        style={[
                            styles.shimmerEffect,
                            {
                                transform: [{
                                    translateX: shimmerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-width, width],
                                    }),
                                }],
                            },
                        ]}
                    />
                </View>

                <View style={styles.stepHeader}>
                    {renderProfileLogo()}
                    <View>
                        <Text style={styles.stepTitle}>Profile Details</Text>
                        <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
                    </View>
                </View>

                {/* First Name */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <View style={styles.inputContainer}>

                        <Image
                            source={require('../../asset/person-outline.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor:  '#403746',
                                marginRight: 12



                            }}
                        />
                        <TextInput
                            ref={firstNameRef}
                            style={styles.input}
                            placeholder="Enter your first name"
                            placeholderTextColor="#999"
                            value={firstName}
                            onChangeText={setFirstName}
                            returnKeyType="next"
                            onSubmitEditing={() => lastNameRef.current?.focus()}
                        />
                    </View>
                </View>

                {/* Last Name */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <View style={styles.inputContainer}>

                        <Image
                            source={require('../../asset/person-outline.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor:  '#403746',
                                marginRight: 12



                            }}
                        />
                        <TextInput
                            ref={lastNameRef}
                            style={styles.input}
                            placeholder="Enter your last name"
                            placeholderTextColor="#999"
                            value={lastName}
                            onChangeText={setLastName}
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>Email ID</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <View style={styles.inputContainer}>

                        <Image
                            source={require('../../asset/mail.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor:  '#403746',
                                marginRight: 12



                            }}
                        />
                        <TextInput
                            ref={emailRef}
                            style={styles.input}
                            placeholder="Enter your email id"
                            placeholderTextColor="#999"
                            value={emailID}
                            onChangeText={setEmailID}
                            returnKeyType="next"
                            onSubmitEditing={() => dobRef.current?.focus()}
                        />
                    </View>
                </View>

                {/* Gender */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <View style={styles.genderContainer}>

                        <TouchableOpacity
                            style={[
                                styles.genderOption,
                                gender === 'Female' && styles.genderOptionSelected,
                            ]}
                            onPress={() => setGender('Female')}
                            activeOpacity={0.7}
                        >


                            <Image
                                source={require('../../asset/female.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: gender === 'Female' ?  '#403746' : COLORS.gold, // Remove if the PNG is already colored
                                }}
                            />
                            <Text style={[
                                styles.genderText,
                                gender === 'Female' && styles.genderTextSelected,
                            ]}>Female</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.genderOption,
                                gender === 'Male' && styles.genderOptionSelected,
                            ]}
                            onPress={() => setGender('Male')}
                            activeOpacity={0.7}
                        >


                            <Image
                                source={require('../../asset/male.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: gender === 'Male' ?  '#403746' : COLORS.gold, // Remove if the PNG is already colored
                                }}
                            />

                            <Text style={[
                                styles.genderText,
                                gender === 'Male' && styles.genderTextSelected,
                            ]}>Male</Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={[
                                styles.genderOption,
                                gender === 'Other' && styles.genderOptionSelected,
                            ]}
                            onPress={() => setGender('Other')}
                            activeOpacity={0.7}
                        >


                            <Image
                                source={require('../../asset/transgender.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',
                                    tintColor: gender === 'Other' ?  '#403746' : COLORS.gold, // Remove if the PNG is already colored
                                }}
                            />
                            <Text style={[
                                styles.genderText,
                                gender === 'Other' && styles.genderTextSelected,
                            ]}>Other</Text>
                        </TouchableOpacity>
                    </View>
                </View>




                {/* Password Field */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <Image
                            source={require('../../asset/lock.png')}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor:  '#403746',
                                marginRight: 12
                            }}
                        />
                        <TextInput
                            ref={passwordRef}
                            style={styles.input}
                            placeholder="Create a strong password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Image
                                source={
                                    showPassword
                                        ? require('../../asset/eye_open.png')
                                        : require('../../asset/eye_close.png')
                                }
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    {password.length > 0 && (
                        <View style={styles.passwordStrength}>
                            <Text style={[
                                styles.passwordStrengthText,
                                password.length < 6 ? { color: COLORS.red } :
                                    password.length < 8 ? { color: COLORS.orange } :
                                        { color: COLORS.success }
                            ]}>
                                {password.length < 6 ? 'Weak' :
                                    password.length < 8 ? 'Medium' : 'Strong'}
                            </Text>
                            <View style={styles.strengthBar}>
                                <View style={[
                                    styles.strengthFill,
                                    {
                                        width: password.length < 6 ? '33%' :
                                            password.length < 8 ? '66%' : '100%',
                                        backgroundColor: password.length < 6 ? COLORS.red :
                                            password.length < 8 ? COLORS.orange : COLORS.success
                                    }
                                ]} />
                            </View>
                        </View>
                    )}
                </View>

                {/* Confirm Password Field */}
                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <Image
                            source={require('../../asset/lock.png')}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor:  '#403746',
                                marginRight: 12
                            }}
                        />
                        <TextInput
                            ref={confirmPasswordRef}
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            <Image
                                source={
                                    showPassword
                                        ? require('../../asset/eye_open.png')
                                        : require('../../asset/eye_close.png')
                                }
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                    tintColor: COLORS.textLight,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    {confirmPassword.length > 0 && password.length > 0 && (
                        <Text style={[
                            styles.matchText,
                            password === confirmPassword ? { color: COLORS.success } : { color: COLORS.red }
                        ]}>
                            {password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                        </Text>
                    )}
                </View>

                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleCreateAccount}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Text>

                        <Image
                            source={require('../../asset/right-arrow.png')} // Update the path as needed
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor:  '#403746', // Remove if the PNG is already colored
                            }}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => setStep('phone')}
                activeOpacity={0.7}
            >
                <Text style={styles.backToLoginText}>Change Phone Number</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim },
                            ],
                        },
                    ]}
                >
                    {/* Gold Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerLogo}>
                                <View style={styles.headerIcon}>

                                    <Image
                                        source={require('../../asset/genlogo.png')} // Update the path as needed
                                        style={{
                                            width: 55,
                                            height: 55,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.dark



                                        }}
                                    />
                                </View>
                                <Text style={styles.headerTitle}>HomeHelp</Text>
                            </View>
                            <View style={styles.headerBadge}>
                                <Text style={styles.headerBadgeText}>Create Account</Text>
                            </View>
                        </View>
                    </View>

                    {/* Main Content */}
                    {step === 'phone' && renderPhoneStep()}
                    {step === 'profile' && renderProfileStep()}
                </Animated.View>
            </ScrollView>

            {/* OTP Modal */}
            {renderOtpModal()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        backgroundColor: '#d6bceb',
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#403746',
        letterSpacing: -0.5,
    },
    headerBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerBadgeText: {
        fontSize: 11,
        color: '#403746',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    stepContainer: {
        width: '100%',
    },
    welcomeContainer: {
        marginBottom: 20,
    },
    welcomeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    accountIconWrapper: {
        marginRight: 4,
    },
    accountIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#d6bceb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1A1A1A',
        lineHeight: 32,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        paddingLeft: 56,
    },
    stepCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E8E3D8',
        shadowColor: 'rgba(201, 168, 76, 0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    cardShimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        overflow: 'hidden',
    },
    shimmerEffect: {
        width: width * 0.5,
        height: '100%',
        backgroundColor: 'rgba(201, 168, 76, 0.04)',
        transform: [{ skewX: '-20deg' }],
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoWrapper: {
        marginRight: 14,
    },
    logoContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#d6bceb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    stepSubtitle: {
        fontSize: 13,
        color: '#666666',
        marginTop: 1,
    },
    stepDescription: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 20,
        lineHeight: 20,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#F8F6F0',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8E3D8',
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 56,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingRight: 12,
        borderRightWidth: 1,
        borderRightColor: '#E8E3D8',
        marginRight: 12,
    },
    countryCodeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    phoneInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        paddingVertical: 12,
    },
    validIcon: {
        marginLeft: 8,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#d6bceb',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        width: '100%',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    primaryButtonText: {
        color: '#403746',
        fontSize: 16,
        fontWeight: '700',
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 14,
        backgroundColor: '#F8F6F0',
        borderWidth: 1,
        borderColor: '#E8E3D8',
    },
    backToLoginText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    // Progress Bar
    progressContainer: {
        marginBottom: 20,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F0EDE8',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#d6bceb',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'right',
    },
    // Profile Form
    inputGroup: {
        marginBottom: 18,
    },
    inputLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    inputRequired: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E17055',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F6F0',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8E3D8',
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        paddingVertical: 12,
    },
    // Gender Selection
    genderContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    genderOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F8F6F0',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 2,
        borderColor: '#E8E3D8',
    },
    genderOptionSelected: {
        backgroundColor: '#d6bceb',
        borderColor: '#d6bceb',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    genderText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
    },
    genderTextSelected: {
        color: '#403746',
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
        minHeight: height * 0.45,
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
        alignItems: 'center',
        marginBottom: 24,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },
    modalHighlight: {
        color: '#d6bceb',
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
        width: '100%',
    },
    otpInput: {
        width: 60,
        height: 60,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E8E3D8',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1A1A',
        backgroundColor: '#F8F6F0',
    },
    otpInputFocused: {
        borderColor: '#d6bceb',
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(201, 168, 76, 0.15)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    otpInputFilled: {
        borderColor: '#2ECC71',
        backgroundColor: '#FFFFFF',
    },
    modalPrimaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#d6bceb',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        width: '100%',
        shadowColor: 'rgba(201, 168, 76, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modalPrimaryButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    modalPrimaryButtonText: {
        color: '#403746',
        fontSize: 16,
        fontWeight: '700',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
        justifyContent: 'center',
    },
    resendText: {
        fontSize: 13,
        color: '#666666',
    },
    resendLink: {
        fontSize: 13,
        color: '#d6bceb',
        fontWeight: '600',
    },
    modalCloseButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
    },
    modalCloseText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
});

export default CreateAccountScreen;