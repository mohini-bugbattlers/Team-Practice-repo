"use client";

import { Bell, Search, User, Menu, Settings, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import AuthService from '../services/auth';
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);

    // Simulate notifications for demo
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: "Trip Update",
        message: "Your managed trip TR-001 has been completed",
        type: "success",
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 2,
        title: "Payment Update",
        message: "Payment of ₹15,000 has been processed",
        type: "success",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileClick = () => {
    router.push('/profile');
    setDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    setDropdownOpen(false);
  };

  const handleNotificationsClick = () => {
    router.push('/notifications');
    setNotificationsOpen(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/auth/login');
    setDropdownOpen(false);
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
                  <input
                    id="search"
                    name="search"
                    className="input-field pl-10"
                    placeholder="Search trips, payments..."
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
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
              {notificationsOpen && (
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
                    <button
                      onClick={handleNotificationsClick}
                      className="w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="ml-3 relative" ref={profileRef}>
              <div className="flex items-center">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-1 hover:bg-gray-50 transition-colors"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-dark-400" />
                </button>
                <div className="ml-3 hidden md:block">
                  <p className="text-sm font-medium text-dark-800">{user?.name || 'Manager User'}</p>
                  <p className="text-xs text-dark-500">{user?.email || 'manager@prathmesh.com'}</p>
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-large border border-gray-100 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-dark-900">{user?.name || 'Manager User'}</p>
                    <p className="text-xs text-dark-500">{user?.email || 'manager@prathmesh.com'}</p>
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
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(dropdownOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setDropdownOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
}
