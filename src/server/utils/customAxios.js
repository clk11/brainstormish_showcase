import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const save = window.location.href;
      window.history.pushState({}, '', '/');
      if (save !== import.meta.env.VITE_FN_URL)
        window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
