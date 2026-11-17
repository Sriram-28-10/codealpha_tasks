const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Initial seed data to make the platform immediately vibrant, interactive, and populated
const defaultData = {
  users: [
    {
      id: "u1",
      username: "sarah_chen",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      bio: "Product Designer & Design Systems lead. Obsessed with micro-interactions, typography, and sleek modern interfaces. 🎨✨",
      location: "San Francisco, CA",
      website: "https://sarahchen.design",
      joined: "March 2024",
      isVerified: true,
      phone: "+15550198234",
      email: "sarah.chen@example.com",
      settings: {
        isPrivate: false,
        allowDms: true,
        showActivity: true,
        emailNotifs: true,
        likeNotifs: true,
        commentNotifs: true,
        followNotifs: true,
        theme: "light",
        highContrast: false,
        reducedMotion: false
      }
    },
    {
      id: "u2",
      username: "alex_lens",
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      bio: "Visual storyteller & street photographer. Chasing light, shadows, and architectural symmetry across the globe. 📷🏙️",
      location: "Tokyo / Brooklyn",
      website: "https://alexrivera.photo",
      joined: "January 2024",
      isVerified: true,
      phone: "+15550198888",
      email: "alex.rivera@example.com",
      settings: {
        isPrivate: false,
        allowDms: true,
        showActivity: true,
        emailNotifs: false,
        likeNotifs: true,
        commentNotifs: true,
        followNotifs: true,
        theme: "light",
        highContrast: false,
        reducedMotion: false
      }
    },
    {
      id: "u3",
      username: "elena_ai",
      name: "Dr. Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      bio: "AI Researcher & Cognitive Systems Architect. Exploring multimodal reasoning, ethical intelligence, and human-agent synergy. 🧠🤖",
      location: "Zurich, Switzerland",
      website: "https://elena-ai.org",
      joined: "October 2023",
      isVerified: true,
      phone: "+15550199999",
      email: "elena.rostova@example.com",
      settings: {
        isPrivate: false,
        allowDms: true,
        showActivity: true,
        emailNotifs: true,
        likeNotifs: true,
        commentNotifs: true,
        followNotifs: true,
        theme: "dark",
        highContrast: false,
        reducedMotion: false
      }
    },
    {
      id: "u4",
      username: "marcus_beats",
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
      bio: "Sound designer, music producer, synth hoarder. Building immersive sonic landscapes for games and film. 🎧🎹",
      location: "Berlin, Germany",
      website: "https://marcusvance.audio",
      joined: "May 2024",
      isVerified: false,
      phone: "+15550194455",
      email: "marcus.vance@example.com",
      settings: {
        isPrivate: false,
        allowDms: false,
        showActivity: false,
        emailNotifs: false,
        likeNotifs: true,
        commentNotifs: false,
        followNotifs: true,
        theme: "light",
        highContrast: false,
        reducedMotion: false
      }
    },
    {
      id: "u5",
      username: "maya_lin",
      name: "Maya Lin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80",
      bio: "Frontend engineer & creative technologist. Passionate about WebGL, accessible CSS, and fast animations. ⚡💻",
      location: "Seattle, WA",
      website: "https://mayalin.dev",
      joined: "February 2024",
      isVerified: true,
      phone: "+15550193322",
      email: "maya.lin@example.com",
      settings: {
        isPrivate: false,
        allowDms: true,
        showActivity: true,
        emailNotifs: true,
        likeNotifs: true,
        commentNotifs: true,
        followNotifs: true,
        theme: "light",
        highContrast: false,
        reducedMotion: false
      }
    }
  ],
  followers: [
    { followerId: "u1", followingId: "u2", createdAt: "2024-03-01T10:00:00Z" },
    { followerId: "u1", followingId: "u3", createdAt: "2024-03-02T10:00:00Z" },
    { followerId: "u1", followingId: "u5", createdAt: "2024-03-03T10:00:00Z" },
    { followerId: "u2", followingId: "u1", createdAt: "2024-03-01T12:00:00Z" },
    { followerId: "u2", followingId: "u3", createdAt: "2024-03-02T14:00:00Z" },
    { followerId: "u3", followingId: "u1", createdAt: "2024-03-04T15:00:00Z" },
    { followerId: "u4", followingId: "u1", createdAt: "2024-03-05T09:00:00Z" },
    { followerId: "u5", followingId: "u1", createdAt: "2024-03-05T11:00:00Z" },
    { followerId: "u5", followingId: "u2", createdAt: "2024-03-06T13:00:00Z" }
  ],
  posts: [
    {
      id: "p1",
      authorId: "u1",
      content: "Just finalized our new design system tokens for high-contrast accessibility! 🎨 The subtle balance between sleek aesthetics and universal usability is where real design magic happens. What do you prioritize first in your UI kit?",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80",
      hashtags: ["DesignSystems", "Accessibility", "UIUX", "CleanDesign"],
      likes: ["u2", "u3", "u5"],
      bookmarks: ["u2"],
      audience: "public",
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString() // 35 min ago
    },
    {
      id: "p2",
      authorId: "u2",
      content: "Golden hour in Tokyo's Ginza district. Captured the interplay of neon reflections and warm sunset light just as the drizzle stopped. No heavy color grading, pure natural dynamic range. 📸✨",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80",
      hashtags: ["Tokyo", "StreetPhotography", "GoldenHour", "VisualArt"],
      likes: ["u1", "u3", "u4", "u5"],
      bookmarks: ["u1", "u5"],
      audience: "public",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: "p3",
      authorId: "u3",
      content: "Exciting breakthrough in self-supervised latent reasoning models! By separating factual grounding from speculative exploration, we reduce hallucination rates while keeping creative problem-solving flexible. Preprint dropping this week. 🔬🚀",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop&q=80",
      hashtags: ["AIResearch", "MachineLearning", "FutureOfTech", "DeepLearning"],
      likes: ["u1", "u2", "u5"],
      bookmarks: ["u1"],
      audience: "public",
      createdAt: new Date(Date.now() - 1000 * 60 * 340).toISOString() // ~5 hours ago
    },
    {
      id: "p4",
      authorId: "u5",
      content: "Modern CSS has made layout so joyful. Between container queries, subgrid, and `:has()`, responsive cards require zero hacky JavaScript resize listeners. Here's a clean snippet pattern that scales effortlessly on all viewports! 💻⚡",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80",
      hashtags: ["WebDev", "CSS", "Frontend", "CleanCode"],
      likes: ["u1", "u2", "u3"],
      bookmarks: ["u1", "u2", "u3"],
      audience: "public",
      createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString() // 12 hours ago
    },
    {
      id: "p5",
      authorId: "u4",
      content: "Late night in the sound lab experimenting with analog modular filters and spatial reverberation. Generating ambient binaural soundscapes that feel like standing in an open redwood forest at dusk. 🌲🎧",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80",
      hashtags: ["AudioProduction", "ModularSynth", "SoundDesign"],
      likes: ["u1", "u2"],
      bookmarks: [],
      audience: "public",
      createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString() // 1 day ago
    }
  ],
  comments: [
    {
      id: "c1",
      postId: "p1",
      authorId: "u5",
      parentId: null,
      content: "Contrast ratios are non-negotiable! The APCA (Accessible Perceptual Contrast Algorithm) has been a game changer compared to old WCAG 2.1 math for dark mode readability.",
      likes: ["u1", "u3"],
      reactions: { "🔥": ["u1"], "💡": ["u3"] },
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    },
    {
      id: "c2",
      postId: "p1",
      authorId: "u1",
      parentId: "c1",
      content: "@maya_lin 100% agreed! We tested APCA across both OLED and standard IPS monitors, and the luminance perception difference is dramatic.",
      likes: ["u5"],
      reactions: { "❤️": ["u5"] },
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "c3",
      postId: "p1",
      authorId: "u2",
      parentId: null,
      content: "Love the micro-interaction preview! Subtle spring physics make everything feel tactile and premium.",
      likes: ["u1"],
      reactions: { "❤️": ["u1"] },
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: "c4",
      postId: "p2",
      authorId: "u1",
      parentId: null,
      content: "The atmospheric haze in this shot is breathtaking Alex! What focal length did you shoot this with?",
      likes: ["u2"],
      reactions: { "❤️": ["u2"] },
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    },
    {
      id: "c5",
      postId: "p2",
      authorId: "u2",
      parentId: "c4",
      content: "@sarah_chen Thank you Sarah! Shot on a 50mm f/1.2 prime wide open at ISO 800. The natural compression is magic for urban layers.",
      likes: ["u1", "u4"],
      reactions: { "🙌": ["u1"] },
      createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString()
    },
    {
      id: "c6",
      postId: "p3",
      authorId: "u1",
      parentId: null,
      content: "Crucial work Dr. Elena. Looking forward to reading the architectural breakdown on verifiable reasoning traces!",
      likes: ["u3"],
      reactions: { "👏": ["u3"] },
      createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString()
    }
  ],
  notifications: [
    {
      id: "n1",
      recipientId: "u1",
      actorId: "u2",
      type: "like",
      postId: "p1",
      commentId: null,
      message: "liked your post: \"Just finalized our new design system...\"",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    },
    {
      id: "n2",
      recipientId: "u1",
      actorId: "u5",
      type: "comment",
      postId: "p1",
      commentId: "c1",
      message: "commented: \"Contrast ratios are non-negotiable!...\"",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    },
    {
      id: "n3",
      recipientId: "u1",
      actorId: "u4",
      type: "follow",
      postId: null,
      commentId: null,
      message: "started following you.",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
    },
    {
      id: "n4",
      recipientId: "u1",
      actorId: "u3",
      type: "like",
      postId: "p1",
      commentId: null,
      message: "liked your post.",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString()
    }
  ],
  stories: [
    {
      id: "s1",
      userId: "u1",
      user: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      media: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      caption: "Polishing design system tokens 🎨",
      hasUnseen: true
    },
    {
      id: "s2",
      userId: "u2",
      user: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      media: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
      caption: "Night walks in Shibuya 🌧️",
      hasUnseen: true
    },
    {
      id: "s3",
      userId: "u3",
      user: "Dr. Elena",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      media: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      caption: "Keynote presentation at AI Forum 🧠",
      hasUnseen: false
    },
    {
      id: "s4",
      userId: "u4",
      user: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      media: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
      caption: "Analog modular patch in action 🎹",
      hasUnseen: false
    },
    {
      id: "s5",
      userId: "u5",
      user: "Maya Lin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      media: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
      caption: "Experimenting with 3D canvas shaders ⚡",
      hasUnseen: true
    }
  ],
  trending: [
    { tag: "DesignSystems", count: 4820, category: "Design · Trending" },
    { tag: "Accessibility", count: 3190, category: "Tech · Trending" },
    { tag: "Tokyo", count: 8940, category: "Photography · Trending" },
    { tag: "AIResearch", count: 12500, category: "Science · Trending" },
    { tag: "WebDev", count: 6420, category: "Programming · Trending" },
    { tag: "CleanDesign", count: 2890, category: "UI/UX · Trending" }
  ]
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting to default:', err);
      this.data = JSON.parse(JSON.stringify(defaultData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(defaultData));
    this.save();
    return this.data;
  }

  // Users
  getUsers() {
    return this.data.users;
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByUsername(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByPhone(phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return this.data.users.find(u => u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone);
  }

  createUser(userData) {
    const newUser = {
      id: 'u_' + Date.now() + Math.random().toString(36).substring(2, 6),
      username: userData.username || 'user_' + Date.now().toString().slice(-4),
      name: userData.name || 'New Member',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
      banner: userData.banner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      bio: userData.bio || "Joined the community to connect and share ideas.",
      location: userData.location || "Earth",
      website: userData.website || "",
      joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isVerified: false,
      phone: userData.phone || "",
      email: userData.email || "",
      settings: {
        isPrivate: false,
        allowDms: true,
        showActivity: true,
        emailNotifs: true,
        likeNotifs: true,
        commentNotifs: true,
        followNotifs: true,
        theme: "light",
        highContrast: false,
        reducedMotion: false,
        ...(userData.settings || {})
      }
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const user = this.getUserById(id);
    if (!user) return null;

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.location !== undefined) user.location = updates.location;
    if (updates.website !== undefined) user.website = updates.website;
    if (updates.avatar !== undefined) user.avatar = updates.avatar;
    if (updates.banner !== undefined) user.banner = updates.banner;
    if (updates.settings !== undefined) {
      user.settings = { ...user.settings, ...updates.settings };
    }

    this.save();
    return user;
  }

  // Follows
  getFollowers(userId) {
    return this.data.followers
      .filter(f => f.followingId === userId)
      .map(f => this.getUserById(f.followerId))
      .filter(Boolean);
  }

  getFollowing(userId) {
    return this.data.followers
      .filter(f => f.followerId === userId)
      .map(f => this.getUserById(f.followingId))
      .filter(Boolean);
  }

  isFollowing(followerId, followingId) {
    return this.data.followers.some(f => f.followerId === followerId && f.followingId === followingId);
  }

  toggleFollow(followerId, followingId) {
    if (followerId === followingId) return { following: false, error: "Cannot follow yourself" };

    const index = this.data.followers.findIndex(f => f.followerId === followerId && f.followingId === followingId);
    let following = false;

    if (index >= 0) {
      this.data.followers.splice(index, 1);
      following = false;
    } else {
      this.data.followers.push({
        followerId,
        followingId,
        createdAt: new Date().toISOString()
      });
      following = true;

      // Add notification
      this.addNotification({
        recipientId: followingId,
        actorId: followerId,
        type: 'follow',
        postId: null,
        commentId: null,
        message: 'started following you.'
      });
    }

    this.save();
    return {
      following,
      followersCount: this.getFollowers(followingId).length,
      followingCount: this.getFollowing(followingId).length
    };
  }

  // Posts
  getPosts({ tab = 'for-you', currentUserId, hashtag, search, authorId, page = 1, limit = 10 } = {}) {
    let list = [...this.data.posts];

    if (authorId) {
      list = list.filter(p => p.authorId === authorId);
    } else if (hashtag) {
      const cleanTag = hashtag.replace('#', '').toLowerCase();
      list = list.filter(p => p.hashtags && p.hashtags.some(t => t.toLowerCase() === cleanTag));
    } else if (search) {
      const term = search.toLowerCase();
      list = list.filter(p => {
        const matchesContent = p.content.toLowerCase().includes(term);
        const matchesTag = p.hashtags && p.hashtags.some(t => t.toLowerCase().includes(term));
        const author = this.getUserById(p.authorId);
        const matchesAuthor = author && (author.name.toLowerCase().includes(term) || author.username.toLowerCase().includes(term));
        return matchesContent || matchesTag || matchesAuthor;
      });
    } else if (tab === 'following' && currentUserId) {
      const followingIds = this.getFollowing(currentUserId).map(u => u.id);
      list = list.filter(p => followingIds.includes(p.authorId) || p.authorId === currentUserId);
    } else if (tab === 'trending') {
      list.sort((a, b) => (b.likes.length * 2 + (this.getPostCommentsCount(b.id) * 3)) - (a.likes.length * 2 + (this.getPostCommentsCount(a.id) * 3)));
    } else if (tab === 'media') {
      list = list.filter(p => !!p.image);
    }

    // Default newest first
    if (tab !== 'trending') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    const enriched = paginated.map(p => this.enrichPost(p, currentUserId));

    return {
      posts: enriched,
      total,
      page,
      hasMore: startIndex + limit < total
    };
  }

  getPostById(id, currentUserId) {
    const post = this.data.posts.find(p => p.id === id);
    if (!post) return null;
    return this.enrichPost(post, currentUserId);
  }

  enrichPost(post, currentUserId) {
    const author = this.getUserById(post.authorId);
    const commentsCount = this.getPostCommentsCount(post.id);
    const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
    const isBookmarked = currentUserId ? (post.bookmarks && post.bookmarks.includes(currentUserId)) : false;

    return {
      ...post,
      author: author ? {
        id: author.id,
        username: author.username,
        name: author.name,
        avatar: author.avatar,
        isVerified: author.isVerified
      } : { id: 'unknown', username: 'unknown', name: 'Unknown User', avatar: '' },
      likesCount: post.likes.length,
      commentsCount,
      isLiked,
      isBookmarked
    };
  }

  createPost({ authorId, content, image, hashtags = [], audience = 'public' }) {
    // Extract hashtags from content if not explicitly provided
    let extractedTags = [...hashtags];
    if (content) {
      const matches = content.match(/#[a-zA-Z0-9_]+/g);
      if (matches) {
        matches.forEach(m => {
          const tag = m.substring(1);
          if (!extractedTags.includes(tag)) extractedTags.push(tag);
        });
      }
    }

    const newPost = {
      id: 'p_' + Date.now() + Math.random().toString(36).substring(2, 6),
      authorId,
      content: content.trim(),
      image: image || null,
      hashtags: extractedTags,
      likes: [],
      bookmarks: [],
      audience,
      createdAt: new Date().toISOString()
    };

    this.data.posts.unshift(newPost);

    // Update trending tags
    extractedTags.forEach(tag => {
      const existing = this.data.trending.find(t => t.tag.toLowerCase() === tag.toLowerCase());
      if (existing) {
        existing.count += 1;
      } else {
        this.data.trending.unshift({ tag, count: 1, category: 'Community · Trending' });
      }
    });

    this.save();
    return this.enrichPost(newPost, authorId);
  }

  deletePost(postId, userId) {
    const index = this.data.posts.findIndex(p => p.id === postId);
    if (index === -1) return { success: false, error: "Post not found" };

    const post = this.data.posts[index];
    if (post.authorId !== userId) {
      return { success: false, error: "Unauthorized: You can only delete your own posts" };
    }

    this.data.posts.splice(index, 1);
    // Remove related comments
    this.data.comments = this.data.comments.filter(c => c.postId !== postId);
    // Remove related notifications
    this.data.notifications = this.data.notifications.filter(n => n.postId !== postId);

    this.save();
    return { success: true };
  }

  toggleLikePost(postId, userId) {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return null;

    const likedIndex = post.likes.indexOf(userId);
    let isLiked = false;

    if (likedIndex >= 0) {
      post.likes.splice(likedIndex, 1);
      isLiked = false;
    } else {
      post.likes.push(userId);
      isLiked = true;

      // Add notification if not self-like
      if (post.authorId !== userId) {
        const author = this.getUserById(userId);
        this.addNotification({
          recipientId: post.authorId,
          actorId: userId,
          type: 'like',
          postId: post.id,
          commentId: null,
          message: `liked your post: "${post.content.slice(0, 36)}${post.content.length > 36 ? '...' : ''}"`
        });
      }
    }

    this.save();
    return {
      isLiked,
      likesCount: post.likes.length
    };
  }

  toggleBookmarkPost(postId, userId) {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return null;

    if (!post.bookmarks) post.bookmarks = [];

    const index = post.bookmarks.indexOf(userId);
    let isBookmarked = false;

    if (index >= 0) {
      post.bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      post.bookmarks.push(userId);
      isBookmarked = true;
    }

    this.save();
    return { isBookmarked };
  }

  // Comments & Nested Replies
  getPostCommentsCount(postId) {
    return this.data.comments.filter(c => c.postId === postId).length;
  }

  getComments(postId, currentUserId) {
    const allPostComments = this.data.comments.filter(c => c.postId === postId);

    // Group into top-level and nested replies
    const topLevel = [];
    const replyMap = new Map();

    allPostComments.forEach(c => {
      const enriched = {
        ...c,
        author: this.getUserById(c.authorId) || { name: 'Anonymous', avatar: '', username: 'user' },
        likesCount: c.likes ? c.likes.length : 0,
        isLiked: currentUserId && c.likes ? c.likes.includes(currentUserId) : false,
        reactions: c.reactions || {},
        replies: []
      };

      if (!c.parentId) {
        topLevel.push(enriched);
      } else {
        if (!replyMap.has(c.parentId)) {
          replyMap.set(c.parentId, []);
        }
        replyMap.get(c.parentId).push(enriched);
      }
    });

    // Attach replies
    topLevel.forEach(parent => {
      parent.replies = (replyMap.get(parent.id) || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });

    return topLevel.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  addComment({ postId, authorId, parentId = null, content }) {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return null;

    const newComment = {
      id: 'c_' + Date.now() + Math.random().toString(36).substring(2, 6),
      postId,
      authorId,
      parentId: parentId || null,
      content: content.trim(),
      likes: [],
      reactions: {},
      createdAt: new Date().toISOString()
    };

    this.data.comments.push(newComment);

    // Create notification
    if (parentId) {
      const parentComment = this.data.comments.find(c => c.id === parentId);
      if (parentComment && parentComment.authorId !== authorId) {
        this.addNotification({
          recipientId: parentComment.authorId,
          actorId: authorId,
          type: 'reply',
          postId,
          commentId: newComment.id,
          message: `replied to your comment: "${content.slice(0, 36)}${content.length > 36 ? '...' : ''}"`
        });
      }
    } else {
      if (post.authorId !== authorId) {
        this.addNotification({
          recipientId: post.authorId,
          actorId: authorId,
          type: 'comment',
          postId,
          commentId: newComment.id,
          message: `commented: "${content.slice(0, 36)}${content.length > 36 ? '...' : ''}"`
        });
      }
    }

    this.save();

    return {
      ...newComment,
      author: this.getUserById(authorId),
      likesCount: 0,
      isLiked: false,
      replies: []
    };
  }

  toggleLikeComment(commentId, userId) {
    const comment = this.data.comments.find(c => c.id === commentId);
    if (!comment) return null;

    if (!comment.likes) comment.likes = [];
    const index = comment.likes.indexOf(userId);
    let isLiked = false;

    if (index >= 0) {
      comment.likes.splice(index, 1);
      isLiked = false;
    } else {
      comment.likes.push(userId);
      isLiked = true;
    }

    this.save();
    return {
      isLiked,
      likesCount: comment.likes.length
    };
  }

  toggleCommentReaction(commentId, userId, emoji) {
    const comment = this.data.comments.find(c => c.id === commentId);
    if (!comment) return null;

    if (!comment.reactions) comment.reactions = {};
    if (!comment.reactions[emoji]) comment.reactions[emoji] = [];

    const index = comment.reactions[emoji].indexOf(userId);
    if (index >= 0) {
      comment.reactions[emoji].splice(index, 1);
      if (comment.reactions[emoji].length === 0) {
        delete comment.reactions[emoji];
      }
    } else {
      comment.reactions[emoji].push(userId);
    }

    this.save();
    return { reactions: comment.reactions };
  }

  deleteComment(commentId, userId) {
    const comment = this.data.comments.find(c => c.id === commentId);
    if (!comment) return { success: false, error: "Comment not found" };

    if (comment.authorId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Remove this comment and any child replies
    this.data.comments = this.data.comments.filter(c => c.id !== commentId && c.parentId !== commentId);
    this.save();
    return { success: true };
  }

  // Notifications
  getNotifications(userId) {
    const notifs = this.data.notifications
      .filter(n => n.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(n => ({
        ...n,
        actor: this.getUserById(n.actorId) || { name: 'Someone', avatar: '', username: 'user' }
      }));

    const unreadCount = notifs.filter(n => !n.read).length;
    return { notifications: notifs, unreadCount };
  }

  markNotificationsRead(userId) {
    this.data.notifications.forEach(n => {
      if (n.recipientId === userId) n.read = true;
    });
    this.save();
    return { success: true };
  }

  addNotification({ recipientId, actorId, type, postId, commentId, message }) {
    if (recipientId === actorId) return; // Don't notify self

    const notif = {
      id: 'n_' + Date.now() + Math.random().toString(36).substring(2, 6),
      recipientId,
      actorId,
      type,
      postId: postId || null,
      commentId: commentId || null,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };

    this.data.notifications.unshift(notif);
    this.save();
  }

  // Search & Explore
  search(query, currentUserId) {
    if (!query || query.trim() === '') {
      return { users: [], posts: [], hashtags: [] };
    }

    const term = query.trim().toLowerCase();

    // Match users
    const matchedUsers = this.data.users
      .filter(u => u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term) || u.bio.toLowerCase().includes(term))
      .map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        isVerified: u.isVerified,
        isFollowing: currentUserId ? this.isFollowing(currentUserId, u.id) : false
      }));

    // Match hashtags
    const matchedTags = this.data.trending
      .filter(t => t.tag.toLowerCase().includes(term.replace('#', '')));

    // Match posts
    const { posts } = this.getPosts({ search: term, currentUserId, limit: 10 });

    return {
      users: matchedUsers,
      hashtags: matchedTags,
      posts
    };
  }

  getSuggestedUsers(currentUserId) {
    const followingIds = currentUserId ? this.getFollowing(currentUserId).map(u => u.id) : [];
    return this.data.users
      .filter(u => u.id !== currentUserId && !followingIds.includes(u.id))
      .slice(0, 4)
      .map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        isVerified: u.isVerified,
        followersCount: this.getFollowers(u.id).length
      }));
  }

  getStories() {
    return this.data.stories;
  }

  getTrending() {
    return this.data.trending;
  }
}

const db = new Database();
module.exports = db;
