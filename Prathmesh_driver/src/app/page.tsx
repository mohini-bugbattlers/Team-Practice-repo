'use client';

import { useState } from 'react';
import { FiHome, FiTruck, FiMap, FiDollarSign, FiUser, FiLogOut, FiMenu, FiX, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Mock data - replace with actual API calls
const upcomingTrips = [
  { id: 1, from: 'Mumbai', to: 'Pune', date: '2023-06-15', status: 'Scheduled' },
  { id: 2, from: 'Pune', to: 'Nashik', date: '2023-06-20', status: 'Pending' },
];

const recentTrips = [
  { id: 3, from: 'Nashik', to: 'Mumbai', date: '2023-06-10', status: 'Completed' },
  { id: 4, from: 'Mumbai', to: 'Goa', date: '2023-06-05', status: 'Completed' },
];

const driverStats = {
  totalTrips: 24,
  completedTrips: 22,
  pendingTrips: 2,
  totalEarnings: '₹1,24,500',
  rating: '4.8',
};

const DriverDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const NavItem = ({ href, icon: Icon, label, active = false }) => (
    <Link href={href} className={`flex items-center p-3 rounded-lg ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </Link>
  );

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const TripCard = ({ trip, isUpcoming = false }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{trip.from} → {trip.to}</h4>
          <p className="text-sm text-gray-500 mt-1">Date: {trip.date}</p>
          <div className="flex items-center mt-2">
            {trip.status === 'Completed' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FiCheckCircle className="mr-1" /> Completed
              </span>
            ) : trip.status === 'Scheduled' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <FiClock className="mr-1" /> Scheduled
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <FiAlertTriangle className="mr-1" /> Pending
              </span>
            )}
          </div>
        </div>
        {isUpcoming && (
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Details
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out z-30 w-64 bg-white border-r border-gray-200 overflow-y-auto`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Driver Portal</h1>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">John Driver</p>
              <p className="text-xs text-gray-500">License: MH01 20180012345</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <NavItem href="/driver" icon={FiHome} label="Dashboard" active={pathname === '/driver'} />
            <NavItem href="/driver/trips" icon={FiTruck} label="My Trips" active={pathname === '/driver/trips'} />
            <NavItem href="/driver/live-tracking" icon={FiMap} label="Live Tracking" active={pathname === '/driver/live-tracking'} />
            <NavItem href="/driver/earnings" icon={FiDollarSign} label="Earnings" active={pathname === '/driver/earnings'} />
            <NavItem href="/driver/profile" icon={FiUser} label="Profile" active={pathname === '/driver/profile'} />
            <button className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <FiLogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-2"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Driver Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <div className="relative">
                  <FiMap className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  JD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Trips" 
              value={driverStats.totalTrips} 
              icon={FiTruck} 
              color="blue" 
            />
            <StatCard 
              title="Completed" 
              value={driverStats.completedTrips} 
              icon={FiCheckCircle} 
              color="green" 
            />
            <StatCard 
              title="Pending" 
              value={driverStats.pendingTrips} 
              icon={FiClock} 
              color="yellow" 
            />
            <StatCard 
              title="Total Earnings" 
              value={driverStats.totalEarnings} 
              icon={FiDollarSign} 
              color="purple" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Trips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Trips</h2>
                <Link href="/driver/trips" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
              </div>
              {upcomingTrips.length > 0 ? (
                <div>
                  {upcomingTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} isUpcoming={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No upcoming trips scheduled</p>
                </div>
              )}
            </div>

            {/* Recent Trips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Trips</h2>
                <Link href="/driver/trips" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
              </div>
              {recentTrips.length > 0 ? (
                <div>
                  {recentTrips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent trips found</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiMap className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Start Trip</span>
              </button>
              <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Mark Complete</span>
              </button>
              <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiAlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Report Issue</span>
              </button>
              <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">View Earnings</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Prathmesh Roadlines. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DriverDashboard;
