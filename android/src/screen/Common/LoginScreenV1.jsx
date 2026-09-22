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
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';



const { width, height } = Dimensions.get('window');

const LoginScreenV1 = ({ navigation }) => {
    // States
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [mpin, setMpin] = useState(['', '', '', '']);
    const [confirmMpin, setConfirmMpin] = useState(['', '', '', '']);
    const [step, setStep] = useState('phone');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [showMpin, setShowMpin] = useState(false);
    const [showConfirmMpin, setShowConfirmMpin] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [isMpinModalVisible, setIsMpinModalVisible] = useState(false);
    const [mpinStep, setMpinStep] = useState('set');

    // Refs
    const otpInputs = useRef([]);
    const mpinInputs = useRef([]);
    const confirmMpinInputs = useRef([]);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const COLORS = {
        gold: '#8B5FBF',
        goldLight: '#A47BD1',
        goldDark: '#5E3A8A',
        goldFade: 'rgba(139, 95, 191, 0.12)',
        goldFadeStrong: 'rgba(139, 95, 191, 0.22)',
        white: '#FFFFFF',
        dark: '#111111',
        textLight: '#555555',
        lightBg: '#FAF7FD',
        border: '#D9C9E8',
        success: '#22C55E',
        shadow: 'rgba(139, 95, 191, 0.25)',
        google: '#DB4437',
        facebook: '#4267B2',
        purple: '#7C3AED',
        pink: '#EC4899',
        blue: '#0EA5E9',
        green: '#10B981',
        red: '#EF4444',
        orange: '#F59E0B',
    };

    useEffect(() => {
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
        ]).start();

        // Pulse animation for create account button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

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


    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '1012631010926-ha4hin2e5uo9sne9tu57bsm28a42rbk7.apps.googleusercontent.com',

            offlineAccess: false,
        });
    }, []);

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

    const handleMpinChange = (text, index) => {
        const newMpin = [...mpin];
        newMpin[index] = text;
        setMpin(newMpin);
        if (text && index < 3) {
            mpinInputs.current[index + 1].focus();
        }
    };

    const handleConfirmMpinChange = (text, index) => {
        const newConfirmMpin = [...confirmMpin];
        newConfirmMpin[index] = text;
        setConfirmMpin(newConfirmMpin);
        if (text && index < 3) {
            confirmMpinInputs.current[index + 1].focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1].focus();
        }
    };

    const handleMpinKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !mpin[index] && index > 0) {
            mpinInputs.current[index - 1].focus();
        }
    };

    const handleConfirmMpinKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !confirmMpin[index] && index > 0) {
            confirmMpinInputs.current[index - 1].focus();
        }
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

                // New customer → Signup
                if (response.data?.isRegistered === false) {

                    navigation.replace('CreateAccountScreen', {
                        mobileNo: response.data?.uniqueMobileNo || phoneNumber,
                        mobileVerified: response.data?.mobileVerified,
                        token: response.data?.token,
                        googleLogin: false,

                    });


                }
                // Existing customer → Dashboard
                else if (response.data?.isRegistered === true) {
                    await AsyncStorage.setItem(
                        'customerMob',
                        String(response.data?.uniqueMobileNo || phoneNumber)
                    );
                    await AsyncStorage.setItem(
                        'token',
                        response.data.token
                    );

                    navigation.replace('DashboardScreen');
                }

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

    const setMPIN = () => {
        const mpinString = mpin.join('');
        if (mpinString.length !== 4) {
            Alert.alert('Invalid MPIN', 'Please enter a complete 4-digit MPIN');
            return;
        }
        setMpinStep('confirm');
        setTimeout(() => {
            if (confirmMpinInputs.current[0]) {
                confirmMpinInputs.current[0].focus();
            }
        }, 100);
    };

    const confirmMPIN = () => {
        const mpinString = mpin.join('');
        const confirmMpinString = confirmMpin.join('');

        if (confirmMpinString.length !== 4) {
            Alert.alert('Invalid PIN', 'Please enter a complete 4-digit PIN');
            return;
        }

        if (mpinString !== confirmMpinString) {
            Alert.alert('PIN Mismatch', 'MPIN and Confirm PIN do not match');
            setMpin(['', '', '', '']);
            setConfirmMpin(['', '', '', '']);
            setMpinStep('set');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsMpinModalVisible(false);
            Alert.alert('Success', 'Account created successfully!');
            navigation.replace('DashboardScreen');
        }, 1500);
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

    const closeMpinModal = () => {
        animateModalOut(() => {
            setIsMpinModalVisible(false);
            setMpin(['', '', '', '']);
            setConfirmMpin(['', '', '', '']);
            setMpinStep('set');
        });
    };


    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);

            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });

            const userInfo = await GoogleSignin.signIn();

            console.log('========== GOOGLE USER ==========');
            console.log(JSON.stringify(userInfo, null, 2));

            const googleUser =
                userInfo?.data?.user ||
                userInfo?.user;

            if (!googleUser) {
                Alert.alert(
                    'Google Login',
                    'Unable to fetch Google account details.'
                );
                return;
            }

            const googleId = googleUser.id || '';
            const firstName = googleUser.givenName || '';
            const lastName = googleUser.familyName || '';
            const email = googleUser.email || '';
            const profileImage = googleUser.photo || '';

            console.log('Google ID:', googleId);
            console.log('First Name:', firstName);
            console.log('Last Name:', lastName);
            console.log('Email:', email);
            console.log('Profile Image:', profileImage);

            navigation.replace('CreateAccountScreen', {
                firstName: firstName,
                lastName: lastName,
                email: email,
                profileImage: profileImage,
                googleId: googleId,
                googleLogin: true,
            });

        } catch (error) {

            console.log('Google Sign-In Error:', error);

            if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled Google Sign-In');

            } else if (error?.code === statusCodes.IN_PROGRESS) {
                Alert.alert(
                    'Please Wait',
                    'Google Sign-In is already in progress.'
                );

            } else if (
                error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
            ) {
                Alert.alert(
                    'Google Play Services',
                    'Google Play Services is not available.'
                );

            } else {
                Alert.alert(
                    'Google Login Error',
                    error?.message || 'Unable to sign in with Google.'
                );
            }

        } finally {
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = () => {
        Alert.alert('Facebook Login', 'Connecting to Facebook...');
    };

    const renderOtpModal = () => (
        <Modal
            transparent={true}
            visible={isOtpModalVisible}
            animationType="none"

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

                                    <Image
                                        source={require('../../asset/shield.png')} // Update the path as needed
                                        style={{
                                            width: 32,
                                            height: 32,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.gold,

                                        }}
                                    />
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
                                        tintColor: '#FFFFFF',

                                    }}
                                />
                            </TouchableOpacity>

                            <View style={styles.resendContainer}>

                                <Image
                                    source={require('../../asset/time-outline.png')} // Update the path as needed
                                    style={{
                                        width: 18,
                                        height: 18,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.textLight,

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

    const renderMpinModal = () => (
        <Modal
            transparent={true}
            visible={isMpinModalVisible}
            animationType="none"
            onRequestClose={closeMpinModal}
        >
            <TouchableWithoutFeedback onPress={closeMpinModal}>
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
                                <View style={[styles.modalIconContainer, { backgroundColor: COLORS.goldDark + '20' }]}>

                                    <Image
                                        source={require('../../asset/lock.png')} // Update the path as needed
                                        style={{
                                            width: 18,
                                            height: 18,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.goldDark,

                                        }}
                                    />
                                </View>
                                <Text style={styles.modalTitle}>
                                    {mpinStep === 'set' ? 'Set MPIN' : 'Confirm MPIN'}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    {mpinStep === 'set'
                                        ? 'Create a 4-digit MPIN for secure login'
                                        : 'Confirm your 4-digit MPIN'}
                                </Text>
                            </View>

                            {mpinStep === 'set' ? (
                                <>
                                    <View style={styles.otpContainer}>
                                        {mpin.map((digit, index) => (
                                            <TextInput
                                                key={index}
                                                ref={(ref) => (mpinInputs.current[index] = ref)}
                                                style={[
                                                    styles.otpInput,
                                                    focusedInput === `mpin-${index}` && styles.otpInputFocused,
                                                    digit && styles.otpInputFilled,
                                                ]}
                                                keyboardType="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChangeText={(text) => handleMpinChange(text, index)}
                                                onKeyPress={(e) => handleMpinKeyPress(e, index)}
                                                onFocus={() => setFocusedInput(`mpin-${index}`)}
                                                onBlur={() => setFocusedInput(null)}
                                                secureTextEntry={!showMpin}
                                                editable={!isLoading}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.showMpinButton}
                                        onPress={() => setShowMpin(!showMpin)}
                                    >
                                        <Image
                                            source={
                                                showMpin
                                                    ? require('../../asset/eye_close.png')
                                                    : require('../../asset/eye_open.png')
                                            }
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: COLORS.gold,
                                                resizeMode: 'contain',
                                            }}
                                        />
                                        <Text style={styles.showMpinText}>
                                            {showMpin ? 'Hide MPIN' : 'Show MPIN'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.otpContainer}>
                                    {confirmMpin.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => (confirmMpinInputs.current[index] = ref)}
                                            style={[
                                                styles.otpInput,
                                                focusedInput === `confirm-${index}` && styles.otpInputFocused,
                                                digit && styles.otpInputFilled,
                                            ]}
                                            keyboardType="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) => handleConfirmMpinChange(text, index)}
                                            onKeyPress={(e) => handleConfirmMpinKeyPress(e, index)}
                                            onFocus={() => setFocusedInput(`confirm-${index}`)}
                                            onBlur={() => setFocusedInput(null)}
                                            secureTextEntry={!showConfirmMpin}
                                            editable={!isLoading}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.modalPrimaryButton,
                                    (mpinStep === 'set'
                                        ? mpin.join('').length !== 4
                                        : confirmMpin.join('').length !== 4) && styles.modalPrimaryButtonDisabled,
                                ]}
                                onPress={mpinStep === 'set' ? setMPIN : confirmMPIN}
                                disabled={
                                    (mpinStep === 'set'
                                        ? mpin.join('').length !== 4
                                        : confirmMpin.join('').length !== 4) || isLoading
                                }
                            >
                                <Text style={styles.modalPrimaryButtonText}>
                                    {isLoading
                                        ? 'Processing...'
                                        : mpinStep === 'set'
                                            ? 'Set MPIN'
                                            : 'Confirm & Create'}
                                </Text>

                                <Image
                                    source={require('../../asset/right-arrow.png')} // Update the path as needed
                                    style={{
                                        width: 20,
                                        height: 20,
                                        resizeMode: 'contain',
                                        tintColor: COLORS.white,

                                    }}
                                />
                            </TouchableOpacity>

                            {mpinStep === 'confirm' && (
                                <TouchableOpacity
                                    style={styles.backToSetMpin}
                                    onPress={() => {
                                        setMpinStep('set');
                                        setConfirmMpin(['', '', '', '']);
                                    }}
                                >

                                    <Image
                                        source={require('../../asset/arrow-back.png')} // Update the path as needed
                                        style={{
                                            width: 18,
                                            height: 18,
                                            resizeMode: 'contain',
                                            tintColor: COLORS.gold,

                                        }}
                                    />
                                    <Text style={styles.backToSetMpinText}>Back to set MPIN</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeMpinModal}>
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const renderWhyChooseHomeHelp = () => {
        const reasons = [
            {
                icon: require('../../asset/shield.png'),
                title: 'Trusted Professionals',
                description: 'Every service provider is verified and background-checked for your safety',
                color: COLORS.purple,
                bg: COLORS.purple + '15',
            },
            {
                icon: require('../../asset/sparkler.png'),
                title: 'Quality Guaranteed',
                description: 'Get premium service with 100% satisfaction guarantee on every booking',
                color: COLORS.gold,
                bg: COLORS.gold + '15',
            },
            {
                icon: require('../../asset/rocket.png'),
                title: 'Quick & Easy Booking',
                description: 'Book trusted professionals in minutes with transparent pricing',
                color: COLORS.blue,
                bg: COLORS.blue + '15',
            },
            {
                icon: require('../../asset/like.png'),
                title: 'Care for Your Home',
                description: 'We treat your home with the same care and respect as our own',
                color: COLORS.pink,
                bg: COLORS.pink + '15',
            },
        ];

        return (
            <View style={styles.whyChooseContainer}>
                <View style={styles.whyChooseHeader}>
                    <View style={styles.whyChooseLine} />
                    <Text style={styles.whyChooseTitle}>✨ Why Choose HomeHelp?</Text>
                    <View style={styles.whyChooseLine} />
                </View>
                <View style={styles.reasonsGrid}>
                    {reasons.map((reason, index) => (
                        <View key={index} style={[styles.reasonCard, { backgroundColor: reason.bg, borderColor: reason.color + '30' }]}>
                            <View style={[styles.reasonIcon, { backgroundColor: reason.color + '20' }]}>
                                <Image
                                    source={reason.icon}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        resizeMode: 'contain',
                                        tintColor: reason.color,
                                    }}
                                />
                            </View>
                            <Text style={styles.reasonTitle}>{reason.title}</Text>
                            <Text style={styles.reasonDescription}>{reason.description}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderPhoneStep = () => (
        <View style={styles.stepContainer}>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Your Home Deserves the Best! 🏠</Text>
                <Text style={styles.welcomeSubtitle}>
                    Connect with verified professionals who care about your home as much as you do
                </Text>
            </View>

            <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                    <View style={styles.stepIconContainer}>

                        <Image
                            source={require('../../asset/telephone.png')} // Update the path as needed
                            style={{
                                width: 28,
                                height: 28,
                                resizeMode: 'contain',
                                tintColor: "#FFFFFF",

                            }}
                        />
                    </View>
                    <Text style={styles.stepTitle}>Login</Text>
                </View>

                <Text style={styles.stepSubtitle}>
                    Enter your mobile number to login or create account
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

                        <Image
                            source={require('../../asset/checked.png')} // Update the path as needed
                            style={{
                                width: 24,
                                height: 24,
                                resizeMode: 'contain',
                                tintColor: COLORS.success,

                            }}
                        />
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        phoneNumber.length !== 10 && styles.primaryButtonDisabled,
                    ]}
                    onPress={sendOTP}
                    disabled={phoneNumber.length !== 10 || isLoading}
                >
                    <Text style={styles.primaryButtonText}>
                        {isLoading ? 'Sending OTP...' : 'Continue with OTP'}
                    </Text>

                    <Image
                        source={require('../../asset/right-arrow.png')} // Update the path as needed
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: 'contain',
                            tintColor: '#FFFFFF',

                        }}
                    />
                </TouchableOpacity>
            </View>

            {/* Social Login Options */}
            <View style={styles.socialContainer}>
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.socialButton, { borderColor: COLORS.google + '50' }]}
                        onPress={handleGoogleLogin}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.socialIconWrapper, { backgroundColor: COLORS.google + '15' }]}>

                            <Image
                                source={require('../../asset/google.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',


                                }}
                            />
                        </View>
                        <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, { borderColor: COLORS.facebook + '50' }]}
                        onPress={handleFacebookLogin}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.socialIconWrapper, { backgroundColor: COLORS.facebook + '15' }]}>

                            <Image
                                source={require('../../asset/fb.png')} // Update the path as needed
                                style={{
                                    width: 24,
                                    height: 24,
                                    resizeMode: 'contain',


                                }}
                            />
                        </View>
                        <Text style={styles.socialButtonText}>Facebook</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Create Account - After Social Login */}
            <Animated.View style={[styles.createAccountHighlight, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.createAccountHighlightContent}>
                    <View style={styles.createAccountHighlightIcon}>

                        <Image
                            source={require('../../asset/person-add.png')} // Update the path as needed
                            style={{
                                width: 24,
                                height: 24,
                                resizeMode: 'contain',
                                tintColor: '#FFFFFF'


                            }}
                        />
                    </View>
                    <View style={styles.createAccountHighlightText}>
                        <Text style={styles.createAccountHighlightTitle}>New to HomeHelp?</Text>
                        <Text style={styles.createAccountHighlightSubtitle}>Create account in 2 minutes</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.createAccountHighlightButton} onPress={() => navigation.navigate('CreateAccountScreen')}>
                    <Text style={styles.createAccountHighlightButtonText}>Sign Up Free</Text>

                    <Image
                        source={require('../../asset/right-arrow.png')} // Update the path as needed
                        style={{
                            width: 18,
                            height: 18,
                            resizeMode: 'contain',
                            tintColor: '#FFFFFF'


                        }}
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* Why Choose HomeHelp */}
            {renderWhyChooseHomeHelp()}

            <Text style={styles.termsText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

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




                                        }}
                                    />
                                </View>

                                <Text style={styles.headerTitle}>
                                    <Text style={styles.headerTitleBold}>H</Text>
                                    <Text style={styles.headerTitleNormal}>ome</Text>
                                    <Text style={styles.headerTitleBold}>H</Text>
                                    <Text style={styles.headerTitleNormal}>elp</Text>
                                </Text>
                            </View>
                            <View style={styles.headerBadge}>
                                <Text style={styles.headerBadgeText}>Premium</Text>
                            </View>
                        </View>
                    </View>

                    {/* Main Content */}
                    {step === 'phone' && renderPhoneStep()}
                </Animated.View>
            </ScrollView>

            {/* OTP Modal */}
            {renderOtpModal()}

            {/* MPIN Modal */}
            {renderMpinModal()}
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
        backgroundColor: '#C9A5E8',
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: 'rgba(94, 58, 138, 0.4)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
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
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        letterSpacing: -0.5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBadge: {
        backgroundColor: 'rgba(255,255,255,0.35)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerBadgeText: {
        fontSize: 11,
        color: '#3B2557',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    stepContainer: {
        width: '100%',
    },
    welcomeContainer: {
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111111',
        marginBottom: 6,
        lineHeight: 30,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#444444',
        lineHeight: 20,
        fontWeight: '500',
    },
    stepCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1.5,
        borderColor: '#D9C9E8',
        shadowColor: 'rgba(139, 95, 191, 0.15)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    stepIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#8B5FBF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111111',
    },
    stepSubtitle: {
        fontSize: 14,
        color: '#444444',
        marginBottom: 20,
        lineHeight: 20,
        fontWeight: '500',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#FAF7FD',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D9C9E8',
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 56,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingRight: 12,
        borderRightWidth: 1.5,
        borderRightColor: '#D9C9E8',
        marginRight: 12,
    },
    countryCodeText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111111',
    },
    phoneInput: {
        flex: 1,
        fontSize: 16,
        color: '#111111',
        paddingVertical: 12,
        fontWeight: '600',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#8B5FBF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        width: '100%',
        shadowColor: 'rgba(94, 58, 138, 0.4)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButtonDisabled: {
        opacity: 0.55,
        shadowOpacity: 0.1,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    // Social Login Styles
    socialContainer: {
        marginTop: 20,
        width: '100%',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: '#D9C9E8',
    },
    dividerText: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '600',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#D9C9E8',
        shadowColor: 'rgba(139, 95, 191, 0.12)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    socialIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111111',
    },
    // Create Account - After Social Login (Highlighted)
    createAccountHighlight: {
        backgroundColor: '#5E3A8A',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        shadowColor: 'rgba(94, 58, 138, 0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    createAccountHighlightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    createAccountHighlightIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    createAccountHighlightText: {
        flexDirection: 'column',
    },
    createAccountHighlightTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    createAccountHighlightSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '500',
        marginTop: 1,
    },
    createAccountHighlightButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        shadowColor: 'rgba(255,255,255,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    createAccountHighlightButtonText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    // Why Choose HomeHelp
    whyChooseContainer: {
        width: '100%',
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5D9F0',
    },
    whyChooseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    whyChooseLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D9C9E8',
    },
    whyChooseTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111111',
    },
    reasonsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    reasonCard: {
        width: (width - 50) / 2,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5D9F0',
        backgroundColor: '#FAF7FD',
    },
    reasonIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    reasonTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111111',
        marginBottom: 4,
    },
    reasonDescription: {
        fontSize: 11,
        color: '#555555',
        lineHeight: 16,
        fontWeight: '500',
    },
    termsText: {
        fontSize: 11,
        color: '#666666',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 16,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
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
        borderWidth: 1,
        borderColor: '#E5D9F0',
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C9A5E8',
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111111',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#555555',
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
    },
    modalHighlight: {

        fontWeight: '700',
        color: '#8B5FBF',
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
        borderColor: '#D9C9E8',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: '#111111',
        backgroundColor: '#FAF7FD',
    },
    otpInputFocused: {

        borderColor: '#8B5FBF',
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(139, 95, 191, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    otpInputFilled: {
        borderColor: '#22C55E',
        backgroundColor: '#FFFFFF',
    },
    modalPrimaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#8B5FBF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        width: '100%',
        shadowColor: 'rgba(94, 58, 138, 0.4)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    modalPrimaryButtonDisabled: {
        opacity: 0.55,
        shadowOpacity: 0.1,
    },
    modalPrimaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
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
        color: '#555555',
        fontWeight: '500',
    },
    resendLink: {
        fontSize: 13,
        color: '#8B5FBF',
        fontWeight: '700',
    },
    modalCloseButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
    },
    modalCloseText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '600',
    },
    showMpinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#FAF7FD',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#D9C9E8',
    },
    showMpinText: {
        fontSize: 13,
        color: '#8B5FBF',
        fontWeight: '700',
    },
    backToSetMpin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FAF7FD',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#D9C9E8',
    },
    backToSetMpinText: {
        fontSize: 13,
        color: '#8B5FBF',
        fontWeight: '700',
    },

    headerTitleBold: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000000',
       fontFamily: 'Segoe UI Bold',
    },
    headerTitleNormal: {
        fontSize: 24,
        color: '#000000',
        fontFamily: 'Segoe UI',
    },
});

export default LoginScreenV1;