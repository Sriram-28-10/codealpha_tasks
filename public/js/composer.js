/**
 * Post Composer & Media Uploads Module
 */
const Composer = (() => {
  let selectedImageUrl = null;
  let selectedFile = null;

  const PRESET_IMAGES = [
    { title: "Design Minimal", url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80" },
    { title: "Tokyo City", url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80" },
    { title: "AI Neural", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1000&auto=format&fit=crop&q=80" },
    { title: "Code & Craft", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80" },
    { title: "Sound Waves", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80" }
  ];

  const init = () => {
    setupInlineComposer();
    setupModalComposer();
    setupEmojiPickers();
    setupPresetPickers();
  };

  const setupInlineComposer = () => {
    const textarea = document.getElementById('composer-textarea-inline');
    const charCounter = document.getElementById('composer-char-count-inline');
    const submitBtn = document.getElementById('btn-submit-post-inline');
    const imageInput = document.getElementById('composer-image-input-inline');
    const previewContainer = document.getElementById('composer-preview-inline');
    const previewImg = document.getElementById('composer-preview-img-inline');
    const removePreviewBtn = document.getElementById('btn-remove-preview-inline');

    if (!textarea) return;

    // Auto resize & character counter
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      updateCharCount(textarea.value.length, charCounter, submitBtn);
    });

    // Keyboard shortcut Ctrl+Enter
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitPost('inline');
      }
    });

    // Image file selection
    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0], previewContainer, previewImg);
      });
    }

    if (removePreviewBtn) {
      removePreviewBtn.addEventListener('click', () => {
        clearImageSelection(previewContainer, previewImg, imageInput);
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => submitPost('inline'));
    }
  };

  const setupModalComposer = () => {
    const textarea = document.getElementById('composer-textarea-modal');
    const charCounter = document.getElementById('composer-char-count-modal');
    const submitBtn = document.getElementById('btn-submit-post-modal');
    const imageInput = document.getElementById('composer-image-input-modal');
    const previewContainer = document.getElementById('composer-preview-modal');
    const previewImg = document.getElementById('composer-preview-img-modal');
    const removePreviewBtn = document.getElementById('btn-remove-preview-modal');

    if (!textarea) return;

    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      updateCharCount(textarea.value.length, charCounter, submitBtn);
    });

    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitPost('modal');
      }
    });

    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0], previewContainer, previewImg);
      });
    }

    if (removePreviewBtn) {
      removePreviewBtn.addEventListener('click', () => {
        clearImageSelection(previewContainer, previewImg, imageInput);
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => submitPost('modal'));
    }
  };

  const updateCharCount = (length, counterEl, btnEl) => {
    const max = 280;
    const remaining = max - length;
    if (counterEl) {
      counterEl.textContent = remaining;
      counterEl.classList.remove('warning', 'danger');
      if (remaining <= 20 && remaining > 0) {
        counterEl.classList.add('warning');
      } else if (remaining <= 0) {
        counterEl.classList.add('danger');
      }
    }
    if (btnEl) {
      btnEl.disabled = length === 0 || remaining < 0;
    }
  };

  const handleFileSelect = (file, containerEl, imgEl) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      App.showToast('Please select a valid image file');
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImageUrl = e.target.result;
      if (imgEl) imgEl.src = selectedImageUrl;
      if (containerEl) containerEl.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  const clearImageSelection = (containerEl, imgEl, inputEl) => {
    selectedImageUrl = null;
    selectedFile = null;
    if (imgEl) imgEl.src = '';
    if (containerEl) containerEl.style.display = 'none';
    if (inputEl) inputEl.value = '';
  };

  const setupEmojiPickers = () => {
    const emojis = ['😀', '🔥', '💡', '✨', '🎨', '🚀', '❤️', '🙌', '💻', '📸'];

    document.querySelectorAll('.btn-emoji-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode || 'inline';
        const picker = document.getElementById(`emoji-popover-${mode}`);
        if (!picker) return;

        picker.innerHTML = emojis.map(em => `<button type="button" class="emoji-btn" style="font-size:1.3rem; padding:4px; border-radius:6px;">${em}</button>`).join('');
        picker.style.display = picker.style.display === 'flex' ? 'none' : 'flex';

        picker.querySelectorAll('.emoji-btn').forEach(ebtn => {
          ebtn.addEventListener('click', () => {
            const textarea = document.getElementById(`composer-textarea-${mode}`);
            if (textarea) {
              textarea.value += ebtn.textContent;
              textarea.dispatchEvent(new Event('input'));
              textarea.focus();
            }
            picker.style.display = 'none';
          });
        });
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.emoji-popover').forEach(p => p.style.display = 'none');
    });
  };

  const setupPresetPickers = () => {
    document.querySelectorAll('.btn-presets-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode || 'inline';
        const modal = document.getElementById('presets-picker-modal');
        if (!modal) return;

        const grid = document.getElementById('presets-picker-grid');
        grid.innerHTML = PRESET_IMAGES.map(p => `
          <div class="preset-card-item" data-url="${p.url}" style="cursor:pointer; border-radius:12px; overflow:hidden; border:2px solid var(--border-light); position:relative; aspect-ratio:16/9;">
            <img src="${p.url}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">
            <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.6); color:#fff; font-size:0.75rem; padding:4px 8px; font-weight:600;">
              ${p.title}
            </div>
          </div>
        `).join('');

        modal.classList.add('show');

        grid.querySelectorAll('.preset-card-item').forEach(item => {
          item.addEventListener('click', () => {
            selectedImageUrl = item.dataset.url;
            selectedFile = null;

            const previewContainer = document.getElementById(`composer-preview-${mode}`);
            const previewImg = document.getElementById(`composer-preview-img-${mode}`);
            if (previewImg) previewImg.src = selectedImageUrl;
            if (previewContainer) previewContainer.style.display = 'block';

            modal.classList.remove('show');
            App.showToast('Preset image selected! 🎨');
          });
        });
      });
    });
  };

  const submitPost = async (mode) => {
    const textarea = document.getElementById(`composer-textarea-${mode}`);
    const audienceSelect = document.getElementById(`composer-audience-${mode}`);
    const submitBtn = document.getElementById(`btn-submit-post-${mode}`);

    if (!textarea) return;
    const content = textarea.value.trim();

    if (!content && !selectedImageUrl) {
      App.showToast('Post cannot be empty');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';
    }

    try {
      let finalImageUrl = selectedImageUrl;

      // If user uploaded a physical file, upload to server
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await API.posts.uploadImage(formData);
        finalImageUrl = uploadRes.imageUrl;
      }

      const postData = {
        content,
        image: finalImageUrl,
        audience: audienceSelect ? audienceSelect.value : 'public'
      };

      const result = await API.posts.create(postData);

      // Clean up composer state
      textarea.value = '';
      textarea.style.height = 'auto';
      updateCharCount(0, document.getElementById(`composer-char-count-${mode}`), submitBtn);
      clearImageSelection(
        document.getElementById(`composer-preview-${mode}`),
        document.getElementById(`composer-preview-img-${mode}`),
        document.getElementById(`composer-image-input-${mode}`)
      );

      if (mode === 'modal') {
        App.closeAllModals();
      }

      // Add to feed immediately
      Feed.prependNewPost(result.post);
      App.showToast('Post published to community! ✨');
    } catch (err) {
      App.showToast(err.message || 'Failed to publish post');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    }
  };

  const openCreateModal = () => {
    const modal = document.getElementById('post-creation-modal');
    if (modal) {
      modal.classList.add('show');
      const textarea = document.getElementById('composer-textarea-modal');
      if (textarea) setTimeout(() => textarea.focus(), 100);
    }
  };

  return {
    init,
    openCreateModal
  };
})();
