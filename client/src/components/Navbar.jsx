import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/endpoints';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  FileText,
  ShieldAlert,
  Users,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isFaculty, isStudent } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationApi.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // poll every 20s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationApi.markAsRead(notif._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setShowNotifications(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (e) {}
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight font-serif">
              IEM <span className="text-brand-600">COLLEGE</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-0.5">
              Institute of Engineering & Management
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
              isActive('/') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/programs"
            className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
              isActive('/programs') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
            }`}
          >
            Academic Programs
          </Link>

          {/* Role specific quick tabs */}
          {isAuthenticated && isStudent && (
            <>
              <Link
                to="/student/dashboard"
                className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
                  isActive('/student/dashboard') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
                }`}
              >
                My Dashboard
              </Link>
              <Link
                to="/student/applications"
                className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
                  isActive('/student/applications') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
                }`}
              >
                Applications
              </Link>
            </>
          )}

          {isAuthenticated && isFaculty && (
            <>
              <Link
                to="/faculty/queue"
                className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
                  isActive('/faculty/queue') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
                }`}
              >
                Evaluation Queue
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
                  isActive('/admin/dashboard') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
                }`}
              >
                Analytics
              </Link>
              <Link
                to="/admin/programs"
                className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
                  isActive('/admin/programs') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
                }`}
              >
                Manage Programs
              </Link>
              <Link
                to="/admin/applications"
                className={`px-3 py-1.5 rounded-lg transition hover:text-brand-600 hover:bg-slate-50 ${
                  isActive('/admin/applications') ? 'text-brand-600 font-semibold bg-brand-50/50' : ''
                }`}
              >
                All Applications
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Center */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-slide-up">
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 bg-brand-100 text-brand-700 font-bold rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          No new notifications right now
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-slate-50 transition cursor-pointer text-xs ${
                              !n.isRead ? 'bg-indigo-50/40 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-800">{n.title}</span>
                              <span className="text-slate-400 text-[10px]">
                                {new Date(n.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-slate-800 block leading-none">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider block mt-0.5 ${
                        user?.role === 'admin'
                          ? 'text-rose-600'
                          : user?.role === 'faculty'
                          ? 'text-indigo-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-slide-up text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    {isStudent && (
                      <>
                        <Link
                          to="/student/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400" /> Student Dashboard
                        </Link>
                        <Link
                          to="/student/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                        >
                          <User className="w-4 h-4 text-slate-400" /> My Profile
                        </Link>
                      </>
                    )}

                    {isFaculty && (
                      <Link
                        to="/faculty/queue"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                      >
                        <FileText className="w-4 h-4 text-slate-400" /> Evaluation Queue
                      </Link>
                    )}

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                        >
                          <BarChart3 className="w-4 h-4 text-slate-400" /> Admin Console
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
                        >
                          <Users className="w-4 h-4 text-slate-400" /> Manage Users
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/25 transition"
              >
                Apply for Admission
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
