// ─────────────────────────────────────────────────────────
// App.tsx — Root Router Configuration
//
// ✏️ HOW TO ADD A NEW PAGE IN 3 STEPS:
//
//   STEP A — Create your page component:
//     src/pages/MyPage/index.tsx
//     (copy Dashboard/index.tsx as a starting template)
//
//   STEP B — Import & register it here:
//     import MyPage from './pages/MyPage';
//     <Route path="/my-page" element={<MyPage />} />
//     (add inside the <AuthenticatedLayout> block below)
//
//   STEP C — Add it to the sidebar:
//     Open src/components/layouts/MainLayout.tsx
//     Add an entry to the `navigationSections` array.
//
// ─────────────────────────────────────────────────────────
//
// ROUTING ARCHITECTURE:
//
//   /login          → Public (no auth required)
//   /               → Redirects to /dashboard
//   /*              → Protected by <ProtectedRoute>
//                     Wrapped in <MainLayout> (sidebar + header)
//
// ─────────────────────────────────────────────────────────

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthPage from './pages/Auth';

// ── Pages ─────────────────────────────────────────────────
// ✏️ Import your page components here
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
// Example: import Users from './pages/Users';

// ─────────────────────────────────────────────────────────
// AuthenticatedLayout wraps all protected routes with the
// MainLayout shell (sidebar + header). Adding Outlet here
// means every child route automatically gets the layout.
// ─────────────────────────────────────────────────────────
function AuthenticatedLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route — accessible without login */}
        <Route path="/login" element={<AuthPage />} />

        {/* Protected routes — redirects to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            {/* Default redirect: / → /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ✏️ Register your pages here */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings"  element={<Settings />} />

            {/* Example of adding a new route:
            <Route path="/users"    element={<Users />} />
            <Route path="/products" element={<Products />} />
            */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
