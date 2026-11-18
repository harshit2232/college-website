import React, { useState, useEffect } from 'react';
import { documentApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react';

export const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('transcript');
  const [previewDoc, setPreviewDoc] = useState(null);
  const toast = useToast();

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await documentApi.getMyDocuments();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size cannot exceed 10MB.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);
      formData.append('title', file.name);

      const res = await documentApi.uploadDocument(formData);
      if (res.success) {
        toast.success(`'${file.name}' uploaded successfully!`);
        fetchDocs();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await documentApi.deleteDocument(id);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
        toast.info('Document deleted.');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            Student Document Locker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store, manage, and inspect your verified academic transcripts and identity proofs.
          </p>
        </div>

        {/* Upload widget */}
        <div className="flex items-center gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
          >
            <option value="transcript">Official Transcript</option>
            <option value="high_school_marksheet">Marksheet (12th / 10th)</option>
            <option value="degree_certificate">Degree Certificate</option>
            <option value="id_proof">Government ID / Passport</option>
            <option value="passport_photo">Passport Photo</option>
            <option value="resume_cv">Curriculum Vitae (CV)</option>
            <option value="other">Other Document</option>
          </select>

          <label className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/20">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
            />
          </label>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading credentials...
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Documents in Locker</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your official marksheet or passport copy to attach to university applications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const isVerified = doc.status === 'verified';
            const isRejected = doc.status === 'rejected';

            return (
              <div
                key={doc._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isVerified ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : isRejected ? (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{doc.status}</span>
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs truncate" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                    {doc.documentType.replace(/_/g, ' ')}
                  </p>

                  {doc.verificationNotes && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-600 italic">
                      Note: {doc.verificationNotes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={doc.fileUrl}
                      download={doc.originalName}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};

export default StudentDocuments;
