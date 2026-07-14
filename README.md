# Alpha Admin Dashboard

A premium SaaS Administrative Dashboard built using **Next.js 15 App Router**, **React 19**, **Tailwind CSS v4**, and client-side LocalStorage session structures. Designed with high-fidelity aesthetics inspired by Vercel, Linear, and Stripe.

---

## Project Overview

Alpha Admin Dashboard is a frontend engineering template showcasing layout grids, advanced catalog filter query engines, role-based pathways permissions, Recharts reporting widgets, and drag-and-drop table layouts.

### User Roles & Demo Credentials

The dashboard uses simulated authentication completely synchronized with browser `LocalStorage`:

*   **Administrator Account**
    *   **Email**: `admin@alpha.com`
    *   **Password**: `admin123`
    *   **Role**: `admin`
    *   **Privileges**: Full access (Dashboard, Products Catalog, Product Details, Analytics reporting, Publish/Unpublish visibilities, Table customize layouts).
*   **Staff Account**
    *   **Email**: `user@alpha.com`
    *   **Password**: `user123`
    *   **Role**: `user`
    *   **Privileges**: Limited access (Products Catalog, Product Details - Read-Only). Restoring analytics or dashboard views redirects them to an unauthorized fall-back screen. Draft items are completely hidden.

---

## Features

### 🔐 Client-Side Authentication & Session Hydration
*   Hydrates authentication state from `localStorage` on client mount.
*   Enforces route guards using a client-side `<RoleGuard>` wrapper to block unauthorized navigation.
*   Secure login cards with email/password input validations and instant test filling shortcuts.

### 📦 Dynamic Products Directory
*   **Debounced Catalog Search**: Search triggers on a `300ms` keystroke pause, matching text against name, brand, or category.
*   **Multi-Select Category Popovers**: Filters listings using a custom checkbox checklist that keeps selections active.
*   **Clickable Header Columns Sorts**: Click table column headers to toggle Ascending, Descending, or Unsorted order.
*   **Responsive Page Sizes Pagination**: Supports page sizes of `10`, `20`, and `50` items. Matches values in the URL and caches selected limits in `localStorage`.
*   **URL State Synchronization**: Every filter query parameters matches the browser URL, preserving state on page reloads or link shares.

### 🎛️ Layout Primitives (Bonus Features)
*   **Show/Hide Customizer**: A customization checklist dropdown allows hiding specific columns (such as Rating or Discount). Persisted locally.
*   **Draggable Table Reordering**: Rearrange table columns using HTML5 Drag and Drop triggers by dragging column headers. Layout changes persist automatically.

### 🔄 Real-Time Synchronizer
*   A 15-second polling loop query verifies catalog updates. Reuses a cached service proxy to prevent API spamming. Displays a toast alert when updates occur.

### 📊 Recharts Reporting Dashboard (Admins Only)
*   **Pie Chart**: Category distribution ratios.
*   **Bar Chart**: Total products count per category.
*   **Line Chart**: Average review ratings per category folder.
*   **Horizontal Bar Chart**: Capital inventory asset value per category.
*   **Business Insights**: Live summary cards evaluating highest/lowest rated categories, stock metrics, and density values.

---

## Architecture & Folder Structure

```text
src/
├── app/                      # Flat Page Routes (Next.js 15 App Router)
│   ├── analytics/            # Admin analytics dashboard page
│   ├── dashboard/            # Admin metrics summary dashboard
│   ├── login/                # Dark-themed login page
│   ├── products/             # Shared products catalog listing
│   │   ├── [id]/             # Dynamic details view with visibility toggles
│   ├── unauthorized/         # Access restriction fallback page
│   ├── layout.js             # Root layout wrapping AuthProvider
│   ├── loading.js            # Suspense page routing transition loading
│   └── page.js               # Landing routing redirect page
│
├── config/                   # Configuration items
│   ├── constants.js          # LocalStorage keys and demo credentials
│   ├── navigation.js         # Sidebar navigation links config
│   └── roles.js              # Access paths roles mapping
│
├── context/                  # React Context definitions
│   └── AuthContext.js        # Auth state store and localStorage handlers
│
├── hooks/                    # Reusable Custom React Hooks
│   ├── useAuth.js            # Accesses AuthContext
│   ├── useLocalStorage.js    # Syncs states with localStorage (hydration-safe)
│   └── useProductsList.js    # Manages listings and URL query states
│
├── services/                 # Centralized Services Layer
│   └── products.js           # API proxy layer (caching, sorting, and roles)
│
└── components/               # UI components
    ├── ui/                   # Reusable atomic UI primitives
    │   ├── Button.js, Input.js, Badge.js, Modal.js, Dropdown.js,
    │   └── SearchInput.js, Select.js, Pagination.js, Loader.js, Toast.js, Card.js
    │
    ├── DashboardLayout.js    # Outer responsive dashboard frame
    ├── Sidebar.js            # Collapsible navigation drawer
    ├── Navbar.js             # Header containing breadcrumbs and user details
    ├── TableContainer.js     # Responsive overflow table wrapper
    ├── LoadingSkeleton.js    # pulsating metric and list loaders
    ├── EmptyState.js         # Dash listing fallback layouts
    └── NotFound.js           # Page not found error layouts
```

---

## Performance Optimizations

1.  **Single-Fetch Promise Cache**: The service layer queries the catalog endpoint exactly once and caches the Promise. Subsequent pagination or filter actions run in-memory, yielding sub-millisecond response rates.
2.  **Derived Memoizations**: Heavy calculations (such as category aggregation maps, KPI aggregations, and business insights) are wrapped in `useMemo` blocks to avoid re-calculating values on re-render.
3.  **Preventing Render Loops**: Handlers passed down component trees are wrapped in `useCallback` hooks. Dynamic lists use distinct keys and `React.memo` is used on sub-components to limit re-renders.
4.  **Lazy Loading**: Images use `loading="lazy"` attributes, and page assets load asynchronously on route transitions using standard Next.js Suspense boundary configurations.

---

## Installation & Running Locally

Ensure you have Node.js version 18+ installed on your system.

```bash
# 1. Clone or download project files
cd alpha-admin-dashboard

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Compile optimized production build
npm run build

# 5. Run compiled production preview
npm start
```

---

## Deployment (Vercel)

The codebase compiles with zero errors and is fully prepared for Vercel deployment:

1.  Push codebase to a Git repository (GitHub/GitLab).
2.  Connect Vercel to the Git repository.
3.  Vercel automatically detects Next.js settings and runs `npm run build` to build.
