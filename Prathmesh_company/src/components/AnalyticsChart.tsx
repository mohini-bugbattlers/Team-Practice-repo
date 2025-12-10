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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  Clock,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import CompanyService, { TripAnalytics, PaymentAnalytics } from "@/services/company";

interface AnalyticsChartProps {
  period?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsChart({ period = 'month', className = "" }: AnalyticsChartProps) {
  const [tripAnalytics, setTripAnalytics] = useState<TripAnalytics | null>(null);
  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'revenue' | 'trips' | 'performance'>('revenue');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [tripsRes, paymentsRes] = await Promise.all([
        CompanyService.getTripAnalytics(period),
        CompanyService.getPaymentAnalytics(period),
      ]);

      if (tripsRes.success && tripsRes.data) setTripAnalytics(tripsRes.data);
      if (paymentsRes.success && paymentsRes.data) setPaymentAnalytics(paymentsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          onClick={() => setActiveChart('revenue')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'revenue'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <DollarSign className="h-4 w-4 inline mr-2" />
          Revenue
        </motion.button>
        <motion.button
          onClick={() => setActiveChart('trips')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'trips'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Truck className="h-4 w-4 inline mr-2" />
          Trips
        </motion.button>
        <motion.button
          onClick={() => setActiveChart('performance')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeChart === 'performance'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Activity className="h-4 w-4 inline mr-2" />
          Performance
        </motion.button>
      </div>

      {/* Revenue Chart */}
      {activeChart === 'revenue' && paymentAnalytics && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-dark-800 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              Revenue Analytics
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              {period.charAt(0).toUpperCase() + period.slice(1)}ly View
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Revenue Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={paymentAnalytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Profit Analysis */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Profit Analysis</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentAnalytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Bar dataKey="profit" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trips Chart */}
      {activeChart === 'trips' && tripAnalytics && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-dark-800 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-500" />
              Trip Analytics
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              {period.charAt(0).toUpperCase() + period.slice(1)}ly View
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trips */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Daily Trips</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tripAnalytics.dailyTrips}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trips" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Route Performance */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Route Performance</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tripAnalytics.routePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Chart */}
      {activeChart === 'performance' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-dark-800 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Performance Metrics
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              {period.charAt(0).toUpperCase() + period.slice(1)}ly View
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Material Distribution */}
            {tripAnalytics && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-4">Material Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tripAnalytics.materialStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }: { type: any, percent: any }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {tripAnalytics.materialStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Payment Methods */}
            {paymentAnalytics && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-4">Payment Methods</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentAnalytics.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percent }: { method: any, percent: any }) => `${method} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {paymentAnalytics.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="card p-4"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-800">
                {formatCurrency(paymentAnalytics?.monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0) || 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card p-4"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-lg font-bold text-gray-800">
                {tripAnalytics?.dailyTrips.reduce((sum, item) => sum + item.trips, 0) || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card p-4"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-lg font-bold text-gray-800">
                {tripAnalytics?.routePerformance && tripAnalytics.routePerformance.length > 0 
                  ? `${(tripAnalytics.routePerformance.reduce((sum, item) => sum + item.averageTime, 0) / tripAnalytics.routePerformance.length).toFixed(1)}h`
                  : '0h'
                }
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card p-4"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Active Routes</p>
              <p className="text-lg font-bold text-gray-800">
                {tripAnalytics?.routePerformance?.length || 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
