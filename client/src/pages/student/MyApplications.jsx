import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/endpoints';
import StatusBadge from '../../components/StatusBadge';
import { FileText, PlusCircle, ExternalLink, Calendar, Search } from 'lucide-react';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await applicationApi.getMyApplications();
        if (data.success) {
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApps = applications.filter((app) => {
    const query = search.toLowerCase();
    const progName = app.program?.name?.toLowerCase() || '';
    const appNum = app.applicationNumber?.toLowerCase() || '';
    return progName.includes(query) || appNum.includes(query);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            My Submitted Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View status, review notes, and download official receipts or admission letters.
          </p>
        </div>

        <Link
          to="/programs"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply to Another Program</span>
        </Link>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by program name or application number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          Total: {filteredApps.length} applications
        </span>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading your applications...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Applications Found</h3>
          <p className="text-xs text-slate-500">You haven't initiated any applications matching this criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px]">
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Degree Program</th>
                <th className="py-3 px-4">Term</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Admission Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {app.applicationNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{app.program?.name}</div>
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
                    {app.status === 'Draft' ? (
                      <Link
                        to={`/student/apply?appId=${app._id}`}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition inline-block"
                      >
                        Resume
                      </Link>
                    ) : (
                      <Link
                        to={`/student/applications/${app._id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
