import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
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