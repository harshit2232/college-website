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
        <div className="flex-1 overflow-auto p-4 bg-slate-100/70 flex items-center justify-center min-h-[420px]">
          {isImage ? (
            <img
              src={document.fileUrl}
              alt={document.title}
              className="max-h-[70vh] max-w-full rounded-lg shadow-md object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={`${document.fileUrl}#toolbar=0`}
              title={document.title}
              className="w-full h-[65vh] rounded-lg shadow-sm border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-800 mb-1">
                Preview not available in browser
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                This file format ({document.mimeType}) can be downloaded to view on your device.
              </p>
              <a
                href={document.fileUrl}
                download={document.originalName}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
