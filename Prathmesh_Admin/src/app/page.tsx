"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Truck, FileText, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AuthService from "@/services/auth";
import { socketService } from "@/services/socket";
import { toast } from "react-hot-toast";

interface DashboardStats {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  totalRevenue: number;
  totalCompanies: number;
  totalVehicleOwners: number;
  totalDrivers: number;
  totalManagers: number;
}

// Mock fallback data
const fallbackStats: DashboardStats = {
  totalTrips: 1247,
  activeTrips: 23,
  completedTrips: 1224,
  totalRevenue: 2847500,
  totalCompanies: 45,
  totalVehicleOwners: 67,
  totalDrivers: 156,
  totalManagers: 8,
};

const revenueData = [
  { name: "Jan", revenue: 240000 },
  { name: "Feb", revenue: 280000 },
  { name: "Mar", revenue: 320000 },
  { name: "Apr", revenue: 290000 },
  { name: "May", revenue: 350000 },
  { name: "Jun", revenue: 310000 },
];

const tripStatusData = [
  { name: "Completed", value: 1224, color: "#22c55e" },
  { name: "In Progress", value: 23, color: "#f97316" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(fallbackStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();

    // Set up real-time updates
    if (AuthService.isAuthenticated()) {
      socketService.connect("1");

      // Listen for trip updates
      socketService.onTripUpdate((tripData: any) => {
        setStats((prev) => ({
          ...prev,
          totalTrips: prev.totalTrips + 1,
          activeTrips:
            tripData.status === "in_transit"
              ? prev.activeTrips + 1
              : prev.activeTrips,
          completedTrips:
            tripData.status === "completed"
              ? prev.completedTrips + 1
              : prev.completedTrips,
          totalRevenue:
            tripData.status === "completed"
              ? prev.totalRevenue + (tripData.totalCost || 0)
              : prev.totalRevenue,
        }));

        // Show toast notification
        if (tripData.status === "completed") {
          toast.success(
            `Trip #${tripData.id} completed! Revenue: ₹${
              tripData.totalCost || 0
            }`
          );
        } else if (tripData.status === "in_transit") {
          toast(`Trip #${tripData.id} is now in transit`, {
            icon: "🚚",
          });
        }
      });

      // Listen for new user registrations
      socketService.onUserUpdate((userData: any) => {
        setStats((prev) => ({
          ...prev,
          totalDrivers:
            userData.role === "driver"
              ? prev.totalDrivers + 1
              : prev.totalDrivers,
          totalVehicleOwners:
            userData.role === "vehicle_owner"
              ? prev.totalVehicleOwners + 1
              : prev.totalVehicleOwners,
          totalManagers:
            userData.role === "manager"
              ? prev.totalManagers + 1
              : prev.totalManagers,
        }));

        // Show toast notification
        toast.success(
          `New ${userData.role.replace("_", " ")} registered: ${
            userData.name || userData.email
          }`
        );
      });
    }

    // Simulate some real-time updates for demo
    const simulateUpdates = () => {
      // Simulate trip completion
      setTimeout(() => {
        socketService.simulateTripUpdate({
          id: Math.floor(Math.random() * 1000),
          status: "completed",
          totalCost: Math.floor(Math.random() * 5000) + 1000,
        });
      }, 2000);

      // Simulate new driver
      setTimeout(() => {
        socketService.simulateUserUpdate({
          role: "driver",
          name: "John Doe",
          email: "john@example.com",
        });
      }, 4000);
    };

    // Start simulation after 3 seconds
    setTimeout(simulateUpdates, 3000);

    return () => {
      socketService.disconnect();
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await AuthService.get("/reports/trips?status=completed");
      if (response.success && response.data.length > 0) {
        const trips = response.data;
        const completedTrips = trips.filter(
          (t: any) => t.status === "completed"
        );
        const inTransitTrips = trips.filter(
          (t: any) => t.status === "in_transit"
        );

        setStats({
          totalTrips: trips.length,
          activeTrips: inTransitTrips.length,
          completedTrips: completedTrips.length,
          totalRevenue: completedTrips.reduce(
            (sum: number, trip: any) => sum + (trip.totalCost || 0),
            0
          ),
          totalCompanies: 45, // fallback or future API
          totalVehicleOwners: 67,
          totalDrivers: 156,
          totalManagers: 8,
        });
      } else {
        setStats(fallbackStats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
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
          <h1 className="text-3xl font-bold text-dark-800">Dashboard</h1>
          <p className="text-dark-600 mt-1">
            Welcome back! Here's an overview of your transport operations.
          </p>
        </div>
        <div className="text-sm text-dark-500 bg-white px-4 py-2 rounded-lg shadow-soft">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Trips */}
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-medium">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Trips</p>
              <p className="text-2xl font-bold text-dark-800">
                {stats.totalTrips}
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> +12% from last month
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Trips */}
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-medium">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Active Trips</p>
              <p className="text-2xl font-bold text-dark-800">
                {stats.activeTrips}
              </p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                Currently in transit
              </p>
            </div>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-medium">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Revenue</p>
              <p className="text-2xl font-bold text-dark-800">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Total Users */}
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-accent-400 to-accent-500 rounded-xl shadow-medium">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Users</p>
              <p className="text-2xl font-bold text-dark-800">
                {stats.totalCompanies +
                  stats.totalVehicleOwners +
                  stats.totalDrivers +
                  stats.totalManagers}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-dark-800 mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-primary-500" />
            Monthly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                fill="url(#revenueGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trip Status Chart */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-dark-800 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-secondary-500" />
            Trip Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tripStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tripStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Trips"]} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
