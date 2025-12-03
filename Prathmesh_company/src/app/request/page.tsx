"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  Fuel,
  Gauge,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";

interface TransportRequestForm {
  materialType: string;
  quantity: number;
  quantityUnit: 'liters' | 'tons' | 'barrels';
  pickupLocation: string;
  dropLocation: string;
  preferredDate: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  specialInstructions: string;
  contactPerson: string;
  contactPhone: string;
  estimatedBudget: number;
  vehicleType: string;
  temperatureControl: boolean;
  hazardousMaterial: boolean;
  insuranceRequired: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const materialTypes = [
  "Crude Oil",
  "Diesel",
  "Petrol",
  "Kerosene",
  "Lubricants",
  "Chemical Waste",
  "Industrial Oil",
  "Biofuel",
  "Other"
];

const vehicleTypes = [
  "Tanker Truck",
  "Container Truck",
  "Refrigerated Truck",
  "Hazardous Material Truck",
  "Standard Truck"
];

const urgencyOptions = [
  { value: 'low', label: 'Low (7-10 days)', color: 'text-green-600' },
  { value: 'medium', label: 'Medium (3-5 days)', color: 'text-yellow-600' },
  { value: 'high', label: 'High (1-2 days)', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent (Same day)', color: 'text-red-600' },
];

export default function NewRequestPage() {
  const [formData, setFormData] = useState<TransportRequestForm>({
    materialType: '',
    quantity: 0,
    quantityUnit: 'liters',
    pickupLocation: '',
    dropLocation: '',
    preferredDate: '',
    urgency: 'medium',
    specialInstructions: '',
    contactPerson: '',
    contactPhone: '',
    estimatedBudget: 0,
    vehicleType: '',
    temperatureControl: false,
    hazardousMaterial: false,
    insuranceRequired: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  useEffect(() => {
    // Auto-calculate estimated cost when form data changes
    calculateEstimate();
  }, [formData.quantity, formData.quantityUnit, formData.urgency, formData.vehicleType, formData.temperatureControl, formData.hazardousMaterial]);

  const calculateEstimate = () => {
    if (!formData.quantity || !formData.quantityUnit) {
      setEstimatedCost(null);
      return;
    }

    let baseRate = 0;

    // Base rate per unit based on material type and quantity
    switch (formData.quantityUnit) {
      case 'liters':
        baseRate = formData.quantity > 10000 ? 2.5 : 3.0;
        break;
      case 'tons':
        baseRate = formData.quantity > 20 ? 150 : 180;
        break;
      case 'barrels':
        baseRate = formData.quantity > 100 ? 25 : 30;
        break;
    }

    // Urgency multiplier
    const urgencyMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.3,
      urgent: 1.8,
    };

    // Vehicle type multiplier
    const vehicleMultiplier = formData.vehicleType === 'Hazardous Material Truck' ? 1.5 :
                             formData.vehicleType === 'Refrigerated Truck' ? 1.3 : 1.0;

    // Special requirements multiplier
    const specialMultiplier = (formData.temperatureControl ? 1.2 : 1.0) *
                             (formData.hazardousMaterial ? 1.4 : 1.0) *
                             (formData.insuranceRequired ? 1.1 : 1.0);

    const estimated = Math.round(formData.quantity * baseRate * urgencyMultiplier[formData.urgency] * vehicleMultiplier * specialMultiplier);
    setEstimatedCost(estimated);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.materialType) newErrors.materialType = 'Material type is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.dropLocation.trim()) newErrors.dropLocation = 'Drop location is required';
    if (!formData.preferredDate) newErrors.preferredDate = 'Preferred date is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';

    // Validate phone number format
    if (formData.contactPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    // Validate pickup and drop locations are different
    if (formData.pickupLocation.trim().toLowerCase() === formData.dropLocation.trim().toLowerCase()) {
      newErrors.dropLocation = 'Drop location must be different from pickup location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        estimatedCost: estimatedCost || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const response = await AuthService.post('/company/transport-requests', requestData);

      if (response.success) {
        setSubmitSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            materialType: '',
            quantity: 0,
            quantityUnit: 'liters',
            pickupLocation: '',
            dropLocation: '',
            preferredDate: '',
            urgency: 'medium',
            specialInstructions: '',
            contactPerson: '',
            contactPhone: '',
            estimatedBudget: 0,
            vehicleType: '',
            temperatureControl: false,
            hazardousMaterial: false,
            insuranceRequired: false,
          });
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrors({ submit: 'Failed to submit request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TransportRequestForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitSuccess) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-[60vh]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center p-8 bg-white rounded-xl shadow-large max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-dark-800 mb-2">Request Submitted!</h2>
          <p className="text-dark-600 mb-4">
            Your transport request has been successfully submitted. Our team will review it and get back to you shortly.
          </p>
          <div className="flex items-center justify-center text-sm text-dark-500">
            <Clock className="w-4 h-4 mr-1" />
            Expected response within 24 hours
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-dark-800 mb-2">New Transport Request</h1>
        <p className="text-dark-600">Submit a request for oil and chemical transportation services</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Material Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                  <Fuel className="w-5 h-5 mr-2 text-primary-500" />
                  Material Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Material Type *
                    </label>
                    <select
                      value={formData.materialType}
                      onChange={(e) => handleInputChange('materialType', e.target.value)}
                      className={`input-field ${errors.materialType ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select material type</option>
                      {materialTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.materialType && <p className="text-red-500 text-xs mt-1">{errors.materialType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity || ''}
                      onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                      className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="Enter quantity"
                      min="0"
                      step="0.01"
                    />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.quantityUnit}
                      onChange={(e) => handleInputChange('quantityUnit', e.target.value)}
                      className="input-field"
                    >
                      <option value="liters">Liters</option>
                      <option value="tons">Tons</option>
                      <option value="barrels">Barrels</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-secondary-500" />
                  Location Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      className={`input-field ${errors.pickupLocation ? 'border-red-500' : ''}`}
                      placeholder="Enter pickup address or location name"
                    />
                    {errors.pickupLocation && <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Drop Location *
                    </label>
                    <input
                      type="text"
                      value={formData.dropLocation}
                      onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                      className={`input-field ${errors.dropLocation ? 'border-red-500' : ''}`}
                      placeholder="Enter drop address or location name"
                    />
                    {errors.dropLocation && <p className="text-red-500 text-xs mt-1">{errors.dropLocation}</p>}
                  </div>
                </div>
              </div>

              {/* Schedule & Urgency */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-accent-500" />
                  Schedule & Urgency
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Preferred Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      className={`input-field ${errors.preferredDate ? 'border-red-500' : ''}`}
                    />
                    {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="input-field"
                    >
                      {urgencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicle Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-primary-500" />
                  Vehicle Requirements
                </h3>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className={`input-field ${errors.vehicleType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.temperatureControl}
                      onChange={(e) => handleInputChange('temperatureControl', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">Temperature Control</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hazardousMaterial}
                      onChange={(e) => handleInputChange('hazardousMaterial', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">Hazardous Material</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.insuranceRequired}
                      onChange={(e) => handleInputChange('insuranceRequired', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">Insurance Required</span>
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-secondary-500" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      className={`input-field ${errors.contactPerson ? 'border-red-500' : ''}`}
                      placeholder="Enter contact person name"
                    />
                    {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className={`input-field ${errors.contactPhone ? 'border-red-500' : ''}`}
                      placeholder="Enter contact phone number"
                    />
                    {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-accent-500" />
                  Additional Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="Any special handling instructions, access restrictions, or additional requirements..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-dark-600">
                  {errors.submit && (
                    <p className="text-red-500 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.submit}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="btn-secondary"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Cost Estimation Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            className="card sticky top-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Cost Estimation
            </h3>

            {estimatedCost ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{estimatedCost.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700">Estimated Cost</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-600">Quantity:</span>
                    <span className="font-medium">{formData.quantity} {formData.quantityUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600">Material:</span>
                    <span className="font-medium">{formData.materialType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600">Urgency:</span>
                    <span className={`font-medium ${urgencyOptions.find(u => u.value === formData.urgency)?.color}`}>
                      {urgencyOptions.find(u => u.value === formData.urgency)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-600">Vehicle:</span>
                    <span className="font-medium">{formData.vehicleType}</span>
                  </div>
                  {formData.temperatureControl && (
                    <div className="flex justify-between">
                      <span className="text-dark-600">Temperature Control:</span>
                      <span className="font-medium text-blue-600">+20%</span>
                    </div>
                  )}
                  {formData.hazardousMaterial && (
                    <div className="flex justify-between">
                      <span className="text-dark-600">Hazardous Material:</span>
                      <span className="font-medium text-red-600">+40%</span>
                    </div>
                  )}
                  {formData.insuranceRequired && (
                    <div className="flex justify-between">
                      <span className="text-dark-600">Insurance:</span>
                      <span className="font-medium text-purple-600">+10%</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-dark-500">
                    * This is an estimate. Final cost may vary based on actual route, traffic conditions, and other factors.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-dark-500">
                <Gauge className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Fill in the form to see cost estimate</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
