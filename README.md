# Nexus — Modern Social Media Platform

> **"Connect. Share. Inspire."**  
> A modern social platform where ideas, stories, and communities thrive. Built for creators, by creators.

---

## 🎨 Overview & Highlights

**Nexus** is a full-featured, responsive, accessible social media platform built with sleek UI/UX, micro-interactions, threaded discussions, real-time notifications, and a modular backend REST API.

### 🌟 Key Features

1. **Clean, Modern Layout & Responsive Design**
   - **Desktop (3 Columns)**: Left navigation sidebar, center infinite-scroll feed/views, right discovery sidebar with live search & trending topics.
   - **Tablet (2 Columns)**: Compact icon-based sidebar navigation and flexible main feed.
   - **Mobile (Single Column)**: Fixed top app bar with notifications badge, bottom navigation bar with active indicators, and floating action button (FAB) for instant post creation.
   - **Color Palette**: Neutral base (`slate-50` / `slate-900`) with vibrant royal blue (`#2563eb`), purple (`#7c3aed`), and indigo accents.
   - **Typography**: Precision typography using Google Fonts (**Inter** & **Poppins**).

2. **Micro-Interactions & Motion**
   - **Heart Popping Animation**: Spring-based `@keyframes heartPop` with radial burst of 8 sparkle particles.
   - **Smooth Post Transitions**: `@keyframes fadeInUp` slide-up on new post creation.
   - **Story Viewer Reel**: Interactive full-screen story viewer with progress indicator bar.
   - **Image Lightbox**: Instant full-screen high-resolution modal image viewer.
   - **Skeleton Loaders**: Polished shimmer effect while fetching feed posts.

3. **Accessibility (a11y) First**
   - **High-Contrast Mode**: Enhanced border definitions and pure contrast ratios complying with WCAG/APCA standards.
   - **Reduced Motion Mode**: Respects user motion preferences (`prefers-reduced-motion`) and provides a manual toggle in Settings.
   - **ARIA Roles & Landmarks**: Semantic `<header>`, `<main>`, `<aside>`, `role="feed"`, `role="article"`, `role="dialog"`, `role="status"`.
   - **Keyboard Navigation**: Accessible `:focus-visible` focus rings, `Escape` to close modals, `Ctrl + Enter` to publish posts, `/` to focus search.

4. **Threaded Comments & Emoji Reactions**
   - Multi-level nested replies with visual connecting branch lines.
   - Emoji reaction bar (`❤️`, `👍`, `🔥`, `💡`, `😂`, `🙌`) on individual comments with instant live counts.
   - Comment like system and author deletion controls.

5. **Multi-Method Authentication & Account Switcher**
   - **Google Sign-In**: Authentic simulated Google OAuth modal with instant account creation.
   - **Phone Number OTP**: Phone number input with verification code prompt (Demo code: `2026`).
   - **Email / Password**: Full login and registration forms with validation.
   - **1-Click Persona Switcher**: Instant switching between 5 diverse demo creator accounts:
     - 🎨 **Sarah Chen** (`@sarah_chen`) — Product Designer & Design Systems Lead
     - 📸 **Alex Rivera** (`@alex_lens`) — Street Photographer & Storyteller
     - 🧠 **Dr. Elena Rostova** (`@elena_ai`) — AI Researcher & Cognitive Systems Architect
     - 🎧 **Marcus Vance** (`@marcus_beats`) — Sound Designer & Music Producer
     - ⚡ **Maya Lin** (`@maya_lin`) — Creative Technologist & Frontend Engineer

6. **Rich Post Creation**
   - Text composer with auto-expanding height and real-time 280-character counter (warning and danger thresholds).
   - Drag & drop or file upload for images (`/api/upload` endpoint powered by Multer).
   - Curated Photography Preset Picker for high-resolution Unsplash photos.
   - Quick hashtag suggestion pills (`#DesignSystems`, `#WebDev`, `#Accessibility`, etc.).
   - Interactive emoji picker popover.
   - Audience visibility selector (Public vs Followers Only).

7. **Real-time Notifications Center**
   - Polling updates every 12 seconds with unread badge counter in desktop sidebar and mobile header.
   - Filters: **All**, **Likes**, **Comments**, **Follows**.
   - "Mark all as read" capability.
   - Click-to-jump to relevant posts and creator profiles.

