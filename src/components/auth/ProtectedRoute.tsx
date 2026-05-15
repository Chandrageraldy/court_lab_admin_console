// ─────────────────────────────────────────────────────────
// ProtectedRoute — Guards all authenticated pages
//
// ✏️ HOW IT WORKS:
//   - While the auth session is resolving → shows a spinner
//   - If no session is found → redirects to /login
//   - If session exists → renders child routes via <Outlet />
//
// This component is used in App.tsx to wrap all routes
// that require the user to be logged in.
//
// ✏️ HOW TO ADD ROLE GUARDS:
//   You can extend this to check profile.role:
//     const { profile } = useProfileService();
//     if (profile?.role !== 'admin') return <Navigate to="/403" />;
// ─────────────────────────────────────────────────────────

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthService } from '../../hooks/useAuthService';

export default function ProtectedRoute() {
  const { session, isLoading } = useAuthService();

  // Show a full-screen spinner while Supabase resolves the session
  // This prevents the login page from flashing before redirect
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f6f6f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <span className="text-sm text-slate-400 tracking-wide">Loading…</span>
        </div>
      </div>
    );
  }

  // If no valid session → go to login page
  // If session exists  → render the matched child route
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
