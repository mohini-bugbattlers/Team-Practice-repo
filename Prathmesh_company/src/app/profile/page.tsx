"use client";

import { useState, useEffect } from "react";
import {
  User,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  companyId?: number;
  created_at: string;
}

interface CompanyProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_number: string;
  gst_number: string;
}

export default function CompanyProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const currentUser = AuthService.getUser();
    const token = AuthService.getToken();

    if (!currentUser || !token) {
      router.push('/auth/login');
      return;
    }

    if (currentUser.role !== 'company') {
      router.push('/auth/login');
      return;
    }

    setIsAuthenticated(true);
    setUser(currentUser);
    setProfileForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
    });
    fetchCompanyProfile(currentUser.companyId);
  };

  const fetchCompanyProfile = async (companyId?: number) => {
    if (!companyId) return;

    try {
      // For now, use mock data
      const mockCompany: CompanyProfile = {
        id: companyId,
        name: "Oil Transport Corp",
        email: "contact@oiltransport.com",
        phone: "+91-9876543210",
        address: "123 Transport Nagar, Mumbai, Maharashtra - 400001",
        registration_number: "OTC2024001",
        gst_number: "22AAAAA0000A1Z5",
      };
      setCompany(mockCompany);
    } catch (error) {
      console.error("Error fetching company profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      // In a real implementation, this would make an API call
      // await AuthService.put('/user/profile', profileForm);

      setUser(prev => prev ? { ...prev, ...profileForm } : null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);

      // Update localStorage
      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      // In a real implementation, this would make an API call
      // await AuthService.put('/user/password', {
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword,
      // });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-800">Profile Settings</h1>
          <p className="text-dark-600 mt-1">Manage your account information and security</p>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-secondary-50 border border-secondary-200 text-secondary-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-secondary-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className="font-medium">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-dark-400 hover:text-dark-600"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information Card */}
        <motion.div
          className="lg:col-span-2 card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-dark-800 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-500" />
              Account Information
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setProfileForm({
                      name: user?.name || '',
                      phone: user?.phone || '',
                    });
                  }}
                  className="btn-secondary flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <div className="input-field bg-gray-50 cursor-not-allowed">
                    {user?.name || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Email Address
                </label>
                <div className="input-field bg-gray-50 cursor-not-allowed flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  {user?.email || 'Not provided'}
                </div>
                <p className="text-xs text-dark-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="input-field bg-gray-50 cursor-not-allowed flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    {user?.phone || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Account Role
                </label>
                <div className="input-field bg-gray-50 cursor-not-allowed flex items-center">
                  <Shield className="h-4 w-4 text-gray-400 mr-2" />
                  {user?.role?.replace('_', ' ').toUpperCase() || 'Not provided'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Account Status
              </label>
              <div className="input-field bg-gray-50 cursor-not-allowed flex items-center">
                <CheckCircle className="h-4 w-4 text-secondary-400 mr-2" />
                {user?.status?.toUpperCase() || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Member Since
              </label>
              <div className="input-field bg-gray-50 cursor-not-allowed flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not provided'}
              </div>
            </div>
          </form>
        </motion.div>

        {/* Company Information Card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-dark-800 mb-6 flex items-center">
            <Building className="h-5 w-5 mr-2 text-secondary-500" />
            Company Details
          </h3>

          {company ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Company Name</label>
                <div className="input-field bg-gray-50 cursor-not-allowed flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  {company.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Registration Number</label>
                <div className="input-field bg-gray-50 cursor-not-allowed">
                  {company.registration_number}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">GST Number</label>
                <div className="input-field bg-gray-50 cursor-not-allowed">
                  {company.gst_number}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Company Address</label>
                <div className="input-field bg-gray-50 cursor-not-allowed flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-sm">{company.address}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-dark-500">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>Company information not available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Security Settings */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-dark-800 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-red-500" />
            Security Settings
          </h3>
          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="btn-secondary flex items-center"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </button>
          ) : (
            <button
              onClick={() => {
                setIsChangingPassword(false);
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                setMessage(null);
              }}
              className="btn-secondary flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          )}
        </div>

        <AnimatePresence>
          {isChangingPassword && (
            <motion.form
              onSubmit={handlePasswordChange}
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setMessage(null);
                  }}
                  className="btn-secondary flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {!isChangingPassword && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-dark-800 mb-2">Password Security Tips</h4>
            <ul className="text-sm text-dark-600 space-y-1">
              <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
              <li>• Avoid using common words or personal information</li>
              <li>• Use different passwords for different accounts</li>
              <li>• Consider using a password manager for better security</li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}
