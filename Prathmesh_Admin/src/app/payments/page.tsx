"use client";

import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";

interface Payment {
  id: string;
  trip_id: string;
  company_id: number;
  vehicle_owner_id: number;
  amount: number;
  service_charge: number;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  payment_date: string;
  due_date: string;
  transaction_id?: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  companyName?: string;
  vehicleOwnerName?: string;
  tripNumber?: string;
  route?: string;
}

interface Trip {
  id: number;
  trip_number: string;
  company_id: number;
  vehicle_owner_id: number;
  driver_id: number;
  route: string;
  status: string;
  start_date: string;
  estimated_delivery_date: string;
  base_amount: number;
  service_charge: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  companyName: string;
  vehicleOwnerName: string;
  driverName: string;
}

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_number: string;
  gst_number: string;
  status: string;
  total_trips: number;
  active_trips: number;
  created_at: string;
}

interface VehicleOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
  fleet_size: number;
  rating: number;
  status: string;
  total_trips: number;
  completed_trips: number;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vehicleOwners, setVehicleOwners] = useState<VehicleOwner[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [addFormData, setAddFormData] = useState({
    trip_id: 0,
    company_id: 0,
    vehicle_owner_id: 0,
    amount: 0,
    payment_method: "offline",
  });
  const filterRef = useRef<HTMLDivElement>(null);
  const addModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setDropdownLoading(true);

      // Fetch dropdown data and payments in parallel
      const [
        paymentsResponse,
        tripsResponse,
        companiesResponse,
        vehicleOwnersResponse,
      ] = await Promise.all([
        AuthService.get("/payments"),
        AuthService.get("/trips"),
        AuthService.get("/companies"),
        AuthService.get("/vehicle-owners"),
      ]);

      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data);
      } else {
        // Fallback to mock data if API fails
      }

      // Set dropdown data
      if (tripsResponse.success) {
        setTrips(tripsResponse.data);
      }
      if (companiesResponse.success) {
        setCompanies(companiesResponse.data);
      }
      if (vehicleOwnersResponse.success) {
        setVehicleOwners(vehicleOwnersResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to mock data
    } finally {
      setLoading(false);
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...payments];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((payment) => {
        const payment_date = new Date(payment.payment_date || payment.due_date);
        switch (dateFilter) {
          case "today":
            return payment_date.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return payment_date >= weekAgo;
          case "month":
            return (
              payment_date.getMonth() === now.getMonth() &&
              payment_date.getFullYear() === now.getFullYear()
            );
          case "year":
            return payment_date.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        addModalRef.current &&
        !addModalRef.current.contains(event.target as Node)
      ) {
        setShowAddModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFilterClick = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await AuthService.post("/payments", addFormData);

      if (response.success) {
        // Refresh payments list
        await fetchPayments();
        setShowAddModal(false);
        setAddFormData({
          trip_id: 0,
          company_id: 0,
          vehicle_owner_id: 0,
          amount: 0,
          payment_method: "offline",
        });
      } else {
        alert("Failed to add payment: " + response.message);
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment");
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      trip_id: 0,
      company_id: 0,
      vehicle_owner_id: 0,
      amount: 0,
      payment_method: "offline",
    });
  };

  const handleView = (payment: Payment) => {
    setViewingPayment(payment);
    setShowViewModal(true);
  };

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      [
        "Payment ID",
        "Trip ID",
        "Company",
        "Vehicle Owner",
        "Amount",
        "Service Charge",
        "Total",
        "Status",
        "Payment Date",
      ],
      ...filteredPayments.map((payment) => [
        payment.id,
        payment.trip_id,
        payment.companyName,
        payment.vehicleOwnerName,
        payment.amount,
        payment.service_charge,
        payment.total_amount,
        payment.status,
        payment.payment_date || payment.due_date,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-active";
      case "completed":
        return "status-completed";
      case "failed":
        return "status-cancelled";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.total_amount, 0);

  const pendingAmount = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, payment) => sum + payment.total_amount, 0);

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
          <h1 className="text-3xl font-bold text-dark-800">Payments</h1>
          <p className="text-dark-600 mt-1">
            Manage and track all payment transactions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Payment
          </button>
          <div className="relative" ref={filterRef}>
            <button
              onClick={handleFilterClick}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-large border border-gray-100 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-dark-900">
                    Advanced Filters
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => {
                      setDateFilter("all");
                      setStatusFilter("all");
                      setShowFilterDropdown(false);
                    }}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="flex-1 btn-primary text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
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
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Revenue</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                From completed payments
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
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                ₹{pendingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-accent-600 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting payment
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
              <p className="text-sm font-medium text-dark-600">Completed</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {
                  filteredPayments.filter((p) => p.status === "completed")
                    .length
                }
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                This month
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
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">This Month</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                ₹
                {filteredPayments
                  .filter((p) => {
                    const payment_date = new Date(p.payment_date || p.due_date);
                    const now = new Date();
                    return (
                      payment_date.getMonth() === now.getMonth() &&
                      payment_date.getFullYear() === now.getFullYear()
                    );
                  })
                  .reduce((sum, p) => sum + p.total_amount, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                Current period
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
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search by company, vehicle owner, or trip ID..."
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
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto scrollbar-hide">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Vehicle Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Amount Breakdown
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment, index) => (
                <motion.tr
                  key={payment.id}
                  className="table-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-dark-900">
                        {payment.id}
                      </div>
                      <div className="text-sm text-dark-500">
                        Trip: {payment.trip_id}
                      </div>
                      <div className="text-xs text-dark-400">
                        {payment.payment_date
                          ? `Paid: ${new Date(
                              payment.payment_date
                            ).toLocaleDateString()}`
                          : `Due: ${new Date(
                              payment.due_date
                            ).toLocaleDateString()}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-dark-900">
                      {payment.companyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-dark-900">
                      {payment.vehicleOwnerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark-900">
                      <div>Total: ₹{payment.total_amount.toLocaleString()}</div>
                      <div className="text-xs text-dark-500">
                        Base: ₹{payment.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-primary-600 font-medium">
                        Service: ₹{payment.service_charge.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`status-badge ${getStatusColor(
                        payment.status
                      )} flex items-center gap-1`}
                    >
                      {getStatusIcon(payment.status)}
                      {payment.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(payment)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {payment.status === "pending" && (
                      <button className="text-secondary-600 hover:text-secondary-900">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              ref={addModalRef}
              className="bg-white rounded-xl shadow-large w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark-900">
                    Add New Payment
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetAddForm();
                    }}
                    className="text-dark-400 hover:text-dark-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleAddPayment}
                className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide"
              >
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Trip
                  </label>
                  <select
                    value={addFormData.trip_id}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        trip_id: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    required
                    disabled={dropdownLoading}
                  >
                    <option value="">Select Trip</option>
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.trip_number} - {trip.route}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Company
                  </label>
                  <select
                    value={addFormData.company_id}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        company_id: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    required
                    disabled={dropdownLoading}
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name} ({company.registration_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Vehicle Owner
                  </label>
                  <select
                    value={addFormData.vehicle_owner_id}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        vehicle_owner_id: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    required
                    disabled={dropdownLoading}
                  >
                    <option value="">Select Vehicle Owner</option>
                    {vehicleOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.fleet_size} vehicles)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={addFormData.amount}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    placeholder="Enter payment amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={addFormData.payment_method}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        payment_method: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="offline">Offline Payment</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetAddForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Add Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Payment Modal */}
      <AnimatePresence>
        {showViewModal && viewingPayment && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-large w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark-900">
                    Payment Details
                  </h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-dark-400 hover:text-dark-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-dark-900">
                        {viewingPayment.id}
                      </h4>
                      <p className="text-dark-600">
                        Trip: {viewingPayment.trip_id}
                      </p>
                    </div>
                    <span
                      className={`status-badge ${getStatusColor(
                        viewingPayment.status
                      )} ml-auto flex items-center gap-1`}
                    >
                      {getStatusIcon(viewingPayment.status)}
                      {viewingPayment.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Company
                        </label>
                        <p className="text-dark-900">
                          {viewingPayment.companyName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Vehicle Owner
                        </label>
                        <p className="text-dark-900">
                          {viewingPayment.vehicleOwnerName}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Base Amount
                        </label>
                        <p className="text-dark-900">
                          ₹{viewingPayment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Service Charge
                        </label>
                        <p className="text-primary-600">
                          ₹{viewingPayment.service_charge.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-dark-700">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-dark-900">
                        ₹{viewingPayment.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {viewingPayment.payment_method && (
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Payment Method
                      </label>
                      <p className="text-dark-900 capitalize">
                        {viewingPayment.payment_method.replace("_", " ")}
                      </p>
                    </div>
                  )}

                  {viewingPayment.transaction_id && (
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Transaction ID
                      </label>
                      <p className="text-dark-900 font-mono text-sm">
                        {viewingPayment.transaction_id}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        {viewingPayment.payment_date
                          ? "Payment Date"
                          : "Due Date"}
                      </label>
                      <p className="text-dark-900">
                        {new Date(
                          viewingPayment.payment_date || viewingPayment.due_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Payment ID
                      </label>
                      <p className="text-dark-900">#{viewingPayment.id}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-dark-500">
                      Created:{" "}
                      {new Date(
                        viewingPayment.payment_date || viewingPayment.due_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                {viewingPayment.status === "pending" && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      // Add approve payment functionality here
                    }}
                    className="flex-1 btn-primary"
                  >
                    Approve Payment
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className={`flex-1 ${
                    viewingPayment.status === "pending"
                      ? "btn-secondary"
                      : "btn-primary"
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
