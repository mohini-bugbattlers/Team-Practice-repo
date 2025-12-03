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
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API_CONFIG from "@/services/config";
import AuthService from "@/services/auth";
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
  driverName?: string;
  vehicleNumber?: string;
  materialType?: string;
  quantity?: number;
  quantityUnit?: string;
}

interface TripStats {
  total: number;
  pending: number;
  inTransit: number;
  completed: number;
  cancelled: number;
  onTimeDelivery: number;
}

export default function CompanyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats>({
    total: 0,
    pending: 0,
    inTransit: 0,
    completed: 0,
    cancelled: 0,
    onTimeDelivery: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

    // Check if user is a company user
    if (user.role !== 'company') {
      router.push('/auth/login');
      return;
    }

    setIsAuthenticated(true);
    fetchTrips();
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await AuthService.get('/company/trips');
      if (response.success) {
        setTrips(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      // Fallback to mock data
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
        driverName: "Rajesh Kumar",
        vehicleNumber: "MH12 AB 1234",
        materialType: "Crude Oil",
        quantity: 5000,
        quantityUnit: "liters",
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
        driverName: "Awaiting Assignment",
        vehicleNumber: "Not Assigned",
        materialType: "Sugarcane Wastewater",
        quantity: 8000,
        quantityUnit: "liters",
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
        driverName: "Amit Sharma",
        vehicleNumber: "GJ05 CD 5678",
        materialType: "Diesel",
        quantity: 3000,
        quantityUnit: "liters",
      },
      {
        id: 4,
        trip_number: "TR-004",
        route: "Chemical Plant, Vapi → Refinery, Jamnagar",
        status: "completed",
        start_date: "2024-01-10T06:00:00Z",
        estimated_delivery_date: "2024-01-11T14:00:00Z",
        actual_delivery_date: "2024-01-11T13:45:00Z",
        base_amount: 45000,
        service_charge: 4500,
        total_amount: 49500,
        created_at: "2024-01-09T08:00:00Z",
        driverName: "Suresh Patel",
        vehicleNumber: "GJ01 EF 9012",
        materialType: "Industrial Chemicals",
        quantity: 15000,
        quantityUnit: "liters",
      },
    ];
    setTrips(mockTrips);
    calculateStats(mockTrips);
  };

  const calculateStats = (tripsData: Trip[]) => {
    const total = tripsData.length;
    const completed = tripsData.filter(t => t.status === 'completed').length;
    const inTransit = tripsData.filter(t => t.status === 'in_transit').length;
    const pending = tripsData.filter(t => t.status === 'pending').length;
    const cancelled = tripsData.filter(t => t.status === 'cancelled').length;

    // Calculate on-time delivery rate
    const completedTrips = tripsData.filter(t => t.status === 'completed');
    const onTimeTrips = completedTrips.filter(t => {
      if (!t.actual_delivery_date) return false;
      const estimated = new Date(t.estimated_delivery_date);
      const actual = new Date(t.actual_delivery_date);
      return actual <= estimated;
    }).length;

    const onTimeDelivery = completedTrips.length > 0 ? (onTimeTrips / completedTrips.length) * 100 : 0;

    setStats({
      total,
      pending,
      inTransit,
      completed,
      cancelled,
      onTimeDelivery,
    });
  };

  const filteredAndSortedTrips = trips
    .filter((trip) => {
      const matchesSearch =
        trip.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.materialType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "amount":
          return b.total_amount - a.total_amount;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in_transit': return 'status-active';
      case 'confirmed': return 'status-active';
      case 'vehicle_assigned': return 'status-active';
      case 'driver_assigned': return 'status-active';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
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
          <h1 className="text-3xl font-bold text-dark-800">My Transport Requests</h1>
          <p className="text-dark-600 mt-1">Track and manage all your transportation requests</p>
        </div>
        <Link href="/request">
          <motion.button
            className="btn-primary flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </motion.button>
        </Link>
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
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Requests</p>
              <p className="text-2xl font-bold text-dark-800">{stats.total}</p>
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
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">In Transit</p>
              <p className="text-2xl font-bold text-dark-800">{stats.inTransit}</p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                Active now
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
              <p className="text-2xl font-bold text-dark-800">{stats.completed}</p>
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
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-dark-800">{stats.onTimeDelivery.toFixed(1)}%</p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Delivery performance
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
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
                placeholder="Search by trip number, route, driver, or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="vehicle_assigned">Vehicle Assigned</option>
              <option value="driver_assigned">Driver Assigned</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount" | "status")}
              className="input-field md:w-32"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Trips Grid */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-dark-600">Loading trips...</p>
          </div>
        ) : filteredAndSortedTrips.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-dark-500 text-lg">No trips found</p>
            <p className="text-dark-400 text-sm mt-1">
              {searchTerm || statusFilter ? "Try adjusting your filters" : "Create your first transport request"}
            </p>
            {!searchTerm && !statusFilter && (
              <Link href="/request">
                <button className="btn-primary mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Request
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-medium transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-800">{trip.trip_number}</h3>
                      <p className="text-sm text-dark-500">{trip.driverName}</p>
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    <span className="ml-1">{trip.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-dark-400" />
                    <span className="text-dark-600 truncate" title={trip.route}>
                      {trip.route}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-dark-400" />
                    <span className="text-dark-600">{trip.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Material:</span>
                    <span className="font-medium">
                      {trip.materialType} ({trip.quantity} {trip.quantityUnit})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Amount:</span>
                    <span className="font-medium">₹{trip.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600">Est. Delivery:</span>
                    <span className="font-medium">
                      {new Date(trip.estimated_delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                  {trip.actual_delivery_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-600">Delivered:</span>
                      <span className="font-medium text-secondary-600">
                        {new Date(trip.actual_delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(trip)}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </button>
                  <button className="flex-1 btn-primary text-sm">
                    <Compass className="w-4 h-4 mr-1" />
                    Track
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Trip Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTrip && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-large w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-800">{selectedTrip.trip_number}</h3>
                      <p className="text-dark-600">{selectedTrip.route}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-dark-400 hover:text-dark-600"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Status</label>
                      <div className={`status-badge ${getStatusColor(selectedTrip.status)}`}>
                        {getStatusIcon(selectedTrip.status)}
                        <span className="ml-1">{selectedTrip.status.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Material Type</label>
                      <p className="text-dark-900">{selectedTrip.materialType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Quantity</label>
                      <p className="text-dark-900">{selectedTrip.quantity} {selectedTrip.quantityUnit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Driver</label>
                      <p className="text-dark-900">{selectedTrip.driverName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Vehicle</label>
                      <p className="text-dark-900">{selectedTrip.vehicleNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Start Date</label>
                      <p className="text-dark-900">{new Date(selectedTrip.start_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Estimated Delivery</label>
                      <p className="text-dark-900">{new Date(selectedTrip.estimated_delivery_date).toLocaleString()}</p>
                    </div>
                    {selectedTrip.actual_delivery_date && (
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">Actual Delivery</label>
                        <p className="text-secondary-600 font-medium">{new Date(selectedTrip.actual_delivery_date).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-dark-800 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cost Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Base Amount:</span>
                      <span>₹{selectedTrip.base_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service Charge:</span>
                      <span>₹{selectedTrip.service_charge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-dark-800 pt-2 border-t border-gray-200">
                      <span>Total Amount:</span>
                      <span>₹{selectedTrip.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 btn-primary">
                    <Compass className="w-4 h-4 mr-2" />
                    Track Location
                  </button>
                  <button className="flex-1 btn-secondary">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
      )}
    </>
  );
}
