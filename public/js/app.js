/**
 * Master Application Controller & Navigation Router
 */
const App = (() => {
  let currentView = 'home';

  const init = async () => {
    // Initialize Settings first (Theme & Contrast)
    Settings.init();

    // Initialize Auth session & active user
    await Auth.init();

    // Initialize Feed, Composer, Comments, Profile, Notifications, Search
    Feed.init();
    Composer.init();
    Profile.init();
    Notifications.init();
    Search.init();
    Follow.loadSuggestedUsers();

    setupNavigation();
    setupModals();
    setupKeyboardShortcuts();

    // Route based on URL hash if any
    handleHashRouting();
    window.addEventListener('hashchange', handleHashRouting);
  };

  const getCurrentView = () => currentView;

  const navigateTo = (viewName) => {
    currentView = viewName;

    // Hide all view containers
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    // Update active nav links (sidebar and mobile)
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.nav === viewName) {
        link.classList.add('active');
      }
    });

    // Show target view panel
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // View-specific actions
    if (viewName === 'home') {
      const titleEl = document.getElementById('main-feed-title');
      if (titleEl) titleEl.textContent = 'Home';
    } else if (viewName === 'notifications') {
      Notifications.loadNotifications();
    } else if (viewName === 'explore') {
      Search.loadTrendingSidebar();
    }
  };

  const handleHashRouting = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'landing' || hash === 'about') {
      navigateTo('landing');
    } else if (hash.startsWith('profile-')) {
      const userId = hash.replace('profile-', '');
      Profile.loadProfile(userId);
    } else if (hash === 'notifications') {
      navigateTo('notifications');
    } else if (hash === 'settings') {
      navigateTo('settings');
    } else if (hash === 'explore') {
      navigateTo('explore');
    } else {
      navigateTo('home');
    }
  };

  const setupNavigation = () => {
    // Sidebar nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = link.dataset.nav;
        if (nav === 'profile') {
          const user = Auth.getCurrentUser();
          Profile.loadProfile(user?.id);
        } else {
          navigateTo(nav);
        }
      });
    });

    // Mobile bottom nav items
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = item.dataset.nav;
        if (nav === 'create') {
          Composer.openCreateModal();
        } else if (nav === 'profile') {
          const user = Auth.getCurrentUser();
          Profile.loadProfile(user?.id);
        } else {
          navigateTo(nav);
        }
      });
    });

    // Floating action button on mobile
    const fab = document.getElementById('mobile-fab-create');
    if (fab) {
      fab.addEventListener('click', () => {
        Composer.openCreateModal();
      });
    }

    // Top Brand Logo click -> Home
    document.querySelectorAll('.brand-link, .brand-logo').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
      });
    });

    // Nav Create Post button
    const btnNavCreate = document.getElementById('btn-nav-create-post');
    if (btnNavCreate) {
      btnNavCreate.addEventListener('click', () => {
        Composer.openCreateModal();
      });
    }

    // Landing Page CTAs
    const btnGetStarted = document.getElementById('btn-hero-get-started');
    if (btnGetStarted) {
      btnGetStarted.addEventListener('click', () => {
        openAuthModal();
      });
    }

    const btnExploreCommunity = document.getElementById('btn-hero-explore');
    if (btnExploreCommunity) {
      btnExploreCommunity.addEventListener('click', () => {
        navigateTo('home');
      });
    }

    const btnJoinConversation = document.getElementById('btn-join-conversation-cta');
    if (btnJoinConversation) {
      btnJoinConversation.addEventListener('click', () => {
        navigateTo('home');
      });
    }
  };

  const setupModals = () => {
    // Close modal on close button click or overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('show');
        }
      });

      overlay.querySelectorAll('.btn-close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.classList.remove('show');
        });
      });
    });
  };

  const closeAllModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(o => o.classList.remove('show'));
  };

  const openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('show');
  };

  // Image Lightbox Viewer
  const openLightbox = (imageUrl) => {
    const modal = document.getElementById('lightbox-modal');
    const imgEl = document.getElementById('lightbox-img');
    if (modal && imgEl) {
      imgEl.src = imageUrl;
      modal.classList.add('show');
    }
  };

  // Interactive Stories Viewer
  const openStoryViewer = (story) => {
    const modal = document.getElementById('story-viewer-modal');
    if (!modal) return;

    const img = document.getElementById('story-viewer-media');
    const avatar = document.getElementById('story-viewer-avatar');
    const author = document.getElementById('story-viewer-author');
    const caption = document.getElementById('story-viewer-caption');
    const progressBar = document.getElementById('story-progress-bar');

    if (img) img.src = story.media;
    if (avatar) avatar.src = story.avatar;
    if (author) author.textContent = story.user;
    if (caption) caption.textContent = story.caption || '';

    modal.classList.add('show');

    // Auto progress animation
    if (progressBar) {
      progressBar.style.width = '0%';
      setTimeout(() => {
        progressBar.style.transition = 'width 5s linear';
        progressBar.style.width = '100%';
      }, 50);

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        modal.classList.remove('show');
      }, 5200);

      modal.dataset.timer = timer;
    }
  };

  const setupKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      // Escape closes modals
      if (e.key === 'Escape') {
        closeAllModals();
        document.querySelectorAll('.search-results-dropdown').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.post-dropdown-menu').forEach(d => d.style.display = 'none');
      }

      // Don't trigger letter shortcuts when user is typing in form controls
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Key 'c' or 'n' -> create post
      if (e.key === 'c' || e.key === 'n') {
        e.preventDefault();
        Composer.openCreateModal();
      }

      // Key '/' -> focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input-sidebar');
        if (searchInput) searchInput.focus();
      }
    });
  };

  // Toast Notification System
  const showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3400);
  };

  return {
    init,
    getCurrentView,
    navigateTo,
    openAuthModal,
    openLightbox,
    openStoryViewer,
    closeAllModals,
    showToast
  };
})();

// Initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
