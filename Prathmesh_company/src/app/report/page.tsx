"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  Search,
  FileText,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import AuthService from "@/services/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReportData {
  totalTrips: number;
  completedTrips: number;
  inTransitTrips: number;
  cancelledTrips: number;
  totalRevenue: number;
  averageTripValue: number;
  onTimeDeliveryRate: number;
  monthlyStats: {
    month: string;
    trips: number;
    revenue: number;
  }[];
  materialBreakdown: {
    material: string;
    trips: number;
    revenue: number;
  }[];
  routePerformance: {
    route: string;
    trips: number;
    revenue: number;
    avgDeliveryTime: number;
  }[];
}

export default function CompanyReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalTrips: 0,
    completedTrips: 0,
    inTransitTrips: 0,
    cancelledTrips: 0,
    totalRevenue: 0,
    averageTripValue: 0,
    onTimeDeliveryRate: 0,
    monthlyStats: [],
    materialBreakdown: [],
    routePerformance: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("last30days");
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
    fetchReportData();
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // For now, use mock data since we don't have the backend endpoint yet
      loadMockReportData();
    } catch (error) {
      console.error("Error fetching report data:", error);
      loadMockReportData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockReportData = () => {
    const mockData: ReportData = {
      totalTrips: 24,
      completedTrips: 18,
      inTransitTrips: 4,
      cancelledTrips: 2,
      totalRevenue: 456800,
      averageTripValue: 25377,
      onTimeDeliveryRate: 94.4,
      monthlyStats: [
        { month: "Jan 2024", trips: 8, revenue: 152000 },
        { month: "Dec 2023", trips: 6, revenue: 114000 },
        { month: "Nov 2023", trips: 5, revenue: 95000 },
        { month: "Oct 2023", trips: 3, revenue: 57000 },
        { month: "Sep 2023", trips: 2, revenue: 38000 },
      ],
      materialBreakdown: [
        { material: "Crude Oil", trips: 12, revenue: 228000 },
        { material: "Industrial Chemicals", trips: 8, revenue: 152000 },
        { material: "Diesel", trips: 3, revenue: 57000 },
        { material: "Petrol", trips: 1, revenue: 19800 },
      ],
      routePerformance: [
        { route: "Mumbai → Pune", trips: 8, revenue: 152000, avgDeliveryTime: 8.5 },
        { route: "Kolhapur → Nashik", trips: 6, revenue: 114000, avgDeliveryTime: 12.2 },
        { route: "Vadodara → Surat", trips: 4, revenue: 76000, avgDeliveryTime: 6.8 },
        { route: "Ahmedabad → Hyderabad", trips: 3, revenue: 57000, avgDeliveryTime: 18.5 },
        { route: "Delhi → Jaipur", trips: 3, revenue: 45600, avgDeliveryTime: 10.2 },
      ],
    };
    setReportData(mockData);
  };

  const handleExportReport = () => {
    // In a real implementation, this would generate and download a PDF/Excel report
    alert('Report export functionality would be implemented here. This would generate a comprehensive PDF report with all the data shown.');
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
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-dark-800">Reports & Analytics</h1>
              <p className="text-dark-600 mt-1">Comprehensive insights into your transport operations</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field md:w-48"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="last12months">Last 12 Months</option>
                <option value="custom">Custom Range</option>
              </select>
              <button
                onClick={handleExportReport}
                className="btn-primary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </motion.div>

          {/* Key Metrics Cards */}
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
                  <p className="text-2xl font-bold text-dark-800">{reportData.totalTrips}</p>
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
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-dark-800">₹{reportData.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-primary-600 flex items-center mt-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                    Avg: ₹{reportData.averageTripValue.toLocaleString()}/trip
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
                  <p className="text-sm font-medium text-dark-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-dark-800">
                    {((reportData.completedTrips / reportData.totalTrips) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-secondary-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {reportData.completedTrips} completed
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
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-600">On-Time Delivery</p>
                  <p className="text-2xl font-bold text-dark-800">{reportData.onTimeDeliveryRate}%</p>
                  <p className="text-xs text-primary-600 flex items-center mt-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                    Performance rate
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Performance Chart */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-dark-800 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary-500" />
                  Monthly Performance
                </h3>
                <div className="flex items-center gap-2 text-sm text-dark-600">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <span>Trips</span>
                  <div className="w-3 h-3 bg-secondary-500 rounded-full ml-2"></div>
                  <span>Revenue</span>
                </div>
              </div>

              <div className="space-y-4">
                {reportData.monthlyStats.map((stat, index) => (
                  <div key={stat.month} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium text-dark-700">{stat.month}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-xs text-dark-500">Trips: {stat.trips}</div>
                          <div className="text-xs text-secondary-500">Revenue: ₹{stat.revenue.toLocaleString()}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(stat.trips / Math.max(...reportData.monthlyStats.map(s => s.trips))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Material Breakdown */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-dark-800 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-secondary-500" />
                  Material Breakdown
                </h3>
                <div className="text-sm text-dark-600">By revenue</div>
              </div>

              <div className="space-y-4">
                {reportData.materialBreakdown.map((material, index) => (
                  <div key={material.material} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full`} style={{
                        backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                      }}></div>
                      <div>
                        <div className="font-medium text-dark-800">{material.material}</div>
                        <div className="text-sm text-dark-500">{material.trips} trips</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-dark-800">₹{material.revenue.toLocaleString()}</div>
                      <div className="text-sm text-dark-500">
                        {((material.revenue / reportData.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Route Performance Table */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-dark-800 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-accent-500" />
                Route Performance
              </h3>
              <div className="text-sm text-dark-600">Top performing routes</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Trips</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Avg Delivery Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.routePerformance.map((route, index) => (
                    <motion.tr
                      key={route.route}
                      className="table-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-dark-900">{route.route}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-900">{route.trips}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-dark-900">₹{route.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-600">{route.avgDeliveryTime}h</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            route.avgDeliveryTime <= 10 ? 'bg-secondary-500' :
                            route.avgDeliveryTime <= 15 ? 'bg-primary-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-dark-600">
                            {route.avgDeliveryTime <= 10 ? 'Excellent' :
                             route.avgDeliveryTime <= 15 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Summary Insights */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-bold text-dark-800 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-500" />
              Key Insights & Recommendations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-secondary-600 mr-2" />
                    <h4 className="font-semibold text-dark-800">Performance Highlights</h4>
                  </div>
                  <ul className="text-sm text-dark-600 space-y-1">
                    <li>• Excellent on-time delivery rate of {reportData.onTimeDeliveryRate}%</li>
                    <li>• Average trip value of ₹{reportData.averageTripValue.toLocaleString()}</li>
                    <li>• Strong performance on Mumbai-Pune route</li>
                    <li>• Crude Oil is your most profitable material</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-primary-600 mr-2" />
                    <h4 className="font-semibold text-dark-800">Growth Opportunities</h4>
                  </div>
                  <ul className="text-sm text-dark-600 space-y-1">
                    <li>• Expand operations to high-demand routes</li>
                    <li>• Focus on high-margin materials like Crude Oil</li>
                    <li>• Optimize delivery times for longer routes</li>
                    <li>• Consider volume discounts for frequent clients</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-accent-50 rounded-lg border border-accent-200">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-accent-600 mr-2" />
                    <h4 className="font-semibold text-dark-800">Areas for Improvement</h4>
                  </div>
                  <ul className="text-sm text-dark-600 space-y-1">
                    <li>• Review performance on Ahmedabad-Hyderabad route</li>
                    <li>• Address delivery delays on longer routes</li>
                    <li>• Optimize resource allocation during peak times</li>
                    <li>• Implement better route planning for efficiency</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                    <h4 className="font-semibold text-dark-800">Monthly Trends</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Best Month:</span>
                      <span className="font-medium text-dark-800">Jan 2024 (8 trips)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Growth Rate:</span>
                      <span className="font-medium text-secondary-600">+33% vs last month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Peak Season:</span>
                      <span className="font-medium text-dark-800">Jan-Mar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
