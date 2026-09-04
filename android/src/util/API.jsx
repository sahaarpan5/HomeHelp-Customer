const BASE_URL = 'https://www.geniushomehelp.com/api';

const API = {
     SEND_OTP: `${BASE_URL}/Auth/send-otp`,
     VERIFY_OTP: `${BASE_URL}/Auth/verify-otp`,
     REGISTER_CUSTOMER: `${BASE_URL}/Customer/register`,
     CUSTOMER_PROFILE: `${BASE_URL}/Customer/Profile`,
};

// Add more endpoints here as needed


export default API;