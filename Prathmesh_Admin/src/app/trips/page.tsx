'use client'

import API_CONFIG from '../../services/config'
import AuthService from '../../services/auth'
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, X, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Company {
  id: number
  name: string
  email: string
  phone: string
  address: string
  registration_number: string
  gst_number: string
  status: string
  total_trips: number
  active_trips: number
  created_at: string
}

interface VehicleOwner {
  id: number
  name: string
  email: string
  phone: string
  address: string
  gst_number: string
  fleet_size: number
  rating: number
  status: string
  total_trips: number
  completed_trips: number
  created_at: string
}

interface Driver {
  id: number
  name: string
  email: string
  phone: string
  license_number: string
  experience_years: number
  rating: number
  status: string
  total_trips: number
  completed_trips: number
  current_trip_id: number | null
  created_at: string
}

interface TripFormData {
  trip_number: string
  company_id: number
  vehicle_owner_id: number
  driver_id: number
  route: string
  status: 'pending' | 'confirmed' | 'vehicle_assigned' | 'driver_assigned' | 'in_transit' | 'completed' | 'cancelled'
  start_date: string
  estimated_delivery_date: string
  base_amount: number
  service_charge: number
}

interface Trip {
  id: number;
  trip_number: string;
  company_id: number;
  vehicle_owner_id: number;
  driver_id: number;
  route: string;
  status: 'pending' | 'confirmed' | 'vehicle_assigned' | 'driver_assigned' | 'in_transit' | 'completed' | 'cancelled';
  start_date: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  base_amount: number;
  service_charge: number;
  total_amount: number;
  created_at: string;
  companyName?: string;
  vehicleOwnerName?: string;
  driverName?: string;
}

interface TransportRequest {
  id: number;
  request_number: string;
  companyName: string;
  material_type: string;
  quantity: number;
  quantity_unit: string;
  pickup_location: string;
  drop_location: string;
  preferred_date: string;
  urgency: string;
  status: string;
  estimated_cost: number;
  created_at: string;
  contact_person: string;
  contact_phone: string;
  special_instructions?: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [vehicleOwners, setVehicleOwners] = useState<VehicleOwner[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [dropdownLoading, setDropdownLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null)
  const [activeTab, setActiveTab] = useState<'trips' | 'requests'>('trips')
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestAction, setRequestAction] = useState<'approve' | 'reject' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [formData, setFormData] = useState<TripFormData>({
    trip_number: '',
    company_id: 0,
    vehicle_owner_id: 0,
    driver_id: 0,
    route: '',
    status: 'pending',
    start_date: '',
    estimated_delivery_date: '',
    base_amount: 0,
    service_charge: 0
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setDropdownLoading(true)
      // Fetch dropdown data in parallel
      const [companiesResponse, vehicleOwnersResponse, driversResponse] = await Promise.all([
        AuthService.get('/companies'),
        AuthService.get('/vehicle-owners'),
        AuthService.get('/drivers')
      ])

      if (companiesResponse.success) {
        setCompanies(companiesResponse.data)
      }
      if (vehicleOwnersResponse.success) {
        setVehicleOwners(vehicleOwnersResponse.data)
      }
      if (driversResponse.success) {
        setDrivers(driversResponse.data)
      }

      await fetchTrips()
      await fetchTransportRequests()
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
      await fetchTrips() // Still fetch trips even if dropdowns fail
    } finally {
      setDropdownLoading(false)
    }
  }

  const fetchTransportRequests = async () => {
    try {
      const response = await AuthService.get('/company/admin/transport-requests')
      if (response.success) {
        setTransportRequests(response.data)
      }
    } catch (error) {
      console.error('Error fetching transport requests:', error)
      // Load mock data as fallback
      setTransportRequests([
        {
          id: 1,
          request_number: "REQ-001",
          companyName: "Oil Transport Corp",
          material_type: "Crude Oil",
          quantity: 5000,
          quantity_unit: "liters",
          pickup_location: "Mumbai Oil Refinery",
          drop_location: "Pune Industrial Area",
          preferred_date: "2024-01-20T10:00:00Z",
          urgency: "high",
          status: "pending",
          estimated_cost: 27500,
          created_at: "2024-01-18T09:00:00Z",
          contact_person: "Rajesh Kumar",
          contact_phone: "+91-9876543210",
          special_instructions: "Handle with care - hazardous material"
        },
        {
          id: 2,
          request_number: "REQ-002",
          companyName: "Chemical Industries Ltd",
          material_type: "Industrial Chemicals",
          quantity: 8000,
          quantity_unit: "liters",
          pickup_location: "Vapi Chemical Plant",
          drop_location: "Ahmedabad Refinery",
          preferred_date: "2024-01-22T08:00:00Z",
          urgency: "medium",
          status: "approved",
          estimated_cost: 35200,
          created_at: "2024-01-19T11:00:00Z",
          contact_person: "Priya Sharma",
          contact_phone: "+91-9876543211",
          special_instructions: "Temperature controlled transport required"
        }
      ])
    }
  }

