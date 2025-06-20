import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // For now, just redirect to login as refresh token functionality is not fully implemented
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);

        /* 
        // Uncomment when refresh token functionality is implemented
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/api/v1/users/refresh-token`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
        */
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const submitFeedback = async (data: any, token?: string) => {
  return apiClient.post('/api/v1/feedback/submit', data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const getFeedbackList = async (token?: string) => {
  return apiClient.get('/api/v1/feedback/list', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const submitEmotionVote = async (data: any, token?: string) => {
  return apiClient.post('/api/v1/feedback/emotion-vote', data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}; 