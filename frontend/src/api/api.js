import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создание экземпляра axios с базовым URL
const api = axios.create({
  baseURL: API_URL
});

// Добавление перехватчика для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API для материалов
export const materialsApi = {
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
};

// API для квизов
export const quizzesApi = {
  getAll: () => api.get('/quizzes'),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers })
};

// API для прогресса
export const progressApi = {
  getStudentProgress: () => api.get('/progress'),
  getTeacherProgress: () => api.get('/teacher/progress')
};

// API для чата с ИИ
export const chatApi = {
  sendMessage: (message) => api.post('/chat', { message })
};

// API для QR-кодов
export const qrCodeApi = {
  generate: (data) => api.post('/qrcode', data)
};

export default api; 