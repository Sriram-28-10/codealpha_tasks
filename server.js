const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to extract current user ID from headers (x-user-id or bearer token)
const getCurrentUserId = (req) => {
  const customHeader = req.headers['x-user-id'];
  if (customHeader) return customHeader;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('user_')) return token.replace('user_', '');
    return token;
  }
  return 'u1'; // Default demo active user is Sarah Chen
};

// ==================== AUTH ROUTES ====================
app.get('/api/auth/me', (req, res) => {
  const userId = getCurrentUserId(req);
  const user = db.getUserById(userId) || db.getUserById('u1');
  if (!user) return res.status(404).json({ error: 'User not found' });

  const followersCount = db.getFollowers(user.id).length;
  const followingCount = db.getFollowing(user.id).length;
  const { unreadCount } = db.getNotifications(user.id);

  res.json({
    user,
    stats: { followersCount, followingCount, unreadNotifications: unreadCount }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, username, password } = req.body;
  let user = null;

  if (email) {
    user = db.getUserByEmail(email);
  } else if (username) {
    user = db.getUserByUsername(username);
  }

  // If not found in demo, create or use first user
  if (!user) {
    if (email) {
      user = db.createUser({
        email,
        username: email.split('@')[0],
        name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase())
      });
    } else {
      return res.status(400).json({ error: 'Invalid credentials. Try Sarah Chen (sarah.chen@example.com)' });
    }
  }

  res.json({
    user,
    token: 'user_' + user.id,
    message: 'Login successful'
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, username, email, password } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  const existingEmail = db.getUserByEmail(email);
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered. Please log in.' });
  }

  const existingUsername = db.getUserByUsername(username);
  if (existingUsername) {
    return res.status(400).json({ error: 'Username already taken. Please choose another.' });
  }

  const user = db.createUser({
    name: name || username,
    username,
    email,
    avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=200&auto=format&fit=crop&q=80`
  });

  res.json({
    user,
    token: 'user_' + user.id,
    message: 'Account created successfully'
  });
});

// Google Authentication
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar, googleId } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    user = db.createUser({
      name: name || 'Google Explorer',
      username: (name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000),
      email: email,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      bio: 'Exploring the modern social network via Google Sign-In.'
    });
  }

  res.json({
    user,
    token: 'user_' + user.id,
    message: 'Google login successful'
  });
});

// Phone Authentication
app.post('/api/auth/phone/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.trim().length < 7) {
    return res.status(400).json({ error: 'Valid phone number required' });
  }

  // Simulated OTP for smooth testing
  const demoOtp = '2026';
  res.json({
    success: true,
    message: `Verification code sent to ${phone}. For demo testing, enter code: ${demoOtp}`,
    demoOtp
  });
});

app.post('/api/auth/phone/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!otp || (otp !== '2026' && otp !== '1234')) {
    return res.status(400).json({ error: 'Invalid verification code. Use 2026 for demo' });
  }

  let user = db.getUserByPhone(phone);
  if (!user) {
    user = db.createUser({
      name: 'Mobile Creator',
      username: 'mobile_' + phone.slice(-4),
      phone: phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Connected via mobile phone authentication.'
    });
  }

  res.json({
    user,
    token: 'user_' + user.id,
    message: 'Phone verification successful'
  });
});

// Demo switch account
app.post('/api/auth/switch-user', (req, res) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    user,
    token: 'user_' + user.id,
    message: `Switched active account to ${user.name}`
  });
});

// Get all demo accounts for instant switching
app.get('/api/auth/demo-users', (req, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatar: u.avatar,
    bio: u.bio
  }));
  res.json({ users });
});

// ==================== USER PROFILE ROUTES ====================
app.get('/api/users/:id', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const targetId = req.params.id;
  const user = db.getUserById(targetId);

  if (!user) return res.status(404).json({ error: 'User not found' });

  const followers = db.getFollowers(targetId);
  const following = db.getFollowing(targetId);
  const isFollowing = currentUserId ? db.isFollowing(currentUserId, targetId) : false;

  const { posts } = db.getPosts({ authorId: targetId, currentUserId, limit: 100 });
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes ? p.likes.length : 0), 0);

  res.json({
    user,
    stats: {
      postsCount: posts.length,
      followersCount: followers.length,
      followingCount: following.length,
      totalLikes,
      isFollowing,
      isSelf: currentUserId === targetId
    }
  });
});

app.put('/api/users/:id', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const targetId = req.params.id;

  if (currentUserId !== targetId) {
    return res.status(403).json({ error: 'Unauthorized: Cannot edit another user\'s profile' });
  }

  const updatedUser = db.updateUser(targetId, req.body);
  if (!updatedUser) return res.status(404).json({ error: 'User not found' });

  res.json({ user: updatedUser, message: 'Profile updated successfully' });
});

app.get('/api/users/:id/followers', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const followers = db.getFollowers(req.params.id).map(u => ({
    ...u,
    isFollowing: currentUserId ? db.isFollowing(currentUserId, u.id) : false
  }));
  res.json({ followers });
});

app.get('/api/users/:id/following', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const following = db.getFollowing(req.params.id).map(u => ({
    ...u,
    isFollowing: currentUserId ? db.isFollowing(currentUserId, u.id) : false
  }));
  res.json({ following });
});

app.post('/api/users/:id/follow', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const targetId = req.params.id;

  if (currentUserId === targetId) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  const result = db.toggleFollow(currentUserId, targetId);
  res.json(result);
});

app.get('/api/users-suggested', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const suggested = db.getSuggestedUsers(currentUserId);
  res.json({ suggested });
});

// ==================== POSTS ROUTES ====================
app.get('/api/posts', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const { tab = 'for-you', hashtag, authorId, search, page = 1, limit = 10 } = req.query;

  const result = db.getPosts({
    tab,
    currentUserId,
    hashtag,
    authorId,
    search,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10
  });

  res.json(result);
});

app.get('/api/posts/:id', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const post = db.getPostById(req.params.id, currentUserId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
});

app.post('/api/posts', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const { content, image, hashtags, audience } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }

  const newPost = db.createPost({
    authorId: currentUserId,
    content,
    image: image || null,
    hashtags: hashtags || [],
    audience: audience || 'public'
  });

  res.status(201).json({ post: newPost, message: 'Post published successfully' });
});

app.delete('/api/posts/:id', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const result = db.deletePost(req.params.id, currentUserId);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({ success: true, message: 'Post deleted successfully' });
});

app.post('/api/posts/:id/like', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const result = db.toggleLikePost(req.params.id, currentUserId);

  if (!result) return res.status(404).json({ error: 'Post not found' });
  res.json(result);
});

app.post('/api/posts/:id/bookmark', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const result = db.toggleBookmarkPost(req.params.id, currentUserId);

  if (!result) return res.status(404).json({ error: 'Post not found' });
  res.json(result);
});

// File upload endpoint for post images
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    imageUrl,
    filename: req.file.filename,
    message: 'Image uploaded successfully'
  });
});

// ==================== COMMENTS ROUTES ====================
app.get('/api/posts/:id/comments', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const comments = db.getComments(req.params.id, currentUserId);
  res.json({ comments });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const { content, parentId } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  const newComment = db.addComment({
    postId: req.params.id,
    authorId: currentUserId,
    parentId: parentId || null,
    content
  });

  if (!newComment) return res.status(404).json({ error: 'Post not found' });
  res.status(201).json({ comment: newComment });
});

app.post('/api/comments/:id/like', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const result = db.toggleLikeComment(req.params.id, currentUserId);

  if (!result) return res.status(404).json({ error: 'Comment not found' });
  res.json(result);
});

app.post('/api/comments/:id/react', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const { emoji } = req.body;

  if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

  const result = db.toggleCommentReaction(req.params.id, currentUserId, emoji);
  if (!result) return res.status(404).json({ error: 'Comment not found' });
  res.json(result);
});

app.delete('/api/comments/:id', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const result = db.deleteComment(req.params.id, currentUserId);

  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({ success: true, message: 'Comment deleted' });
});

// ==================== NOTIFICATIONS ROUTES ====================
app.get('/api/notifications', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const data = db.getNotifications(currentUserId);
  res.json(data);
});

app.post('/api/notifications/read', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const result = db.markNotificationsRead(currentUserId);
  res.json(result);
});

// ==================== SEARCH & DISCOVERY ROUTES ====================
app.get('/api/search', (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const query = req.query.q || '';
  const result = db.search(query, currentUserId);
  res.json(result);
});

app.get('/api/stories', (req, res) => {
  res.json({ stories: db.getStories() });
});

app.get('/api/trending', (req, res) => {
  res.json({ trending: db.getTrending() });
});

// Reset database route for quick developer resets
app.post('/api/admin/reset-db', (req, res) => {
  db.reset();
  res.json({ success: true, message: 'Database reset to default seed data' });
});

// ==================== STATIC SERVING ====================
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for client-side routing in Express 5
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Social Media Platform running on http://localhost:${PORT}`);
  console.log(`📡 REST API & Web Server ready`);
  console.log(`=======================================================`);
});
