# Landing Page & Merchant Dashboard Redesign Plan

## Overview
Redesign the BdeshShop landing page with a full-scale video background hero, dropdown navigation, and modern aesthetics. Redesign the merchant dashboard to be more user-friendly, data-rich, and versatile.

---

## Part 1: Landing Page Redesign

### Current Problems
- **No video background** — hero is plain text on white
- **No dropdown menus** — nav links are flat, no sub-navigation
- **No mobile menu** — nav links hidden on mobile with no hamburger
- **Generic design** — looks like a basic template, no visual impact
- **No animations** — static, no scroll effects or transitions
- **Weak footer** — single row, no structure

### New Architecture

#### 1. Navigation Bar (Complete Rewrite)
**File:** `apps/web/app/page.tsx` — inline component

```
┌─────────────────────────────────────────────────────────┐
│ 🏪 BdeshShop   Templates ▾   Features ▾   Pricing      │
│                                Login  |  Create Store →  │
└─────────────────────────────────────────────────────────┘
```

- **Transparent on hero**, becomes solid white with shadow on scroll (using `useState` + `useEffect` scroll listener)
- **Dropdown menus:**
  - "Templates" dropdown → shows 3 template mini-cards with preview thumbnails (Roseo, Modern Shop, Minimal)
  - "Features" dropdown → categorized list (Store, Payments, Delivery, Security)
- **Mobile hamburger menu** → slide-out drawer from right with all nav items + dropdowns expanded
- **Animated logo** with subtle hover scale
- **CTA buttons** with gradient and hover glow effect

