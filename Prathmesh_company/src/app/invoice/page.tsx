"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Filter,
  Search,
  Edit,
  Trash2,
  X,
  Building,
  User,
  Truck,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Invoice {
  id: number;
  invoice_number: string;
  trip_id: number;
  trip_number: string;
  route: string;
  pickup_location: string;
  drop_location: string;
  material_type: string;
  quantity: number;
  quantity_unit: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'pending';
  issue_date: string;
  due_date: string;
  created_at: string;
}

interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export default function CompanyInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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

    if (user.role !== 'company') {
      router.push('/auth/login');
      return;
    }

    setIsAuthenticated(true);
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await AuthService.get('/company/invoices');
      if (response.success) {
        setInvoices(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockInvoices: Invoice[] = [
      {
        id: 1,
        invoice_number: "INV-TR-001",
        trip_id: 1,
        trip_number: "TR-001",
        route: "Mumbai Oil Refinery → Pune Industrial Area",
        pickup_location: "Mumbai Oil Refinery",
        drop_location: "Pune Industrial Area",
        material_type: "Crude Oil",
        quantity: 5000,
        quantity_unit: "liters",
        amount: 27500,
        status: "paid",
        issue_date: "2024-01-14T09:00:00Z",
        due_date: "2024-01-20T09:00:00Z",
        created_at: "2024-01-14T09:00:00Z",
      },
      {
        id: 2,
        invoice_number: "INV-TR-002",
        trip_id: 2,
        trip_number: "TR-002",
        route: "Sugar Mill, Kolhapur → Chemical Plant, Nashik",
        pickup_location: "Sugar Mill, Kolhapur",
        drop_location: "Chemical Plant, Nashik",
        material_type: "Industrial Chemicals",
        quantity: 8000,
        quantity_unit: "liters",
        amount: 35200,
        status: "pending",
        issue_date: "2024-01-19T10:00:00Z",
        due_date: "2024-01-25T10:00:00Z",
        created_at: "2024-01-19T10:00:00Z",
      },
      {
        id: 3,
        invoice_number: "INV-TR-003",
        trip_id: 3,
        trip_number: "TR-003",
        route: "Oil Depot, Vadodara → Factory, Surat",
        pickup_location: "Oil Depot, Vadodara",
        drop_location: "Factory, Surat",
        material_type: "Diesel",
        quantity: 3000,
        quantity_unit: "liters",
        amount: 19800,
        status: "overdue",
        issue_date: "2024-01-17T11:00:00Z",
        due_date: "2024-01-22T11:00:00Z",
        created_at: "2024-01-17T11:00:00Z",
      },
    ];
    setInvoices(mockInvoices);
    calculateStats(mockInvoices);
  };

  const calculateStats = (invoicesData: Invoice[]) => {
    const totalInvoices = invoicesData.length;
    const totalAmount = invoicesData.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoicesData
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = invoicesData
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = invoicesData
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);

    setStats({
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.material_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-cancelled';
      case 'sent': return 'status-active';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'sent': return <FileText className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
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
              <h1 className="text-3xl font-bold text-dark-800">Invoices</h1>
              <p className="text-dark-600 mt-1">Manage and track all your invoices</p>
            </div>
            <Link href="/invoice/generate">
              <motion.button
                className="btn-primary flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Invoice
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
                  <p className="text-sm font-medium text-dark-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-dark-800">{stats.totalInvoices}</p>
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
                  <p className="text-sm font-medium text-dark-600">Total Amount</p>
                  <p className="text-2xl font-bold text-dark-800">₹{stats.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-primary-600 flex items-center mt-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                    All invoices
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
                  <p className="text-sm font-medium text-dark-600">Paid</p>
                  <p className="text-2xl font-bold text-dark-800">₹{stats.paidAmount.toLocaleString()}</p>
                  <p className="text-xs text-secondary-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Successfully paid
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
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-medium">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-600">Overdue</p>
                  <p className="text-2xl font-bold text-dark-800">₹{stats.overdueAmount.toLocaleString()}</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    Needs attention
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
                    placeholder="Search by invoice number, trip, or material..."
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
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Invoices Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Invoice Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-2 text-dark-600">Loading invoices...</p>
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        className="table-row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-dark-900">{invoice.invoice_number}</div>
                            <div className="text-sm text-dark-500">{invoice.trip_number}</div>
                            <div className="text-xs text-dark-400">{invoice.route}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-dark-900">{invoice.material_type}</div>
                          <div className="text-sm text-dark-500">{invoice.quantity} {invoice.quantity_unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-dark-900">₹{invoice.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1">{invoice.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(invoice)}
                              className="text-primary-600 hover:text-primary-900 transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="text-secondary-600 hover:text-secondary-900 transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="text-accent-600 hover:text-accent-900 transition-colors">
                              <Edit className="w-5 h-5" />
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

          {/* Invoice Details Modal */}
          <AnimatePresence>
            {showDetailsModal && selectedInvoice && (
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
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-dark-800">Invoice Details</h3>
                          <p className="text-dark-600">{selectedInvoice.invoice_number}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="text-dark-400 hover:text-dark-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Trip Number</label>
                          <p className="text-dark-900">{selectedInvoice.trip_number}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Route</label>
                          <p className="text-dark-900">{selectedInvoice.pickup_location} → {selectedInvoice.drop_location}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Material Type</label>
                          <p className="text-dark-900">{selectedInvoice.material_type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Quantity</label>
                          <p className="text-dark-900">{selectedInvoice.quantity} {selectedInvoice.quantity_unit}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Amount</label>
                          <p className="text-xl font-bold text-primary-600">₹{selectedInvoice.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Status</label>
                          <span className={`status-badge ${getStatusColor(selectedInvoice.status)}`}>
                            {getStatusIcon(selectedInvoice.status)}
                            <span className="ml-1">{selectedInvoice.status.replace('_', ' ').toUpperCase()}</span>
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Issue Date</label>
                          <p className="text-dark-900">{new Date(selectedInvoice.issue_date).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-dark-700 mb-1">Due Date</label>
                          <p className={`font-medium ${new Date(selectedInvoice.due_date) < new Date() && selectedInvoice.status !== 'paid' ? 'text-red-600' : 'text-dark-900'}`}>
                            {new Date(selectedInvoice.due_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-dark-800 mb-3">Invoice Actions</h4>
                      <div className="flex gap-3">
                        <button className="flex-1 btn-primary">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </button>
                        <button className="flex-1 btn-secondary">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Invoice
                        </button>
                        {selectedInvoice.status !== 'paid' && (
                          <button className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Mark as Paid
                          </button>
                        )}
                      </div>
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
