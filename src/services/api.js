import axios from 'axios';
import { retryWithBackoff, deduplicatedRequest } from '../utils/retry';

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

const getSessionId = () => {
  let sessionId = localStorage.getItem('prephub_session_id');
  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('prephub_session_id', sessionId);
  }
  return sessionId;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers['x-session-id'] = getSessionId();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const curriculumAPI = {
  getAllTopics: (params = {}) => retryWithBackoff(() => api.get('/curriculum/topics', { params })),
  getPersonalizedTopics: (params = {}) => retryWithBackoff(() => api.get('/curriculum/topics/personalized', { params })),
  getTopicBySlug: (slug) => deduplicatedRequest(`topic-${slug}`, () =>
    retryWithBackoff(() => api.get(`/curriculum/topics/${slug}`))
  ),
  getSectionBySlug: (topicSlug, sectionSlug) => deduplicatedRequest(`section-${topicSlug}-${sectionSlug}`, () =>
    retryWithBackoff(() => api.get(`/curriculum/sections/${topicSlug}/${sectionSlug}`))
  ),
  getTopicAggregate: (slug, params = {}) => deduplicatedRequest(`topic-agg-${slug}`, () =>
    retryWithBackoff(() => api.get(`/curriculum/aggregate/topic/${slug}`, { params }))
  ),
  getCategoryAggregate: (topicSlug, categorySlug) => deduplicatedRequest(`cat-agg-${topicSlug}-${categorySlug}`, () =>
    retryWithBackoff(() => api.get(`/curriculum/aggregate/category/${topicSlug}/${categorySlug}`))
  ),
  getSectionAggregate: (topicSlug, sectionSlug) => deduplicatedRequest(`sec-agg-${topicSlug}-${sectionSlug}`, () =>
    retryWithBackoff(() => api.get(`/curriculum/aggregate/section/${topicSlug}/${sectionSlug}`))
  ),
  getTopicStatic: (slug) => api.get(`/curriculum/static/topic/${slug}`),
  getCategoryStatic: (topicSlug, categorySlug) =>
    api.get(`/curriculum/static/category/${topicSlug}/${categorySlug}`),
  getSectionStatic: (topicSlug, sectionSlug) =>
    api.get(`/curriculum/static/section/${topicSlug}/${sectionSlug}`)
};

export const aiAPI = {
  explainTopic: (topic, section, context = '', language = 'javascript', experienceLevel = 'advanced') =>
    api.post('/ai/explain', { topic, section, context, language, experienceLevel }),

  askQuestion: (question, context = {}, language = 'javascript', experienceLevel = 'advanced') =>
    api.post('/ai/ask', { question, context, language, experienceLevel }),



  generateQuiz: (topic, section, regenerate = false, language = 'javascript', content = '', experienceLevel = 'advanced') =>
    api.post('/ai/quiz', { topic, section, regenerate, language, content, experienceLevel }),

  translateCode: (codeBlocks, sourceLanguage, targetLanguage) =>
    api.post('/ai/translate-code', { codeBlocks, sourceLanguage, targetLanguage }),

  analyzeCode: (code, mode = 'review', language = 'javascript', experienceLevel = 'advanced') =>
    api.post('/ai/analyze', { code, mode, language, experienceLevel })
};

export const compilerAPI = {
  getLanguages: () => api.get('/compiler/languages'),
  executeCode: (language, code, stdin = '') =>
    api.post('/compiler/execute', { language, code, stdin })
};

export const categoryAPI = {
  getCategoriesByTopic: (topicSlug) => api.get(`/category/${topicSlug}/categories`),
  getCategoryWithSections: (topicSlug, categorySlug) =>
    api.get(`/category/${topicSlug}/categories/${categorySlug}`)
};

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

progressAPI.updateTime = (topicSlug, sectionSlug, minutes) =>
  api.post('/progress/time', { topicSlug, sectionSlug, minutes });

progressAPI.getDueReviews = () => api.get('/progress/reviews/due');
progressAPI.updateReview = (topicSlug, sectionSlug, quality) =>
  api.post('/progress/reviews/update', { topicSlug, sectionSlug, quality });

export const testCaseAPI = {
  generateTestCases: (problemTitle, problemDescription, functionSignature) =>
    api.post('/test-cases/generate', { problemTitle, problemDescription, functionSignature })
};

export const greetingAPI = {
  getPersonalizedGreeting: (data) => api.post('/greetings/personalized', data)
};

export const journeyAPI = {
  getNextAction: (data) => api.post('/journey/next-action', data),
  onboardStep: (data) => api.post('/journey/onboard', data),
  completeOnboarding: (data) => api.post('/journey/complete-onboard', data),
  getPaths: (goal) => api.get('/journey/paths', { params: { goal } })
};

export const authAPI = {
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  syncPreferences: (localPreferences) => api.post('/auth/sync-preferences', { localPreferences })
};

export default api;

