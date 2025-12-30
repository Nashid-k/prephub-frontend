import axios from 'axios';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
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

// Curriculum API
export const curriculumAPI = {
  getAllTopics: () => api.get('/curriculum/topics'),
  getTopicBySlug: (slug) => api.get(`/curriculum/topics/${slug}`),
  getSectionBySlug: (topicSlug, sectionSlug) => 
    api.get(`/curriculum/sections/${topicSlug}/${sectionSlug}`),
  getCategoryWithSections: (topicSlug, categorySlug) =>
    api.get(`/category/${topicSlug}/categories/${categorySlug}`)
};

// AI API
export const aiAPI = {
  explainTopic: (topic, section, context = '') => 
    api.post('/ai/explain', { topic, section, context }),
  askQuestion: (question, context = {}) => 
    api.post('/ai/ask', { question, context }),
  generateQuestions: (topic, section, difficulty = 'medium') => 
    api.post('/ai/generate-questions', { topic, section, difficulty }),
  generateInterviewQuestions: (topic, type = 'both', difficulty = 'medium') => 
    api.post('/ai/interview-questions', { topic, type, difficulty })
};

// Compiler API
export const compilerAPI = {
  getLanguages: () => api.get('/compiler/languages'),
  executeCode: (language, code, stdin = '') => 
    api.post('/compiler/execute', { language, code, stdin })
};

// Category API
export const categoryAPI = {
  getCategoriesByTopic: (topicSlug) => api.get(`/category/${topicSlug}/categories`),
  getCategoryWithSections: (topicSlug, categorySlug) => 
    api.get(`/category/${topicSlug}/categories/${categorySlug}`)
};

// Progress API
export const progressAPI = {
  toggleProgress: (topicSlug, sectionSlug, completed) => 
    api.post('/progress/toggle', { topicSlug, sectionSlug, completed }),
  getProgress: (topicSlug, sectionSlug) => 
    api.get(`/progress/${topicSlug}/${sectionSlug}`),
  getCategoryProgress: (topicSlug, categorySlug) =>
    api.get(`/progress/category/${topicSlug}/${categorySlug}`),
  getTopicProgress: (topicSlug) =>
    api.get(`/progress/topic/${topicSlug}`),
  getAllProgress: () =>
    api.get('/progress/all')
};

// Test Case API
export const testCaseAPI = {
  generateTestCases: (problemTitle, problemDescription, functionSignature) =>
    api.post('/test-cases/generate', { problemTitle, problemDescription, functionSignature })
};

export default api;
