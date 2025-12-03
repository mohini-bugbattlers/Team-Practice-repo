"use client";

import API_CONFIG from "../../services/config";
import { useState, useEffect } from "react";
import { Save, Bell, Palette } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthService from "../../services/auth";

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
    appearance: {
      theme: "light",
      animations: true,
    },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await AuthService.get("/settings");
      if (response.success) {
        // Transform backend response to match frontend structure
        const backendSettings = response.data;
        setSettings({
          notifications: {
            emailNotifications: backendSettings.notifications_email || true,
            smsNotifications: backendSettings.notifications_sms || false,
            pushNotifications: backendSettings.notifications_push || true,
            tripUpdates: true,
            systemAlerts: true,
            marketingEmails: false,
          },
          appearance: {
            theme: backendSettings.theme || "light",
            animations: true,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Transform frontend settings to backend format
      const backendData = {
        notifications_email: settings.notifications.emailNotifications,
        notifications_sms: settings.notifications.smsNotifications,
        notifications_push: settings.notifications.pushNotifications,
        theme: settings.appearance.theme,
      };

      const response = await AuthService.put("/settings", backendData);

      if (response.success) {
        toast.success("Settings saved successfully!");
        // Apply theme immediately
        if (settings.appearance.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        throw new Error(response.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark-900 mb-2">
                Settings
              </h1>
              <p className="text-dark-600">Configure your preferences</p>
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

              {/* Appearance Settings */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-accent-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-900">
                    Appearance
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.appearance.theme}
                      onChange={(e) => {
                        const newTheme = e.target.value;
                        setSettings({
                          ...settings,
                          appearance: {
                            ...settings.appearance,
                            theme: newTheme,
                          },
                        });

                        // Apply theme immediately
                        if (newTheme === "dark") {
                          document.documentElement.classList.add("dark");
                          document.body.classList.add("dark");
                        } else if (newTheme === "light") {
                          document.documentElement.classList.remove("dark");
                          document.body.classList.remove("dark");
                        } else {
                          // System preference
                          const prefersDark = window.matchMedia(
                            "(prefers-color-scheme: dark)"
                          ).matches;
                          if (prefersDark) {
                            document.documentElement.classList.add("dark");
                            document.body.classList.add("dark");
                          } else {
                            document.documentElement.classList.remove("dark");
                            document.body.classList.remove("dark");
                          }
                        }
                      }}
                      className="input-field"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-700">
                        Animations
                      </label>
                      <p className="text-xs text-dark-500">
                        Enable interface animations
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
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
