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

// Generate or retrieve session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('prephub_session_id');
  if (!sessionId) {
    // Generate a unique session ID
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('prephub_session_id', sessionId);
  }
  return sessionId;
};

// Add a request interceptor to include the auth token and session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // For anonymous users, send session ID
      config.headers['x-session-id'] = getSessionId();
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
  getPersonalizedTopics: () => api.get('/curriculum/topics/personalized'),
  getTopicBySlug: (slug) => api.get(`/curriculum/topics/${slug}`),
  getSectionBySlug: (topicSlug, sectionSlug) => 
    api.get(`/curriculum/sections/${topicSlug}/${sectionSlug}`),
  // Aggregate endpoints (includes user progress)
  getTopicAggregate: (slug) => api.get(`/curriculum/aggregate/topic/${slug}`),
  getCategoryAggregate: (topicSlug, categorySlug) =>
    api.get(`/curriculum/aggregate/category/${topicSlug}/${categorySlug}`),
  getSectionAggregate: (topicSlug, sectionSlug) =>
    api.get(`/curriculum/aggregate/section/${topicSlug}/${sectionSlug}`),
  // Static endpoints (NO user progress - globally cacheable)
  getTopicStatic: (slug) => api.get(`/curriculum/static/topic/${slug}`),
  getCategoryStatic: (topicSlug, categorySlug) =>
    api.get(`/curriculum/static/category/${topicSlug}/${categorySlug}`),
  getSectionStatic: (topicSlug, sectionSlug) =>
    api.get(`/curriculum/static/section/${topicSlug}/${sectionSlug}`)
};

// AI API
// AI API
export const aiAPI = {
  explainTopic: (topic, section, context = '', language = 'javascript') => 
    api.post('/ai/explain', { topic, section, context, language }),
  askQuestion: (question, context = {}, language = 'javascript') => 
    api.post('/ai/ask', { question, context, language }),

  generateInterviewQuestions: (topic, type = 'both', difficulty = 'medium') => 
    api.post('/ai/interview-questions', { topic, type, difficulty }),
  generateQuiz: (topic, section, regenerate = false, language = 'javascript') => 
    api.post('/ai/quiz', { topic, section, regenerate, language })
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
    api.get('/progress/all'),
  toggleCategory: (topicSlug, categorySlug, completed) =>
    api.post('/progress/toggle/category', { topicSlug, categorySlug, completed }),
  toggleTopic: (topicSlug, completed) =>
    api.post('/progress/toggle/topic', { topicSlug, completed })
};

// Add time tracking method
progressAPI.updateTime = (topicSlug, sectionSlug, minutes) => 
  api.post('/progress/time', { topicSlug, sectionSlug, minutes });

// Add spaced repetition methods
progressAPI.getDueReviews = () => api.get('/progress/reviews/due');
progressAPI.updateReview = (topicSlug, sectionSlug, quality) =>
  api.post('/progress/reviews/update', { topicSlug, sectionSlug, quality });

// Test Case API
export const testCaseAPI = {
  generateTestCases: (problemTitle, problemDescription, functionSignature) =>
    api.post('/test-cases/generate', { problemTitle, problemDescription, functionSignature })
};

export default api;
