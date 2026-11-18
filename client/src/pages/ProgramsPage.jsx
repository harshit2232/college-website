import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { programApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  GraduationCap,
  Calendar,
  IndianRupee,
  Users,
  CheckCircle,
  ArrowRight,
  Info,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedDegree, setSelectedDegree] = useState('All');
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [activeModalProgram, setActiveModalProgram] = useState(null);

  const { isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await programApi.getPrograms({
        search,
        department: selectedDept,
        degree: selectedDegree,
      });
      if (data.success) {
        setPrograms(data.programs);
        if (data.departments) setDepartments(['All', ...data.departments]);
        if (data.degrees) setDegrees(['All', ...data.degrees]);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [selectedDept, selectedDegree]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPrograms();
  };

  const handleApplyClick = (program) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/student/apply?programId=${program._id}` } });
      return;
    }
    if (isStudent) {
      navigate(`/student/apply?programId=${program._id}`);
    } else {
      alert(`You are logged in as a ${isAuthenticated ? 'Faculty/Admin' : 'Guest'}. Switch to a Student account to submit an application.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Academic Catalog 2026-2027
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
          Undergraduate & Graduate Degree Programs
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Find the curriculum matching your aspirations. Filter by degree level, department, and admission criteria.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by program name, keywords, course code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Department:</span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  selectedDept === dept
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Degree Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Degree:</span>
            {degrees.map((deg) => (
              <button
                key={deg}
                onClick={() => setSelectedDegree(deg)}
                className={`px-2.5 py-1 rounded-lg transition font-medium ${
                  selectedDegree === deg
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {deg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Program Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading academic programs...
        </div>
      ) : programs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No programs found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => {
            const seatsLeft = Math.max(0, prog.seatCapacity - (prog.enrolledCount || 0));

            return (
              <div
                key={prog._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md">
                      {prog.degree} • {prog.department}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      ₹{prog.applicationFee}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition">
                    {prog.name}
                  </h3>
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">Code: {prog.code}</p>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {prog.description}
                  </p>

                  {/* Highlights / Eligibility */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>Duration: {prog.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>Deadline: {new Date(prog.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Users className="w-3.5 h-3.5 text-brand-500" />
                      <span>Capacity: {prog.seatCapacity} seats ({seatsLeft} remaining)</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalProgram(prog)}
                    className="flex-1 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApplyClick(prog)}
                    className="flex-1 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm shadow-brand-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Program Detail Modal */}
      {activeModalProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-bold rounded">
                  {activeModalProgram.degree} • {activeModalProgram.department}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {activeModalProgram.name}
                </h3>
                <p className="font-mono text-xs text-slate-500">Program Code: {activeModalProgram.code}</p>
              </div>
              <button
                onClick={() => setActiveModalProgram(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Program Overview</h4>
                <p className="leading-relaxed text-slate-600">{activeModalProgram.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Admission Eligibility Criteria</h4>
                <ul className="space-y-2">
                  {activeModalProgram.eligibilityCriteria?.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Application Fee</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">₹{activeModalProgram.applicationFee}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Seats</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{activeModalProgram.seatCapacity} Seats</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Academic Intake</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{activeModalProgram.intakeSeason || 'Fall 2026'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Deadline</span>
                  <p className="text-sm font-bold text-rose-600 mt-0.5">
                    {new Date(activeModalProgram.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveModalProgram(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const p = activeModalProgram;
                  setActiveModalProgram(null);
                  handleApplyClick(p);
                }}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20"
              >
                Apply for this Degree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsPage;
