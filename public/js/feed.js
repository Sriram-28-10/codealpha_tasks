/**
 * Home Feed & Post Interactions Module
 */
const Feed = (() => {
  let currentTab = 'for-you';
  let activeHashtag = null;
  let activeSearch = null;
  let activeAuthorId = null;
  let currentPage = 1;
  let hasMore = true;
  let isLoading = false;

  const init = () => {
    setupFeedTabs();
    setupInfiniteScroll();
    loadStories();
    loadFeed({ reset: true });
  };

  const setupFeedTabs = () => {
    const tabs = document.querySelectorAll('.feed-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        activeHashtag = null;
        activeSearch = null;
        activeAuthorId = null;

        // Reset page title if it was showing a tag
        const titleEl = document.getElementById('main-feed-title');
        if (titleEl) titleEl.textContent = 'Home';

        loadFeed({ reset: true });
      });
    });
  };

  const setFilterHashtag = (tag) => {
    activeHashtag = tag;
    currentTab = 'for-you';
    activeSearch = null;
    activeAuthorId = null;

    const titleEl = document.getElementById('main-feed-title');
    if (titleEl) titleEl.textContent = `#${tag}`;

    document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
    App.navigateTo('home');
    loadFeed({ reset: true });
  };

  const loadFeed = async ({ reset = false } = {}) => {
    if (isLoading) return;
    if (reset) {
      currentPage = 1;
      hasMore = true;
    }
    if (!hasMore && !reset) return;

    isLoading = true;
    const container = document.getElementById('posts-stream');
    const loadingIndicator = document.getElementById('feed-loading-indicator');

    if (reset && container) {
      container.innerHTML = getSkeletonHTML(3);
    }
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    try {
      const params = {
        tab: currentTab,
        page: currentPage,
        limit: 10
      };
      if (activeHashtag) params.hashtag = activeHashtag;
      if (activeSearch) params.search = activeSearch;
      if (activeAuthorId) params.authorId = activeAuthorId;

      const data = await API.posts.getFeed(params);

      if (reset && container) {
        container.innerHTML = '';
      }

      if (data.posts.length === 0 && currentPage === 1) {
        container.innerHTML = `
          <div style="padding: 48px 20px; text-align: center; color: var(--text-muted);">
            <svg style="width: 48px; height: 48px; margin: 0 auto 12px; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px;">No posts yet</h3>
            <p style="font-size: 0.9rem;">Be the first to share an idea, image, or story with the community!</p>
          </div>
        `;
        hasMore = false;
        return;
      }

      data.posts.forEach(post => {
        const card = createPostCardElement(post);
        container.appendChild(card);
      });

      hasMore = data.hasMore;
      currentPage += 1;
    } catch (err) {
      console.error('Failed to load feed:', err);
      if (reset && container) {
        container.innerHTML = `
          <div style="padding: 30px; text-align: center; color: var(--color-error);">
            <p>Failed to load posts. Please check connection.</p>
            <button class="btn-outline-primary" style="margin-top:10px;" onclick="Feed.loadFeed({reset:true})">Retry</button>
          </div>
        `;
      }
    } finally {
      isLoading = false;
      if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
  };

  const createPostCardElement = (post, isNew = false) => {
    const card = document.createElement('article');
    card.className = `post-card ${isNew ? 'anim-fade-in' : ''}`;
    card.id = `post-${post.id}`;
    card.setAttribute('role', 'article');

    const formattedTime = formatRelativeTime(post.createdAt);
    const currentUser = Auth.getCurrentUser();
    const isOwnPost = currentUser && currentUser.id === post.author.id;

    // Format hashtags in content
    const formattedContent = escapeHTML(post.content).replace(
      /#([a-zA-Z0-9_]+)/g,
      '<span class="hashtag" data-tag="$1">#$1</span>'
    );

    card.innerHTML = `
      <div class="post-avatar-col">
        <img src="${post.author.avatar}" alt="${post.author.name}" class="post-avatar" data-user-id="${post.author.id}">
      </div>
      <div class="post-content-col">
        <header class="post-header">
          <div class="post-author-meta">
            <span class="post-author-name" data-user-id="${post.author.id}">
              ${post.author.name}
              ${post.author.isVerified ? `<svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
            </span>
            <span class="post-author-handle">@${post.author.username}</span>
            <span class="post-bullet">·</span>
            <time class="post-time" datetime="${post.createdAt}">${formattedTime}</time>
          </div>
          <div class="post-actions-menu">
            <button class="btn-more-options" aria-label="More options" data-post-id="${post.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
            <div class="post-dropdown-menu" id="dropdown-${post.id}" style="display:none; position:absolute; right:0; top:30px; background:var(--bg-secondary); border:1px solid var(--border-light); border-radius:var(--radius-md); box-shadow:var(--shadow-lg); z-index:20; min-width:140px; overflow:hidden;">
              <button class="dropdown-item btn-copy-link" data-post-id="${post.id}" style="padding:8px 14px; width:100%; text-align:left; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy Link
              </button>
              ${isOwnPost ? `
                <button class="dropdown-item btn-delete-post" data-post-id="${post.id}" style="padding:8px 14px; width:100%; text-align:left; font-size:0.85rem; color:var(--color-error); display:flex; align-items:center; gap:8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Delete Post
                </button>
              ` : ''}
            </div>
          </div>
        </header>

        <div class="post-body">
          <p>${formattedContent}</p>
        </div>

        ${post.image ? `
          <div class="post-image-container" data-image-url="${post.image}">
            <img src="${post.image}" alt="Post attachment" loading="lazy">
          </div>
        ` : ''}

        <footer class="post-footer-actions">
          <!-- Comment Action -->
          <button class="btn-action-icon btn-action-comment" data-post-id="${post.id}" aria-label="Comment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span class="comment-count">${post.commentsCount || 0}</span>
          </button>

          <!-- Like Action with Micro-interaction -->
          <button class="btn-action-icon btn-action-like ${post.isLiked ? 'liked' : ''}" data-post-id="${post.id}" aria-label="Like post" style="position:relative;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="like-count">${post.likesCount || 0}</span>
          </button>

          <!-- Bookmark Action -->
          <button class="btn-action-icon btn-action-bookmark ${post.isBookmarked ? 'bookmarked' : ''}" data-post-id="${post.id}" aria-label="Bookmark post">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>

          <!-- Share Action -->
          <button class="btn-action-icon btn-action-share" data-post-id="${post.id}" aria-label="Share post">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </footer>

        <!-- Nested Comments Container (Loaded on click) -->
        <div class="comments-container" id="comments-container-${post.id}"></div>
      </div>
    `;

    bindPostCardEvents(card, post);
    return card;
  };

  const bindPostCardEvents = (card, post) => {
    // Navigate to author profile on avatar / name click
    card.querySelectorAll('[data-user-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const userId = el.dataset.userId;
        Profile.loadProfile(userId);
      });
    });

    // Hashtag clicks
    card.querySelectorAll('.hashtag').forEach(tagEl => {
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        setFilterHashtag(tagEl.dataset.tag);
      });
    });

    // Post image click -> Lightbox
    const imageContainer = card.querySelector('.post-image-container');
    if (imageContainer) {
      imageContainer.addEventListener('click', () => {
        App.openLightbox(imageContainer.dataset.imageUrl);
      });
    }

    // Like button click with heart pop & sparkles
    const likeBtn = card.querySelector('.btn-action-like');
    likeBtn.addEventListener('click', async () => {
      await handleLikePost(post.id, likeBtn);
    });

    // Bookmark button click
    const bookmarkBtn = card.querySelector('.btn-action-bookmark');
    bookmarkBtn.addEventListener('click', async () => {
      await handleBookmarkPost(post.id, bookmarkBtn);
    });

    // Comment button click -> toggle comments drawer
    const commentBtn = card.querySelector('.btn-action-comment');
    commentBtn.addEventListener('click', () => {
      Comments.toggleComments(post.id);
    });

    // Share button click
    const shareBtn = card.querySelector('.btn-action-share');
    shareBtn.addEventListener('click', () => {
      handleSharePost(post.id);
    });

    // More options menu toggle
    const moreBtn = card.querySelector('.btn-more-options');
    const dropdown = card.querySelector(`#dropdown-${post.id}`);
    if (moreBtn && dropdown) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close any other open dropdowns
        document.querySelectorAll('.post-dropdown-menu').forEach(d => {
          if (d !== dropdown) d.style.display = 'none';
        });
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      });

      document.addEventListener('click', () => {
        dropdown.style.display = 'none';
      });

      // Copy link
      const copyBtn = card.querySelector('.btn-copy-link');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.style.display = 'none';
          handleSharePost(post.id);
        });
      }

      // Delete post
      const deleteBtn = card.querySelector('.btn-delete-post');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          dropdown.style.display = 'none';
          if (confirm('Are you sure you want to delete this post?')) {
            try {
              await API.posts.delete(post.id);
              card.remove();
              App.showToast('Post deleted');
            } catch (err) {
              App.showToast(err.message || 'Failed to delete post');
            }
          }
        });
      }
    }
  };

  const handleLikePost = async (postId, btn) => {
    // Play heart bounce animation
    const icon = btn.querySelector('svg');
    icon.classList.remove('anim-heart-pop');
    void icon.offsetWidth; // trigger reflow
    icon.classList.add('anim-heart-pop');

    // Trigger sparkle particle burst if becoming liked
    if (!btn.classList.contains('liked')) {
      createSparkleBurst(btn);
    }

    try {
      const result = await API.posts.toggleLike(postId);
      const countEl = btn.querySelector('.like-count');
      if (result.isLiked) {
        btn.classList.add('liked');
      } else {
        btn.classList.remove('liked');
      }
      if (countEl) countEl.textContent = result.likesCount;
    } catch (err) {
      App.showToast(err.message || 'Failed to like post');
    }
  };

  const createSparkleBurst = (container) => {
    const burst = document.createElement('div');
    burst.className = 'sparkle-container';

    const particles = 8;
    for (let i = 0; i < particles; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle-particle';
      const angle = (i / particles) * 2 * Math.PI;
      const distance = 25 + Math.random() * 15;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      burst.appendChild(p);
    }

    container.appendChild(burst);
    setTimeout(() => burst.remove(), 700);
  };

  const handleBookmarkPost = async (postId, btn) => {
    try {
      const result = await API.posts.toggleBookmark(postId);
      if (result.isBookmarked) {
        btn.classList.add('bookmarked');
        App.showToast('Post saved to bookmarks');
      } else {
        btn.classList.remove('bookmarked');
        App.showToast('Post removed from bookmarks');
      }
    } catch (err) {
      App.showToast('Failed to update bookmark');
    }
  };

  const handleSharePost = (postId) => {
    const shareUrl = `${window.location.origin}/#post-${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      App.showToast('Post link copied to clipboard! 📋');
    }).catch(() => {
      App.showToast('Post URL: ' + shareUrl);
    });
  };

  const setupInfiniteScroll = () => {
    window.addEventListener('scroll', () => {
      if (App.getCurrentView() !== 'home') return;
      if (isLoading || !hasMore) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 500;

      if (scrollPosition >= threshold) {
        loadFeed();
      }
    });
  };

  const loadStories = async () => {
    try {
      const { stories } = await API.discovery.getStories();
      const container = document.getElementById('stories-container');
      if (!container) return;

      container.innerHTML = stories.map(s => `
        <div class="story-item ${s.hasUnseen ? 'has-unseen' : ''}" data-story-id="${s.id}">
          <div class="story-avatar-ring ${s.hasUnseen ? '' : 'seen'}">
            <img src="${s.avatar}" alt="${s.user}">
          </div>
          <span class="story-username">${s.user.split(' ')[0]}</span>
        </div>
      `).join('');

      container.querySelectorAll('.story-item').forEach(item => {
        item.addEventListener('click', () => {
          const storyId = item.dataset.storyId;
          const story = stories.find(s => s.id === storyId);
          if (story) App.openStoryViewer(story);
        });
      });
    } catch (err) {
      console.error('Error loading stories:', err);
    }
  };

  const prependNewPost = (post) => {
    const container = document.getElementById('posts-stream');
    if (!container) return;
    const card = createPostCardElement(post, true);
    container.insertBefore(card, container.firstChild);
  };

  const getSkeletonHTML = (count = 3) => {
    return Array(count).fill(0).map(() => `
      <div class="post-card" style="opacity: 0.7;">
        <div class="post-avatar-col">
          <div class="skeleton skeleton-avatar"></div>
        </div>
        <div class="post-content-col" style="flex:1;">
          <div class="skeleton skeleton-text" style="width: 40%;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 75%;"></div>
          <div class="skeleton skeleton-image"></div>
        </div>
      </div>
    `).join('');
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  };

  return {
    init,
    loadFeed,
    prependNewPost,
    setFilterHashtag
  };
})();
