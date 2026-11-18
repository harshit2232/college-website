import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi, programApi, reportApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  Download,
  ExternalLink,
  Edit3,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AllApplications = () => {
  const [applications, setApplications] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [programFilter, setProgramFilter] = useState('All');
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Status Change Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const [appRes, progRes] = await Promise.all([
        applicationApi.getAllApplications({
          status: statusFilter,
          program: programFilter,
          search,
        }),
        programApi.getPrograms(),
      ]);

      if (appRes.success) {
        setApplications(appRes.applications || []);
      }
      if (progRes.success) {
        setPrograms(progRes.programs || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter, programFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApps();
  };

  const openStatusModal = (app) => {
    setSelectedApp(app);
    setTargetStatus(app.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setSubmittingStatus(true);
      const res = await applicationApi.updateStatus(selectedApp._id, {
        status: targetStatus,
        note: statusNote || `Status overridden by admissions administration to ${targetStatus}`,
      });

      if (res.success) {
        toast.success(`Application status updated to ${targetStatus}`);
        setApplications((prev) =>
          prev.map((a) => (a._id === selectedApp._id ? res.application : a))
        );
        setSelectedApp(null);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            All Admissions Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Global master table across all academic colleges and departments.
          </p>
        </div>

        <a
          href={reportApi.getExportCSVUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All CSV</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, email, application #, program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Filter Status:</span>
            {['All', 'Draft', 'Submitted', 'Under Review', 'Verified', 'Approved', 'Waitlisted', 'Rejected'].map(
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

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Program:</span>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium max-w-xs truncate"
            >
              <option value="All">All Academic Programs</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading master applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No applications found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or keywords.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px]">
                <th className="py-3 px-4">App #</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Term</th>
                <th className="py-3 px-4">Fee Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {app.applicationNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{app.student?.name}</div>
                    <div className="text-[10px] text-slate-500">{app.student?.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{app.program?.name}</div>
                    <div className="text-[10px] text-slate-400">{app.program?.department}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{app.intakeTerm}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        app.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {app.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openStatusModal(app)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        title="Override Status"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Status</span>
                      </button>
                      <Link
                        to={`/faculty/review/${app._id}`}
                        className="p-1 text-slate-400 hover:text-brand-600 transition"
                        title="Open Review Workbench"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Override Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Override Application Status</h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedApp.applicationNumber} • {selectedApp.student?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Lifecycle Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Approved">Approved (Grant Admission)</option>
                  <option value="Waitlisted">Waitlisted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Audit / Notification Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Reason for status change. This note will be recorded in the candidate's audit log."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition disabled:opacity-60"
                >
                  {submittingStatus ? 'Updating...' : 'Confirm Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllApplications;