  const fetchTrips = async () => {
    try {
      const response = await AuthService.get('/trips')
      if (response.success) {
        setTrips(response.data)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || trip.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'in_transit': return 'status-active'
      case 'confirmed': return 'status-active'
      case 'vehicle_assigned': return 'status-active'
      case 'driver_assigned': return 'status-active'
      case 'pending': return 'status-pending'
      case 'cancelled': return 'status-cancelled'
      default: return 'status-pending'
    }
  }

  const resetForm = () => {
    setFormData({
      trip_number: '',
      company_id: 0,
      vehicle_owner_id: 0,
      driver_id: 0,
      route: '',
      status: 'pending',
      start_date: '',
      estimated_delivery_date: '',
      base_amount: 0,
      service_charge: 0
    })
    setEditingTrip(null)
    setViewingTrip(null)
    setShowViewModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTrip
        ? `/trips/${editingTrip.id}`
        : "/trips";

      const method = editingTrip ? "PUT" : "POST"

      // Transform form data to match backend expectations
      const submitData = {
        trip_number: formData.trip_number,
        company_id: formData.company_id,
        vehicle_owner_id: formData.vehicle_owner_id,
        driver_id: formData.driver_id,
        route: formData.route,
        start_date: formData.start_date,
        estimated_delivery_date: formData.estimated_delivery_date,
        base_amount: formData.base_amount,
        service_charge: formData.service_charge,
        status: formData.status
      }

      const response = await AuthService.apiCall(url, {
        method,
        body: JSON.stringify(submitData),
      })

      if (response.success) {
        await fetchAllData()
        setShowAddModal(false)
        setShowViewModal(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving trip:", error)
    }
  }

  const handleView = (trip: Trip) => {
    setViewingTrip(trip)
    setShowViewModal(true)
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      trip_number: trip.trip_number,
      company_id: trip.company_id,
      vehicle_owner_id: trip.vehicle_owner_id,
      driver_id: trip.driver_id,
      route: trip.route,
      status: trip.status,
      start_date: trip.start_date,
      estimated_delivery_date: trip.estimated_delivery_date,
      base_amount: trip.base_amount,
      service_charge: trip.service_charge
    });
    setShowAddModal(true);
  };

  const handleViewRequest = (request: TransportRequest) => {
    setSelectedRequest(request)
    setShowRequestModal(true)
    setRequestAction(null)
  }

  const handleApproveRequest = (request: TransportRequest) => {
    setSelectedRequest(request)
    setRequestAction('approve')
    setAdminNotes('')
  }

  const handleRejectRequest = (request: TransportRequest) => {
    setSelectedRequest(request)
    setRequestAction('reject')
    setAdminNotes('')
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !requestAction) return

