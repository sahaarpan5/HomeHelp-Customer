import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://rms.geniushrtech.com/RMSAPI/api';

// Create axios instance
const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add token
axiosClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🌐 ${config.method.toUpperCase()} ${config.url}`);
        if (config.data) {
            console.log('📦 Request Body:', JSON.stringify(config.data, null, 2));
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.data);
        return response;
    },
    async (error) => {
        console.error('❌ Response error:', error);
        
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('@auth_token');
            // Navigate to login
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;