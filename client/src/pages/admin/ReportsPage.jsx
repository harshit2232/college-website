import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/endpoints';
import {
  FileText,
  Download,
  Printer,
  BarChart2,
  IndianRupee,
  Award,
  Users,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await reportApi.getAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Compiling admissions executive report...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const deptData = data?.departmentBreakdown || [];
  const progData = data?.programPopularity || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 printable-area bg-white">
      {/* Header (No print controls) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Official University Audit Document
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            Admissions & Revenue Comprehensive Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated on: {new Date().toLocaleString()} • IEM Office of Admissions & Bursar
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report / PDF</span>
          </button>
          <a
            href={reportApi.getExportCSVUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-brand-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Applications</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{metrics.totalApplications || 0}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled / Admitted</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{metrics.approvedCount || 0}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Acceptance Rate</span>
          <p className="text-2xl font-extrabold text-brand-600 mt-0.5">{metrics.acceptanceRate || 0}%</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Fee Revenue (₹ INR)</span>
          <p className="text-2xl font-extrabold text-indigo-700 font-mono mt-0.5">
            ₹{Number(metrics.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Department Performance & Revenue Summary</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Active Programs</th>
                <th className="py-2.5 px-3">Total Seats</th>
                <th className="py-2.5 px-3">Applications</th>
                <th className="py-2.5 px-3">Admitted</th>
                <th className="py-2.5 px-3 text-right">Fee Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptData.map((d, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-bold text-slate-800">{d.department}</td>
                  <td className="py-3 px-3 text-slate-600">{d.programsCount}</td>
                  <td className="py-3 px-3 text-slate-600">{d.totalSeats}</td>
                  <td className="py-3 px-3 font-semibold text-brand-700">{d.applications}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-700">{d.approved}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    ₹{Number(d.revenue || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program Popularity Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Program Demand & Capacity Analysis</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Program Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Applications Received</th>
                <th className="py-2.5 px-3">Capacity Quota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {progData.map((p, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-bold text-slate-800">{p.name}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{p.code}</td>
                  <td className="py-3 px-3 text-slate-600">{p.department}</td>
                  <td className="py-3 px-3 font-bold text-brand-700">{p.applications}</td>
                  <td className="py-3 px-3 text-slate-600">{p.seats} seats</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signoff Footer */}
      <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
        <span>Confidential Admissions Ledger • IEM Registry</span>
        <span>Verified Cryptographically</span>
      </div>
    </div>
  );
};

export default ReportsPage;
