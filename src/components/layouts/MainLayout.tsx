// ─────────────────────────────────────────────────────────
// MainLayout — App Shell (Sidebar + Header + Content Area)
//
// ✏️ HOW TO CUSTOMIZE FOR A NEW PROJECT:
//
//   1. LOGO:
//      Replace the logo <div> placeholder in the "Logo Area"
//      section with your own <img> tag or SVG component.
//      Example: <img src={yourLogo} alt="My App" className="h-8" />
//
//   2. NAVIGATION ITEMS:
//      Edit the `navigationSections` array below.
//      Each section has a `title` (group label) and `items`.
//      Each item needs: { name, href, icon }
//      Icons come from lucide-react — browse at https://lucide.dev
//
//   3. BRAND COLOR:
//      The active nav item uses bg-[#3a40d7].
//      Do a find-and-replace for "#3a40d7" to change the brand color.
//
//   4. PROFILE DISPLAY:
//      The header shows the user's first/last name from the
//      "Profiles" Supabase table. Update Profile type & query
//      if your table structure is different.
// ─────────────────────────────────────────────────────────

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  BadgeDollarSign,
  Package,
  AlertTriangle,
  ReceiptText,
  // ✏️ Add or swap icons from lucide-react as needed
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useAuthService } from "../../hooks/useAuthService";
import { useProfileService } from "../../hooks/useProfileService";
import type { Profile } from "../../types/Profile";
import courtlabWording from "../../assets/courtlab_wording_only.png";
import courtlabLogo from "../../assets/courtlab_logo_only.png";

// ─────────────────────────────────────────────────────────
// ✏️ NAVIGATION CONFIGURATION
//
// Add your project's pages here.
// Structure:
//   title  → section heading shown above the group (empty = no heading)
//   items  → array of nav links
//     name → label shown in the sidebar
//     href → React Router path (must match a <Route path> in App.tsx)
//     icon → Lucide icon component
// ─────────────────────────────────────────────────────────
const navigationSections = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Point of Sale", href: "/point-of-sale", icon: BadgeDollarSign },
    ],
  },
  {
    title: "Inventory",
    items: [
      { name: "Products", href: "/products", icon: Package },
      { name: "Low Stock", href: "/low-stock", icon: AlertTriangle },
    ],
  },
  {
    title: "Finance",
    items: [{ name: "Transactions", href: "/transactions", icon: ReceiptText }],
  },
  // ✏️ EXAMPLE: Add more sections like this:
  // {
  //   title: 'Management',
  //   items: [
  //     { name: 'Users',    href: '/users',    icon: Users },
  //     { name: 'Products', href: '/products', icon: Package },
  //   ],
  // },
];

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, signOut } = useAuthService();
  const { getProfileByUserId } = useProfileService();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch the current user's profile from Supabase on mount / user change
  useEffect(() => {
    if (user?.id) {
      getProfileByUserId(user.id).then((data) => {
        if (data) setProfile(data);
      });
    }
  }, [user?.id]);

  // Close the header dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─────────────────────────────────────────────────────
  // Auto-generates a breadcrumb label from the active route
  // by matching it against the navigationSections config.
  // Falls back to formatting the URL path if no match found.
  // ─────────────────────────────────────────────────────
  const getBreadcrumb = () => {
    const currentPath =
      location.pathname === "/" ? "/dashboard" : location.pathname;

    for (const section of navigationSections) {
      const exactItem = section.items.find((item) => item.href === currentPath);
      const matchedItem =
        exactItem ||
        section.items.find((item) => currentPath.startsWith(item.href));

      if (matchedItem) {
        if (section.title) {
          return (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 font-medium">{section.title}</span>
              <span className="mx-2 text-gray-300 font-normal">/</span>
              <span className="text-gray-900 font-bold tracking-wide">
                {matchedItem.name}
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center text-sm">
            <span className="text-gray-900 font-bold tracking-wide">
              {matchedItem.name}
            </span>
          </div>
        );
      }
    }

    // Fallback: format the URL slug as a title
    const segments = currentPath.split("/").filter(Boolean);
    if (segments.length > 0) {
      const formatted = segments[0]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return (
        <div className="text-sm text-gray-900 font-bold tracking-wide">
          {formatted}
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-900 font-bold tracking-wide">
        Court Lab Admin Console
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-2 px-6 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={courtlabLogo}
              alt="Court Lab Logo"
              className="w-8 h-8 object-contain"
            />

            <img
              src={courtlabWording}
              alt="Court Lab"
              className="h-3 w-auto object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title || "main"}>
              {section.title && (
                <h3 className="px-1 text-xs font-bold text-black uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  // Active state: exact match or starts-with for nested routes
                  const isActive =
                    location.pathname === item.href ||
                    (location.pathname === "/" && item.href === "/dashboard");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isActive
                          ? "bg-[#FFF1ED] text-[#F14B27]" // ✏️ Active: brand color
                          : "text-gray-500 hover:bg-gray-200 hover:text-gray-700" // Inactive
                      }`}
                    >
                      <Icon
                        className={`mr-3 flex-shrink-0 h-4 w-4 ${
                          isActive
                            ? "text-[#F14B27]"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Right Panel (Header + Main Content) ─────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
        {/* Global Header */}
        <header className="h-16 flex items-center justify-between px-8 shrink-0">
          {/* Breadcrumb — auto-generated from route */}
          <div>{getBreadcrumb()}</div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-[#3a40d7]/50 border border-transparent hover:border-gray-200"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col items-start mr-1">
                <span className="text-sm font-bold text-gray-800">
                  {/* Shows first + last name from Profiles table, fallback to "Username" */}
                  {profile
                    ? `${profile.first_name} ${profile.last_name}`
                    : "Username"}
                </span>
                <span className="text-xs font-medium text-gray-500 truncate max-w-[150px]">
                  {user?.email}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                {/* ✏️ Add more dropdown items here (e.g. "My Profile", "Change Password") */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content — page components render here */}
        <main className="flex-1 overflow-y-auto px-8 py-5">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
