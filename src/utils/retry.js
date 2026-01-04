/**
 * Retry utility with exponential backoff
 * Handles Render free tier cold starts gracefully
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Last attempt - throw error
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⏱️ Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Request deduplication to prevent duplicate simultaneous requests
 */
const pendingRequests = new Map();

export const deduplicatedRequest = async (key, requestFn) => {
  // Check if request is already pending
  if (pendingRequests.has(key)) {
    console.log(`♻️ Deduplicating request: ${key}`);
    return pendingRequests.get(key);
  }
  
  // Create new request promise
  const promise = requestFn()
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(key);
    });
  
  // Store promise for deduplication
  pendingRequests.set(key, promise);
  
  return promise;
};

/**
 * Debounce function for user input
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
