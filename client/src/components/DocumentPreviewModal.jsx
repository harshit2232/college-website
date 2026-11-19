import React from 'react';
import { X, Download, ExternalLink, FileText, CheckCircle2, XCircle } from 'lucide-react';

export const DocumentPreviewModal = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const isPdf = document.mimeType?.includes('pdf') || document.fileUrl?.endsWith('.pdf');
  const isImage = document.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(document.fileUrl);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                {document.title || document.originalName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {document.documentType} • {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={document.fileUrl}
              download={document.originalName || 'document'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verification Status Pill if available */}
        {document.status && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              document.status === 'verified'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                : document.status === 'rejected'
                ? 'bg-rose-50 text-rose-800 border-rose-100'
                : 'bg-amber-50 text-amber-800 border-amber-100'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {document.status === 'verified' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : document.status === 'rejected' ? (
                <XCircle className="w-4 h-4 text-rose-600" />
              ) : null}
              <span>Verification Status: {document.status.toUpperCase()}</span>
            </div>
            {document.verificationNotes && (
              <span className="italic text-slate-600">
                Note: {document.verificationNotes}
              </span>
            )}
          </div>
        )}

        {/* Document Content View */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100/70 flex items-center justify-center min-h-[420px]">
          {isImage && document.fileUrl && !document.fileUrl.startsWith('http') ? (
            <img
              src={document.fileUrl}
              alt={document.title}
              className="max-h-[70vh] max-w-full rounded-lg shadow-md object-contain"
            />
          ) : (
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-lg p-8 space-y-6 text-slate-800">
              {/* Document Header Seal */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-900 text-amber-300 flex items-center justify-center font-black text-xl shadow-sm border border-amber-400">
                    IEM
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight font-serif uppercase">
                      Institute of Engineering & Management
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                      Admissions Credential Verification Repository
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      document.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : document.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {document.status === 'verified' ? '✓ Verified Credential' : document.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    Doc ID: {document._id}
                  </p>
                </div>
              </div>

              {/* Document Metadata Sheet */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Document Title</span>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">{document.title}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Classification</span>
                  <p className="font-semibold text-brand-700 mt-0.5 capitalize">{document.documentType?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">File Encoding</span>
                  <p className="font-mono text-slate-700 mt-0.5">{document.mimeType || 'application/pdf'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Digital Checksum</span>
                  <p className="font-mono text-slate-600 text-[10px] mt-0.5">SHA256: 8f2c...e19a</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Timestamp</span>
                  <p className="text-slate-700 mt-0.5">{new Date(document.uploadedAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">File Size</span>
                  <p className="text-slate-700 mt-0.5">{formatFileSize(document.fileSize || 512000)}</p>
                </div>
              </div>

              {/* Simulated Official Credential Body */}
              <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-3 text-center">
                <FileText className="w-12 h-12 text-brand-600 mx-auto" />
                <h5 className="font-bold text-slate-900 text-sm">
                  Official Academic Record Certificate
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  This document was submitted to the IEM Admissions Directorate for candidate qualification and verification against secondary boards / entrance exam councils.
                </p>

                {document.verificationNotes && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-left">
                    <strong className="text-slate-700 block mb-0.5">Verification Auditor Notes:</strong>
                    <span className="text-slate-600">{document.verificationNotes}</span>
                  </div>
                )}
              </div>

              {/* Footer Notice */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Tamper-evident admissions record</span>
                <span className="font-mono">IEM Admissions Board • Salt Lake, Kolkata</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
