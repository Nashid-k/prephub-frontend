
const BOOKMARKS_KEY = 'prephub_bookmarks';

export const getBookmarks = () => {
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

export const addBookmark = (item) => {
  try {
    const bookmarks = getBookmarks();
    
    const exists = bookmarks.some(b => b.id === item.id);
    if (exists) {
      return { success: false, message: 'Already bookmarked' };
    }

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

export const isBookmarked = (itemId) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.id === itemId);
};

export const toggleBookmark = (item) => {
  if (isBookmarked(item.id)) {
    return removeBookmark(item.id);
  } else {
    return addBookmark(item);
  }
};

export const clearAllBookmarks = () => {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
    return { success: true, message: 'All bookmarks cleared' };
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return { success: false, message: 'Failed to clear bookmarks' };
  }
};

export const getBookmarksCount = () => {
  return getBookmarks().length;
};

export const getBookmarksByType = (type) => {
  const bookmarks = getBookmarks();
  return bookmarks.filter(b => b.type === type);
};

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
