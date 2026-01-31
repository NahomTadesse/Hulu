// Add this to ../context/apiInstance.ts after creating apiInstance

import {apiInstance} from "../context/apiInstance.ts";

apiInstance.interceptors.response.use(
    (response) => {

        return response;
    },
    (error) => {
        // Generic error handling logic
        let errorMessage:string = 'An unexpected error occurred. Please try again.';

        if (error.response) {
            // Server responded with a status outside 2xx
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    errorMessage = data.message || 'Bad request. Please check your input.';
                    break;
                case 401:
                    errorMessage = 'Unauthorized. Please log in again.';
                    // Optional: Redirect to login page
                    // window.location.href = '/login';
                    // Or use react-router: history.push('/login') if you have access to history
                    break;
                case 403:
                    errorMessage = 'Forbidden. You do not have permission for this action.';
                    break;
                case 404:
                    errorMessage = 'Resource not found.';
                    break;
                case 500:
                    errorMessage = 'Server error. Please contact support.';
                    break;
                default:
                    errorMessage = data.message || `Error: ${status}`;
            }
        } else if (error.request) {
            // Request was made but no response received (e.g., network issue)
            errorMessage = 'No response from server. Check your network connection.';
        } else {
            // Error setting up the request
            errorMessage = error.message || 'Request setup failed.';
        }

        // Log the error for debugging (use console or a logging service like Sentry)
        console.error('API Error:', error);

        // Show user-friendly feedback (assuming you have react-toastify installed)
        // If not, install it: npm install react-toastify
        // Import and use: import { toast } from 'react-toastify';
        // toast.error(errorMessage);

        // Reject the promise to propagate the error back to the calling function if needed
        return Promise.reject(errorMessage);
    }
);