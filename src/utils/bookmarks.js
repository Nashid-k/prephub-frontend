// Bookmark utility functions using localStorage

const BOOKMARKS_KEY = 'prephub_bookmarks';

// Get all bookmarks
export const getBookmarks = () => {
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

// Add a bookmark
export const addBookmark = (item) => {
  try {
    const bookmarks = getBookmarks();
    
    // Check if already bookmarked
    const exists = bookmarks.some(b => b.id === item.id);
    if (exists) {
      return { success: false, message: 'Already bookmarked' };
    }

    // Add bookmark with timestamp
    const newBookmark = {
      ...item,
      bookmarkedAt: new Date().toISOString()
    };

    bookmarks.push(newBookmark);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    
    return { success: true, message: 'Bookmark added' };
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return { success: false, message: 'Failed to add bookmark' };
  }
};

// Remove a bookmark
export const removeBookmark = (itemId) => {
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== itemId);
    
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    return { success: true, message: 'Bookmark removed' };
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return { success: false, message: 'Failed to remove bookmark' };
  }
};

// Check if an item is bookmarked
export const isBookmarked = (itemId) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.id === itemId);
};

// Toggle bookmark (add if not exists, remove if exists)
export const toggleBookmark = (item) => {
  if (isBookmarked(item.id)) {
    return removeBookmark(item.id);
  } else {
    return addBookmark(item);
  }
};

// Clear all bookmarks
export const clearAllBookmarks = () => {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
    return { success: true, message: 'All bookmarks cleared' };
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return { success: false, message: 'Failed to clear bookmarks' };
  }
};

// Get bookmarks count
export const getBookmarksCount = () => {
  return getBookmarks().length;
};

// Get bookmarks by type
export const getBookmarksByType = (type) => {
  const bookmarks = getBookmarks();
  return bookmarks.filter(b => b.type === type);
};

// Export all functions
export default {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked,
  toggleBookmark,
  clearAllBookmarks,
  getBookmarksCount,
  getBookmarksByType
};