#### 2. Hero Section (Full Video Background)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          ★ Trusted by 1,200+ BD businesses             │
│                                                         │
│     Your Online Store,                                 │
│     Ready in 2 Minutes                                 │
│                                                         │
│     Pick a template, add products, start selling.       │
│                                                         │
│     [Create Your Store →]  [See Templates]             │
│                                                         │
│     ✓ Free to start  ✓ bKash & Nagad  ✓ No card       │
│                                                         │
│                    ↓ scroll                             │
└─────────────────────────────────────────────────────────┘
```

- **Full-viewport video background** using `<video>` tag with:
  - `autoPlay`, `muted`, `loop`, `playsInline` attributes
  - Fallback gradient for slow connections / no-JS
  - Dark overlay (gradient from black/60 to black/40) for text readability
  - Video source: free stock video of Bangladesh marketplace/shop (or abstract tech video)
  - Poster image for loading state
- **Animated text entrance** — heading fades in + slides up on mount (CSS animation)
- **Glassmorphism CTA buttons** — semi-transparent with backdrop-blur
- **Scroll indicator** — animated bouncing chevron at bottom
- **Trust badges** with subtle glow

**Video Implementation:**
```tsx
<video
  autoPlay
  muted
  loop
  playsInline
  poster="/hero-poster.jpg"
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/hero-video.mp4" type="video/mp4" />
</video>
<div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
```

**Fallback:** If video fails to load, show a gradient background with animated particles or a high-quality static image.

#### 3. Template Showcase (Enhanced)
- **Category filter tabs** above grid: "All", "Fashion", "Food", "General"
- **Larger cards** with better hover animations (scale + shadow + overlay)
- **Template preview mockup** — show a mini browser frame with gradient preview inside
- **"New" badge** on recently added templates
- **Animated entrance** on scroll (intersection observer)

#### 4. How It Works (Timeline Design)
- **Horizontal timeline** with connecting line and dots
- **Step numbers** in gradient circles
- **Animated icons** that pulse on hover
- **Connecting arrows** between steps

#### 5. Features Section (Bento Grid)
- **Asymmetric bento grid** layout (2x2 + 1 large card)
- **Feature cards** with gradient icon backgrounds
- **Hover effects** — card lifts with shadow
- **Stats counter** — animated number count-up on scroll

#### 6. Testimonials (NEW Section)
- **Customer testimonial cards** with avatar, name, store name
- **Star ratings**
- **Carousel or grid layout**
- 3-4 placeholder testimonials from BD business owners

#### 7. Pricing (Glassmorphism)
- **Glass-effect cards** with subtle border
- **Popular plan** with gradient border glow
- **Better visual hierarchy** — larger price, clearer feature list

#### 8. CTA Section (Gradient + Pattern)
- **Gradient background** with dot pattern overlay
- **Larger text** with more impact
- **Animated arrow** on button

#### 9. Footer (Multi-Column)
```
┌──────────┬──────────┬──────────┬──────────┐
│ BdeshShop│ Product  │ Company  │ Legal    │
│          │ Features │ About    │ Privacy  │
│ 🌐 Social│ Templates│ Blog     │ Terms    │
│          │ Pricing  │ Contact  │          │
│          │ Support  │ Careers  │          │
└──────────┴──────────┴──────────┴──────────┘
│        © 2025 BdeshShop. All rights reserved.        │
└───────────────────────────────────────────────────────┘
```

- **4-column layout** with link groups
- **Social media icons** (Facebook, Instagram, Twitter)
- **Newsletter signup** input
- **Language selector** placeholder

### CSS Additions (globals.css)
- `@keyframes fadeInUp` — hero text entrance
- `@keyframes bounce-slow` — scroll indicator
- `@keyframes count-up` — stats animation
- `.glass` utility class — backdrop-blur + semi-transparent bg
- `.gradient-text` — text with gradient fill
- `.video-overlay` — gradient overlay for video hero

### Assets Needed
- `/public/hero-video.mp4` — stock video (we'll use a free CDN URL or placeholder)
- `/public/hero-poster.jpg` — poster frame for video
- Social media SVG icons (from lucide-react)

---

## Part 2: Merchant Dashboard Redesign

### Current Problems
- **Basic stats** — just 4 number cards, no trends or charts
- **No search** — can't find orders/products quickly
- **No notifications** — no alert system for new orders
- **Limited quick actions** — only 4 actions
- **No onboarding progress** — new users don't know what to do next
- **No data visualization** — no charts or graphs
- **Store cards are basic** — no health indicators or quick stats
- **No activity feed** — can't see what happened recently

### New Architecture

#### 1. Layout Enhancements (`dashboard/layout.tsx`)

**Top Bar Improvements:**
```
┌──────────────────────────────────────────────────────────┐
│ ☰  🔍 Search orders, products...    🔔  👤 Admin ▾     │
└──────────────────────────────────────────────────────────┘
```

- **Search bar** — global search input (searches orders, products, stores)
- **Notification bell** — with badge count for pending orders
- **User dropdown** — avatar with dropdown (Profile, Settings, Logout)
- **Breadcrumb** — shows current page path

**Sidebar Improvements:**
- **Section labels** — "MAIN", "STORE", "SYSTEM" group headers
- **Badge counts** — pending orders count on Orders nav item
- **Collapse button** — toggle sidebar to icon-only mode
- **Active store indicator** — colored dot for active store status

#### 2. Dashboard Page (`dashboard/page.tsx`) — Complete Rewrite

**Section A: Welcome Header**
```
┌─────────────────────────────────────────────────────────┐
│ Good morning, Rahim! 👋                                │
│ Here's what's happening with your stores today.        │
│                                    [Date range picker] │
└─────────────────────────────────────────────────────────┘
```

- **Personalized greeting** based on time of day
- **Date range selector** for filtering stats (Today, 7d, 30d, All)

**Section B: Stats Cards (Enhanced)**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📦 Products  │ │ 🛒 Orders    │ │ 💰 Revenue   │ │ ⏳ Pending   │
│    24        │ │    156       │ │    ৳45,200   │ │    8         │
│ ▲ +3 this wk│ │ ▲ +12 this wk│ │ ▲ +8.2%     │ │ ↓ -2 today  │
│ ▁▃▅▇▅▃▁▃▅  │ │ ▁▃▅▇▅▃▁▃▅  │ │ ▁▃▅▇▅▃▁▃▅  │ │ ▁▃▅▇▅▃▁▃▅  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

- **Sparkline mini-charts** — 7-day trend line using CSS/SVG
- **Trend indicators** — up/down arrows with percentage
- **Color-coded** — green for positive, red for negative trends

**Section C: Revenue Chart (NEW)**
```
┌─────────────────────────────────────────────────────────┐
│ Revenue Overview                          ▾ Last 30 days │
│                                                         │
│  ৳5k ┤                                    ████         │
│  ৳4k ┤              ████          ████  ██████         │
│  ৳3k ┤    ████  ██████████  ████████████ ████████       │
│  ৳2k ┤  ██████████████████████████████████████████      │
│  ৳1k ┤██████████████████████████████████████████████    │
│      └──┬──────┬──────┬──────┬──────┬──────┬──────┬──   │
│        Mon   Tue   Wed   Thu   Fri   Sat   Sun         │
└─────────────────────────────────────────────────────────┘
```

- **Bar chart** using pure CSS (no chart library needed)
- **7-day or 30-day toggle**
- **Tooltip on hover** showing exact amount

**Section D: Two-Column Layout**

**Left Column: Store Health Cards**
```
┌─────────────────────────────────────────────────────────┐
│ Your Stores                              [+ Add Store]  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 🏪 Fashion BD                    ● ACTIVE         │  │
│ │ fashion-bd.bdesh.shop                             │  │
│ │                                                   │  │
│ │ 📦 24 products  🛒 89 orders  💰 ৳32,400        │  │
│ │                                                   │  │
│ │ Setup Progress: ████████░░ 80%                    │  │
│ │ [Manage]  [View Store →]                         │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ 🏪 Electronics Hub               ● ACTIVE         │  │
│ │ ...                                               │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Store health cards** with:
  - Store name, subdomain, status badge
  - Quick stats row (products, orders, revenue)
  - **Setup progress bar** — tracks onboarding completion
  - Action buttons (Manage, View Store)

