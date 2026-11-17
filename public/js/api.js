/**
 * API Client Layer for Social Media Platform
 */
const API = (() => {
  const BASE_URL = '';

  const getActiveUserId = () => {
    return localStorage.getItem('social_user_id') || 'u1';
  };

  const getAuthToken = () => {
    return localStorage.getItem('social_auth_token') || 'user_u1';
  };

  const setAuthSession = (user, token) => {
    if (user && user.id) {
      localStorage.setItem('social_user_id', user.id);
      localStorage.setItem('social_user_data', JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem('social_auth_token', token);
    }
  };

  const clearAuthSession = () => {
    localStorage.removeItem('social_user_id');
    localStorage.removeItem('social_user_data');
    localStorage.removeItem('social_auth_token');
  };

  const request = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': getActiveUserId(),
      'Authorization': `Bearer ${getAuthToken()}`,
      ...(options.headers || {})
    };

    // If uploading FormData, delete Content-Type to let browser set boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  };

  return {
    getActiveUserId,
    getAuthToken,
    setAuthSession,
    clearAuthSession,

    // Authentication
    auth: {
      getMe: () => request('/api/auth/me'),
      login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
      signup: (userData) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
      googleLogin: (profile) => request('/api/auth/google', { method: 'POST', body: JSON.stringify(profile) }),
      phoneSendOtp: (phone) => request('/api/auth/phone/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
      phoneVerifyOtp: (phone, otp) => request('/api/auth/phone/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
      switchUser: (userId) => request('/api/auth/switch-user', { method: 'POST', body: JSON.stringify({ userId }) }),
      getDemoUsers: () => request('/api/auth/demo-users')
    },

    // Posts
    posts: {
      getFeed: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/posts${query ? `?${query}` : ''}`);
      },
      getById: (id) => request(`/api/posts/${id}`),
      create: (postData) => request('/api/posts', { method: 'POST', body: JSON.stringify(postData) }),
      delete: (id) => request(`/api/posts/${id}`, { method: 'DELETE' }),
      toggleLike: (id) => request(`/api/posts/${id}/like`, { method: 'POST' }),
      toggleBookmark: (id) => request(`/api/posts/${id}/bookmark`, { method: 'POST' }),
      uploadImage: (formData) => request('/api/upload', { method: 'POST', body: formData })
    },

    // Comments & Nested Replies
    comments: {
      getByPost: (postId) => request(`/api/posts/${postId}/comments`),
      add: (postId, commentData) => request(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(commentData) }),
      toggleLike: (commentId) => request(`/api/comments/${commentId}/like`, { method: 'POST' }),
      toggleReaction: (commentId, emoji) => request(`/api/comments/${commentId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }),
      delete: (commentId) => request(`/api/comments/${commentId}`, { method: 'DELETE' })
    },

    // Users & Profiles
    users: {
      getProfile: (id) => request(`/api/users/${id}`),
      updateProfile: (id, updates) => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
      getFollowers: (id) => request(`/api/users/${id}/followers`),
      getFollowing: (id) => request(`/api/users/${id}/following`),
      toggleFollow: (id) => request(`/api/users/${id}/follow`, { method: 'POST' }),
      getSuggested: () => request('/api/users-suggested')
    },

    // Notifications
    notifications: {
      getAll: () => request('/api/notifications'),
      markAllRead: () => request('/api/notifications/read', { method: 'POST' })
    },

    // Search & Discovery
    search: {
      query: (q) => request(`/api/search?q=${encodeURIComponent(q)}`)
    },
    discovery: {
      getStories: () => request('/api/stories'),
      getTrending: () => request('/api/trending')
    }
  };
})();
