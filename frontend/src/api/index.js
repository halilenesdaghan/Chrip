import axios from 'axios';
import setupMockAxiosInterceptor from './mockInterceptor';

// Ortam değişkenlerini kontrol et
const IS_MOCK_API = true; // Bu değişkeni false yaparak gerçek API'ye bağlanabilirsiniz
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api/v1';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API mi yoksa gerçek API mi kullanılacak?
if (IS_MOCK_API) {
  setupMockAxiosInterceptor();
  console.log('Mock API aktif. Backend olmadan çalışılıyor.');
} else {
  // Request interceptor - isteklere token ekle
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - 401 hatalarını yakala
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token süresi dolmuşsa veya geçersizse kullanıcıyı çıkış yap
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}

export default api;