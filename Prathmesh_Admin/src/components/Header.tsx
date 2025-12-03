"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, Menu, Settings, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { socketService } from "@/services/socket";
import AuthService from "@/services/auth";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export default function Header() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  useEffect(() => {
    // Only initialize socket connection if user is authenticated
    if (AuthService.isAuthenticated()) {
      socketService.connect('1');

      // Listen for real-time notifications
      socketService.onNotification((notification: Notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only latest 10
      });

      // Simulate some initial notifications
      setTimeout(() => {
        socketService.simulateNotification(
          "System ready",
          "Real-time notifications are now active",
          "success"
        );
      }, 1000);
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Only add click outside handler if authenticated
    if (!isAuthenticated) return;

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileClick = () => {
    router.push('/profile');
    setShowProfileDropdown(false);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    setShowProfileDropdown(false);
  };

  const handleSignOut = () => {
    AuthService.logout();
    socketService.disconnect();
    router.push('/login');
    setShowProfileDropdown(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    try {
      // For demo purposes, simulate search functionality
      alert('Search functionality implemented! In a full implementation, this would search across trips, companies, drivers, vehicle owners, and payments. Backend search endpoints would need to be added for full functionality.');
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <button className="text-dark-500 hover:text-dark-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-dark-400" />
                  </div>
                  <form onSubmit={handleSearch}>
                    <input
                      id="search"
                      name="search"
                      className="input-field pl-10"
                      placeholder="Search trips, users..."
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="bg-white p-2 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 relative"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-large border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-dark-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-dark-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'success' ? 'bg-secondary-500' :
                                notification.type === 'error' ? 'bg-red-500' : 'bg-primary-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-dark-900">{notification.title}</p>
                                <p className="text-xs text-dark-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-dark-400 mt-2">
                                  {new Date(notification.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated && (
              <div className="ml-3 relative" ref={profileRef}>
                <div className="flex items-center">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-1 hover:bg-gray-50 transition-colors"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-dark-400" />
                  </button>
                  <div className="ml-3 hidden md:block">
                    <p className="text-sm font-medium text-dark-800">Admin User</p>
                    <p className="text-xs text-dark-500">Administrator</p>
                  </div>
                </div>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-large border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-dark-900">Admin User</p>
                      <p className="text-xs text-dark-500">admin@prathmesh.com</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-sm text-dark-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </button>
                      <button
                        onClick={handleSettingsClick}
                        className="w-full text-left px-4 py-2 text-sm text-dark-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
