/**
 * Authentication & Account Switcher Module
 */
const Auth = (() => {
  let currentUser = null;
  let userStats = { followersCount: 0, followingCount: 0, unreadNotifications: 0 };

  const init = async () => {
    try {
      const data = await API.auth.getMe();
      currentUser = data.user;
      userStats = data.stats;
      updateUserUI();
    } catch (err) {
      console.warn('Could not load current user, defaulting to demo user u1', err);
      // Fallback
      API.setAuthSession({ id: 'u1' }, 'user_u1');
      const data = await API.auth.getMe();
      currentUser = data.user;
      userStats = data.stats;
      updateUserUI();
    }

    setupEventListeners();
    loadDemoAccounts();
  };

  const getCurrentUser = () => currentUser;
  const getStats = () => userStats;

  const updateUserUI = () => {
    if (!currentUser) return;

    // Update left sidebar account card
    const userAvatarEl = document.getElementById('sidebar-user-avatar');
    const userNameEl = document.getElementById('sidebar-user-name');
    const userHandleEl = document.getElementById('sidebar-user-handle');

    if (userAvatarEl) userAvatarEl.src = currentUser.avatar;
    if (userNameEl) {
      userNameEl.innerHTML = `
        ${currentUser.name}
        ${currentUser.isVerified ? `<svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
      `;
    }
    if (userHandleEl) userHandleEl.textContent = `@${currentUser.username}`;

    // Update inline composer avatar
    const composerAvatarEl = document.getElementById('composer-active-avatar');
    if (composerAvatarEl) composerAvatarEl.src = currentUser.avatar;

    // Update mobile top avatar
    const mobileAvatarEl = document.getElementById('mobile-header-avatar');
    if (mobileAvatarEl) mobileAvatarEl.src = currentUser.avatar;

    // Update notifications badge
    if (userStats && userStats.unreadNotifications > 0) {
      const badgeNav = document.getElementById('nav-notif-badge');
      const badgeMobile = document.getElementById('mobile-notif-badge');
      if (badgeNav) {
        badgeNav.textContent = userStats.unreadNotifications;
        badgeNav.classList.remove('hidden');
      }
      if (badgeMobile) {
        badgeMobile.textContent = userStats.unreadNotifications;
        badgeMobile.classList.remove('hidden');
      }
    }
  };

  const setupEventListeners = () => {
    // Open Account Switcher Dropdown
    const userCard = document.getElementById('user-account-card');
    const dropdown = document.getElementById('account-switcher-dropdown');

    if (userCard && dropdown) {
      userCard.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    }

    // Auth Modal Tabs (Google, Phone, Email)
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetTab = tab.dataset.authTab;
        document.querySelectorAll('.auth-form-panel').forEach(panel => {
          panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`auth-panel-${targetTab}`);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Google Sign-In button click
    const btnGoogleAuth = document.getElementById('btn-google-auth');
    if (btnGoogleAuth) {
      btnGoogleAuth.addEventListener('click', handleGoogleAuth);
    }

    // Phone OTP flow
    const btnSendOtp = document.getElementById('btn-send-phone-otp');
    const btnVerifyOtp = document.getElementById('btn-verify-phone-otp');

    if (btnSendOtp) {
      btnSendOtp.addEventListener('click', handleSendOtp);
    }
    if (btnVerifyOtp) {
      btnVerifyOtp.addEventListener('click', handleVerifyOtp);
    }

    // Email/Password form submit
    const authForm = document.getElementById('email-auth-form');
    if (authForm) {
      authForm.addEventListener('submit', handleEmailAuth);
    }
  };

  const loadDemoAccounts = async () => {
    try {
      const { users } = await API.auth.getDemoUsers();
      const listEl = document.getElementById('demo-accounts-list');
      if (!listEl) return;

      listEl.innerHTML = users.map(u => `
        <button class="demo-account-item ${u.id === currentUser?.id ? 'active' : ''}" data-user-id="${u.id}">
          <img src="${u.avatar}" alt="${u.name}" class="user-avatar" style="width:34px; height:34px;">
          <div class="user-details">
            <span class="user-name" style="font-size:0.85rem;">${u.name}</span>
            <span class="user-handle" style="font-size:0.75rem;">@${u.username}</span>
          </div>
        </button>
      `).join('');

      listEl.querySelectorAll('.demo-account-item').forEach(item => {
        item.addEventListener('click', async () => {
          const targetId = item.dataset.userId;
          await switchUser(targetId);
        });
      });
    } catch (err) {
      console.error('Error loading demo accounts:', err);
    }
  };

  const switchUser = async (userId) => {
    try {
      const data = await API.auth.switchUser(userId);
      API.setAuthSession(data.user, data.token);
      currentUser = data.user;
      
      const meData = await API.auth.getMe();
      userStats = meData.stats;

      updateUserUI();
      loadDemoAccounts();

      App.showToast(`Switched account to ${currentUser.name}`);
      
      // Refresh active views
      Feed.loadFeed({ reset: true });
      Notifications.loadNotifications();
      Follow.loadSuggestedUsers();
      
      // If currently on profile view, reload profile
      if (App.getCurrentView() === 'profile') {
        Profile.loadProfile(currentUser.id);
      }
    } catch (err) {
      App.showToast(err.message || 'Failed to switch user');
    }
  };

  // Google Login Simulation
  const handleGoogleAuth = async () => {
    try {
      // Simulate OAuth response with authentic Google payload
      const mockGoogleProfile = {
        name: "Google Explorer",
        email: `explorer_${Date.now().toString().slice(-4)}@gmail.com`,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
        googleId: "gid_" + Date.now()
      };

      const data = await API.auth.googleLogin(mockGoogleProfile);
      API.setAuthSession(data.user, data.token);
      currentUser = data.user;

      const meData = await API.auth.getMe();
      userStats = meData.stats;

      updateUserUI();
      App.closeAllModals();
      App.showToast(`Signed in with Google as ${currentUser.name}!`);

      Feed.loadFeed({ reset: true });
      Notifications.loadNotifications();
      Follow.loadSuggestedUsers();
    } catch (err) {
      App.showToast(err.message || 'Google Sign-In failed');
    }
  };

  // Phone OTP Flow
  const handleSendOtp = async () => {
    const phoneInput = document.getElementById('phone-auth-input');
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!phone) {
      App.showToast('Please enter a phone number');
      return;
    }

    try {
      const res = await API.auth.phoneSendOtp(phone);
      document.getElementById('phone-step-1').style.display = 'none';
      document.getElementById('phone-step-2').style.display = 'flex';
      
      const hint = document.getElementById('otp-demo-hint');
      if (hint) hint.textContent = `Demo Code: ${res.demoOtp || '2026'}`;
      
      App.showToast(res.message);
    } catch (err) {
      App.showToast(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    const phoneInput = document.getElementById('phone-auth-input');
    const otpInput = document.getElementById('otp-auth-input');
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const otp = otpInput ? otpInput.value.trim() : '';

    if (!otp) {
      App.showToast('Please enter the verification code');
      return;
    }

    try {
      const data = await API.auth.phoneVerifyOtp(phone, otp);
      API.setAuthSession(data.user, data.token);
      currentUser = data.user;

      const meData = await API.auth.getMe();
      userStats = meData.stats;

      updateUserUI();
      App.closeAllModals();
      App.showToast(`Verified! Welcome ${currentUser.name}`);

      Feed.loadFeed({ reset: true });
      Notifications.loadNotifications();
      Follow.loadSuggestedUsers();
    } catch (err) {
      App.showToast(err.message || 'Invalid verification code');
    }
  };

  // Email/Password Login & Signup
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    const isSignup = document.getElementById('auth-signup-toggle').checked;
    const email = document.getElementById('auth-email-input').value.trim();
    const password = document.getElementById('auth-password-input').value;
    const name = document.getElementById('auth-name-input')?.value.trim();
    const username = document.getElementById('auth-username-input')?.value.trim();

    try {
      let data;
      if (isSignup) {
        data = await API.auth.signup({ email, password, name, username });
      } else {
        data = await API.auth.login({ email, password });
      }

      API.setAuthSession(data.user, data.token);
      currentUser = data.user;

      const meData = await API.auth.getMe();
      userStats = meData.stats;

      updateUserUI();
      App.closeAllModals();
      App.showToast(data.message || `Welcome, ${currentUser.name}!`);

      Feed.loadFeed({ reset: true });
      Notifications.loadNotifications();
      Follow.loadSuggestedUsers();
    } catch (err) {
      App.showToast(err.message || 'Authentication failed');
    }
  };

  return {
    init,
    getCurrentUser,
    getStats,
    switchUser,
    updateUserUI
  };
})();
