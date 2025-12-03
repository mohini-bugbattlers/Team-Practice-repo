"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Receipt,
  IndianRupee,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";
import Link from "next/link";

interface Payment {
  id: number;
  trip_id: number;
  trip_number: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'card';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date: string;
  due_date: string;
  paid_date?: string;
  description: string;
  invoice_number?: string;
  route?: string;
  materialType?: string;
  quantity?: number;
  quantityUnit?: string;
}

interface PaymentStats {
  totalPaid: number;
  pendingAmount: number;
  thisMonthPaid: number;
  overdueAmount: number;
  totalTransactions: number;
  successRate: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  trip_id: number;
  trip_number: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  route: string;
  materialType: string;
  quantity: number;
  quantityUnit: string;
}

export default function CompanyPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPaid: 0,
    pendingAmount: 0,
    thisMonthPaid: 0,
    overdueAmount: 0,
    totalTransactions: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, invoicesResponse] = await Promise.all([
        AuthService.get('/company/payments'),
        AuthService.get('/company/invoices')
      ]);

      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data);
        calculatePaymentStats(paymentsResponse.data);
      }

      if (invoicesResponse.success) {
        setInvoices(invoicesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching payments data:", error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockPayments: Payment[] = [
      {
        id: 1,
        trip_id: 1,
        trip_number: "TR-001",
        amount: 27500,
        payment_method: "bank_transfer",
        status: "completed",
        transaction_id: "TXN2024001",
        payment_date: "2024-01-16",
        due_date: "2024-01-16",
        paid_date: "2024-01-16",
        description: "Crude Oil Transportation - Mumbai to Pune",
        invoice_number: "INV-2024-001",
        route: "Mumbai Oil Refinery → Pune Industrial Area",
        materialType: "Crude Oil",
        quantity: 5000,
        quantityUnit: "liters",
      },
      {
        id: 2,
        trip_id: 2,
        trip_number: "TR-002",
        amount: 35200,
        payment_method: "upi",
        status: "pending",
        payment_date: "2024-01-21",
        due_date: "2024-01-21",
        description: "Chemical Waste Transportation - Kolhapur to Nashik",
        invoice_number: "INV-2024-002",
        route: "Sugar Mill, Kolhapur → Chemical Plant, Nashik",
        materialType: "Chemical Waste",
        quantity: 8000,
        quantityUnit: "liters",
      },
      {
        id: 3,
        trip_id: 3,
        trip_number: "TR-003",
        amount: 19800,
        payment_method: "cheque",
        status: "completed",
        transaction_id: "TXN2024003",
        payment_date: "2024-01-19",
        due_date: "2024-01-19",
        paid_date: "2024-01-19",
        description: "Diesel Transportation - Vadodara to Surat",
        invoice_number: "INV-2024-003",
        route: "Oil Depot, Vadodara → Factory, Surat",
        materialType: "Diesel",
        quantity: 3000,
        quantityUnit: "liters",
      },
    ];

    const mockInvoices: Invoice[] = [
      {
        id: 1,
        invoice_number: "INV-2024-001",
        trip_id: 1,
        trip_number: "TR-001",
        amount: 27500,
        issue_date: "2024-01-14",
        due_date: "2024-01-16",
        status: "paid",
        route: "Mumbai Oil Refinery → Pune Industrial Area",
        materialType: "Crude Oil",
        quantity: 5000,
        quantityUnit: "liters",
      },
      {
        id: 2,
        invoice_number: "INV-2024-002",
        trip_id: 2,
        trip_number: "TR-002",
        amount: 35200,
        issue_date: "2024-01-19",
        due_date: "2024-01-21",
        status: "sent",
        route: "Sugar Mill, Kolhapur → Chemical Plant, Nashik",
        materialType: "Chemical Waste",
        quantity: 8000,
        quantityUnit: "liters",
      },
    ];

    setPayments(mockPayments);
    setInvoices(mockInvoices);
    calculatePaymentStats(mockPayments);
  };

  const calculatePaymentStats = (paymentsData: Payment[]) => {
    const totalPaid = paymentsData
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = paymentsData
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const overdueAmount = paymentsData
      .filter(p => {
        if (p.status !== 'pending') return false;
        return new Date(p.due_date) < new Date();
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const thisMonthPaid = paymentsData
      .filter(p => {
        if (p.status !== 'completed') return false;
        const paymentDate = new Date(p.paid_date || p.payment_date);
        const currentMonth = new Date();
        return paymentDate.getMonth() === currentMonth.getMonth() &&
               paymentDate.getFullYear() === currentMonth.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTransactions = paymentsData.length;
    const successfulTransactions = paymentsData.filter(p => p.status === 'completed').length;
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    setStats({
      totalPaid,
      pendingAmount,
      thisMonthPaid,
      overdueAmount,
      totalTransactions,
      successRate,
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.materialType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': return 'status-completed';
      case 'pending': case 'sent': return 'status-pending';
      case 'processing': return 'status-active';
      case 'failed': case 'cancelled': return 'status-cancelled';
      case 'overdue': return 'status-cancelled';
      case 'refunded': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': case 'sent': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': case 'cancelled': case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'refunded': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <FileText className="h-4 w-4" />;
      case 'upi': return <IndianRupee className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'cheque': return <Receipt className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-800">Payments & Invoices</h1>
          <p className="text-dark-600 mt-1">Track your payments and manage invoices</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link href="/trips">
            <button className="btn-primary flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              View Trips
            </button>
          </Link>
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
            <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-medium">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Total Paid</p>
              <p className="text-2xl font-bold text-dark-800">₹{stats.totalPaid.toLocaleString()}</p>
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
            <div className="p-3 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl shadow-medium">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Pending Amount</p>
              <p className="text-2xl font-bold text-dark-800">₹{stats.pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-primary-600 flex items-center mt-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
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
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">This Month</p>
              <p className="text-2xl font-bold text-dark-800">₹{stats.thisMonthPaid.toLocaleString()}</p>
              <p className="text-xs text-secondary-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Monthly total
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
            <div className="p-3 bg-gradient-to-br from-accent-400 to-accent-500 rounded-xl shadow-medium">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-dark-600">Overdue</p>
              <p className="text-2xl font-bold text-dark-800">₹{stats.overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Requires attention
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2 inline" />
              Payments ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'invoices'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 mr-2 inline" />
              Invoices ({invoices.length})
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-dark-600">Loading payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-dark-500 text-lg">No payments found</p>
              </div>
            ) : (
              filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-medium transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-800">{payment.trip_number}</p>
                      <p className="text-sm text-dark-600">{payment.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-dark-500">
                          {payment.invoice_number} • {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                        {payment.transaction_id && (
                          <p className="text-xs text-primary-600 font-mono">
                            {payment.transaction_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-dark-800">₹{payment.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <p className="text-xs text-dark-500 capitalize">{payment.payment_method.replace('_', ' ')}</p>
                    </div>
                    <div className={`status-badge ${getStatusColor(payment.status)} mt-1`}>
                      {payment.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewPayment(payment)}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </button>
                    {payment.status === 'completed' && (
                      <button className="btn-primary text-sm flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Receipt
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-dark-600">Loading invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-dark-500 text-lg">No invoices found</p>
              </div>
            ) : (
              filteredInvoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-medium transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-800">{invoice.invoice_number}</p>
                      <p className="text-sm text-dark-600">{invoice.trip_number} - {invoice.route}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-dark-500">
                          {invoice.materialType} • {invoice.quantity} {invoice.quantityUnit}
                        </p>
                        <p className="text-xs text-dark-500">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-dark-800">₹{invoice.amount.toLocaleString()}</p>
                    <p className="text-xs text-dark-500">
                      Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                    </p>
                    <div className={`status-badge ${getStatusColor(invoice.status)} mt-1`}>
                      {invoice.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="btn-primary text-sm flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPayment && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentModal(false)}
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
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-800">Payment Details</h3>
                      <p className="text-dark-600">{selectedPayment.trip_number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-dark-400 hover:text-dark-600"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Payment Status</label>
                      <div className={`status-badge ${getStatusColor(selectedPayment.status)}`}>
                        {getStatusIcon(selectedPayment.status)}
                        <span className="ml-1">{selectedPayment.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Amount</label>
                      <p className="text-2xl font-bold text-dark-900">₹{selectedPayment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Payment Method</label>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(selectedPayment.payment_method)}
                        <span className="capitalize">{selectedPayment.payment_method.replace('_', ' ')}</span>
                      </div>
                    </div>
                    {selectedPayment.transaction_id && (
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">Transaction ID</label>
                        <p className="font-mono text-sm text-dark-900">{selectedPayment.transaction_id}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Trip Details</label>
                      <p className="text-dark-900">{selectedPayment.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Invoice Number</label>
                      <p className="text-dark-900">{selectedPayment.invoice_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Payment Date</label>
                      <p className="text-dark-900">{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Due Date</label>
                      <p className="text-dark-900">{new Date(selectedPayment.due_date).toLocaleDateString()}</p>
                    </div>
                    {selectedPayment.paid_date && (
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">Paid Date</label>
                        <p className="text-secondary-600 font-medium">{new Date(selectedPayment.paid_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </button>
                  <button className="flex-1 btn-secondary">
                    <FileText className="w-4 h-4 mr-2" />
                    View Invoice
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
