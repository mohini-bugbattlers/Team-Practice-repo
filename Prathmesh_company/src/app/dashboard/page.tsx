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
import {
  Truck,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";

interface CompanyStats {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  totalRevenue: number;
  totalDrivers: number;
  totalVehicles: number;
  pendingPayments: number;
  avgTripDuration: number;
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<CompanyStats>({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalRevenue: 0,
    totalDrivers: 0,
    totalVehicles: 0,
    pendingPayments: 0,
    avgTripDuration: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tripsRes] = await Promise.all([
        fetch("http://localhost:3000/api/companies/stats"),
        fetch("http://localhost:3000/api/trips?limit=5"),
      ]);

      if (statsRes.ok && tripsRes.ok) {
        const [statsData, tripsData] = await Promise.all([
          statsRes.json(),
          tripsRes.json(),
        ]);

        if (statsData.success && tripsData.success) {
          setStats(statsData.data);
          setRecentTrips(tripsData.data);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tripStatusData = [
    { name: "Completed", value: stats.completedTrips, color: "#10B981" },
    { name: "In Transit", value: stats.activeTrips, color: "#3B82F6" },
    {
      name: "Pending",
      value: Math.max(
        0,
        stats.totalTrips - stats.activeTrips - stats.completedTrips
      ),
      color: "#F59E0B",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Company Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your transportation operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTrips}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Trips</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeTrips}
              </p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                Currently in transit
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.5% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fleet Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVehicles}
              </p>
              <p className="text-xs text-purple-600 flex items-center mt-1">
                {stats.totalDrivers} drivers assigned
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trip Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Trip Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tripStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {tripStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Monthly Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { month: "Jan", trips: 45, revenue: 225000 },
                { month: "Feb", trips: 52, revenue: 260000 },
                { month: "Mar", trips: 48, revenue: 240000 },
                { month: "Apr", trips: 61, revenue: 305000 },
                { month: "May", trips: 55, revenue: 275000 },
                { month: "Jun", trips: 67, revenue: 335000 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="trips" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Trips and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trips */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Trips
          </h3>
          <div className="space-y-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center space-x-4"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              : recentTrips.slice(0, 5).map((trip: any) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Trip #{trip.id}
                        </p>
                        <p className="text-sm text-gray-600">{trip.route}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        trip.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : trip.status === "in_transit"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Alerts & Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Payment Pending</p>
                <p className="text-sm text-yellow-700">
                  ₹15,000 payment for Trip #TRP-2024-045 is overdue
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Trip Delay Alert</p>
                <p className="text-sm text-blue-700">
                  Trip #TRP-2024-048 is running 2 hours behind schedule
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">
                  Performance Milestone
                </p>
                <p className="text-sm text-green-700">
                  Congratulations! You've completed 500 trips this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
