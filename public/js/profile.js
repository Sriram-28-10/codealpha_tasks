/**
 * User Profile & Follow System Module
 */
const Profile = (() => {
  let viewingUserId = null;
  let activeTab = 'posts';

  const init = () => {
    setupProfileTabs();
    setupEditProfileModal();
  };

  const loadProfile = async (userId) => {
    viewingUserId = userId || Auth.getCurrentUser()?.id || 'u1';
    App.navigateTo('profile');

    const container = document.getElementById('profile-view-container');
    if (!container) return;

    container.innerHTML = `
      <div style="padding:40px; text-align:center; color:var(--text-muted);">
        Loading profile...
      </div>
    `;

    try {
      const data = await API.users.getProfile(viewingUserId);
      const user = data.user;
      const stats = data.stats;
      const currentUser = Auth.getCurrentUser();
      const isSelf = currentUser && currentUser.id === user.id;

      container.innerHTML = `
        <!-- Profile Banner -->
        <div class="profile-banner-container">
          <img src="${user.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}" alt="Profile Banner" class="profile-banner-img">
        </div>

        <!-- Profile Details -->
        <div class="profile-details-section">
          <div class="profile-avatar-row">
            <img src="${user.avatar}" alt="${user.name}" class="profile-avatar-large">
            
            <div class="profile-action-buttons">
              ${isSelf ? `
                <button class="btn-outline-primary" id="btn-edit-profile-trigger">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  Edit Profile
                </button>
              ` : `
                <button class="btn-follow ${stats.isFollowing ? 'following' : ''}" id="btn-profile-follow" data-user-id="${user.id}">
                  ${stats.isFollowing ? 'Following' : 'Follow'}
                </button>
              `}
            </div>
          </div>

          <div class="profile-name-group">
            <h2 class="profile-full-name">
              ${user.name}
              ${user.isVerified ? `<svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
            </h2>
            <span class="profile-handle">@${user.username}</span>
          </div>

          <p class="profile-bio-text">${escapeHTML(user.bio || 'No bio yet.')}</p>

          <div class="profile-meta-row">
            ${user.location ? `
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${user.location}</span>
              </div>
            ` : ''}

            ${user.website ? `
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <a href="${user.website}" target="_blank" rel="noopener noreferrer">${user.website.replace(/^https?:\/\//, '')}</a>
              </div>
            ` : ''}

            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Joined ${user.joined || '2024'}</span>
            </div>
          </div>

          <div class="profile-stats-row">
            <div class="stat-link" id="link-following-modal">
              <span class="stat-number" id="profile-following-count">${stats.followingCount}</span>
              <span class="stat-label">Following</span>
            </div>
            <div class="stat-link" id="link-followers-modal">
              <span class="stat-number" id="profile-followers-count">${stats.followersCount}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat-link">
              <span class="stat-number">${stats.totalLikes}</span>
              <span class="stat-label">Likes</span>
            </div>
          </div>
        </div>

        <!-- Profile Tabs -->
        <nav class="profile-tabs" aria-label="Profile navigation">
          <button class="profile-tab ${activeTab === 'posts' ? 'active' : ''}" data-ptab="posts">Posts</button>
          <button class="profile-tab ${activeTab === 'media' ? 'active' : ''}" data-ptab="media">Media</button>
          <button class="profile-tab ${activeTab === 'likes' ? 'active' : ''}" data-ptab="likes">Likes</button>
          ${isSelf ? `<button class="profile-tab ${activeTab === 'bookmarks' ? 'active' : ''}" data-ptab="bookmarks">Bookmarks</button>` : ''}
        </nav>

        <!-- Profile Posts Stream -->
        <div class="profile-posts-stream" id="profile-posts-stream"></div>
      `;

      bindProfileHeaderEvents(user);
      loadProfilePosts();
    } catch (err) {
      console.error('Error loading profile:', err);
      container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--color-error);">User not found.</div>`;
    }
  };

  const bindProfileHeaderEvents = (user) => {
    // Edit profile button
    const editBtn = document.getElementById('btn-edit-profile-trigger');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        openEditProfileModal(user);
      });
    }

    // Follow button
    const followBtn = document.getElementById('btn-profile-follow');
    if (followBtn) {
      followBtn.addEventListener('click', async () => {
        try {
          const res = await API.users.toggleFollow(user.id);
          followBtn.classList.toggle('following', res.following);
          followBtn.textContent = res.following ? 'Following' : 'Follow';
          
          const followersCountEl = document.getElementById('profile-followers-count');
          if (followersCountEl) followersCountEl.textContent = res.followersCount;

          Follow.loadSuggestedUsers();
          App.showToast(res.following ? `Following @${user.username}` : `Unfollowed @${user.username}`);
        } catch (err) {
          App.showToast('Failed to update follow');
        }
      });
    }

    // Followers list modal
    const followersLink = document.getElementById('link-followers-modal');
    if (followersLink) {
      followersLink.addEventListener('click', () => {
        openUsersListModal(user.id, 'followers', `${user.name}'s Followers`);
      });
    }

    // Following list modal
    const followingLink = document.getElementById('link-following-modal');
    if (followingLink) {
      followingLink.addEventListener('click', () => {
        openUsersListModal(user.id, 'following', `People followed by ${user.name}`);
      });
    }

    // Tab buttons
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.ptab;
        loadProfilePosts();
      });
    });
  };

  const loadProfilePosts = async () => {
    const stream = document.getElementById('profile-posts-stream');
    if (!stream) return;

    stream.innerHTML = `<div style="padding:24px; text-align:center; color:var(--text-muted);">Loading posts...</div>`;

    try {
      let params = { authorId: viewingUserId, limit: 20 };
      if (activeTab === 'media') params.tab = 'media';

      const data = await API.posts.getFeed(params);
      stream.innerHTML = '';

      if (data.posts.length === 0) {
        stream.innerHTML = `
          <div style="padding:40px 20px; text-align:center; color:var(--text-muted);">
            <p>No ${activeTab} to show yet.</p>
          </div>
        `;
        return;
      }

      data.posts.forEach(post => {
        // Reuse feed post element creator
        const postCard = Feed.createPostCardElement ? Feed.createPostCardElement(post) : document.createElement('div');
        stream.appendChild(postCard);
      });
    } catch (err) {
      stream.innerHTML = `<div style="padding:20px; color:var(--color-error); text-align:center;">Failed to load user posts</div>`;
    }
  };

  const setupProfileTabs = () => {
    // Handled in loadProfile
  };

  const setupEditProfileModal = () => {
    const form = document.getElementById('edit-profile-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentUser = Auth.getCurrentUser();
      if (!currentUser) return;

      const updates = {
        name: document.getElementById('edit-name-input').value.trim(),
        bio: document.getElementById('edit-bio-input').value.trim(),
        location: document.getElementById('edit-location-input').value.trim(),
        website: document.getElementById('edit-website-input').value.trim(),
        avatar: document.getElementById('edit-avatar-input').value.trim()
      };

      try {
        const res = await API.users.updateProfile(currentUser.id, updates);
        API.setAuthSession(res.user);
        Auth.init(); // Refresh navbar avatar/name
        App.closeAllModals();
        App.showToast('Profile updated successfully! ✨');
        loadProfile(currentUser.id);
      } catch (err) {
        App.showToast(err.message || 'Failed to update profile');
      }
    });
  };

  const openEditProfileModal = (user) => {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    document.getElementById('edit-name-input').value = user.name || '';
    document.getElementById('edit-bio-input').value = user.bio || '';
    document.getElementById('edit-location-input').value = user.location || '';
    document.getElementById('edit-website-input').value = user.website || '';
    document.getElementById('edit-avatar-input').value = user.avatar || '';

    modal.classList.add('show');
  };

  const openUsersListModal = async (userId, type, title) => {
    const modal = document.getElementById('users-list-modal');
    const modalTitle = document.getElementById('users-list-modal-title');
    const listContainer = document.getElementById('users-list-modal-body');

    if (!modal) return;

    if (modalTitle) modalTitle.textContent = title;
    if (listContainer) listContainer.innerHTML = '<div style="padding:20px; text-align:center;">Loading...</div>';
    modal.classList.add('show');

    try {
      const data = type === 'followers' ? await API.users.getFollowers(userId) : await API.users.getFollowing(userId);
      const list = type === 'followers' ? data.followers : data.following;

      if (list.length === 0) {
        listContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted);">No users found.</div>`;
        return;
      }

      listContainer.innerHTML = list.map(u => `
        <div class="follow-suggestion-item" style="padding:10px 0; border-bottom:1px solid var(--border-light);">
          <div class="follow-user-meta" onclick="Profile.loadProfile('${u.id}'); App.closeAllModals();">
            <img src="${u.avatar}" alt="${u.name}" class="follow-avatar">
            <div class="follow-user-info">
              <span class="follow-user-name">${u.name}</span>
              <span class="follow-user-handle">@${u.username}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      listContainer.innerHTML = `<div style="color:var(--color-error); padding:20px;">Failed to load users</div>`;
    }
  };

  const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  };

  return {
    init,
    loadProfile
  };
})();

// Suggested Follows & Follow Helper
const Follow = (() => {
  const loadSuggestedUsers = async () => {
    try {
      const { suggested } = await API.users.getSuggested();
      const container = document.getElementById('suggested-users-list');
      if (!container) return;

      if (suggested.length === 0) {
        container.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted);">No suggestions right now.</div>`;
        return;
      }

      container.innerHTML = suggested.map(u => `
        <div class="follow-suggestion-item" id="suggested-user-${u.id}">
          <div class="follow-user-meta" onclick="Profile.loadProfile('${u.id}')">
            <img src="${u.avatar}" alt="${u.name}" class="follow-avatar">
            <div class="follow-user-info">
              <span class="follow-user-name">
                ${u.name}
                ${u.isVerified ? `<svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
              </span>
              <span class="follow-user-handle">@${u.username}</span>
            </div>
          </div>
          <button class="btn-follow" data-user-id="${u.id}">Follow</button>
        </div>
      `).join('');

      container.querySelectorAll('.btn-follow').forEach(btn => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.userId;
          try {
            const res = await API.users.toggleFollow(userId);
            btn.classList.toggle('following', res.following);
            btn.textContent = res.following ? 'Following' : 'Follow';
            App.showToast(res.following ? 'Followed user' : 'Unfollowed');
          } catch (err) {
            App.showToast('Follow action failed');
          }
        });
      });
    } catch (err) {
      console.error('Error loading suggested users:', err);
    }
  };

  return { loadSuggestedUsers };
})();
