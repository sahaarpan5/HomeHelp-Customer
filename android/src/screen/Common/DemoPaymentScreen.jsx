import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const DemoPaymentScreen = () => {

  

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                HomeHelp
            </Text>

            <Text style={styles.service}>
                Home Cleaning Service
            </Text>

            <Text style={styles.amount}>
                ₹499
            </Text>

            <TouchableOpacity
                style={styles.payButton}
                activeOpacity={0.8}
                onPress={handleDemoPayment}
            >
                <Text style={styles.payButtonText}>
                    Pay ₹499
                </Text>
            </TouchableOpacity>

        </View>
    );
};

export default DemoPaymentScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5FA',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#76577F',
        marginBottom: 10,
    },

    service: {
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
    },

    amount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#222',
        marginBottom: 30,
    },

    payButton: {
        width: '100%',
        backgroundColor: '#76577F',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    payButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});