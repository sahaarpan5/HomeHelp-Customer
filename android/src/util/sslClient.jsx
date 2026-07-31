import { fetch as sslFetch } from 'react-native-ssl-pinning';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update BASE_URL to your API
const BASE_URL = 'https://rms.geniushrtech.com/RMSAPI/api';

// Your certificate pins from SSL Labs
const CERTIFICATE_PINS = [
    'FE66sMnpc+cMQMkmoCorjG7YuXzSqS4284tHZSRcH8A=',
    'KqkYYX5LYAYP7XGemqzbtPPIA8x7BS/BbOIcAXf3j2k=',
];

class SSLClient {
    constructor() {
        this.baseURL = BASE_URL;
        this.pins = CERTIFICATE_PINS;
    }

    async getToken() {
        return await AsyncStorage.getItem('@auth_token');
    }

    // Build query string from params object
    buildQueryString(params) {
        if (!params || Object.keys(params).length === 0) return '';
        
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                if (typeof params[key] === 'object' && !Array.isArray(params[key])) {
                    Object.keys(params[key]).forEach(subKey => {
                        queryParams.append(`${key}[${subKey}]`, params[key][subKey]);
                    });
                } else if (Array.isArray(params[key])) {
                    params[key].forEach(value => {
                        queryParams.append(`${key}[]`, value);
                    });
                } else {
                    queryParams.append(key, params[key]);
                }
            }
        });
        
        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : '';
    }

    async request(endpoint, options = {}) {
        const token = await this.getToken();
        
        let url = `${this.baseURL}${endpoint}`;
        
        if (options.method === 'GET' && options.params) {
            url += this.buildQueryString(options.params);
        }
        
        const config = {
            method: options.method || 'GET',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
            sslPinning: {
                certs: this.pins,
                validityCheck: true,
            },
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
            config.body = JSON.stringify(options.body);
        }

        try {
            console.log(`🌐 ${config.method} ${url}`);
            
            if (options.method !== 'GET' && options.body) {
                console.log('📦 Request Body:', JSON.stringify(options.body, null, 2));
            }
            
            const response = await sslFetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    message: errorData.message || response.statusText || 'Request failed',
                    data: errorData,
                };
            }
            
            const data = await response.json();
            console.log('✅ Response:', data);
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            
            if (error.message && error.message.includes('certificate')) {
                error.message = 'SSL Certificate validation failed';
            }
            
            throw error;
        }
    }

    get(endpoint, params = {}, headers = {}) {
        return this.request(endpoint, { method: 'GET', params, headers });
    }

    post(endpoint, body = {}, headers = {}) {
        return this.request(endpoint, { method: 'POST', body, headers });
    }

    put(endpoint, body = {}, headers = {}) {
        return this.request(endpoint, { method: 'PUT', body, headers });
    }

    delete(endpoint, params = {}, headers = {}) {
        return this.request(endpoint, { method: 'DELETE', params, headers });
    }

    patch(endpoint, body = {}, headers = {}) {
        return this.request(endpoint, { method: 'PATCH', body, headers });
    }
}

export default new SSLClient();