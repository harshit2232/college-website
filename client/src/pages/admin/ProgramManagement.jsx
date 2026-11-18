import React, { useState, useEffect } from 'react';
import { programApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  CheckCircle,
  Calendar,
  Users,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react';

export const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    code: '',
    degree: 'B.Tech',
    department: 'Computer Science',
    duration: '4 Years',
    description: '',
    eligibilityCriteria: '',
    applicationFee: 75,
    seatCapacity: 60,
    intakeSeason: 'Fall 2026',
    applicationDeadline: '',
    status: 'active',
  });

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await programApi.getPrograms({ status: '' }); // admin sees all
      if (res.success) {
        setPrograms(res.programs || []);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const openAddModal = () => {
    setEditingProgram(null);
    setForm({
      name: '',
      code: '',
      degree: 'B.Tech',
      department: 'Computer Science',
      duration: '4 Years',
      description: '',
      eligibilityCriteria: 'Minimum 75% in High School Mathematics\nProficiency in English',
      applicationFee: 75,
      seatCapacity: 60,
      intakeSeason: 'Fall 2026',
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prog) => {
    setEditingProgram(prog);
    setForm({
      name: prog.name,
      code: prog.code,
      degree: prog.degree,
      department: prog.department,
      duration: prog.duration,
      description: prog.description,
      eligibilityCriteria: prog.eligibilityCriteria?.join('\n') || '',
      applicationFee: prog.applicationFee,
      seatCapacity: prog.seatCapacity,
      intakeSeason: prog.intakeSeason || 'Fall 2026',
      applicationDeadline: prog.applicationDeadline
        ? new Date(prog.applicationDeadline).toISOString().slice(0, 10)
        : '',
      status: prog.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        eligibilityCriteria: form.eligibilityCriteria
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        applicationFee: Number(form.applicationFee),
        seatCapacity: Number(form.seatCapacity),
        applicationDeadline: new Date(form.applicationDeadline),
      };

      if (editingProgram) {
        const res = await programApi.updateProgram(editingProgram._id, payload);
        if (res.success) {
          toast.success('Program updated successfully!');
          fetchPrograms();
          setIsModalOpen(false);
        }
      } else {
        const res = await programApi.createProgram(payload);
        if (res.success) {
          toast.success('New academic program created!');
          fetchPrograms();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove or close '${name}'?`)) return;
    try {
      const res = await programApi.deleteProgram(id);
      if (res.success) {
        toast.info(res.message);
        fetchPrograms();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            Academic Programs Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure courses, eligibility criteria, seat quotas, application fees, and deadlines.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Program</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs by name, code, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          Total Programs: {filteredPrograms.length}
        </span>
      </div>

      {/* Programs Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading academic programs catalog...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-semibold text-[10px]">
                <th className="py-3 px-4">Program & Code</th>
                <th className="py-3 px-4">Degree & Dept</th>
                <th className="py-3 px-4">Seats (Enrolled)</th>
                <th className="py-3 px-4">App Fee</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.map((prog) => (
                <tr key={prog._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{prog.name}</div>
                    <div className="font-mono text-[10px] text-brand-600 font-semibold">{prog.code}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{prog.degree}</div>
                    <div className="text-[10px] text-slate-400">{prog.department}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {prog.enrolledCount || 0} / {prog.seatCapacity}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    ₹{prog.applicationFee}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(prog.applicationDeadline).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        prog.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prog.status === 'closed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {prog.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(prog)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Program"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prog._id, prog.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                        title="Delete or Close Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Program Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProgram ? 'Edit Academic Program' : 'Add New Academic Degree Program'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Program Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech in Computer Science & AI"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSAI-BTECH-2026"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Degree Level *</label>
                  <select
                    value={form.degree}
                    onChange={(e) => setForm({ ...form, degree: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Sc">M.Sc</option>
                    <option value="MBA">MBA</option>
                    <option value="BBA">BBA</option>
                    <option value="Ph.D">Ph.D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Years"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Fee (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.applicationFee}
                    onChange={(e) => setForm({ ...form, applicationFee: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seat Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.seatCapacity}
                    onChange={(e) => setForm({ ...form, seatCapacity: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={form.applicationDeadline}
                    onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="active">Active (Accepting Applications)</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Curriculum Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Eligibility Criteria (Enter each requirement on a new line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Minimum 75% in High School&#10;SAT Score 1200+&#10;IELTS 6.5+"
                    value={form.eligibilityCriteria}
                    onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingProgram ? 'Save Changes' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;
