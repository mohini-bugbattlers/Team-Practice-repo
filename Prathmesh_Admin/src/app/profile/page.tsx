"use client";

import API_CONFIG from "../../services/config";
import AuthService from "../../services/auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, Eye, EyeOff } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

interface SettingsData {
  notifications_email: boolean;
  notifications_sms: boolean;
  notifications_push: boolean;
  theme: string;
  language: string;
  timezone: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await AuthService.get("/profile");
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await AuthService.get("/settings");
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await AuthService.put("/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
      } else {
        alert("Failed to update profile: " + response.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await AuthService.put("/settings", settings);

      if (response.success) {
        setSettings(response.data);
      } else {
        alert("Failed to update settings: " + response.message);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }

    setSaving(true);
    try {
      const response = await AuthService.put("/profile/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        alert("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPassword(false);
      } else {
        alert("Failed to change password: " + response.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-dark-900 mb-2">
            Profile & Settings
          </h1>
          <p className="text-dark-600">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Settings
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Profile Information */}
              <div className="card">
                {profile ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-dark-900">
                          {profile.name}
                        </h3>
                        <p className="text-dark-600 capitalize">
                          {profile.role.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            className="input-field"
                            placeholder="Enter your name"
                          />
                        ) : (
                          <p className="text-dark-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {profile.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                              setProfile({ ...profile, email: e.target.value })
                            }
                            className="input-field"
                            placeholder="Enter your email"
                          />
                        ) : (
                          <p className="text-dark-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {profile.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profile.phone || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            className="input-field"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <p className="text-dark-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {profile.phone || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-700 mb-2">
                          Role
                        </label>
                        <p className="text-dark-900 bg-gray-50 px-3 py-2 rounded-lg capitalize">
                          {profile.role.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleProfileUpdate}
                            disabled={saving}
                            className="btn-primary"
                          >
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn-primary"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-dark-500">Failed to load profile data</p>
                    <button onClick={fetchProfile} className="btn-primary mt-2">
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {/* Password Change */}
              <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="input-field pr-10"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="input-field pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-dark-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Notification Settings */}
              <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4">
                  Notification Preferences
                </h3>
                {settings ? (
                  <div className="space-y-4">
                    {Object.entries(settings).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <label className="text-sm font-medium text-dark-700">
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </label>
                          <p className="text-xs text-dark-500">
                            Receive notifications for this type
                          </p>
                        </div>
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? "bg-primary-600" : "bg-gray-200"
                          }`}
                          onClick={() => {
                            if (settings) {
                              setSettings({
                                ...settings,
                                [key]: !value,
                              });
                            }
                          }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-dark-500">Failed to load settings</p>
                    <button
                      onClick={fetchSettings}
                      className="btn-primary mt-2"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSettingsUpdate}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
