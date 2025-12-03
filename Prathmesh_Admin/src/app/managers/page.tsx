"use client";

import API_CONFIG from "../../services/config";
import AuthService from "../../services/auth";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  UserCheck,
  X,
  CheckCircle,
  AlertCircle,
  Lock,
  EyeOff,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Manager {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: "active" | "inactive";
  total_managed_trips: number;
  created_at: string;
}

interface ManagerFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  status: "active" | "inactive";
  password: string;
  confirmPassword: string;
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [viewingManager, setViewingManager] = useState<Manager | null>(null);
  const [deletingManager, setDeletingManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState<ManagerFormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    status: "active",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await AuthService.get("/managers");
      if (response.success) {
        setManagers(response.data);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      status: "active",
      password: "",
      confirmPassword: "",
    });
    setEditingManager(null);
    setViewingManager(null);
    setShowViewModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords for new managers
    if (!editingManager) {
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
      const url = editingManager
        ? `/managers/${editingManager.id}`
        : "/managers";

      const method = editingManager ? "PUT" : "POST";

      const managerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        status: formData.status,
      };

      const response = await AuthService.apiCall(url, {
        method,
        body: JSON.stringify(managerData),
      });

      if (response.success) {
        // If creating a new manager, also create a user account
        if (!editingManager) {
          try {
            await AuthService.post('/auth/create-user', {
              email: formData.email,
              password: formData.password,
              name: formData.name,
              role: 'manager',
              phone: formData.phone,
            });
          } catch (userError) {
            console.error('Error creating user account:', userError);
            // Manager created but user creation failed - still show success
          }
        }

        await fetchManagers();
        setShowAddModal(false);
        setShowViewModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving manager:", error);
    }
  };

  const handleView = (manager: Manager) => {
    setViewingManager(manager);
    setShowViewModal(true);
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      department: manager.department,
      status: manager.status,
      password: "",
      confirmPassword: "",
    });
    setShowAddModal(true);
  };

  const handleDelete = (manager: Manager) => {
    setDeletingManager(manager);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingManager) return;

    try {
      const response = await AuthService.delete(`/managers/${deletingManager.id}`);

      if (response.success) {
        await fetchManagers();
        setShowDeleteModal(false);
        setDeletingManager(null);
      }
    } catch (error) {
      console.error("Error deleting manager:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">
          Manager Management
        </h1>
        <p className="text-dark-600">
          Manage operations managers and supervisors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600">
                Total Managers
              </p>
              <p className="text-2xl font-bold text-dark-900">
                {managers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary-600" />
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
                Active Managers
              </p>
              <p className="text-2xl font-bold text-dark-900">
                {managers.filter((m) => m.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary-600" />
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
                Avg Trips Managed
              </p>
              <p className="text-2xl font-bold text-dark-900">
                {managers.length > 0
                  ? Math.round(
                      managers.reduce(
                        (sum, m) => sum + m.total_managed_trips,
                        0
                      ) / managers.length
                    )
                  : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-accent-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Actions */}
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
                placeholder="Search managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Manager
          </button>
        </div>
      </motion.div>

      {/* Managers Table */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto scrollbar-hide">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Trips Managed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-2 text-dark-600">Loading managers...</p>
                  </td>
                </tr>
              ) : filteredManagers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-dark-500"
                  >
                    No managers found
                  </td>
                </tr>
              ) : (
                filteredManagers.map((manager, index) => (
                  <motion.tr
                    key={manager.id}
                    className="table-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {manager.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark-900">
                            {manager.name}
                          </div>
                          <div className="text-sm text-dark-500">
                            ID: {manager.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-900">
                        {manager.email}
                      </div>
                      <div className="text-sm text-dark-500">
                        {manager.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="status-badge status-active">
                        {manager.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`status-badge ${
                          manager.status === "active"
                            ? "status-active"
                            : "status-cancelled"
                        }`}
                      >
                        {manager.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                      {manager.total_managed_trips}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(manager)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(manager)}
                          className="text-secondary-600 hover:text-secondary-900 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(manager)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
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
              className="bg-white rounded-xl shadow-large w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark-900">
                    {editingManager ? "Edit Manager" : "Add New Manager"}
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
                    Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Enter manager name"
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

                {/* Password fields - only show for new managers */}
                {!editingManager && (
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
                        <p className="text-sm font-medium text-blue-800">Manager Account</p>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        A manager account will be created with the provided email and password for login access.
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
                    department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Operations">Operations</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Fleet Management">Fleet Management</option>
                    <option value="Quality Control">Quality Control</option>
                  </select>
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
                    {editingManager ? "Update" : "Add"} Manager
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && viewingManager && (
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
                    Manager Details
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
                      {viewingManager.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-dark-900">
                        {viewingManager.name}
                      </h4>
                      <p className="text-dark-600">{viewingManager.email}</p>
                    </div>
                    <span
                      className={`status-badge ${
                        viewingManager.status === "active"
                          ? "status-active"
                          : "status-cancelled"
                      } ml-auto`}
                    >
                      {viewingManager.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Phone
                        </label>
                        <p className="text-dark-900">{viewingManager.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          department
                        </label>
                        <span className="status-badge status-active">
                          {viewingManager.department}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Total Managed Trips
                        </label>
                        <p className="text-dark-900">
                          {viewingManager.total_managed_trips}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Manager ID
                        </label>
                        <p className="text-dark-900">#{viewingManager.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-dark-500">
                      Joined:{" "}
                      {new Date(viewingManager.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingManager);
                  }}
                  className="flex-1 btn-primary"
                >
                  Edit Manager
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingManager && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-large w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark-900">
                    Confirm Deletion
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-dark-400 hover:text-dark-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-900">
                      Delete Manager
                    </h4>
                    <p className="text-sm text-dark-600">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-dark-700 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{deletingManager.name}</span>? This will
                  permanently remove the manager and all associated data.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete Manager
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
