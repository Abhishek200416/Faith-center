import { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Calendar, Users, Megaphone, UserCheck } from "lucide-react";

const DashboardHome = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    ministries: 0,
    announcements: 0,
    attendees: 0,
    subscribers: 0,
  });

  useEffect(() => {
    if (currentBrand && authToken) {
      loadStats();
    }
  }, [currentBrand, authToken]);

  const loadStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const [events, ministries, announcements, attendees, subscribers] = await Promise.all([
        axios.get(`${API}/events?brand_id=${currentBrand.id}`, config),
        axios.get(`${API}/ministries?brand_id=${currentBrand.id}`, config),
        axios.get(`${API}/announcements?brand_id=${currentBrand.id}`, config),
        axios.get(`${API}/attendees?brand_id=${currentBrand.id}`, config),
        axios.get(`${API}/subscribers?brand_id=${currentBrand.id}`, config),
      ]);

      setStats({
        events: events.data.length,
        ministries: ministries.data.length,
        announcements: announcements.data.length,
        attendees: attendees.data.length,
        subscribers: subscribers.data.length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" data-testid="dashboard-title">Dashboard Overview</h1>
      
      {currentBrand && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Current Brand: {currentBrand.name}</h2>
          <p className="text-gray-600">{currentBrand.domain}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow" data-testid="stat-events">
          <div className="flex items-center justify-between mb-4">
            <Calendar size={32} className="text-blue-600" />
            <span className="text-3xl font-bold">{stats.events}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Events</h3>
        </div>

        <div className="bg-white rounded-lg p-6 shadow" data-testid="stat-ministries">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} className="text-green-600" />
            <span className="text-3xl font-bold">{stats.ministries}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Ministries</h3>
        </div>

        <div className="bg-white rounded-lg p-6 shadow" data-testid="stat-announcements">
          <div className="flex items-center justify-between mb-4">
            <Megaphone size={32} className="text-purple-600" />
            <span className="text-3xl font-bold">{stats.announcements}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Announcements</h3>
        </div>

        <div className="bg-white rounded-lg p-6 shadow" data-testid="stat-attendees">
          <div className="flex items-center justify-between mb-4">
            <UserCheck size={32} className="text-orange-600" />
            <span className="text-3xl font-bold">{stats.attendees}</span>
          </div>
          <h3 className="text-gray-600 font-medium">Event Registrations</h3>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <p className="text-gray-600 mb-4">Use the sidebar to manage your content:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Create and manage events for your community</li>
          <li>Add or update ministry teams and descriptions</li>
          <li>Post announcements and mark urgent items</li>
          <li>Review and respond to volunteer applications</li>
          <li>Manage brand settings and appearance</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardHome;
