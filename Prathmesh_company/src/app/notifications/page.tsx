"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Truck,
  DollarSign,
  FileText,
  Eye,
  Trash2,
  Filter,
  Search,
  Check,
  X,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  category: 'trip' | 'payment' | 'system' | 'invoice';
  related_id?: number;
  action_url?: string;
}

export default function CompanyNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterType, filterRead]);

  const checkAuthentication = () => {
    const user = AuthService.getUser();
    const token = AuthService.getToken();

    if (!user || !token) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'company') {
      router.push('/auth/login');
      return;
    }

    setIsAuthenticated(true);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // For now, use mock data
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "Trip Approved",
          message: "Your transport request TR-001 has been approved and assigned to driver Rajesh Kumar",
          type: "success",
          timestamp: new Date().toISOString(),
          read: false,
          category: "trip",
          related_id: 1,
          action_url: "/trips",
        },
        {
          id: 2,
          title: "Payment Received",
          message: "Payment of ₹27,500 has been successfully received for completed trip TR-001",
          type: "success",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          category: "payment",
          related_id: 1,
          action_url: "/payments",
        },
        {
          id: 3,
          title: "Invoice Generated",
          message: "Invoice INV-TR-001 has been generated for your completed trip",
          type: "info",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          category: "invoice",
          related_id: 1,
          action_url: "/invoice",
        },
        {
          id: 4,
          title: "New Driver Assigned",
          message: "Driver Priya Sharma has been assigned to your trip TR-002",
          type: "info",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          category: "trip",
          related_id: 2,
          action_url: "/trips",
        },
        {
          id: 5,
          title: "Trip Delayed",
          message: "Your trip TR-002 is experiencing delays due to traffic conditions",
          type: "warning",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          category: "trip",
          related_id: 2,
          action_url: "/trips",
        },
        {
          id: 6,
          title: "Account Verification",
          message: "Your account has been successfully verified and activated",
          type: "success",
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          read: true,
          category: "system",
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filter by read status
    if (filterRead !== "all") {
      filtered = filtered.filter(n => filterRead === "read" ? n.read : !n.read);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredNotifications(filtered);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-secondary-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-primary-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trip': return <Truck className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'invoice': return <FileText className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {!isAuthenticated ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-dark-600">Checking authentication...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-dark-800">Notifications</h1>
              <p className="text-dark-600 mt-1">Stay updated with your account activity and trip status</p>
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn-secondary flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="btn-secondary flex items-center text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              className="card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-medium">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-600">Total</p>
                  <p className="text-2xl font-bold text-dark-800">{notifications.length}</p>
                  <p className="text-xs text-secondary-600 flex items-center mt-1">
                    All notifications
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-medium">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-600">Unread</p>
                  <p className="text-2xl font-bold text-dark-800">{unreadCount}</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    Needs attention
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-medium">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-600">This Week</p>
                  <p className="text-2xl font-bold text-dark-800">
                    {notifications.filter(n => {
                      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return new Date(n.timestamp) > oneWeekAgo;
                    }).length}
                  </p>
                  <p className="text-xs text-primary-600 flex items-center mt-1">
                    Recent activity
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl shadow-medium">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-600">Latest</p>
                  <p className="text-sm font-bold text-dark-800">
                    {notifications.length > 0
                      ? new Date(notifications[0].timestamp).toLocaleDateString()
                      : 'No notifications'
                    }
                  </p>
                  <p className="text-xs text-primary-600 flex items-center mt-1">
                    Most recent
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input-field md:w-40"
                >
                  <option value="all">All Types</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="info">Info</option>
                </select>
                <select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                  className="input-field md:w-32"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications List */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-dark-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-dark-500 text-lg">No notifications found</p>
                <p className="text-dark-400 text-sm mt-1">
                  {searchTerm || filterType !== "all" || filterRead !== "all"
                    ? "Try adjusting your filters"
                    : "You'll see notifications here when there are updates"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-medium ${
                      !notification.read ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (index * 0.05) }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-dark-900">{notification.title}</h4>
                            {getCategoryIcon(notification.category)}
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-dark-500">
                              {new Date(notification.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-dark-600 mb-3">{notification.message}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.type === 'success' ? 'bg-secondary-100 text-secondary-800' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.type === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-primary-100 text-primary-800'
                            }`}>
                              {notification.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-dark-500 capitalize">
                              {notification.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}
