import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Interceptor to add JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Get the token from local storage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
