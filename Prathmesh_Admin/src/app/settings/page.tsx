"use client";

import API_CONFIG from "../../services/config";
import { useState } from "react";
import {
  Save,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      tripUpdates: true,
      systemAlerts: true,
      marketingEmails: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAlerts: true,
    },
    system: {
      timezone: "Asia/Kolkata",
      language: "en",
      dateFormat: "DD/MM/YYYY",
      currency: "INR",
    },
    appearance: {
      theme: "light",
      sidebarCollapsed: false,
      compactMode: false,
      animations: true,
    },
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 mb-2">
          System Settings
        </h1>
        <p className="text-dark-600">
          Configure system preferences and user settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-dark-700">
                  Email Notifications
                </label>
                <p className="text-xs text-dark-500">
                  Receive notifications via email
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.emailNotifications
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      emailNotifications:
                        !settings.notifications.emailNotifications,
                    },
                  })
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.emailNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-dark-700">
                  SMS Notifications
                </label>
                <p className="text-xs text-dark-500">
                  Receive notifications via SMS
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.smsNotifications
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      smsNotifications:
                        !settings.notifications.smsNotifications,
                    },
                  })
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.smsNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-dark-700">
                  Trip Updates
                </label>
                <p className="text-xs text-dark-500">
                  Get notified about trip status changes
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.tripUpdates
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      tripUpdates: !settings.notifications.tripUpdates,
                    },
                  })
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.tripUpdates
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary-600" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900">
              Security Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-dark-700">
                  Two-Factor Authentication
                </label>
                <p className="text-xs text-dark-500">
                  Add an extra layer of security
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.security.twoFactorAuth
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      twoFactorAuth: !settings.security.twoFactorAuth,
                    },
                  })
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.security.twoFactorAuth
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      sessionTimeout: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-dark-700">
                  Login Alerts
                </label>
                <p className="text-xs text-dark-500">
                  Get notified of new logins
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.security.loginAlerts
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      loginAlerts: !settings.security.loginAlerts,
                    },
                  })
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.security.loginAlerts
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900">
              System Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.system.timezone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    system: {
                      ...settings.system,
                      timezone: e.target.value,
                    },
                  })
                }
                className="input-field"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Language
              </label>
              <select
                value={settings.system.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    system: {
                      ...settings.system,
                      language: e.target.value,
                    },
                  })
                }
                className="input-field"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Date Format
              </label>
              <select
                value={settings.system.dateFormat}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    system: {
                      ...settings.system,
                      dateFormat: e.target.value,
                    },
                  })
                }
                className="input-field"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Currency
              </label>
              <select
                value={settings.system.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    system: {
                      ...settings.system,
                      currency: e.target.value,
                    },
                  })
                }
                className="input-field"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900">Appearance</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Theme
              </label>
              <select
                value={settings.appearance.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    appearance: {
                      ...settings.appearance,
                      theme: e.target.value,
                    },
                  })
                }
                className="input-field"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-dark-700">
                  Animations
                </label>
                <p className="text-xs text-dark-500">
                  Enable smooth transitions
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.appearance.animations
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    appearance: {
                      ...settings.appearance,
                      animations: !settings.appearance.animations,
                    },
                  })
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.appearance.animations
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-dark-700">
                  Compact Mode
                </label>
                <p className="text-xs text-dark-500">
                  Reduce spacing for more content
                </p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.appearance.compactMode
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                onClick={() =>
                  setSettings({
                    ...settings,
                    appearance: {
                      ...settings.appearance,
                      compactMode: !settings.appearance.compactMode,
                    },
                  })
                }
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.appearance.compactMode
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
