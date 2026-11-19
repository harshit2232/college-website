import axios from 'axios';
import { handleMockRequest } from './mockRouter';

const apiBaseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` 
  : '/api';

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with intelligent fallback for static cloud deployments
api.interceptors.response.use(
  (response) => {
    const isHtmlResponse =
      typeof response.data === 'string' &&
      (response.data.toLowerCase().includes('<!doctype') ||
       response.data.toLowerCase().includes('<html') ||
       response.headers?.['content-type']?.includes('text/html'));

    if (isHtmlResponse) {
      return handleMockRequest(response.config);
    }
    return response.data;
  },
  async (error) => {
    const status = error.response?.status;
    const isHtmlError =
      typeof error.response?.data === 'string' &&
      (error.response.data.toLowerCase().includes('<!doctype') ||
       error.response.data.toLowerCase().includes('<html') ||
       error.response?.headers?.['content-type']?.includes('text/html'));

    // Check if error is due to missing cloud backend (404, 405 Method Not Allowed, 500, 502, 503, Network Error)
    const isBackendUnavailable =
      !error.response ||
      status === 404 ||
      status === 405 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      isHtmlError;

    if (isBackendUnavailable && error.config) {
      try {
        const fallbackData = await handleMockRequest(error.config);
        return fallbackData;
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default api;
