# Court Lab Admin Console

A production-ready React + Supabase admin panel starter template. Clone it, wire up your Supabase project, and start building your features — the auth, layout, routing, and data-access patterns are already in place.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
   - [Step 1 — Clone & Install](#step-1--clone--install)
   - [Step 2 — Set Up Supabase Credentials](#step-2--set-up-supabase-credentials)
   - [Step 3 — Create the Profiles Table](#step-3--create-the-profiles-table)
   - [Step 4 — Enable Email Auth in Supabase](#step-4--enable-email-auth-in-supabase)
   - [Step 5 — Run the Dev Server](#step-5--run-the-dev-server)
5. [Features](#features)
6. [How To Add a New Page](#how-to-add-a-new-page)
7. [How To Add a New Data Service](#how-to-add-a-new-data-service)
8. [Customising the Layout](#customising-the-layout)
9. [UI Component Library](#ui-component-library)
10. [Available Scripts](#available-scripts)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Icons | Lucide React |
| Table | TanStack Table v8 |
| UI primitives | Radix UI Dialog |
| Date utilities | date-fns, react-datepicker |
| Select input | react-select |

---

## Project Structure

```
src/
├── App.tsx                     # Root router — all routes registered here
├── main.tsx                    # React entry point
├── index.css                   # Global styles / Tailwind imports
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx  # Guards all private routes
│   ├── layouts/
│   │   └── MainLayout.tsx      # Sidebar + header shell
│   └── ui/                     # Reusable UI components
│       ├── DefaultButton.tsx
│       ├── DefaultTextField.tsx
│       ├── DefaultDropdown.tsx
│       ├── DefaultMultiSelect.tsx
│       ├── DefaultDatePicker.tsx
│       ├── DefaultSearchField.tsx
│       ├── DefaultDialog.tsx
│       └── Checkbox.tsx
│
├── hooks/                      # Data-access hooks (one per entity)
│   ├── useAuthService.ts       # Session, signIn, signOut
│   ├── useProfileService.ts    # Fetch logged-in user's profile
│   └── useExampleService.ts    # CRUD template — copy for each entity
│
├── pages/
│   ├── Auth/index.tsx          # Login page (public)
│   ├── Dashboard/index.tsx     # Home page (protected) — use as page template
│   └── Settings/index.tsx      # Settings page (protected)
│
├── services/
│   └── supabase.ts             # Supabase client singleton
│
└── types/
    └── Profile.ts              # TypeScript type for the Profiles table
```

---

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url> my-new-project
cd my-new-project

# 2. Install dependencies
npm install

# 3. Configure environment variables (see Configuration below)
cp .env.example .env

# 4. Start the dev server
npm run dev
```

---

## Configuration

### Step 1 — Clone & Install

```bash
git clone <repo-url> my-new-project
cd my-new-project
npm install
```

---

### Step 2 — Set Up Supabase Credentials

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY_HERE
```

**Where to find these values:**

1. Go to [https://supabase.com](https://supabase.com) and open your project.
2. Navigate to **Project Settings → API**.
3. Copy **Project URL** → `VITE_SUPABASE_URL`
4. Copy **Publishable (anon) key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

> **Important:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

### Step 3 — Create the Profiles Table

The layout shell reads the logged-in user's name from a `Profiles` table. Run the following SQL in the **Supabase SQL Editor** to create it:

```sql
CREATE TABLE "Profiles" (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);
```

After creating the table, insert a profile row for your test user (replace the UUID with your actual auth user ID, found in **Supabase → Authentication → Users**):

```sql
INSERT INTO "Profiles" (user_id, first_name, last_name, email, role)
VALUES (
  'YOUR-AUTH-USER-UUID',
  'Jane',
  'Doe',
  'jane@example.com',
  'admin'
);
```

> **Note:** You can extend the `role` column to be an enum or add more columns. Update `src/types/Profile.ts` to match your schema.

---

### Step 4 — Enable Email Auth in Supabase

1. In your Supabase project, go to **Authentication → Providers**.
2. Make sure **Email** is enabled.
3. Optionally disable **Confirm email** during development so you can log in immediately after creating a user.
4. Create a test user under **Authentication → Users → Add user**.

---

### Step 5 — Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You will be redirected to `/login`. Sign in with the test user you created in Step 4.

---

## Features

### ✅ Authentication Flow (Supabase)

- Email + password login via `supabase.auth.signInWithPassword`
- Session is automatically restored from `localStorage` on page reload
- `onAuthStateChange` keeps the session state reactive across the app
- Sign-out clears the session and redirects to `/login`

**Files involved:**
- `src/hooks/useAuthService.ts` — session state, `signIn`, `signOut`
- `src/pages/Auth/index.tsx` — login form UI
- `src/components/auth/ProtectedRoute.tsx` — guards all protected routes

To add more auth methods (e.g. Google OAuth or magic link), open `useAuthService.ts` and add:

```ts
// Magic link
await supabase.auth.signInWithOtp({ email });

// Google OAuth
await supabase.auth.signInWithOAuth({ provider: 'google' });
```

---

### ✅ Protected Routing

All routes except `/login` are wrapped by `<ProtectedRoute>`, which:

1. Waits for the initial session check to complete (`isLoading`).
2. Redirects unauthenticated users to `/login`.
3. Allows authenticated users through to the `<MainLayout>` shell.

The routing architecture in `App.tsx`:

```
/login       → Public (AuthPage)
/            → Redirects to /dashboard
/*           → Protected by <ProtectedRoute>
               Wrapped in <MainLayout> (sidebar + header)
```

---

### ✅ App Shell — Sidebar + Header

`src/components/layouts/MainLayout.tsx` provides the full layout:

| Element | Description |
|---|---|
| **Sidebar** | Left-hand navigation with grouped sections and active-link highlighting |
| **Logo area** | Placeholder at the top of the sidebar — replace with your logo |
| **Header** | Shows a breadcrumb (auto-generated from the active route) and a user dropdown |
| **User dropdown** | Displays the user's name + email from the `Profiles` table; contains Sign out |

---

### ✅ Service Hook Pattern

Each Supabase table gets its own hook file in `src/hooks/`. Hooks expose async functions that call Supabase directly and return typed data or `null` on error.

**Example — consuming a service hook in a page:**

```tsx
import { useState, useEffect } from 'react';
import { useExampleService } from '../../hooks/useExampleService';

const MyPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAll } = useExampleService();

  useEffect(() => {
    getAll().then((data) => {
      if (data) setItems(data);
      setIsLoading(false);
    });
  }, []);

  // ...
};
```

---

### ✅ Soft Delete Pattern

The example service uses a soft-delete strategy by default: instead of issuing a `DELETE`, it sets `is_deleted = true`. All `getAll` queries filter with `.eq('is_deleted', false)`.

If you prefer hard deletes, replace `.update({ is_deleted: true })` with `.delete()` in your service hook.

---

## How To Add a New Page

Follow these three steps:

### Step A — Create the page component

Copy the Dashboard template and rename it:

```
src/pages/Dashboard/index.tsx  →  src/pages/Users/index.tsx
```

Inside the new file:
- Rename the component function (e.g. `Dashboard` → `Users`).
- Update the `<h2>` page title.
- Add your data fetching inside the `useEffect` block.

### Step B — Register the route in `App.tsx`

```tsx
// 1. Import your page
import Users from './pages/Users';

// 2. Add the route inside <AuthenticatedLayout>
<Route path="/users" element={<Users />} />
```

### Step C — Add the link to the sidebar

Open `src/components/layouts/MainLayout.tsx` and add an entry to the `navigationSections` array:

```ts
import { Users } from 'lucide-react'; // pick an icon from https://lucide.dev

const navigationSections = [
  {
    title: 'Management',
    items: [
      { name: 'Users', href: '/users', icon: Users },
    ],
  },
  // ...
];
```

---

## How To Add a New Data Service

1. **Copy** `src/hooks/useExampleService.ts` and rename it (e.g. `useProductService.ts`).
2. Replace `ExampleItem` with your entity name (e.g. `Product`).
3. Replace the `'ExampleItems'` table name string with your Supabase table name.
4. Update the `ExampleItem` interface fields, or better — create a dedicated type file in `src/types/Product.ts` and import it.
5. Import and use the hook in your page component.

**Example skeleton:**

```ts
// src/hooks/useProductService.ts
import { supabase } from '../services/supabase';
import type { Product } from '../types/Product';

export const useProductService = () => {
  const getAll = async (): Promise<Product[] | null> => {
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) { console.error(error); return null; }
    return data as Product[];
  };

  // Add create, update, remove following the same pattern...

  return { getAll };
};
```

---

## Customising the Layout

All customisation points in `MainLayout.tsx` are marked with `✏️` comments. Here is a summary:

| What to change | Where |
|---|---|
| **App name** | Find `Court Lab` text inside the Logo area |
| **Logo image** | Replace the text logo `<div>` with `<img src={yourLogo} />` |
| **Brand / accent color** | Find-and-replace `#3a40d7` with your hex color |
| **Navigation items** | Edit the `navigationSections` array |
| **Sidebar section headings** | Set the `title` property of each section |
| **Header user dropdown items** | Add `<button>` elements inside the dropdown `<div>` |

---

## UI Component Library

Pre-built components are in `src/components/ui/`. All accept standard props and are styled with Tailwind.

| Component | File | Usage |
|---|---|---|
| Button | `DefaultButton.tsx` | Primary / secondary action buttons |
| Text Field | `DefaultTextField.tsx` | Controlled text input |
| Dropdown | `DefaultDropdown.tsx` | Single-select dropdown (react-select) |
| Multi Select | `DefaultMultiSelect.tsx` | Multi-value select (react-select) |
| Date Picker | `DefaultDatePicker.tsx` | Date input (react-datepicker) |
| Search Field | `DefaultSearchField.tsx` | Debounced search input |
| Dialog | `DefaultDialog.tsx` | Modal dialog (Radix UI) |
| Checkbox | `Checkbox.tsx` | Styled checkbox input |

Import any component directly:

```tsx
import DefaultButton from '../../components/ui/DefaultButton';
import DefaultTextField from '../../components/ui/DefaultTextField';
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server at `localhost:5173` |
| `npm run build` | Type-check and build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the entire project |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Your Supabase publishable (anon) API key |

> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser bundle.
