// ─────────────────────────────────────────────────────────
// Dashboard Page — Starter Template
//
// ✏️ HOW TO USE THIS AS A TEMPLATE FOR OTHER PAGES:
//   1. Duplicate this folder (e.g. copy Dashboard → Users)
//   2. Rename the component function
//   3. Add your page's data fetching in the useEffect block
//   4. Register the new route in App.tsx
//
// ✏️ PATTERN USED IN THIS PROJECT:
//   - isLoading → shows a spinner while fetching data
//   - Data is fetched from Supabase via a service hook
//     (e.g. useProfileService, useAuthService, etc.)
//   - All new hooks go in src/hooks/
//   - All new types go in src/types/
// ─────────────────────────────────────────────────────────

import { useState } from 'react';

const Dashboard = () => {
  // ── Loading State ──────────────────────────────────────
  // Set to true while fetching data, false when done.
  // ✏️ When fetching real data, wrap your service calls with:
  //   setIsLoading(true);
  //   const data = await myService.getAll();
  //   setIsLoading(false);
  const [isLoading] = useState(false);

  return (
    <>
      {isLoading ? (
        // Full-page spinner — shown while data is loading
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-2">
          {/* ── Page Header ─────────────────────────────── */}
          <div className="flex items-start justify-between mb-8">
            {/* ✏️ Change this title for each new page */}
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            {/* ✏️ Add action buttons here (e.g. "Add New", "Export") */}
          </div>

          {/* ── Page Content ────────────────────────────── */}
          {/* ✏️ Replace this placeholder with your actual page content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 font-medium">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
