import axios from 'axios';
import { API_BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 80000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response interceptor for handling responses
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors (session expired)
        if (error.response && error.response.status === 401) {
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Show error toast and redirect to login
            if (window.location.pathname !== '/login') {
                // Import toast dynamically to avoid circular imports
                import('react-hot-toast').then(({ toast }) => {
                    toast.error('Your session has expired. Please login again.');
                });
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
        
        // Handle other errors
        if (error.response) {
            if (error.response.status === 500) {
                console.error("Server error. Please try again later")
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error("A timeout has occurred. Please try again later.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
