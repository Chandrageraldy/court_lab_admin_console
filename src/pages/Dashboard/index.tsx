import { useState } from "react";

const Dashboard = () => {
  const [isLoading] = useState(false);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="">
          {/* ── Page Header ─────────────────────────────── */}
          <div className="flex items-start justify-between mb-8">
            {/* Left Side - Header Title */}
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            {/* Right Side - Action Buttons */}
          </div>

          {/* ── Page Content ────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
