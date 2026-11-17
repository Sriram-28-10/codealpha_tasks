/**
 * Search & Autocomplete Discovery Module
 */
const Search = (() => {
  let debounceTimer = null;

  const init = () => {
    setupLiveSearch();
    loadTrendingSidebar();
  };

  const setupLiveSearch = () => {
    const input = document.getElementById('search-input-sidebar');
    const dropdown = document.getElementById('search-results-dropdown');

    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const query = input.value.trim();

      if (query.length === 0) {
        dropdown.classList.remove('show');
        dropdown.innerHTML = '';
        return;
      }

      debounceTimer = setTimeout(() => {
        executeSearch(query, dropdown);
      }, 250);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length > 0) {
        dropdown.classList.add('show');
      }
    });
  };

  const executeSearch = async (query, dropdown) => {
    dropdown.innerHTML = `<div style="padding:12px 16px; font-size:0.85rem; color:var(--text-muted);">Searching for "${escapeHTML(query)}"...</div>`;
    dropdown.classList.add('show');

    try {
      const data = await API.search.query(query);
      const { users, hashtags, posts } = data;

      if (users.length === 0 && hashtags.length === 0 && posts.length === 0) {
        dropdown.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.9rem;">No results found for "${escapeHTML(query)}"</div>`;
        return;
      }

      let html = '';

      // Users section
      if (users.length > 0) {
        html += `<div class="search-category-title">People</div>`;
        users.forEach(u => {
          html += `
            <div class="search-item" data-type="user" data-id="${u.id}">
              <img src="${u.avatar}" alt="${u.name}" class="follow-avatar" style="width:34px; height:34px;">
              <div class="follow-user-info">
                <span class="follow-user-name" style="font-size:0.85rem;">
                  ${u.name}
                  ${u.isVerified ? `<svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>` : ''}
                </span>
                <span class="follow-user-handle" style="font-size:0.75rem;">@${u.username}</span>
              </div>
            </div>
          `;
        });
      }

      // Hashtags section
      if (hashtags.length > 0) {
        html += `<div class="search-category-title">Topics</div>`;
        hashtags.forEach(h => {
          html += `
            <div class="search-item" data-type="tag" data-tag="${h.tag}">
              <span style="font-size:1.1rem; color:var(--accent-blue);">#</span>
              <div class="follow-user-info">
                <span style="font-weight:700; font-size:0.9rem;">#${h.tag}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">${h.count} posts</span>
              </div>
            </div>
          `;
        });
      }

      // Posts section
      if (posts.length > 0) {
        html += `<div class="search-category-title">Posts</div>`;
        posts.slice(0, 3).forEach(p => {
          html += `
            <div class="search-item" data-type="post" data-id="${p.id}">
              <div style="font-size:0.85rem; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:260px;">
                <strong>@${p.author.username}</strong>: ${escapeHTML(p.content.slice(0, 40))}...
              </div>
            </div>
          `;
        });
      }

      dropdown.innerHTML = html;

      // Bind result clicks
      dropdown.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
          const type = item.dataset.type;
          dropdown.classList.remove('show');

          if (type === 'user') {
            Profile.loadProfile(item.dataset.id);
          } else if (type === 'tag') {
            Feed.setFilterHashtag(item.dataset.tag);
          } else if (type === 'post') {
            App.navigateTo('home');
            setTimeout(() => {
              const target = document.getElementById(`post-${item.dataset.id}`);
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }
        });
      });
    } catch (err) {
      dropdown.innerHTML = `<div style="padding:12px; color:var(--color-error); font-size:0.85rem;">Search failed</div>`;
    }
  };

  const loadTrendingSidebar = async () => {
    try {
      const { trending } = await API.discovery.getTrending();
      const container = document.getElementById('trending-topics-list');
      if (!container) return;

      container.innerHTML = trending.map(t => `
        <div class="trending-item" data-tag="${t.tag}">
          <span class="trending-category">${t.category}</span>
          <span class="trending-tag">#${t.tag}</span>
          <span class="trending-count">${t.count.toLocaleString()} posts</span>
        </div>
      `).join('');

      container.querySelectorAll('.trending-item').forEach(item => {
        item.addEventListener('click', () => {
          Feed.setFilterHashtag(item.dataset.tag);
        });
      });
    } catch (err) {
      console.error('Error loading trending:', err);
    }
  };

  const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  };

  return {
    init,
    loadTrendingSidebar
  };
})();