8. **Live Search & Autocomplete**
   - Real-time debounced search for users, hashtags, and posts.
   - Trending topics widget with post volumes.

9. **Landing & Marketing Showcase**
   - Contains the exact Hero Section, Features Section, Community Section, About Section, and Footer specified in the design brief.

---

## 🛠️ Architecture & Tech Stack

```
d:\Sem 3\S O C I A L
│
├── server.js                # Express.js REST API & static server
├── db.js                    # Persistent database layer with seed creator accounts
├── package.json             # Dependencies and start scripts
│
└── public/                  # Frontend single-page application
    ├── index.html           # Semantic HTML5 with ARIA landmarks and responsive views
    ├── css/
    │   ├── style.css        # Core design system, variables, layouts, responsive grids
    │   ├── animations.css   # Heart pop, sparkles burst, skeleton shimmer, transitions
    │   └── landing.css      # Hero, features, community, about, and footer styles
    │
    ├── js/
    │   ├── api.js           # Centralized fetch client for backend endpoints
    │   ├── auth.js          # Authentication state, Google/Phone OTP, account switcher
    │   ├── feed.js          # Post rendering, like micro-interactions, bookmarks
    │   ├── composer.js      # Post creation modal, image upload & presets, emojis
    │   ├── comments.js      # Nested replies, connector lines, emoji reactions
    │   ├── profile.js       # User profile page, followers/following modals, edit profile
    │   ├── notifications.js # Real-time notification center & badge counter
    │   ├── search.js        # Autocomplete search & trending hashtags
    │   ├── settings.js      # Theme toggle, high-contrast, privacy, notification settings
    │   └── app.js           # Router, modal manager, stories viewer, lightbox, toasts
    │
    └── uploads/             # Directory for user-uploaded post media
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch

```bash
# 1. Install dependencies (Express, CORS, Multer)
npm install

# 2. Start the server
npm start
```

Open your browser at:
👉 **`http://localhost:5000`**

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Fetch active user profile and unread notifications count |
| `POST` | `/api/auth/login` | Email/password sign-in |
| `POST` | `/api/auth/signup` | Register new creator account |
| `POST` | `/api/auth/google` | Google OAuth sign-in |
| `POST` | `/api/auth/phone/send-otp` | Request phone verification code (Demo: `2026`) |
| `POST` | `/api/auth/phone/verify-otp` | Verify phone OTP code |
| `POST` | `/api/auth/switch-user` | Switch active account between demo personas |
| `GET` | `/api/posts` | Paginated feed (`tab=for-you|following|trending|media`) |
| `POST` | `/api/posts` | Create new post with text, image, and hashtags |
| `POST` | `/api/posts/:id/like` | Toggle like on post |
| `POST` | `/api/posts/:id/bookmark`| Toggle bookmark on post |
| `DELETE`| `/api/posts/:id` | Delete post (author only) |
| `POST` | `/api/upload` | Upload image file (Multipart form-data) |
| `GET` | `/api/posts/:id/comments`| Fetch threaded comments with nested replies |
| `POST` | `/api/posts/:id/comments`| Add comment or nested reply |
| `POST` | `/api/comments/:id/like` | Like comment |
| `POST` | `/api/comments/:id/react`| Toggle emoji reaction on comment |
| `GET` | `/api/users/:id` | Fetch creator profile and statistics |
| `PUT` | `/api/users/:id` | Update profile information |
| `POST` | `/api/users/:id/follow` | Toggle follow / unfollow user |
| `GET` | `/api/notifications` | Fetch notifications stream & unread count |
| `POST` | `/api/notifications/read`| Mark all notifications as read |
| `GET` | `/api/search?q=query` | Search users, hashtags, and posts |
| `GET` | `/api/stories` | Fetch creator reels and stories |
| `GET` | `/api/trending` | Fetch trending hashtag volumes |

---

## ♿ Accessibility Testing

- **High Contrast**: Open Settings (`#settings`) or click your theme preferences to toggle High-Contrast mode for enhanced border contrast and bold typography.
- **Keyboard Navigation**: Press `Tab` to navigate through interactive elements, `Escape` to close any modal dialog, `Ctrl + Enter` to publish posts, and `/` to focus the search bar.
- **Reduced Motion**: Enable Reduced Motion in Settings to disable transitions and bouncy spring animations.
