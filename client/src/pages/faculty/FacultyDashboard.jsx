import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyApi, programApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  Eye,
  Award,
  Users,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [onlyMyDept, setOnlyMyDept] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const [queueRes, progRes] = await Promise.all([
        facultyApi.getEvaluationQueue({
          status: statusFilter,
          program: programFilter,
          search,
          onlyMyDept: onlyMyDept.toString(),
        }),
        programApi.getPrograms(),
      ]);

      if (queueRes.success) {
        setApplications(queueRes.applications || []);
      }
      if (progRes.success) {
        setPrograms(progRes.programs || []);
      }
    } catch (err) {
      console.error('Error fetching evaluation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter, programFilter, onlyMyDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQueue();
  };

  const pendingReviewCount = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-navy-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Admissions Committee Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
            Faculty Evaluation Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Department: <strong className="text-white">{user?.department || 'University Admissions Committee'}</strong> • Review candidate qualifications, inspect transcripts, and submit scoring.
          </p>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-300">Pending Committee Action</span>
          <div className="text-2xl font-black text-amber-300 mt-0.5">{pendingReviewCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, application number, or program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Filter Status:</span>
            {['All', 'Submitted', 'Under Review', 'Verified', 'Approved', 'Waitlisted', 'Rejected'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition font-medium ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          {user?.department && (
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={onlyMyDept}
                onChange={(e) => setOnlyMyDept(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Only show {user.department}</span>
            </label>
          )}
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading evaluation queue...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Evaluation Queue Clear</h3>
          <p className="text-xs text-slate-500">
            No applications currently matching the selected criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px]">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Program & Dept</th>
                <th className="py-3 px-4">Docs Status</th>
                <th className="py-3 px-4">Evaluation Score</th>
                <th className="py-3 px-4">Admission Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => {
                const totalDocs = app.documents?.length || 0;
                const verifiedDocs = app.documents?.filter((d) => d.status === 'verified').length || 0;
                const evalScore = app.evaluation?.totalScore;

                return (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.student?.name}</div>
                      <div className="text-[10px] text-slate-500">{app.student?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{app.program?.name}</div>
                      <div className="text-[10px] text-slate-400">{app.program?.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">
                        {verifiedDocs} / {totalDocs} Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {evalScore ? (
                        <span className="font-bold text-brand-700">{evalScore} / 100</span>
                      ) : (
                        <span className="text-slate-400 italic">Not evaluated</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/faculty/review/${app._id}`}
                        className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Evaluate</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
