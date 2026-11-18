import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationApi, documentApi, facultyApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import {
  FileText,
  User,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowLeft,
  Save,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';

export const FacultyReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Document verification modal/notes state
  const [docFeedback, setDocFeedback] = useState({});

  // Evaluation Form State
  const [scores, setScores] = useState({
    academicScore: 85,
    interviewScore: 80,
    statementScore: 85,
    recommendation: 'recommend',
    interviewNotes: '',
    comments: '',
    newStatus: 'Under Review',
  });

  const fetchApp = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getApplicationById(id);
      if (data.success && data.application) {
        const app = data.application;
        setApplication(app);

        if (app.evaluation) {
          setScores({
            academicScore: app.evaluation.academicScore || 85,
            interviewScore: app.evaluation.interviewScore || 80,
            statementScore: app.evaluation.statementScore || 85,
            recommendation: app.evaluation.recommendation || 'recommend',
            interviewNotes: app.evaluation.interviewNotes || '',
            comments: app.evaluation.comments || '',
            newStatus: app.status || 'Under Review',
          });
        } else {
          setScores((prev) => ({ ...prev, newStatus: app.status }));
        }
      }
    } catch (err) {
      console.error('Error fetching application for review:', err);
      toast.error('Could not load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApp();
  }, [id]);

  // Handle Verify or Reject Individual Document
  const handleVerifyDocument = async (docId, newStatus) => {
    try {
      const notes = docFeedback[docId] || '';
      const res = await documentApi.verifyDocument(docId, {
        status: newStatus,
        verificationNotes: notes,
      });

      if (res.success) {
        toast.success(`Document marked as ${newStatus.toUpperCase()}`);
        // update local state
        setApplication((prev) => ({
          ...prev,
          documents: prev.documents.map((d) => (d._id === docId ? res.document : d)),
        }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Submit Comprehensive Faculty Evaluation
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await facultyApi.submitEvaluation(id, scores);
      if (res.success) {
        toast.success('Evaluation and status updated successfully!', 'Review Saved');
        navigate('/faculty/queue');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading evaluation workbench...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-16 text-center text-slate-500">
        <h3 className="font-bold">Application not found</h3>
        <Link to="/faculty/queue" className="text-brand-600 text-xs underline mt-2">
          Back to Queue
        </Link>
      </div>
    );
  }

  const computedTotal = Math.round(
    (Number(scores.academicScore) + Number(scores.interviewScore) + Number(scores.statementScore)) / 3
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/faculty/queue"
            className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            Candidate Evaluation Workbench
          </h1>
          <p className="text-xs text-slate-500">
            Applicant: <strong className="text-slate-800">{application.student?.name}</strong> •{' '}
            {application.program?.name} ({application.applicationNumber})
          </p>
        </div>

        <StatusBadge status={application.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Background & Document Inspection (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Profile Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" /> Applicant Information
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
                <p className="font-bold text-slate-800 mt-0.5">{application.student?.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.student?.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Phone</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.student?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Nationality</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {application.personalInfo?.nationality || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Term Applied</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.intakeTerm}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Fee Status</span>
                <p className="font-bold text-emerald-700 mt-0.5 uppercase">{application.paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Academic Background & SOP */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-600" /> Academic History & Statement
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Prior Institution</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.academicInfo?.institution || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">GPA / Score %</span>
                <p className="font-bold text-brand-700 text-sm mt-0.5">
                  {application.academicInfo?.cgpaOrPercentage || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Board / University</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.academicInfo?.boardOrUniversity || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Test Score</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {application.academicInfo?.standardizedTest?.name}: {application.academicInfo?.standardizedTest?.score || 'N/A'}
                </p>
              </div>
            </div>

            {application.academicInfo?.statementOfPurpose && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Statement of Purpose</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] leading-relaxed text-slate-700">
                  {application.academicInfo.statementOfPurpose}
                </div>
              </div>
            )}
          </div>

          {/* Document Verification Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" /> Credential Document Verification ({application.documents?.length || 0})
            </h3>

            <div className="space-y-3">
              {application.documents?.map((doc) => {
                const isVerified = doc.status === 'verified';
                const isRejected = doc.status === 'rejected';

                return (
                  <div
                    key={doc._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-slate-800 truncate">{doc.title}</h4>
                          <p className="text-[10px] text-slate-400">{doc.documentType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {doc.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1 transition shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </button>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Verification notes / rejection feedback..."
                        defaultValue={doc.verificationNotes || ''}
                        onChange={(e) =>
                          setDocFeedback({ ...docFeedback, [doc._id]: e.target.value })
                        }
                        className="flex-1 w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'verified')}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'rejected')}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Faculty Evaluation Scorecard (1 col) */}
        <div>
          <form
            onSubmit={handleSubmitEvaluation}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs sticky top-20"
          >
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-brand-600 block">Scoring Card</span>
              <h3 className="text-base font-bold text-slate-900">Faculty Assessment</h3>
            </div>

            {/* Scores Inputs */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Academic Record Score (0-100)</span>
                  <span className="font-bold text-brand-700">{scores.academicScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.academicScore}
                  onChange={(e) => setScores({ ...scores, academicScore: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Interview / Technical Aptitude (0-100)</span>
                  <span className="font-bold text-brand-700">{scores.interviewScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.interviewScore}
                  onChange={(e) => setScores({ ...scores, interviewScore: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Statement of Purpose / Fit (0-100)</span>
                  <span className="font-bold text-brand-700">{scores.statementScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scores.statementScore}
                  onChange={(e) => setScores({ ...scores, statementScore: Number(e.target.value) })}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              {/* Total Computed Score Display */}
              <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-800">Composite Score:</span>
                <span className="text-lg font-black text-brand-700">{computedTotal} / 100</span>
              </div>
            </div>

            {/* Recommendation dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Faculty Recommendation *
              </label>
              <select
                value={scores.recommendation}
                onChange={(e) => setScores({ ...scores, recommendation: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
              >
                <option value="recommend">Recommend for Admission</option>
                <option value="waitlist">Place on Waitlist</option>
                <option value="reject">Do Not Recommend (Reject)</option>
                <option value="need_info">Request Additional Information</option>
              </select>
            </div>

            {/* Status change selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Update Application Status
              </label>
              <select
                value={scores.newStatus}
                onChange={(e) => setScores({ ...scores, newStatus: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
              >
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Approved">Approved / Admitted</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Committee Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Evaluation Notes / Comments
              </label>
              <textarea
                rows={3}
                placeholder="Assessment notes, interview comments, or scholarship recommendation..."
                value={scores.comments}
                onChange={(e) => setScores({ ...scores, comments: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-[11px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition disabled:opacity-60 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Save Evaluation & Status'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Document Inspector Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};

export default FacultyReviewPage;