**Right Column: Recent Activity + Orders**

**Activity Feed (NEW):**
```
┌─────────────────────────────────────────┐
│ Recent Activity                         │
│                                         │
│ 🛒 New order #1024 — ৳1,200    2m ago │
│ 📦 Order #1021 shipped          1h ago │
│ ⭐ New review on "T-Shirt"     3h ago │
│ 🛒 New order #1023 — ৳850      5h ago │
│ ✅ Order #1019 delivered        1d ago │
└─────────────────────────────────────────┘
```

- **Timeline-style activity feed** with icons and relative timestamps
- **Color-coded** by type (order, shipping, review, delivery)

**Order Status Breakdown (NEW):**
```
┌─────────────────────────────────────────┐
│ Order Status                            │
│                                         │
│ Pending     ████████░░░░  8            │
│ Processing  ██████░░░░░░  6            │
│ Shipped     ████░░░░░░░░  4            │
│ Delivered   ██████████████  12         │
│ Cancelled   ██░░░░░░░░░░  2            │
└─────────────────────────────────────────┘
```

- **Horizontal progress bars** for each status
- **Color-coded** matching existing status colors

**Section E: Quick Actions (Enhanced)**
```
┌──────────────────────────────────────────────────────────┐
│ Quick Actions                                            │
│                                                          │
│ [➕ Add Product] [📋 View Orders] [🎨 Customize Store]  │
│ [📊 Analytics]  [🏪 New Store]   [⚙️ Settings]          │
└──────────────────────────────────────────────────────────┘
```

- **6 actions** in 3x2 grid (was 4 in 4-col)
- **Better icons** with gradient backgrounds
- **Hover lift effect**

**Section F: Onboarding Checklist (NEW — for new users)**
```
┌──────────────────────────────────────────────────────────┐
│ 🚀 Get Your Store Ready                                 │
│                                                          │
│ ✅ Create your store                                     │
│ ✅ Choose a template                                     │
│ ⬜ Add your first product                                │
│ ⬜ Set up payment methods                                │
│ ⬜ Share your store link                                 │
│                                                          │
│ 3 of 5 complete  ██████░░░░  60%                        │
└──────────────────────────────────────────────────────────┘
```

- **Shows only when setup < 100%**
- **Checklist items** with links to complete each step
- **Progress bar** showing completion
- **Dismissible** once complete

---

## Implementation Order

### Phase A: Landing Page (Priority — first impression)
1. Add CSS animations and utility classes to `globals.css`
2. Rewrite `page.tsx` with:
   - Transparent → solid navbar with dropdowns + mobile menu
   - Video background hero section
   - Enhanced template showcase with filter tabs
   - Timeline-style "How It Works"
   - Bento grid features section
   - Testimonials section (new)
   - Glassmorphism pricing cards
   - Gradient CTA section
   - Multi-column footer
3. Add video asset to `/public/` (or use CDN URL)
4. Build verification

### Phase B: Merchant Dashboard
1. Update `dashboard/layout.tsx`:
   - Add search bar to top bar
   - Add notification bell with badge
   - Add user dropdown menu
   - Add section labels to sidebar
   - Add badge counts to nav items
2. Rewrite `dashboard/page.tsx`:
   - Welcome header with greeting
   - Enhanced stat cards with sparklines and trends
   - Revenue chart (CSS-based bar chart)
   - Store health cards with progress bars
   - Activity feed timeline
   - Order status breakdown
   - Enhanced quick actions (6 items)
   - Onboarding checklist (conditional)
3. Build verification

### Files to Modify
| File | Changes |
|------|---------|
| `apps/web/app/page.tsx` | Complete rewrite — video hero, dropdowns, modern design |
| `apps/web/app/globals.css` | Add animation keyframes, glass utility, gradient-text |
| `apps/web/app/dashboard/layout.tsx` | Search bar, notifications, user dropdown, sidebar labels |
| `apps/web/app/dashboard/page.tsx` | Complete rewrite — charts, activity feed, store health, onboarding |

### No New Dependencies
All changes use existing dependencies (React, Next.js, Tailwind CSS, lucide-react). No chart libraries — we'll use pure CSS/SVG for charts and sparklines.

### Video Asset Strategy
- Use a free stock video from Pexels/Pixabay CDN (e.g., `https://videos.pexels.com/...`)
- Or embed a placeholder video URL that can be swapped later
- Poster image: gradient fallback or static screenshot
- The video element will have a gradient overlay so quality matters less

### Responsive Design
- **Landing page**: Mobile-first, breakpoints at sm/md/lg/xl
  - Mobile: hamburger menu, stacked sections, smaller text
  - Desktop: dropdown menus, side-by-side layouts, larger hero
- **Dashboard**: Already responsive, enhancing with better mobile cards
