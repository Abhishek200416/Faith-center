import { useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth, ADMIN_KEY_PATH } from "@/App";
import { LayoutDashboard, Calendar, Users, Megaphone, Mail, LogOut, Video, BookOpen, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

import DashboardHome from "./admin/DashboardHome";
import EventsManager from "./admin/EventsManagerEnhanced";
import MinistriesManager from "./admin/MinistriesManager";
import AnnouncementsManager from "./admin/AnnouncementsManager";
import LiveStreamManager from "./admin/LiveStreamManager";
import BlogManager from "./admin/BlogManager";
import CountdownManager from "./admin/CountdownManager";
import HeaderNavigationManager from "./admin/HeaderNavigationManagerEnhanced";

const AdminDashboard = ({ secureKey }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  
  // Use the key from props or get from URL params
  const params = useParams();
  const urlKey = secureKey || params.secureKey || ADMIN_KEY_PATH;
  const basePath = `/panel/${urlKey}`;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { path: `${basePath}/dashboard`, icon: LayoutDashboard, label: "Dashboard" },
    { path: `${basePath}/header-navigation`, icon: Navigation, label: "Header Navigation" },
    { path: `${basePath}/events`, icon: Calendar, label: "Events" },
    { path: `${basePath}/ministries`, icon: Users, label: "Ministries" },
    { path: `${basePath}/blogs`, icon: BookOpen, label: "Blogs" },
    { path: `${basePath}/countdowns`, icon: Clock, label: "Countdowns" },
    { path: `${basePath}/live-streams`, icon: Video, label: "Live Streams" },
    { path: `${basePath}/announcements`, icon: Megaphone, label: "Announcements" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="px-6 mb-8">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-gray-400 text-sm mt-1">{admin?.email}</p>
        </div>
        <nav className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive(item.path)
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
                data-testid={`admin-menu-${item.label.toLowerCase()}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 mt-auto absolute bottom-8 left-0 right-0">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors w-full"
            data-testid="admin-logout-btn"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content flex-1">
        <Routes>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="header-navigation" element={<HeaderNavigationManager />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="attendees" element={<AttendeesManager />} />
          <Route path="ministries" element={<MinistriesManager />} />
          <Route path="blogs" element={<BlogManager />} />
          <Route path="countdowns" element={<CountdownManager />} />
          <Route path="live-streams" element={<LiveStreamManager />} />
          <Route path="announcements" element={<AnnouncementsManager />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
