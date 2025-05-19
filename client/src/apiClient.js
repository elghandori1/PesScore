// apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Interceptor for responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // If unauthorized, redirect to login
    if (status === 401) {
      window.location.href = "/login"; // or use navigate() inside React components
    }

    return Promise.reject(error);
  }
);

export default apiClient;