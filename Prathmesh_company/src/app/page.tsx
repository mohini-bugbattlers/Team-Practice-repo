"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Filter,
  Search,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  BarChart3,
  Users,
  Car,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API_CONFIG from "@/services/config";
import AuthService from "@/services/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/hooks/useDashboardData";
import AnalyticsChart from "@/components/AnalyticsChart";

interface Trip {
  id: number;
  trip_number: string;
  route: string;
  status: 'pending' | 'confirmed' | 'vehicle_assigned' | 'driver_assigned' | 'in_transit' | 'completed' | 'cancelled';
  start_date: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  base_amount: number;
  service_charge: number;
  total_amount: number;
  created_at: string;
}

interface PaymentSummary {
  totalPaid: number;
  pendingAmount: number;
  thisMonthPaid: number;
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
}

interface DashboardStats {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalSpent: number;
  pendingPayments: number;
  thisMonthSpent: number;
}

export default function CompanyDashboard() {
  const {
    metrics,
    tripAnalytics,
    paymentAnalytics,
    notifications,
    loading,
    error,
    refreshData,
    markNotificationRead,
    unreadCount,
    connectionStatus,
  } = useDashboardData();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

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
    fetchTrips();
  };

  const fetchTrips = async () => {
    try {
      const response = await AuthService.get('/company/trips');
      if (response.success) {
        setTrips(response.data);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockTrips: Trip[] = [
      {
        id: 1,
        trip_number: "TR-001",
        route: "Mumbai Oil Refinery → Pune Industrial Area",
        status: "in_transit",
        start_date: "2024-01-15T10:00:00Z",
        estimated_delivery_date: "2024-01-16T18:00:00Z",
        base_amount: 25000,
        service_charge: 2500,
        total_amount: 27500,
        created_at: "2024-01-14T09:00:00Z",
      },
      {
        id: 2,
        trip_number: "TR-002",
        route: "Sugar Mill, Kolhapur → Chemical Plant, Nashik",
        status: "pending",
        start_date: "2024-01-20T08:00:00Z",
        estimated_delivery_date: "2024-01-21T16:00:00Z",
        base_amount: 32000,
        service_charge: 3200,
        total_amount: 35200,
        created_at: "2024-01-19T10:00:00Z",
      },
      {
        id: 3,
        trip_number: "TR-003",
        route: "Oil Depot, Vadodara → Factory, Surat",
        status: "completed",
        start_date: "2024-01-18T09:00:00Z",
        estimated_delivery_date: "2024-01-19T17:00:00Z",
        actual_delivery_date: "2024-01-19T16:30:00Z",
        base_amount: 18000,
        service_charge: 1800,
        total_amount: 19800,
        created_at: "2024-01-17T11:00:00Z",
      },
    ];
    setTrips(mockTrips);
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.route?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-active';
      case 'vehicle_assigned': return 'status-active';
      case 'driver_assigned': return 'status-active';
      case 'in_transit': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

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
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-800">Company Dashboard</h1>
          <p className="text-dark-600 mt-1">Manage your transport requests and track payments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              connectionStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : connectionStatus === 'connecting'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus === 'connected' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </div>
            <motion.button
              onClick={refreshData}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
          
          <div className="relative">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-dark-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            notification.type === 'success' ? 'bg-green-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                             notification.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                             notification.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                             <Bell className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-dark-800 text-sm">{notification.title}</p>
                            <p className="text-xs text-dark-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <Link href="/notifications">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all notifications
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/request">
            <motion.button
              className="btn-primary flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transport Request
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-medium">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Requests</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {metrics?.activeTrips || 0}
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {metrics?.monthlyGrowth ? `+${metrics.monthlyGrowth}%` : 'All time'}
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
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Active Trips</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {metrics?.activeTrips || 0}
              </p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                In progress
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
            <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-medium">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Completed</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {metrics?.completedTrips || 0}
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {metrics?.onTimeDeliveryRate ? `${metrics.onTimeDeliveryRate}% on-time` : 'Successfully delivered'}
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
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Revenue</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                ₹{metrics?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                All completed trips
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-medium">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Active Drivers</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {metrics?.driverPerformance?.activeDrivers || 0}
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <Users className="h-3 w-3 mr-1" />
                {metrics?.driverPerformance?.averageRating ? `Avg: ${metrics.driverPerformance.averageRating}★` : 'Total drivers'}
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
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-medium">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Fleet Utilization</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {metrics?.fleetUtilization?.utilizationRate || 0}%
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <Car className="h-3 w-3 mr-1" />
                {metrics?.fleetUtilization?.activeVehicles || 0} of {metrics?.fleetUtilization?.totalVehicles || 0} active
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-medium">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {metrics?.averageDeliveryTime || 0}h
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Average trip duration
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Trips */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-dark-800 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-primary-500" />
            Recent Transport Requests
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Link href="/trips">
              <button className="btn-secondary text-sm flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-dark-600">Loading trips...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-8 text-dark-500">
              No trips found
            </div>
          ) : (
            filteredTrips.slice(0, 5).map((trip, index) => (
              <motion.div
                key={trip.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-medium transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-800">{trip.trip_number}</p>
                    <p className="text-sm text-dark-600">
                      {trip.route}
                    </p>
                    <p className="text-xs text-dark-500">
                      {new Date(trip.start_date).toLocaleDateString()} •
                      {trip.status.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-dark-800">
                    ₹{trip.total_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-dark-500">
                    Base: ₹{trip.base_amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-primary-600 font-medium">
                    Service: ₹{trip.service_charge.toLocaleString()}
                  </p>
                </div>

                <div className={`status-badge ${getStatusColor(trip.status)}`}>
                  {trip.status.replace('_', ' ').toUpperCase()}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Analytics Section */}
      <AnalyticsChart period="month" />

      {/* Quick Actions */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-dark-800 mb-6 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-secondary-500" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/request">
            <motion.div
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-dark-800">New Transport Request</p>
                  <p className="text-sm text-dark-600">Request oil transportation</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/trips">
            <motion.div
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-secondary-100 rounded-lg mr-3">
                  <Truck className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <p className="font-medium text-dark-800">View All Trips</p>
                  <p className="text-sm text-dark-600">Track all your requests</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/payments">
            <motion.div
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div className="p-2 bg-accent-100 rounded-lg mr-3">
                  <DollarSign className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-medium text-dark-800">Payment History</p>
                  <p className="text-sm text-dark-600">View payment records</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
      )}
    </>
  );
}
