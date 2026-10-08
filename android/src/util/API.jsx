const BASE_URL = 'https://www.geniushomehelp.com/api';
const LOCAL = 'https://q4rxnp3k-44307.inc1.devtunnels.ms/api';

const API = {
     SEND_OTP: `${BASE_URL}/Auth/send-otp`,
     VERIFY_OTP: `${BASE_URL}/Auth/verify-otp`,
     REGISTER_CUSTOMER: `${BASE_URL}/Customer/register`,
     CUSTOMER_PROFILE: `${BASE_URL}/Customer/Profile`,
     CUSTOMER_ADDRESS: `${BASE_URL}/Customer/Address`,
     CUSTOMER_ADDRESSES: `${BASE_URL}/Customer/Addresses`,

         // Delete address
    CUSTOMER_DELETE_ADDRESS: `${BASE_URL}/Customer/Address`,
    CUSTOMER_SERVICES: `${BASE_URL}/Service/list-for-customer`,
    CUSTOMER_SERVICE_DETAILS: `${BASE_URL}/Service/get-for-customer`,

    CUSTOMER_BOOKING: `${BASE_URL}/Booking`,
};

// Add more endpoints here as needed


export default API;