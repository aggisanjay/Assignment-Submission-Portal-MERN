import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = {
  student: [
    { path: '/student', label: 'Dashboard', icon: '🏠' },
    { path: '/my-submissions', label: 'My Submissions', icon: '📬' },
  ],
  teacher: [
    { path: '/teacher', label: 'Dashboard', icon: '🏠' },
  ],
  admin: [
    { path: '/admin', label: 'Admin Panel', icon: '⚙️' },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const links = navItems[user?.role] || [];
  const roleColors = { student: 'indigo', teacher: 'emerald', admin: 'rose' };
  const color = roleColors[user?.role] || 'indigo';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${color}-600 flex items-center justify-center text-xl`}>📚</div>
            <div>
              <p className="font-bold text-white">AssignPortal</p>
              <p className={`text-xs text-${color}-400 capitalize`}>{user?.role}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full bg-${color}-800 flex items-center justify-center font-bold text-sm`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium
                ${location.pathname === path
                  ? `bg-${color}-600/20 text-${color}-400 border border-${color}-600/30`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur border-b border-gray-800 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ☰
          </button>
          <h1 className="text-lg font-semibold text-white">Assignment Submission Portal</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}