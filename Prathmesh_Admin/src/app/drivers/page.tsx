"use client";

import API_CONFIG from "../../services/config";
import AuthService from "../../services/auth";
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  User,
  Phone,
  Mail,
  X,
  CheckCircle,
  Star,
  Lock,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  rating: number;
  status: "active" | "inactive" | "suspended";
  total_trips: number;
  completed_trips: number;
  current_trip_id?: number;
  created_at: string;
}

interface DriverFormData {
  name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  status: "active" | "inactive" | "suspended";
  password: string;
  confirmPassword: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    experience_years: 0,
    status: "active",
    password: "",
    confirmPassword: "",
  });
  const addModalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await AuthService.get("/drivers");
      if (response.success) {
        setDrivers(response.data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "inactive":
        return "status-cancelled";
      case "suspended":
        return "status-cancelled";
      default:
        return "status-cancelled";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < rating ? "text-accent-500" : "text-dark-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      license_number: "",
      experience_years: 0,
      status: "active",
      password: "",
      confirmPassword: "",
    });
    setEditingDriver(null);
    setViewingDriver(null);
    setShowViewModal(false);
  };

  const handleView = (driver: Driver) => {
    setViewingDriver(driver);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords for new drivers
    if (!editingDriver) {
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    try {
      const url = editingDriver ? `/drivers/${editingDriver.id}` : "/drivers";

      const method = editingDriver ? "PUT" : "POST";

      const driverData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        license_number: formData.license_number,
        experience_years: formData.experience_years,
        status: formData.status,
      };

      const response = await AuthService.apiCall(url, {
        method,
        body: JSON.stringify(driverData),
      });

      if (response.success) {
        // If creating a new driver, also create a user account
        if (!editingDriver) {
          try {
            await AuthService.post('/auth/create-user', {
              email: formData.email,
              password: formData.password,
              name: formData.name,
              role: 'driver',
              phone: formData.phone,
            });
          } catch (userError) {
            console.error('Error creating user account:', userError);
            // Driver created but user creation failed - still show success
          }
        }

        await fetchDrivers();
        setShowAddModal(false);
        setShowViewModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving driver:", error);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      license_number: driver.license_number,
      experience_years: driver.experience_years,
      status: driver.status,
      password: "",
      confirmPassword: "",
    });
    setShowAddModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">
          Driver Management
        </h1>
        <p className="text-dark-600">
          Manage and monitor all registered drivers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600">Total Drivers</p>
              <p className="text-2xl font-bold text-dark-900">
                {drivers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600">
                Active Drivers
              </p>
              <p className="text-2xl font-bold text-dark-900">
                {drivers.filter((d) => d.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-dark-900">
                {drivers.length > 0
                  ? (
                      drivers.reduce((sum, d) => sum + d.rating, 0) /
                      drivers.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600">Total Trips</p>
              <p className="text-2xl font-bold text-dark-900">
                {drivers.reduce((sum, d) => sum + d.total_trips, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        className="card mb-8"
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
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Driver
          </button>
        </div>
      </motion.div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : filteredDrivers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-500 text-lg">No drivers found</p>
          </div>
        ) : (
          filteredDrivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              className="card hover:shadow-medium transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {driver.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "N/A"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-dark-900">
                      {driver.name || "N/A"}
                    </h3>
                    <span
                      className={`status-badge ${getStatusColor(
                        driver.status
                      )}`}
                    >
                      {driver.status?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-dark-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{driver.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{driver.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">License:</span>
                  <span className="font-medium text-dark-800">
                    {driver.license_number || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">Experience:</span>
                  <span className="font-medium text-dark-800">
                    {driver.experience_years || 0} years
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">Trips:</span>
                  <span className="font-medium text-dark-800">
                    {driver.completed_trips || 0}/{driver.total_trips || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-xs text-dark-500">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent-500 fill-current" />
                    <span className="font-semibold text-dark-800">
                      {driver.rating || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleView(driver)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(driver)}
                  className="flex-1 btn-primary text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={addModalRef}
              className="bg-white rounded-xl shadow-large w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark-900">
                    {editingDriver ? "Edit Driver" : "Add New Driver"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-dark-400 hover:text-dark-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide"
              >
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Enter driver name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-field"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Password fields - only show for new drivers */}
                {!editingDriver && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-dark-700 mb-2 flex items-center">
                        <Lock className="h-4 w-4 mr-1" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="input-field pr-10"
                          placeholder="Enter password (min 6 characters)"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-dark-700 mb-2 flex items-center">
                        <Lock className="h-4 w-4 mr-1" />
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="input-field pr-10"
                          placeholder="Confirm password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-800">Driver Account</p>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        A driver account will be created with the provided email and password for login access.
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input-field"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_number: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="Enter license number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience_years: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    placeholder="Enter years of experience"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "active"
                          | "inactive"
                          | "suspended",
                      })
                    }
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingDriver ? "Update" : "Add"} Driver
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && viewingDriver && (
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
                    Driver Details
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
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {viewingDriver.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "N/A"}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-dark-900">
                        {viewingDriver.name || "N/A"}
                      </h4>
                      <p className="text-dark-600">
                        {viewingDriver.email || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`status-badge ${getStatusColor(
                        viewingDriver.status
                      )} ml-auto`}
                    >
                      {viewingDriver.status?.toUpperCase() || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Phone
                        </label>
                        <p className="text-dark-900">
                          {viewingDriver.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          License Number
                        </label>
                        <p className="text-dark-900">
                          {viewingDriver.license_number || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Experience
                        </label>
                        <p className="text-dark-900">
                          {viewingDriver.experience_years || 0} years
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Driver ID
                        </label>
                        <p className="text-dark-900">#{viewingDriver.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Total Trips
                      </label>
                      <p className="text-dark-900">
                        {viewingDriver.total_trips || 0}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Completed Trips
                      </label>
                      <p className="text-secondary-600 font-medium">
                        {viewingDriver.completed_trips || 0}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-dark-500">
                      Joined:{" "}
                      {new Date(viewingDriver.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingDriver);
                  }}
                  className="flex-1 btn-primary"
                >
                  Edit Driver
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
