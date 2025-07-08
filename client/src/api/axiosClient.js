import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // To send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;