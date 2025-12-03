"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Truck,
  Users,
  UserCheck,
  FileText,
  CreditCard,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Vehicle Owners", href: "/vehicle-owners", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Managers", href: "/managers", icon: UserCheck },
  { name: "Trips", href: "/trips", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-100 shadow-soft">
        <div className="flex items-center flex-shrink-0 px-6 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-medium">
            <span className="text-sm font-bold text-white">PR</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-800">Admin Panel</h2>
            <p className="text-xs text-dark-500">Prathmesh Roadlines</p>
          </div>
        </div>
        <div className="mt-2 flex-grow flex flex-col">
          <nav className="flex-1 px-3 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-link group ${isActive ? "active" : ""}`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-dark-600 group-hover:text-primary-600"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-100">
          <button className="sidebar-link w-full text-left group">
            <LogOut className="mr-3 h-5 w-5 text-dark-600 group-hover:text-red-500 transition-colors duration-200" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
