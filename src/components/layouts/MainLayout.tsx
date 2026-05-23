// ─────────────────────────────────────────────────────────
// MainLayout — App Shell (Sidebar + Header + Content Area)
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useAuthService } from "../../hooks/useAuthService";
import { useProfileService } from "../../hooks/useProfileService";
import type { Profile } from "../../types/Profile";
import courtlabWording from "../../assets/courtlab_wording_only.png";
import courtlabLogo from "../../assets/courtlab_logo_only.png";
import courtlabFull from "../../assets/courtlab_logo.png";

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
];

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, signOut } = useAuthService();
  const { getProfileByUserId } = useProfileService();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      getProfileByUserId(user.id).then((data) => {
        if (data) setProfile(data);
      });
    }
  }, [user?.id]);

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
      <div
        className={`relative ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 px-1`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center px-3 shrink-0 overflow-hidden">
          {isSidebarCollapsed ? (
            <img
              src={courtlabFull}
              alt="Court Lab Logo"
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="flex items-center gap-3 w-full px-3">
              <img
                src={courtlabLogo}
                alt="Court Lab Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <img
                src={courtlabWording}
                alt="Court Lab"
                className={`h-3 w-auto object-contain transition-opacity duration-150 ${
                  isSidebarCollapsed ? "opacity-0" : "opacity-100 delay-200"
                }`}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title || "main"}>
              {/* Section Title */}
              {section.title && (
                <h3
                  className={`text-xs font-bold text-black uppercase tracking-wider mb-2 overflow-hidden whitespace-nowrap transition-all duration-150 ${
                    isSidebarCollapsed
                      ? "opacity-0 h-0 mb-0 pointer-events-none"
                      : "opacity-100 h-auto delay-200 px-1"
                  }`}
                >
                  {section.title}
                </h3>
              )}
              {/* Divider when collapsed */}
              {section.title && isSidebarCollapsed && (
                <div className="border-t border-gray-100 mb-2" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (location.pathname === "/" && item.href === "/dashboard");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      title={isSidebarCollapsed ? item.name : undefined}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isSidebarCollapsed ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-[#FFF1ED] text-[#F14B27]"
                          : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                      }`}
                    >
                      <Icon
                        className={`flex-shrink-0 h-4 w-4 ${
                          isSidebarCollapsed ? "" : "mr-3"
                        } ${
                          isActive
                            ? "text-[#F14B27]"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-150 ${
                          isSidebarCollapsed
                            ? "opacity-0 w-0 pointer-events-none"
                            : "opacity-100 delay-200"
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Toggle Button — centered on right edge */}
        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow-lg transition-all z-10"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-3 h-3" />
          ) : (
            <PanelLeftClose className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* ── Right Panel (Header + Main Content) ─────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
        {/* Global Header */}
        <header className="h-16 flex items-center justify-between px-8 shrink-0">
          <div>{getBreadcrumb()}</div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-[#F14B27]/20 border border-transparent hover:border-gray-200"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col items-start mr-1">
                <span className="text-sm font-bold text-gray-800">
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

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-8 py-5">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
