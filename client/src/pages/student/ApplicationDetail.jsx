import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationApi, paymentApi } from '../../api/endpoints';
import StatusBadge from '../../components/StatusBadge';
import TimelineTracker from '../../components/TimelineTracker';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import PaymentReceiptModal from '../../components/PaymentReceiptModal';
import AdmissionLetterModal from '../../components/AdmissionLetterModal';
import {
  FileText,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Award,
  AlertTriangle,
  Receipt,
  User,
  GraduationCap,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';

export const ApplicationDetail = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getApplicationById(id);
      if (data.success && data.application) {
        setApplication(data.application);

        // Fetch payment details if paid
        if (data.application.paymentStatus === 'paid') {
          try {
            const pRes = await paymentApi.getPaymentByApp(id);
            if (pRes.success) setPayment(pRes.payment);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Error fetching application detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading application details...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-16 text-center text-slate-500">
        <h3 className="font-bold text-slate-800">Application not found</h3>
        <Link to="/student/dashboard" className="text-brand-600 text-xs underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isApproved = application.status === 'Approved';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/student/dashboard" className="text-xs font-semibold text-slate-400 hover:text-slate-600">
              Applications
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-xs font-bold text-slate-600">{application.applicationNumber}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif tracking-tight">
            {application.program?.name || 'Academic Degree Program'}
          </h1>
          <p className="text-xs text-slate-500">
            {application.program?.degree} • {application.program?.department} • Term: {application.intakeTerm}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <StatusBadge status={application.status} size="lg" />
          {payment && (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm transition"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fee Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* Celebration Banner if Admitted */}
      {isApproved && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Official Decision
              </span>
              <h3 className="text-lg font-bold leading-tight">
                Congratulations! You are Admitted to IEM
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                The admissions committee has approved your candidacy for {application.intakeTerm}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOfferModal(true)}
            className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition shrink-0 flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>View Letter of Admission</span>
          </button>
        </div>
      )}

      {/* Progress Timeline Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Admission Lifecycle Progress
        </h3>
        <TimelineTracker
          currentStatus={application.status}
          submissionDate={application.submittedAt}
          decisionDate={application.decisionDate}
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Personal & Academic Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Candidate Profile Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" /> Personal & Contact Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Candidate Name</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.personalInfo?.fullName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.personalInfo?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Phone</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.personalInfo?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Nationality</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.personalInfo?.nationality || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {application.personalInfo?.address?.street}, {application.personalInfo?.address?.city},{' '}
                  {application.personalInfo?.address?.state} {application.personalInfo?.address?.zipCode},{' '}
                  {application.personalInfo?.address?.country}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Background & SOP */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-600" /> Academic Qualifications & SOP
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Qualifying Degree</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.academicInfo?.highestQualification || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Institution</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.academicInfo?.institution || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Board / University</span>
                <p className="font-semibold text-slate-800 mt-0.5">{application.academicInfo?.boardOrUniversity || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">GPA / Score</span>
                <p className="font-semibold text-emerald-700 mt-0.5">{application.academicInfo?.cgpaOrPercentage || 'N/A'}</p>
              </div>
            </div>

            {application.academicInfo?.statementOfPurpose && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Statement of Purpose</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                  {application.academicInfo.statementOfPurpose}
                </p>
              </div>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" /> Uploaded Credential Documents ({application.documents?.length || 0})
            </h3>

            {application.documents?.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No documents attached.</p>
            ) : (
              <div className="space-y-2.5">
                {application.documents?.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{doc.title}</p>
                        <p className="text-[10px] text-slate-400">{doc.documentType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          doc.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status & Evaluation Feed */}
        <div className="space-y-6">
          {/* Faculty Evaluation Card if reviewed */}
          {application.evaluation?.totalScore > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3 text-xs bg-gradient-to-b from-indigo-50/30 to-white">
              <span className="text-[10px] uppercase font-bold text-indigo-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Admissions Committee Review
              </span>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Composite Score</span>
                  <div className="text-xl font-black text-brand-700 mt-0.5">
                    {application.evaluation.totalScore} / 100
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Recommendation</span>
                  <div className="text-xs font-bold text-emerald-700 capitalize mt-0.5">
                    {application.evaluation.recommendation}
                  </div>
                </div>
              </div>

              {application.evaluation.comments && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-0.5">Faculty Remarks:</span>
                  {application.evaluation.comments}
                </div>
              )}
            </div>
          )}

          {/* Activity / Status History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
              Status Audit History
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {application.statusHistory?.map((hist, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px]">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">{hist.status}</div>
                    <div className="text-slate-500">{hist.note}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(hist.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <PaymentReceiptModal
        payment={payment}
        application={application}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />

      <AdmissionLetterModal
        application={application}
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
      />
    </div>
  );
};

export default ApplicationDetail;
