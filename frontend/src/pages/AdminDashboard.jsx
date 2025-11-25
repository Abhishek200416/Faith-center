import { useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { LayoutDashboard, Calendar, Users, Megaphone, Mail, UserCircle, Settings, LogOut, DollarSign, Video, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

import DashboardHome from "./admin/DashboardHome";
import EventsManager from "./admin/EventsManager";
import MinistriesManager from "./admin/MinistriesManager";
import AnnouncementsManager from "./admin/AnnouncementsManager";
import VolunteersManager from "./admin/VolunteersManager";
import BrandsManager from "./admin/BrandsManager";
import MembersManager from "./admin/MembersManager";
import LiveStreamManager from "./admin/LiveStreamManager";
import AttendeesManager from "./admin/AttendeesManager";
import BlogsManager from "./admin/BlogsManagerEnhanced";

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/brands", icon: Settings, label: "Brands" },
    { path: "/admin/members", icon: UserCircle, label: "Members" },
    { path: "/admin/events", icon: Calendar, label: "Events" },
    { path: "/admin/attendees", icon: Users, label: "Attendees" },
    { path: "/admin/ministries", icon: Users, label: "Ministries" },
    { path: "/admin/blogs", icon: BookOpen, label: "Blogs" },
    { path: "/admin/live-streams", icon: Video, label: "Live Streams" },
    { path: "/admin/announcements", icon: Megaphone, label: "Announcements" },
    { path: "/admin/volunteers", icon: Mail, label: "Volunteers" },
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
          <Route path="brands" element={<BrandsManager />} />
          <Route path="members" element={<MembersManager />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="attendees" element={<AttendeesManager />} />
          <Route path="ministries" element={<MinistriesManager />} />
          <Route path="blogs" element={<BlogsManager />} />
          <Route path="live-streams" element={<LiveStreamManager />} />
          <Route path="announcements" element={<AnnouncementsManager />} />
          <Route path="volunteers" element={<VolunteersManager />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
