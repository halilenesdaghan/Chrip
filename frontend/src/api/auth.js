import api from './index';

const authService = {
  // Kullanıcı kaydı
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.status === 'success') {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Kullanıcı girişi
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.status === 'success') {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Kullanıcı çıkışı
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Mevcut kullanıcı bilgilerini getir
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Token yenileme
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    if (response.data.status === 'success') {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  // Şifre değiştirme
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  // Şifre sıfırlama isteği
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Şifre sıfırlama
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Kullanıcı giriş yapmış mı kontrolü
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Mevcut kullanıcıyı getir (localStorage'dan)
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;