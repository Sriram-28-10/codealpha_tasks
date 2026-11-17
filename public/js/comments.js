/**
 * Nested Comments & Emoji Reactions Module
 */
const Comments = (() => {
  const toggleComments = async (postId) => {
    const container = document.getElementById(`comments-container-${postId}`);
    if (!container) return;

    if (container.classList.contains('show')) {
      container.classList.remove('show');
      return;
    }

    container.classList.add('show');
    container.innerHTML = `
      <div style="padding:14px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
        Loading comments...
      </div>
    `;

    await loadComments(postId);
  };

  const loadComments = async (postId) => {
    const container = document.getElementById(`comments-container-${postId}`);
    if (!container) return;

    try {
      const { comments } = await API.comments.getByPost(postId);
      const currentUser = Auth.getCurrentUser();

      container.innerHTML = `
        <!-- Comment Input Box -->
        <div class="comment-input-row">
          <img src="${currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}" alt="Avatar" class="comment-avatar">
          <form class="comment-input-box" id="form-comment-${postId}">
            <input type="text" placeholder="Write a thoughtful reply..." required id="input-comment-${postId}">
            <button type="submit" class="btn-send-comment">Reply</button>
          </form>
        </div>

        <!-- Threaded Comments List -->
        <div class="comments-list" id="list-comments-${postId}">
          ${comments.length === 0 ? `
            <div style="font-size:0.85rem; color:var(--text-muted); padding:10px 0; text-align:center;">
              No comments yet. Start the conversation!
            </div>
          ` : comments.map(c => renderCommentItemHTML(c, postId)).join('')}
        </div>
      `;

      // Bind top-level comment submission
      const form = document.getElementById(`form-comment-${postId}`);
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const input = document.getElementById(`input-comment-${postId}`);
          const content = input.value.trim();
          if (!content) return;

          try {
            const { comment } = await API.comments.add(postId, { content });
            input.value = '';
            
            // Reload comments list
            await loadComments(postId);
            
            // Increment comment count in UI
            incrementPostCommentCount(postId, 1);
            App.showToast('Reply posted');
          } catch (err) {
            App.showToast(err.message || 'Failed to post comment');
          }
        });
      }

      bindCommentActions(container, postId);
    } catch (err) {
      console.error('Error loading comments:', err);
      container.innerHTML = `<div style="color:var(--color-error); font-size:0.85rem; padding:8px;">Failed to load comments</div>`;
    }
  };

  const renderCommentItemHTML = (comment, postId) => {
    const currentUser = Auth.getCurrentUser();
    const isOwn = currentUser && currentUser.id === comment.author.id;
    const timeFormatted = formatTime(comment.createdAt);

    return `
      <div class="comment-item" id="comment-${comment.id}">
        <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar" style="cursor:pointer;" onclick="Profile.loadProfile('${comment.author.id}')">
        <div class="comment-bubble">
          <div class="comment-author-row">
            <span class="comment-author-name" style="cursor:pointer;" onclick="Profile.loadProfile('${comment.author.id}')">${comment.author.name}</span>
            <time class="comment-time">${timeFormatted}</time>
          </div>
          <p class="comment-text">${escapeHTML(comment.content)}</p>

          <!-- Comment Actions & Reactions -->
          <div class="comment-controls">
            <button class="btn-like-comment ${comment.isLiked ? 'liked' : ''}" data-comment-id="${comment.id}">
              ${comment.isLiked ? '❤️' : '🤍'} ${comment.likesCount > 0 ? comment.likesCount : 'Like'}
            </button>
            <button class="btn-reply-trigger" data-comment-id="${comment.id}" data-username="${comment.author.username}">
              Reply
            </button>
            
            <!-- Quick emoji reaction picker trigger -->
            <div style="position:relative; display:inline-block;">
              <button class="btn-emoji-reaction-trigger" data-comment-id="${comment.id}">😀+</button>
              <div class="emoji-picker-dropdown" id="emoji-picker-${comment.id}" style="display:none; position:absolute; bottom:25px; left:0; background:var(--bg-secondary); border:1px solid var(--border-light); border-radius:var(--radius-full); padding:4px 8px; box-shadow:var(--shadow-md); z-index:10; gap:4px;">
                ${['❤️', '👍', '🔥', '💡', '😂'].map(em => `
                  <button type="button" class="btn-emoji-reaction-choice" data-comment-id="${comment.id}" data-emoji="${em}" style="font-size:1.1rem; padding:2px;">${em}</button>
                `).join('')}
              </div>
            </div>

            ${isOwn ? `
              <button class="btn-delete-comment" data-comment-id="${comment.id}" style="color:var(--color-error); margin-left:auto;">
                Delete
              </button>
            ` : ''}
          </div>

          <!-- Existing reactions pills -->
          <div class="comment-reactions" id="reactions-container-${comment.id}">
            ${renderReactionsPills(comment.reactions, comment.id)}
          </div>

          <!-- Inline Reply Box (Hidden by default) -->
          <div class="reply-composer-inline" id="reply-box-${comment.id}">
            <input type="text" placeholder="Reply to @${comment.author.username}..." class="reply-input" id="input-reply-${comment.id}" style="font-size:0.85rem; padding:6px 10px;">
            <button class="btn-outline-primary btn-submit-reply" data-parent-id="${comment.id}" data-post-id="${postId}" style="font-size:0.8rem; padding:6px 12px;">Reply</button>
          </div>
        </div>
      </div>

      <!-- Nested Child Replies -->
      ${comment.replies && comment.replies.length > 0 ? `
        <div class="nested-replies-list">
          ${comment.replies.map(r => renderCommentItemHTML(r, postId)).join('')}
        </div>
      ` : ''}
    `;
  };

  const renderReactionsPills = (reactions = {}, commentId) => {
    const currentUser = Auth.getCurrentUser();
    return Object.entries(reactions).map(([emoji, users]) => {
      if (!users || users.length === 0) return '';
      const hasReacted = currentUser && users.includes(currentUser.id);
      return `
        <button class="reaction-pill ${hasReacted ? 'active' : ''}" data-comment-id="${commentId}" data-emoji="${emoji}">
          <span>${emoji}</span>
          <span style="font-weight:700;">${users.length}</span>
        </button>
      `;
    }).join('');
  };

  const bindCommentActions = (container, postId) => {
    // Like Comment
    container.querySelectorAll('.btn-like-comment').forEach(btn => {
      btn.addEventListener('click', async () => {
        const commentId = btn.dataset.commentId;
        try {
          const res = await API.comments.toggleLike(commentId);
          btn.innerHTML = `${res.isLiked ? '❤️' : '🤍'} ${res.likesCount > 0 ? res.likesCount : 'Like'}`;
          btn.classList.toggle('liked', res.isLiked);
        } catch (err) {
          App.showToast('Failed to like comment');
        }
      });
    });

    // Toggle Reply Box
    container.querySelectorAll('.btn-reply-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.commentId;
        const username = btn.dataset.username;
        const replyBox = document.getElementById(`reply-box-${commentId}`);
        const input = document.getElementById(`input-reply-${commentId}`);

        if (replyBox) {
          replyBox.classList.toggle('show');
          if (replyBox.classList.contains('show') && input) {
            input.value = `@${username} `;
            input.focus();
          }
        }
      });
    });

    // Submit Reply
    container.querySelectorAll('.btn-submit-reply').forEach(btn => {
      btn.addEventListener('click', async () => {
        const parentId = btn.dataset.parentId;
        const input = document.getElementById(`input-reply-${parentId}`);
        const content = input.value.trim();
        if (!content) return;

        try {
          await API.comments.add(postId, { content, parentId });
          await loadComments(postId);
          incrementPostCommentCount(postId, 1);
          App.showToast('Reply added');
        } catch (err) {
          App.showToast('Failed to submit reply');
        }
      });
    });

    // Emoji reaction picker popover toggle
    container.querySelectorAll('.btn-emoji-reaction-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const commentId = btn.dataset.commentId;
        const dropdown = document.getElementById(`emoji-picker-${commentId}`);
        if (dropdown) {
          dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
        }
      });
    });

    // Choose emoji reaction
    container.querySelectorAll('.btn-emoji-reaction-choice').forEach(btn => {
      btn.addEventListener('click', async () => {
        const commentId = btn.dataset.commentId;
        const emoji = btn.dataset.emoji;
        try {
          const res = await API.comments.toggleReaction(commentId, emoji);
          const reactionsContainer = document.getElementById(`reactions-container-${commentId}`);
          if (reactionsContainer) {
            reactionsContainer.innerHTML = renderReactionsPills(res.reactions, commentId);
            bindReactionPills(reactionsContainer);
          }
          const dropdown = document.getElementById(`emoji-picker-${commentId}`);
          if (dropdown) dropdown.style.display = 'none';
        } catch (err) {
          App.showToast('Failed to add reaction');
        }
      });
    });

    // Reaction pill clicks (toggle reaction)
    bindReactionPills(container);

    // Delete comment
    container.querySelectorAll('.btn-delete-comment').forEach(btn => {
      btn.addEventListener('click', async () => {
        const commentId = btn.dataset.commentId;
        if (confirm('Delete this comment?')) {
          try {
            await API.comments.delete(commentId);
            await loadComments(postId);
            incrementPostCommentCount(postId, -1);
            App.showToast('Comment deleted');
          } catch (err) {
            App.showToast('Failed to delete comment');
          }
        }
      });
    });
  };

  const bindReactionPills = (container) => {
    container.querySelectorAll('.reaction-pill').forEach(pill => {
      pill.addEventListener('click', async () => {
        const commentId = pill.dataset.commentId;
        const emoji = pill.dataset.emoji;
        try {
          const res = await API.comments.toggleReaction(commentId, emoji);
          const parent = document.getElementById(`reactions-container-${commentId}`);
          if (parent) {
            parent.innerHTML = renderReactionsPills(res.reactions, commentId);
            bindReactionPills(parent);
          }
        } catch (err) {
          console.error(err);
        }
      });
    });
  };

  const incrementPostCommentCount = (postId, delta) => {
    const card = document.getElementById(`post-${postId}`);
    if (card) {
      const countEl = card.querySelector('.comment-count');
      if (countEl) {
        const current = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = Math.max(0, current + delta);
      }
    }
  };

  const formatTime = (isoString) => {
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
    toggleComments,
    loadComments
  };
})();