    try {
      const newStatus = requestAction === 'approve' ? 'approved' : 'rejected'
      const response = await AuthService.put(`/company/admin/transport-requests/${selectedRequest.id}/status`, {
        status: newStatus,
        adminNotes: adminNotes
      })

      if (response.success) {
        await fetchTransportRequests()
        setShowRequestModal(false)
        setSelectedRequest(null)
        setRequestAction(null)
        setAdminNotes('')
      }
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">Trip Management</h1>
        <p className="text-dark-600">Monitor and manage all transportation trips</p>
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
              <p className="text-sm font-medium text-dark-600">Total Trips</p>
              <p className="text-2xl font-bold text-dark-900">{trips.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
              <p className="text-sm font-medium text-dark-600">Active Trips</p>
              <p className="text-2xl font-bold text-dark-900">{trips.filter(t => t.status === 'in_transit').length}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
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
              <p className="text-sm font-medium text-dark-600">Completed</p>
              <p className="text-2xl font-bold text-dark-900">{trips.filter(t => t.status === 'completed').length}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
              <p className="text-sm font-medium text-dark-600">Pending</p>
              <p className="text-2xl font-bold text-dark-900">{trips.filter(t => t.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
                placeholder="Search trips..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="vehicle_assigned">Vehicle Assigned</option>
              <option value="driver_assigned">Driver Assigned</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Trip
          </button>
        </div>
      </motion.div>

      {/* Tabs for switching between trips and requests */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'trips'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Trips ({trips.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Transport Requests ({transportRequests.length})
        </button>
      </div>

      {activeTab === 'trips' && (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Trip Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                      <p className="mt-2 text-dark-600">Loading trips...</p>
                    </td>
                  </tr>
                ) : filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-dark-500">
                      No trips found
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip, index) => (
                    <motion.tr
                      key={trip.id}
                      className="table-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-dark-900">{trip.trip_number || 'N/A'}</div>
                          <div className="text-sm text-dark-500">{trip.companyName || 'N/A'}</div>
                          <div className="text-sm text-dark-500">{trip.driverName || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-900">{trip.route || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge ${getStatusColor(trip.status)}`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                        <div>Start: {new Date(trip.start_date).toLocaleDateString()}</div>
                        {trip.actual_delivery_date && (
                          <div>Delivered: {new Date(trip.actual_delivery_date).toLocaleDateString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(trip)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(trip)}
                            className="text-secondary-600 hover:text-secondary-900 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors">
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
      )}

      {activeTab === 'requests' && (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Request Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                      <p className="mt-2 text-dark-600">Loading transport requests...</p>
                    </td>
                  </tr>
                ) : transportRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      No transport requests found
                    </td>
                  </tr>
                ) : (
                  transportRequests.map((request, index) => (
                    <motion.tr
                      key={request.id}
                      className="table-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-dark-900">{request.request_number}</div>
                          <div className="text-sm text-dark-500">{request.companyName}</div>
                          <div className="text-sm text-dark-500">{request.contact_person}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-900">{request.material_type}</div>
                        <div className="text-sm text-dark-500">{request.quantity} {request.quantity_unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-dark-900">
                          {request.pickup_location} → {request.drop_location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge ${getStatusColor(request.status)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-dark-900">₹{request.estimated_cost.toLocaleString()}</div>
                        <div className="text-xs text-dark-500">
                          {new Date(request.preferred_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleApproveRequest(request)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <X className="w-5 h-5" />
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
      )}

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
                    {editingTrip ? "Edit Trip" : "Add New Trip"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      resetForm()
                    }}
                    className="text-dark-400 hover:text-dark-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Trip Number
                  </label>
                  <input
                    type="text"
                    value={formData.trip_number}
                    onChange={(e) => setFormData({ ...formData, trip_number: e.target.value })}
                    className="input-field"
                    placeholder="Enter trip number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Company
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) =>
                      setFormData({ ...formData, company_id: parseInt(e.target.value) || 0 })
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
                    value={formData.vehicle_owner_id}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicle_owner_id: parseInt(e.target.value) || 0 })
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
                    Driver
                  </label>
                  <select
                    value={formData.driver_id}
                    onChange={(e) =>
                      setFormData({ ...formData, driver_id: parseInt(e.target.value) || 0 })
                    }
                    className="input-field"
                    required
                    disabled={dropdownLoading}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.license_number}, {driver.experience_years}y exp)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Route
                  </label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className="input-field"
                    placeholder="Enter route (From - To)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.estimated_delivery_date}
                    onChange={(e) => setFormData({ ...formData, estimated_delivery_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Base Amount
                  </label>
                  <input
                    type="number"
                    value={formData.base_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, base_amount: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field"
                    placeholder="Enter base amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Service Charge
                  </label>
                  <input
                    type="number"
                    value={formData.service_charge}
                    onChange={(e) =>
                      setFormData({ ...formData, service_charge: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field"
                    placeholder="Enter service charge"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="vehicle_assigned">Vehicle Assigned</option>
                    <option value="driver_assigned">Driver Assigned</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      resetForm()
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingTrip ? "Update" : "Add"} Trip
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && viewingTrip && (
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
                    Trip Details
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
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-dark-900">
                        {viewingTrip.trip_number || 'N/A'}
                      </h4>
                      <p className="text-dark-600">{viewingTrip.route || 'N/A'}</p>
                    </div>
                    <span
                      className={`status-badge ${getStatusColor(
                        viewingTrip.status
                      )} ml-auto`}
                    >
                      {viewingTrip.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Company
                        </label>
                        <p className="text-dark-900">{viewingTrip.companyName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Driver
                        </label>
                        <p className="text-dark-900">{viewingTrip.driverName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Vehicle Owner
                        </label>
                        <p className="text-dark-900">{viewingTrip.vehicleOwnerName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Trip ID
                        </label>
                        <p className="text-dark-900">#{viewingTrip.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Start Date
                      </label>
                      <p className="text-dark-900">
                        {new Date(viewingTrip.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Estimated Delivery
                      </label>
                      <p className="text-dark-900">
                        {new Date(viewingTrip.estimated_delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {viewingTrip.actual_delivery_date && (
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">
                        Actual Delivery
                      </label>
                      <p className="text-secondary-600 font-medium">
                        {new Date(viewingTrip.actual_delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-dark-700">Amount Breakdown</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base Amount:</span>
                        <span>₹{viewingTrip.base_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service Charge:</span>
                        <span className="text-primary-600">₹{viewingTrip.service_charge.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>₹{viewingTrip.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-dark-500">
                      Created: {new Date(viewingTrip.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEdit(viewingTrip)
                  }}
                  className="flex-1 btn-primary"
                >
                  Edit Trip
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

      {/* Transport Request Modal */}
      <AnimatePresence>
        {showRequestModal && selectedRequest && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRequestModal(false)}
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
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-800">Transport Request</h3>
                      <p className="text-dark-600">{selectedRequest.request_number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowRequestModal(false)
                      setSelectedRequest(null)
                      setRequestAction(null)
                      setAdminNotes('')
                    }}
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
                      <label className="block text-sm font-medium text-dark-700 mb-1">Company</label>
                      <p className="text-dark-900">{selectedRequest.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Material Type</label>
                      <p className="text-dark-900">{selectedRequest.material_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Quantity</label>
                      <p className="text-dark-900">{selectedRequest.quantity} {selectedRequest.quantity_unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Contact Person</label>
                      <p className="text-dark-900">{selectedRequest.contact_person}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Contact Phone</label>
                      <p className="text-dark-900">{selectedRequest.contact_phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Route</label>
                      <p className="text-dark-900">{selectedRequest.pickup_location} → {selectedRequest.drop_location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Preferred Date</label>
                      <p className="text-dark-900">{new Date(selectedRequest.preferred_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Urgency</label>
                      <span className={`status-badge ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.urgency.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Estimated Cost</label>
                      <p className="text-xl font-bold text-primary-600">₹{selectedRequest.estimated_cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Current Status</label>
                      <span className={`status-badge ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedRequest.special_instructions && (
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Special Instructions</label>
                    <p className="text-dark-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.special_instructions}</p>
                  </div>
                )}

                {requestAction && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-dark-800 mb-3">
                      {requestAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-1">
                          Admin Notes {requestAction === 'approve' ? '(Optional)' : '(Required)'}
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="input-field min-h-[80px]"
                          placeholder={requestAction === 'approve' ? 'Add any notes for the company...' : 'Please provide reason for rejection...'}
                          required={requestAction === 'reject'}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {requestAction ? (
                    <>
                      <button
                        onClick={handleConfirmAction}
                        disabled={requestAction === 'reject' && !adminNotes.trim()}
                        className={`flex-1 ${
                          requestAction === 'approve'
                            ? 'btn-primary'
                            : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50'
                        }`}
                      >
                        {requestAction === 'approve' ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Request
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Reject Request
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setRequestAction(null)
                          setAdminNotes('')
                        }}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveRequest(selectedRequest!)}
                        className="flex-1 btn-primary"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(selectedRequest!)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setShowRequestModal(false)
                          setSelectedRequest(null)
                        }}
                        className="flex-1 btn-secondary"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
