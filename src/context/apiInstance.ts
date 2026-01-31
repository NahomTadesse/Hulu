// import axios from 'axios';
// const baseUrl = import.meta.env.VITE_API_URL;
// const apiInstance = axios.create({
//     baseURL: baseUrl,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });
//
//
// export { apiInstance };

import axios from 'axios';

// Assume you have a way to get the token, for example, from localStorage
const getToken = () => localStorage.getItem('token');

const baseUrl = import.meta.env.VITE_API_URL;

const apiInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
apiInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        // Check if the token exists and add it to the Authorization header
        if (token) {
            // Use Bearer token format, which is standard for JWT
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

export { apiInstance };