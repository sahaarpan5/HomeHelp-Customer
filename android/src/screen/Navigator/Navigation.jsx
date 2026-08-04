import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WelcomeScreen from '../Common/WelcomeScreen';
import LoginScreen from '../Common/LoginScreen';
import CreateAccountScreen from '../Common/CreateAccountScreen';
import DashboardScreen from '../Common/DashboardScreen';
import MyBookingsScreen from '../Common/MyBookingsScreen';
import JobCompletedScreen from '../Common/JobCompletedScreen';
import CancelOrderScreen from '../Common/CancelOrderScreen';
import BookingScheduleScreen from '../Common/BookingScheduleScreen';
import ProfileScreen from '../Common/ProfileScreen';
import ProfileUpdateScreen from '../Common/ProfileUpdateScreen';
import WalletScreen from '../Common/WalletScreen';
import MyRatingsScreen from '../Common/MyRatingsScreen';
import ManageAddressScreen from '../Common/ManageAddressScreen';
import AddAddressScreen from '../Common/AddAddressScreen';
import ManagePaymentScreen from '../Common/ManagePaymentScreen';





const Stack = createNativeStackNavigator();

const Navigation = () => {

  return (
    <SafeAreaProvider >

      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="WelcomeScreen">
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
       <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} />
       <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
       <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} />
       <Stack.Screen name="JobCompletedScreen" component={JobCompletedScreen} />
       <Stack.Screen name="CancelOrderScreen" component={CancelOrderScreen} />
       <Stack.Screen name="BookingScheduleScreen" component={BookingScheduleScreen} />
       <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
       <Stack.Screen name="ProfileUpdateScreen" component={ProfileUpdateScreen} />
       <Stack.Screen name="WalletScreen" component={WalletScreen} />
       <Stack.Screen name="MyRatingsScreen" component={MyRatingsScreen} />
       <Stack.Screen name="ManageAddressScreen" component={ManageAddressScreen} />
        <Stack.Screen name="AddAddressScreen" component={AddAddressScreen} />
        <Stack.Screen name="ManagePaymentScreen" component={ManagePaymentScreen} />
      </Stack.Navigator>

    </SafeAreaProvider>


  );
};

export default Navigation;