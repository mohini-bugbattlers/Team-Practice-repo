"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Truck,
  DollarSign,
  FileText,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthService from "@/services/auth";

interface LayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/trips", icon: Truck, label: "Trips" },
  { href: "/request", icon: Plus, label: "New Request" },
  { href: "/payments", icon: DollarSign, label: "Payments" },
  { href: "/invoice", icon: FileText, label: "Invoices" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/report", icon: BarChart3, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function CompanyLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const userData = AuthService.getUser();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-primary-600">RoadLines</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="p-4">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-colors ${
                        isActive
                          ? "bg-primary-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:block">
        <div className="flex h-full flex-col bg-white shadow-lg">
          <div className="flex items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-primary-600">RoadLines</h2>
          </div>
          <nav className="flex-1 p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Company User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'company@roadlines.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-800">
                  {sidebarItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Link href="/notifications">
                <button className="relative p-2 rounded-lg hover:bg-gray-100">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'C'}
                  </div>
                  <ChevronDown className="h-4 w-4 ml-2 text-gray-600" />
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Link href="/profile">
                        <div className="flex items-center px-4 py-3 hover:bg-gray-50">
                          <User className="h-4 w-4 mr-3 text-gray-600" />
                          <span className="text-sm text-gray-700">Profile</span>
                        </div>
                      </Link>
                      <Link href="/settings">
                        <div className="flex items-center px-4 py-3 hover:bg-gray-50">
                          <Settings className="h-4 w-4 mr-3 text-gray-600" />
                          <span className="text-sm text-gray-700">Settings</span>
                        </div>
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-600" />
                        <span className="text-sm text-gray-700">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
