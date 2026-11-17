/**
 * Settings, Appearance & Accessibility Module
 */
const Settings = (() => {
  const DEFAULT_SETTINGS = {
    theme: 'light',
    highContrast: false,
    reducedMotion: false,
    fontSize: 'normal',
    isPrivate: false,
    allowDms: true,
    showActivity: true,
    emailNotifs: true,
    likeNotifs: true,
    commentNotifs: true,
    followNotifs: true
  };

  let currentSettings = { ...DEFAULT_SETTINGS };

  const init = () => {
    loadSavedSettings();
    setupAppearanceControls();
    setupPrivacyControls();
    setupNotificationToggles();
  };

  const loadSavedSettings = () => {
    const saved = localStorage.getItem('social_settings');
    if (saved) {
      try {
        currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        currentSettings = { ...DEFAULT_SETTINGS };
      }
    }

    applySettings(currentSettings);
  };

  const saveSettings = () => {
    localStorage.setItem('social_settings', JSON.stringify(currentSettings));
  };

  const applySettings = (settings) => {
    // Apply Theme
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }

    // Apply High Contrast Mode
    if (settings.highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }

    // Apply Reduced Motion
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    // Update settings UI toggles if on settings page
    updateControlsUI();
  };

  const updateControlsUI = () => {
    // Theme buttons
    document.querySelectorAll('.theme-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === currentSettings.theme);
    });

    // High Contrast toggle
    const contrastToggle = document.getElementById('setting-toggle-contrast');
    if (contrastToggle) contrastToggle.checked = !!currentSettings.highContrast;

    // Reduced motion toggle
    const motionToggle = document.getElementById('setting-toggle-motion');
    if (motionToggle) motionToggle.checked = !!currentSettings.reducedMotion;

    // Privacy toggles
    const privateToggle = document.getElementById('setting-toggle-private');
    if (privateToggle) privateToggle.checked = !!currentSettings.isPrivate;

    const dmsToggle = document.getElementById('setting-toggle-dms');
    if (dmsToggle) dmsToggle.checked = !!currentSettings.allowDms;

    const activityToggle = document.getElementById('setting-toggle-activity');
    if (activityToggle) activityToggle.checked = !!currentSettings.showActivity;

    // Notification toggles
    const likeToggle = document.getElementById('setting-toggle-like-notifs');
    if (likeToggle) likeToggle.checked = !!currentSettings.likeNotifs;

    const commentToggle = document.getElementById('setting-toggle-comment-notifs');
    if (commentToggle) commentToggle.checked = !!currentSettings.commentNotifs;

    const followToggle = document.getElementById('setting-toggle-follow-notifs');
    if (followToggle) followToggle.checked = !!currentSettings.followNotifs;
  };

  const setupAppearanceControls = () => {
    // Theme options
    document.querySelectorAll('.theme-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        currentSettings.theme = theme;
        saveSettings();
        applySettings(currentSettings);
        App.showToast(`Theme changed to ${theme}`);
      });
    });

    // High Contrast Toggle
    const contrastToggle = document.getElementById('setting-toggle-contrast');
    if (contrastToggle) {
      contrastToggle.addEventListener('change', (e) => {
        currentSettings.highContrast = e.target.checked;
        saveSettings();
        applySettings(currentSettings);
        App.showToast(currentSettings.highContrast ? 'High Contrast Mode Enabled 👁️' : 'High Contrast Mode Disabled');
      });
    }

    // Reduced Motion Toggle
    const motionToggle = document.getElementById('setting-toggle-motion');
    if (motionToggle) {
      motionToggle.addEventListener('change', (e) => {
        currentSettings.reducedMotion = e.target.checked;
        saveSettings();
        applySettings(currentSettings);
        App.showToast(currentSettings.reducedMotion ? 'Reduced Motion Enabled' : 'Animations Restored');
      });
    }
  };

  const setupPrivacyControls = () => {
    const bindToggle = (id, key, label) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          currentSettings[key] = e.target.checked;
          saveSettings();
          App.showToast(`${label} updated`);
        });
      }
    };

    bindToggle('setting-toggle-private', 'isPrivate', 'Account Privacy');
    bindToggle('setting-toggle-dms', 'allowDms', 'Direct Messages');
    bindToggle('setting-toggle-activity', 'showActivity', 'Activity Status');
  };

  const setupNotificationToggles = () => {
    const bindToggle = (id, key, label) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          currentSettings[key] = e.target.checked;
          saveSettings();
          App.showToast(`${label} preference saved`);
        });
      }
    };

    bindToggle('setting-toggle-like-notifs', 'likeNotifs', 'Like alerts');
    bindToggle('setting-toggle-comment-notifs', 'commentNotifs', 'Comment alerts');
    bindToggle('setting-toggle-follow-notifs', 'followNotifs', 'Follower alerts');
  };

  return {
    init,
    getSettings: () => currentSettings
  };
})();
