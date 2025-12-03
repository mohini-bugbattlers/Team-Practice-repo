"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Download,
  Upload,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MessageSquare,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthService from "@/services/auth";
import { useRouter } from "next/navigation";

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    trip_updates: boolean;
    payment_alerts: boolean;
    system_notifications: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    date_format: string;
    currency: string;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'company';
    data_sharing: boolean;
    analytics: boolean;
  };
}

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      trip_updates: true,
      payment_alerts: true,
      system_notifications: true,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata',
      date_format: 'DD/MM/YYYY',
      currency: 'INR',
    },
    privacy: {
      profile_visibility: 'company',
      data_sharing: false,
      analytics: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences' | 'privacy' | 'account'>('notifications');
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
    loadSettings();
  };

  const loadSettings = () => {
    // In a real implementation, this would fetch from API
    // For now, use default settings
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // In a real implementation, this would make an API call
      // await AuthService.put('/user/settings', settings);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Settings saved successfully!' });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // In a real implementation, this would generate and download user data
    alert('Data export functionality would be implemented here. This would generate a comprehensive report of all user data including trips, payments, and profile information.');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including trips, payments, and profile information.'
    );

    if (confirmed) {
      // In a real implementation, this would make an API call to delete the account
      alert('Account deletion would be processed here. In a real implementation, this would require additional verification steps.');
    }
  };

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePreferenceSetting = (key: keyof UserSettings['preferences'], value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
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
              <h1 className="text-3xl font-bold text-dark-800">Settings</h1>
              <p className="text-dark-600 mt-1">Customize your account preferences and privacy settings</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="btn-secondary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
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
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Tabs */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card">
                <nav className="space-y-1">
                  {[
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'preferences', label: 'Preferences', icon: Settings },
                    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
                    { id: 'account', label: 'Account', icon: Settings },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                          : 'text-dark-600 hover:bg-gray-100 hover:text-dark-800'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Settings Content */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              key={activeTab}
            >
              <div className="card">
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-dark-800 mb-2 flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-primary-500" />
                        Notification Preferences
                      </h3>
                      <p className="text-dark-600 text-sm">Choose how you want to receive notifications</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-dark-800">Email Notifications</p>
                            <p className="text-sm text-dark-600">Receive notifications via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.email}
                            onChange={(e) => updateNotificationSetting('email', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-dark-800">Push Notifications</p>
                            <p className="text-sm text-dark-600">Receive push notifications in browser</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.push}
                            onChange={(e) => updateNotificationSetting('push', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-dark-800">SMS Notifications</p>
                            <p className="text-sm text-dark-600">Receive important updates via SMS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.sms}
                            onChange={(e) => updateNotificationSetting('sms', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-dark-800 mb-4">Notification Types</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'trip_updates', label: 'Trip Updates', description: 'Status changes and driver assignments' },
                          { key: 'payment_alerts', label: 'Payment Alerts', description: 'Payment confirmations and due dates' },
                          { key: 'system_notifications', label: 'System Notifications', description: 'Account updates and maintenance alerts' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-dark-800">{item.label}</p>
                              <p className="text-sm text-dark-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications[item.key as keyof UserSettings['notifications']]}
                                onChange={(e) => updateNotificationSetting(item.key as keyof UserSettings['notifications'], e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-dark-800 mb-2 flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-secondary-500" />
                        Display & Language
                      </h3>
                      <p className="text-dark-600 text-sm">Customize how the application looks and feels</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={settings.preferences.theme}
                          onChange={(e) => updatePreferenceSetting('theme', e.target.value)}
                          className="input-field"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Language
                        </label>
                        <select
                          value={settings.preferences.language}
                          onChange={(e) => updatePreferenceSetting('language', e.target.value)}
                          className="input-field"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="mr">Marathi</option>
                          <option value="gu">Gujarati</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.preferences.timezone}
                          onChange={(e) => updatePreferenceSetting('timezone', e.target.value)}
                          className="input-field"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="Asia/Delhi">Asia/Delhi (IST)</option>
                          <option value="Asia/Mumbai">Asia/Mumbai (IST)</option>
                          <option value="Asia/Ahmedabad">Asia/Ahmedabad (IST)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Date Format
                        </label>
                        <select
                          value={settings.preferences.date_format}
                          onChange={(e) => updatePreferenceSetting('date_format', e.target.value)}
                          className="input-field"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.preferences.currency}
                          onChange={(e) => updatePreferenceSetting('currency', e.target.value)}
                          className="input-field"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-dark-800 mb-2 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-red-500" />
                        Privacy & Security
                      </h3>
                      <p className="text-dark-600 text-sm">Control your data and privacy settings</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={settings.privacy.profile_visibility}
                          onChange={(e) => updatePrivacySetting('profile_visibility', e.target.value)}
                          className="input-field"
                        >
                          <option value="public">Public - Visible to everyone</option>
                          <option value="company">Company Only - Visible to company members</option>
                          <option value="private">Private - Visible only to you</option>
                        </select>
                        <p className="text-xs text-dark-500 mt-1">
                          Controls who can see your profile information
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-dark-800">Data Sharing</p>
                          <p className="text-sm text-dark-600">Allow sharing of anonymized data for service improvement</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.data_sharing}
                            onChange={(e) => updatePrivacySetting('data_sharing', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-dark-800">Analytics</p>
                          <p className="text-sm text-dark-600">Help us improve by sharing usage analytics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.analytics}
                            onChange={(e) => updatePrivacySetting('analytics', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-dark-800 mb-2 flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-gray-500" />
                        Account Management
                      </h3>
                      <p className="text-dark-600 text-sm">Manage your account data and security</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-primary-600" />
                            <div>
                              <p className="font-medium text-dark-800">Export Your Data</p>
                              <p className="text-sm text-dark-600">Download all your account data including trips, payments, and profile</p>
                            </div>
                          </div>
                          <button
                            onClick={handleExportData}
                            className="btn-secondary flex items-center"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-medium text-dark-800">Delete Account</p>
                              <p className="text-sm text-dark-600">Permanently delete your account and all associated data</p>
                            </div>
                          </div>
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                        <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                          ⚠️ Warning: This action cannot be undone. All your data will be permanently removed.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
