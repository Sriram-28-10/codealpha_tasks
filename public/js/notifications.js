/**
 * Real-time Notifications Center Module
 */
const Notifications = (() => {
  let notificationsList = [];
  let activeFilter = 'all';
  let pollInterval = null;

  const init = () => {
    setupNotificationTabs();
    setupMarkAllRead();
    loadNotifications();

    // Start background polling every 12 seconds for real-time feel
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(loadNotifications, 12000);
  };

  const setupNotificationTabs = () => {
    document.querySelectorAll('.notif-filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.notif-filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.dataset.filter;
        renderFilteredList();
      });
    });
  };

  const setupMarkAllRead = () => {
    const btn = document.getElementById('btn-mark-all-read');
    if (btn) {
      btn.addEventListener('click', async () => {
        try {
          await API.notifications.markAllRead();
          notificationsList.forEach(n => n.read = true);
          updateBadgeCounters(0);
          renderFilteredList();
          App.showToast('All notifications marked as read');
        } catch (err) {
          App.showToast('Failed to mark read');
        }
      });
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await API.notifications.getAll();
      notificationsList = data.notifications || [];
      updateBadgeCounters(data.unreadCount || 0);

      if (App.getCurrentView() === 'notifications') {
        renderFilteredList();
      }
    } catch (err) {
      console.warn('Notifications poll check:', err);
    }
  };

  const updateBadgeCounters = (unreadCount) => {
    const badgeNav = document.getElementById('nav-notif-badge');
    const badgeMobile = document.getElementById('mobile-notif-badge');

    if (badgeNav) {
      badgeNav.textContent = unreadCount;
      if (unreadCount > 0) {
        badgeNav.classList.remove('hidden');
      } else {
        badgeNav.classList.add('hidden');
      }
    }

    if (badgeMobile) {
      badgeMobile.textContent = unreadCount;
      if (unreadCount > 0) {
        badgeMobile.classList.remove('hidden');
      } else {
        badgeMobile.classList.add('hidden');
      }
    }
  };

  const renderFilteredList = () => {
    const container = document.getElementById('notifications-stream');
    if (!container) return;

    let filtered = [...notificationsList];
    if (activeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === activeFilter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 48px 20px; text-align: center; color: var(--text-muted);">
          <svg style="width: 48px; height: 48px; margin: 0 auto 12px; opacity: 0.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px;">Nothing here yet</h3>
          <p style="font-size: 0.9rem;">When people like, comment, or follow you, you'll see alerts here in real-time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(n => {
      const timeFormatted = formatTime(n.createdAt);
      let iconHTML = '';

      if (n.type === 'like') {
        iconHTML = `<div class="notif-type-icon notif-like">❤️</div>`;
      } else if (n.type === 'comment' || n.type === 'reply') {
        iconHTML = `<div class="notif-type-icon notif-comment">💬</div>`;
      } else if (n.type === 'follow') {
        iconHTML = `<div class="notif-type-icon notif-follow">👤</div>`;
      }

      return `
        <div class="notification-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" data-type="${n.type}" data-actor-id="${n.actor.id}" data-post-id="${n.postId || ''}">
          ${iconHTML}
          <div class="notif-body">
            <div class="notif-header">
              <img src="${n.actor.avatar}" alt="${n.actor.name}" class="notif-actor-avatar">
              <span style="font-weight:700; font-size:0.9rem;">${n.actor.name}</span>
            </div>
            <p class="notif-text">${escapeHTML(n.message)}</p>
            <time class="notif-time">${timeFormatted}</time>
          </div>
        </div>
      `;
    }).join('');

    // Bind item click
    container.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const actorId = item.dataset.actorId;
        const postId = item.dataset.postId;
        const type = item.dataset.type;

        if (type === 'follow' && actorId) {
          Profile.loadProfile(actorId);
        } else if (postId) {
          App.navigateTo('home');
          setTimeout(() => {
            const targetEl = document.getElementById(`post-${postId}`);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
              targetEl.style.backgroundColor = 'var(--accent-blue-light)';
              setTimeout(() => targetEl.style.backgroundColor = '', 2000);
            }
          }, 300);
        }
      });
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  };

  return {
    init,
    loadNotifications
  };
})();
