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
      </Stack.Navigator>

    </SafeAreaProvider>


  );
};

export default Navigation;