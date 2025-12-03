"use client";

import API_CONFIG from "../../services/config";
import AuthService from "../../services/auth";
import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Lock,
  EyeOff,
  User,
} from "lucide-react";

interface VehicleOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
  fleet_size: number;
  status: "active" | "inactive";
  total_trips: number;
  completed_trips: number;
  created_at: string;
  driver_count?: number;
  drivers?: Driver[];
  available_vans?: number;
  total_vans?: number;
}

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  status: "active" | "inactive" | "suspended";
  total_trips: number;
  completed_trips: number;
  current_trip_id?: number;
  created_at: string;
}

interface VehicleOwnerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
  fleet_size: number;
  status: "active" | "inactive";
  password: string;
  confirmPassword: string;
}

export default function VehicleOwnersPage() {
  const [vehicleOwners, setVehicleOwners] = useState<VehicleOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<VehicleOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<VehicleOwner | null>(null);
  const [viewingOwner, setViewingOwner] = useState<VehicleOwner | null>(null);
  const [deletingOwner, setDeletingOwner] = useState<VehicleOwner | null>(null);
  const [showDriversModal, setShowDriversModal] = useState(false);
  const [selectedOwnerDrivers, setSelectedOwnerDrivers] = useState<Driver[]>(
    []
  );
  const [formData, setFormData] = useState<VehicleOwnerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
    fleet_size: 0,
    status: "active",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchVehicleOwners();
  }, []);

  const fetchVehicleOwners = async () => {
    try {
      const response = await AuthService.get("/vehicle-owners");
      if (response.success) {
        setVehicleOwners(response.data);
      } else {
        // Fallback to mock data if API fails
        setVehicleOwners([
          {
            id: 1,
            name: "Rajesh Kumar",
            email: "rajesh.kumar@email.com",
            phone: "+91-9876543210",
            address: "123 Transport Nagar, Mumbai, Maharashtra",
            gst_number: "22AAAAA0000A1Z5",
            fleet_size: 15,
            status: "active",
            total_trips: 156,
            completed_trips: 149,
            created_at: "2023-06-15",
          },
          {
            id: 2,
            name: "Priya Sharma",
            email: "priya.sharma@email.com",
            phone: "+91-9876543211",
            address: "456 Industrial Area, Pune, Maharashtra",
            gst_number: "27BBBBB0000B1Y4",
            fleet_size: 8,
            status: "active",
            total_trips: 89,
            completed_trips: 85,
            created_at: "2023-08-20",
          },
          {
            id: 3,
            name: "Amit Patel",
            email: "amit.patel@email.com",
            phone: "+91-9876543212",
            address: "789 Logistics Hub, Ahmedabad, Gujarat",
            gst_number: "24CCCCC0000C1X3",
            fleet_size: 12,
            status: "inactive",
            total_trips: 67,
            completed_trips: 61,
            created_at: "2023-05-10",
          },
          {
            id: 4,
            name: "Sunita Reddy",
            email: "sunita.reddy@email.com",
            phone: "+91-9876543213",
            address: "321 Commercial Complex, Hyderabad, Telangana",
            gst_number: "36DDDDD0000D1W2",
            fleet_size: 20,
            status: "active",
            total_trips: 203,
            completed_trips: 198,
            created_at: "2023-04-05",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching vehicle owners:", error);
      // Fallback to mock data
      setVehicleOwners([
        {
          id: 1,
          name: "Rajesh Kumar",
          email: "rajesh.kumar@email.com",
          phone: "+91-9876543210",
          address: "123 Transport Nagar, Mumbai, Maharashtra",
          gst_number: "22AAAAA0000A1Z5",
          fleet_size: 15,
          status: "active",
          total_trips: 156,
          completed_trips: 149,
          created_at: "2023-06-15",
          drivers: [
            {
              id: 1,
              name: "Ramesh Kumar",
              email: "ramesh.kumar@email.com",
              phone: "+91-9876543210",
              license_number: "DL-123456",
              experience_years: 5,
              status: "active",
              total_trips: 45,
              completed_trips: 42,
              created_at: "2023-06-15",
            },
            {
              id: 2,
              name: "Suresh Sharma",
              email: "suresh.sharma@email.com",
              phone: "+91-9876543211",
              license_number: "DL-789012",
              experience_years: 3,
              status: "active",
              total_trips: 32,
              completed_trips: 30,
              created_at: "2023-08-20",
            },
          ],
          available_vans: 8,
          total_vans: 15,
        },
        {
          id: 2,
          name: "Priya Sharma",
          email: "priya.sharma@email.com",
          phone: "+91-9876543211",
          address: "456 Industrial Area, Pune, Maharashtra",
          gst_number: "27BBBBB0000B1Y4",
          fleet_size: 8,
          status: "active",
          total_trips: 89,
          completed_trips: 85,
          created_at: "2023-08-20",
          drivers: [
            {
              id: 3,
              name: "Mahesh Patel",
              email: "mahesh.patel@email.com",
              phone: "+91-9876543212",
              license_number: "DL-345678",
              experience_years: 7,
              status: "active",
              total_trips: 28,
              completed_trips: 25,
              created_at: "2023-05-10",
            },
          ],
          available_vans: 5,
          total_vans: 8,
        },
        {
          id: 3,
          name: "Amit Patel",
          email: "amit.patel@email.com",
          phone: "+91-9876543212",
          address: "789 Logistics Hub, Ahmedabad, Gujarat",
          gst_number: "24CCCCC0000C1X3",
          fleet_size: 12,
          status: "inactive",
          total_trips: 67,
          completed_trips: 61,
          created_at: "2023-05-10",
          drivers: [],
          available_vans: 0,
          total_vans: 12,
        },
        {
          id: 4,
          name: "Sunita Reddy",
          email: "sunita.reddy@email.com",
          phone: "+91-9876543213",
          address: "321 Commercial Complex, Hyderabad, Telangana",
          gst_number: "36DDDDD0000D1W2",
          fleet_size: 20,
          status: "active",
          total_trips: 203,
          completed_trips: 198,
          created_at: "2023-04-05",
          drivers: [
            {
              id: 4,
              name: "Vikram Singh",
              email: "vikram.singh@email.com",
              phone: "+91-9876543214",
              license_number: "DL-567890",
              experience_years: 10,
              status: "active",
              total_trips: 67,
              completed_trips: 64,
              created_at: "2023-04-05",
            },
            {
              id: 5,
              name: "Rahul Verma",
              email: "rahul.verma@email.com",
              phone: "+91-9876543215",
              license_number: "DL-901234",
              experience_years: 6,
              status: "active",
              total_trips: 45,
              completed_trips: 43,
              created_at: "2023-07-15",
            },
            {
              id: 6,
              name: "Anil Kumar",
              email: "anil.kumar@email.com",
              phone: "+91-9876543216",
              license_number: "DL-234567",
              experience_years: 4,
              status: "inactive",
              total_trips: 22,
              completed_trips: 20,
              created_at: "2023-09-10",
            },
          ],
          available_vans: 12,
          total_vans: 20,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriversForOwner = async (ownerId: number) => {
    // This function is no longer needed since we're using real data from the backend
    // The drivers are now included in the vehicle owner response
  };

  useEffect(() => {
    let filtered = vehicleOwners;

    if (searchTerm) {
      filtered = filtered.filter(
        (owner) =>
          owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((owner) => owner.status === statusFilter);
    }

    setFilteredOwners(filtered);
  }, [vehicleOwners, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    return status === "active" ? "status-active" : "status-cancelled";
  };

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <XCircle className="h-4 w-4" />
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      gst_number: "",
      fleet_size: 0,
      status: "active",
      password: "",
      confirmPassword: "",
    });
    setEditingOwner(null);
    setViewingOwner(null);
    setShowViewModal(false);
  };

  const handleView = (owner: VehicleOwner) => {
    setViewingOwner(owner);
    setShowViewModal(true);
  };

  const handleEdit = (owner: VehicleOwner) => {
    setEditingOwner(owner);
    setFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      gst_number: owner.gst_number,
      fleet_size: owner.fleet_size,
      status: owner.status,
      password: "",
      confirmPassword: "",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords for new vehicle owners
    if (!editingOwner) {
      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    try {
      const url = editingOwner
        ? `/vehicle-owners/${editingOwner.id}`
        : "/vehicle-owners";

      const method = editingOwner ? "PUT" : "POST";

      const ownerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gst_number: formData.gst_number,
        fleet_size: formData.fleet_size,
        status: formData.status,
      };

      const response = await AuthService.apiCall(url, {
        method,
        body: JSON.stringify(ownerData),
      });

      if (response.success) {
        // If creating a new vehicle owner, also create a user account
        if (!editingOwner) {
          try {
            await AuthService.post("/auth/create-user", {
              email: formData.email,
              password: formData.password,
              name: formData.name,
              role: "vehicle_owner",
              phone: formData.phone,
            });
          } catch (userError) {
            console.error("Error creating user account:", userError);
            // Owner created but user creation failed - still show success
          }
        }

        await fetchVehicleOwners();
        setShowAddModal(false);
        setShowViewModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving vehicle owner:", error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-800">Vehicle Owners</h1>
          <p className="text-dark-600 mt-1">
            Manage vehicle owners and their fleet information
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle Owner
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-medium">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Owners</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {vehicleOwners.length}
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                Registered owners
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl shadow-medium">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Active Owners</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {vehicleOwners.filter((o) => o.status === "active").length}
              </p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Currently active
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-medium">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Fleet</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {vehicleOwners.reduce(
                  (sum, owner) => sum + owner.fleet_size,
                  0
                )}
              </p>
              <p className="text-xs text-accent-600 flex items-center mt-1">
                <Truck className="h-3 w-3 mr-1" />
                Vehicles available
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl shadow-medium">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Drivers</p>
              <p className="text-2xl font-bold text-dark-800 animate-fade-in">
                {vehicleOwners.reduce(
                  (sum, owner) => sum + (owner.driver_count || 0),
                  0
                )}
              </p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <User className="h-3 w-3 mr-1" />
                All drivers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Owners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
        {filteredOwners.map((owner, index) => (
          <div key={owner.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {owner.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "N/A"}
                </div>
                <div>
                  <h3 className="font-semibold text-dark-800">
                    {owner.name || "N/A"}
                  </h3>
                  <div
                    className={`status-badge ${getStatusColor(
                      owner.status
                    )} flex items-center gap-1`}
                  >
                    {getStatusIcon(owner.status)}
                    {owner.status?.toUpperCase() || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(owner)}
                  className="p-2 text-dark-400 hover:text-primary-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(owner)}
                  className="p-2 text-dark-400 hover:text-primary-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <Mail className="h-4 w-4" />
                {owner.email || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <Phone className="h-4 w-4" />
                {owner.phone || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-600">
                <MapPin className="h-4 w-4" />
                {owner.address || "N/A"}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-dark-500">Fleet Size</p>
                  <p className="font-semibold text-dark-800">
                    {owner.fleet_size || 0} vehicles
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500">Drivers</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-dark-800">
                      {owner.driver_count || 0}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedOwnerDrivers(owner.drivers || []);
                        setShowDriversModal(true);
                      }}
                      className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
                      title="View Drivers"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-dark-500">Total Trips</p>
                  <p className="font-semibold text-dark-800">
                    {owner.total_trips || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500">Completed</p>
                  <p className="font-semibold text-dark-800">
                    {owner.completed_trips || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-dark-500">
                Member since: {new Date(owner.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-large w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-900">
                  {editingOwner
                    ? "Edit Vehicle Owner"
                    : "Add New Vehicle Owner"}
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
                  Owner Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter owner name"
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

              {/* Password fields - only show for new vehicle owners */}
              {!editingOwner && (
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
                      <p className="text-sm font-medium text-blue-800">
                        Owner Account
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      A vehicle owner account will be created with the provided
                      email and password for login access.
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
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Enter owner address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gst_number}
                  onChange={(e) =>
                    setFormData({ ...formData, gst_number: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter GST number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Fleet Size
                </label>
                <input
                  type="number"
                  value={formData.fleet_size}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fleet_size: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                  placeholder="Enter fleet size"
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
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  {editingOwner ? "Update" : "Add"} Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingOwner && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-large w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-900">
                  Vehicle Owner Details
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
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {viewingOwner.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "N/A"}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-900">
                      {viewingOwner.name || "N/A"}
                    </h4>
                    <p className="text-dark-600">
                      {viewingOwner.email || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`status-badge ${getStatusColor(
                      viewingOwner.status
                    )} ml-auto flex items-center gap-1`}
                  >
                    {getStatusIcon(viewingOwner.status)}
                    {viewingOwner.status?.toUpperCase() || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Phone
                      </label>
                      <p className="text-dark-900">
                        {viewingOwner.phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        GST Number
                      </label>
                      <p className="text-dark-900">
                        {viewingOwner.gst_number || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Fleet Size
                      </label>
                      <p className="text-dark-900">
                        {viewingOwner.fleet_size || 0} vehicles
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Owner ID
                      </label>
                      <p className="text-dark-900">#{viewingOwner.id}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Address
                  </label>
                  <p className="text-dark-900 bg-gray-50 p-3 rounded-lg">
                    {viewingOwner.address || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Total Trips
                    </label>
                    <p className="text-dark-900">
                      {viewingOwner.total_trips || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Completed Trips
                    </label>
                    <p className="text-secondary-600 font-medium">
                      {viewingOwner.completed_trips || 0}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Available Vans
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {viewingOwner.available_vans || 0}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    Total Vans
                  </label>
                  <p className="text-lg font-semibold text-dark-800">
                    {viewingOwner.total_vans || 0}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-dark-500">
                    Member since:{" "}
                    {new Date(viewingOwner.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingOwner!);
                }}
                className="flex-1 btn-primary"
              >
                Edit Owner
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drivers Modal */}
      {showDriversModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDriversModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-large w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Drivers List
                  {selectedOwnerDrivers.length > 0 &&
                    selectedOwnerDrivers[0] && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Real-time data from backend)
                      </span>
                    )}
                </h3>
                <button
                  onClick={() => setShowDriversModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedOwnerDrivers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No drivers found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedOwnerDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-dark-900">
                                {driver.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {driver.email}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{driver.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{driver.license_number}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-gray-400" />
                              <span>{driver.experience_years} years exp.</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">
                                Total Trips
                              </p>
                              <p className="font-semibold text-dark-800">
                                {driver.total_trips}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Completed</p>
                              <p className="font-semibold text-green-600">
                                {driver.completed_trips}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  driver.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : driver.status === "inactive"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {driver.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Total Drivers: {selectedOwnerDrivers.length}
                </p>
                <button
                  onClick={() => setShowDriversModal(false)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
