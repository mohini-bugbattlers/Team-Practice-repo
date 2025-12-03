'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const VehicleOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState([
    { id: 1, name: 'Truck 1', status: 'Available', type: 'Oil Tanker', capacity: '10,000 L' },
    { id: 2, name: 'Truck 2', status: 'On Trip', type: 'Oil Tanker', capacity: '12,000 L' },
  ]);
  const [drivers, setDrivers] = useState([
    { id: 1, name: 'John Doe', status: 'Available', contact: '+1234567890' },
    { id: 2, name: 'Jane Smith', status: 'On Trip', contact: '+1987654321' },
  ]);
  const [quotations, setQuotations] = useState([
    { id: 1, trip: 'Oil Supply #1001', amount: '₹25,000', status: 'Pending', daysDelayed: 0 },
  ]);

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Total Vehicles</h3>
        <p className="text-3xl font-bold">{vehicles.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Active Drivers</h3>
        <p className="text-3xl font-bold">{drivers.filter(d => d.status === 'Available').length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Pending Quotations</h3>
        <p className="text-3xl font-bold">{quotations.filter(q => q.status === 'Pending').length}</p>
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Vehicles</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Vehicle</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">Vehicle Name</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Capacity</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t">
                <td className="px-6 py-4">{vehicle.name}</td>
                <td className="px-6 py-4">{vehicle.type}</td>
                <td className="px-6 py-4">{vehicle.capacity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-sm rounded-full ${vehicle.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuotations = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Quotations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left">Trip ID</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Days Delayed</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quote) => (
              <tr key={quote.id} className="border-t">
                <td className="px-6 py-4">{quote.trip}</td>
                <td className="px-6 py-4">{quote.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-sm rounded-full ${quote.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4">{quote.daysDelayed > 0 ? `${quote.daysDelayed} days` : 'On time'}</td>
                <td className="px-6 py-4">
                  {quote.status === 'Pending' && (
                    <>
                      <button className="text-green-600 hover:text-green-800 mr-3">Approve</button>
                      <button className="text-red-600 hover:text-red-800">Reject</button>
                    </>
                  )}
                  {quote.status === 'Approved' && (
                    <button className="text-blue-600 hover:text-blue-800">View Details</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Owner Portal</h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">Notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2">
                <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <span className="text-gray-700">Vehicle Owner</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'vehicles' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                My Vehicles
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'drivers' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Drivers
              </button>
              <button
                onClick={() => setActiveTab('quotations')}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'quotations' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Quotations
              </button>
              <button
                onClick={() => setActiveTab('trips')}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'trips' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Trip History
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <>
                <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                {renderDashboard()}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Recent Quotations</h3>
                    {quotations.length > 0 ? (
                      <div className="space-y-4">
                        {quotations.slice(0, 3).map((quote) => (
                          <div key={quote.id} className="border-b pb-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{quote.trip}</span>
                              <span className={`text-sm ${quote.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                                {quote.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Amount: {quote.amount} • {quote.daysDelayed > 0 ? `${quote.daysDelayed} days delayed` : 'On time'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No recent quotations</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'vehicles' && renderVehicles()}
            {activeTab === 'quotations' && renderQuotations()}
            
            {activeTab === 'drivers' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">My Drivers</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Driver</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-6 py-3 text-left">Driver Name</th>
                        <th className="px-6 py-3 text-left">Contact</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((driver) => (
                        <tr key={driver.id} className="border-t">
                          <td className="px-6 py-4">{driver.name}</td>
                          <td className="px-6 py-4">{driver.contact}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-sm rounded-full ${driver.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {driver.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-800">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'trips' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Trip History</h2>
                <div className="text-center py-8 text-gray-500">
                  <p>No trips completed yet.</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value="My Transport Company" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value="owner@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value="+1234567890" />
                  </div>
                  <div className="pt-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleOwnerDashboard;
