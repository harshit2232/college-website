import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import TimelineTracker from '../../components/TimelineTracker';
import {
  FileText,
  Clock,
  Award,
  CreditCard,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, studentProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationApi.getMyApplications();
        if (data.success) {
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error('Error fetching student applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'Approved');
  const pendingApps = applications.filter((a) =>
    ['Submitted', 'Under Review', 'Verified'].includes(a.status)
  );
  const draftApps = applications.filter((a) => a.status === 'Draft');

  const completionPercent = studentProfile?.profileCompletion || 60;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Applicant Dashboard • Academic Session 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
            Welcome back, {user?.name || 'Applicant'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your university application status, review committee evaluations, manage credentials, and download admission letters.
          </p>
        </div>

        <Link
          to="/programs"
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/30 transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply to New Program</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Applications</span>
            <p className="text-2xl font-extrabold text-slate-900">{totalApps}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">In Committee Review</span>
            <p className="text-2xl font-extrabold text-amber-600">{pendingApps.length}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Offers of Admission</span>
            <p className="text-2xl font-extrabold text-emerald-600">{approvedApps.length}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Profile Completion</span>
            <p className="text-2xl font-extrabold text-slate-900">{completionPercent}%</p>
          </div>
        </div>
      </div>

      {/* Profile Completion Callout if not 100 */}
      {completionPercent < 100 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Your applicant profile is {completionPercent}% complete
              </p>
              <p className="text-[11px] text-amber-700">
                Complete your academic history and contact details for faster document verification.
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm shrink-0"
          >
            Update Profile Now
          </Link>
        </div>
      )}

      {/* Active Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">My University Applications</h2>
          <Link
            to="/student/applications"
            className="text-xs font-semibold text-brand-600 hover:text-brand-800"
          >
            View Full List
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Applications Submitted Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select an undergraduate or graduate degree program from our catalog and begin your application.
            </p>
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
            >
              <span>Explore Programs & Apply</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {app.applicationNumber}
                      </span>
                      <StatusBadge status={app.status} />
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {app.intakeTerm || 'Fall 2026'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {app.program?.name || 'Academic Degree Program'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'Draft' ? (
                      <Link
                        to={`/student/apply?appId=${app._id}`}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                      >
                        <span>Resume Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        to={`/student/applications/${app._id}`}
                        className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                      >
                        <span>View Status & Documents</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="pt-2 border-t border-slate-100">
                  <TimelineTracker
                    currentStatus={app.status}
                    submissionDate={app.submittedAt}
                    decisionDate={app.decisionDate}
                  />
                </div>

                {/* Offer Letter Callout if Approved */}
                {app.status === 'Approved' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Congratulations! You have been granted admission to this program.
                    </span>
                    <Link
                      to={`/student/applications/${app._id}`}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      View Admission Letter →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
