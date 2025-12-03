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
} from "lucide-react";
import { motion } from "framer-motion";
import API_CONFIG from '../services/config';
import AuthService from '../services/auth';
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  company_name?: string;
  vehicle_owner_name?: string;
  driver_name?: string;
}

interface DashboardStats {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  totalRevenue: number;
  pendingPayments: number;
  thisMonthRevenue: number;
}

export default function ManagerDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    thisMonthRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

    // Check if user is a manager
    if (user.role !== 'manager') {
      router.push('/auth/login');
      return;
    }

    setIsAuthenticated(true);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await AuthService.get('/manager/dashboard');
      if (response.success) {
        setStats(response.data);
      }

      const tripsResponse = await AuthService.get('/manager/trips');
      if (tripsResponse.success) {
        setTrips(tripsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setLoading(false);
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
        company_name: "ABC Oil Ltd",
        vehicle_owner_name: "XYZ Transports",
        driver_name: "John Doe",
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
        company_name: "DEF Chemicals",
        vehicle_owner_name: "LMN Logistics",
        driver_name: "Jane Smith",
      },
    ];
    setTrips(mockTrips);
    calculateStats(mockTrips);
  };

  const calculateStats = (tripsData: Trip[]) => {
    const totalTrips = tripsData.length;
    const activeTrips = tripsData.filter(t =>
      ['confirmed', 'vehicle_assigned', 'driver_assigned', 'in_transit'].includes(t.status)
    ).length;
    const completedTrips = tripsData.filter(t => t.status === 'completed').length;
    const totalRevenue = tripsData
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.total_amount, 0);
    const pendingPayments = tripsData
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.total_amount, 0);
    const thisMonthRevenue = totalRevenue; // In real app, filter by current month

    setStats({
      totalTrips,
      activeTrips,
      completedTrips,
      totalRevenue,
      pendingPayments,
      thisMonthRevenue,
    });
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
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
              <h1 className="text-3xl font-bold text-dark-800">Manager Dashboard</h1>
              <p className="text-dark-600 mt-1">Oversee transport operations and manage trips</p>
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
                  <p className="text-sm font-medium text-dark-600">Total Trips</p>
                  <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                    {stats.totalTrips}
                  </p>
                  <p className="text-xs text-secondary-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All time
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
                    {stats.activeTrips}
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
                    {stats.completedTrips}
                  </p>
                  <p className="text-xs text-secondary-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Successfully delivered
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
                    ₹{stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-primary-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All completed trips
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
                All Transport Trips
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
                          {trip.company_name} • {new Date(trip.start_date).toLocaleDateString()} •
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
              <Link href="/trips">
                <motion.div
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg mr-3">
                      <Truck className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-dark-800">View All Trips</p>
                      <p className="text-sm text-dark-600">Manage all transport trips</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/payments">
                <motion.div
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-secondary-100 rounded-lg mr-3">
                      <DollarSign className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-dark-800">Payment Management</p>
                      <p className="text-sm text-dark-600">Handle payments and invoices</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/reports">
                <motion.div
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-accent-100 rounded-lg mr-3">
                      <TrendingUp className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="font-medium text-dark-800">Reports & Analytics</p>
                      <p className="text-sm text-dark-600">View performance reports</p>
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
