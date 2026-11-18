import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const loggedUser = await login(email, password);

      // Redirect based on previous location or role
      const redirectPath =
        location.state?.redirectTo ||
        (location.state?.from
          ? (location.state.from.pathname || '/') + (location.state.from.search || '')
          : null);

      if (redirectPath) {
        navigate(redirectPath);
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'faculty') {
        navigate('/faculty/queue');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-700 to-indigo-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            Admissions Portal Sign In
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your university application, review committee queue, or admin dashboard.
          </p>
        </div>

        {/* Quick Demo Switcher - 1 Click Login */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            ⚡ 1-Click Quick Demo Switcher
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('rajh36073@gmail.com', 'harshit@500')}
              className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold text-center transition flex flex-col items-center gap-0.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Admin</span>
              <span className="text-[9px] font-normal text-rose-600 opacity-80">Default</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('faculty@iem.edu.in', 'faculty@500')}
              className="p-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold text-center transition flex flex-col items-center gap-0.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Faculty</span>
              <span className="text-[9px] font-normal text-indigo-600 opacity-80">CS Review</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('student@iem.edu.in', 'student@500')}
              className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold text-center transition flex flex-col items-center gap-0.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student</span>
              <span className="text-[9px] font-normal text-emerald-600 opacity-80">Applicant</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an applicant account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
