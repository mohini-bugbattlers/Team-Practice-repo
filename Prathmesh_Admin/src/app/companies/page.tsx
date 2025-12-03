"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Building2,
  X,
  CheckCircle,
  EyeOff,
  User,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_number: string;
  gst_number: string;
  total_trips: number;
  active_trips: number;
  status: "active" | "inactive";
  created_at: string;
}

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_number: string;
  gst_number: string;
  status: "active" | "inactive";
  password: string;
  confirmPassword: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    registration_number: "",
    gst_number: "",
    status: "active",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await AuthService.get("/companies");
      if (response.success) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.registration_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === "active" ? "status-active" : "status-cancelled";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      registration_number: "",
      gst_number: "",
      status: "active",
      password: "",
      confirmPassword: "",
    });
    setEditingCompany(null);
    setViewingCompany(null);
    setShowViewModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords for new companies
    if (!editingCompany) {
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
      const url = editingCompany
        ? `/companies/${editingCompany.id}`
        : "/companies";

      const method = editingCompany ? "PUT" : "POST";

      const companyData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        registration_number: formData.registration_number,
        gst_number: formData.gst_number || null,
        status: formData.status,
      };

      const response = await AuthService.apiCall(url, {
        method,
        body: JSON.stringify(companyData),
      });

      if (response.success) {
        // If creating a new company, also create a user account
        if (!editingCompany) {
          try {
            await AuthService.post("/auth/create-user", {
              email: formData.email,
              password: formData.password,
              name: formData.name,
              role: "company",
              phone: formData.phone,
            });
          } catch (userError) {
            console.error("Error creating user account:", userError);
            // Company created but user creation failed - still show success
          }
        }

        await fetchCompanies();
        setShowAddModal(false);
        setShowViewModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving company:", error);
    }
  };

  const handleView = (company: Company) => {
    setViewingCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      registration_number: company.registration_number,
      gst_number: company.gst_number || "",
      status: company.status,
      password: "",
      confirmPassword: "",
    });
    setShowAddModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">
          Company Management
        </h1>
        <p className="text-dark-600">Manage registered transport companies</p>
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
              <p className="text-sm font-medium text-dark-600">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-dark-900">
                {companies.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
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
                Active Companies
              </p>
              <p className="text-2xl font-bold text-dark-900">
                {companies.filter((c) => c.status === "active").length}
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
              <p className="text-sm font-medium text-dark-600">Total Trips</p>
              <p className="text-2xl font-bold text-dark-900">
                {companies.reduce((sum, c) => sum + c.total_trips, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent-600" />
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
              <p className="text-sm font-medium text-dark-600">This Month</p>
              <p className="text-2xl font-bold text-dark-900">
                {
                  companies.filter(
                    (c) =>
                      new Date(c.created_at) >
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
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
                placeholder="Search companies..."
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
            Add Company
          </button>
        </div>
      </motion.div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : filteredCompanies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-500 text-lg">No companies found</p>
          </div>
        ) : (
          filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              className="card hover:shadow-medium transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900">
                      {company.name}
                    </h3>
                    <p className="text-sm text-dark-500">{company.email}</p>
                  </div>
                </div>
                <span
                  className={`status-badge ${getStatusColor(company.status)}`}
                >
                  {company.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">Phone:</span>
                  <span className="font-medium text-dark-800">
                    {company.phone}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">Reg. No:</span>
                  <span className="font-medium text-dark-800">
                    {company.registration_number}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">Total Trips:</span>
                  <span className="font-medium text-dark-800">
                    {company.total_trips}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-600">Active Trips:</span>
                  <span className="font-medium text-secondary-600">
                    {company.active_trips}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleView(company)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleEdit(company)}
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
            onClick={() => setShowAddModal(false)}
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
                    {editingCompany ? "Edit Company" : "Add New Company"}
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
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="Enter company name"
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

                {/* Password fields - only show for new companies */}
                {!editingCompany && (
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
                          Account Creation
                        </p>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        A company user account will be created with the provided
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
                    placeholder="Enter company address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_number: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="Enter registration number"
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
                      setFormData({
                        ...formData,
                        gst_number: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="Enter GST number (optional)"
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
                    {editingCompany ? "Update" : "Add"} Company
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && viewingCompany && (
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
                    Company Details
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
                      <Building2 className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-dark-900">
                        {viewingCompany.name}
                      </h4>
                      <p className="text-dark-600">{viewingCompany.email}</p>
                    </div>
                    <span
                      className={`status-badge ${getStatusColor(
                        viewingCompany.status
                      )} ml-auto`}
                    >
                      {viewingCompany.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Phone
                        </label>
                        <p className="text-dark-900">{viewingCompany.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Registration Number
                        </label>
                        <p className="text-dark-900">
                          {viewingCompany.registration_number}
                        </p>
                      </div>
                      {viewingCompany.gst_number && (
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">
                            GST Number
                          </label>
                          <p className="text-dark-900">
                            {viewingCompany.gst_number}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Total Trips
                        </label>
                        <p className="text-dark-900">
                          {viewingCompany.total_trips}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Active Trips
                        </label>
                        <p className="text-secondary-600 font-medium">
                          {viewingCompany.active_trips}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">
                      Address
                    </label>
                    <p className="text-dark-900 bg-gray-50 p-3 rounded-lg">
                      {viewingCompany.address}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-dark-500">
                      Created:{" "}
                      {new Date(viewingCompany.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingCompany);
                  }}
                  className="flex-1 btn-primary"
                >
                  Edit Company
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
