import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Award, Printer, CheckCircle, GraduationCap } from 'lucide-react';

export const AdmissionLetterModal = ({ application, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen && application?.status === 'Approved') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName =
    application.personalInfo?.fullName || application.student?.name || 'Admitted Student';
  const programName = application.program?.name || 'Undergraduate / Graduate Degree';
  const degree = application.program?.degree || 'Degree';
  const intakeTerm = application.intakeTerm || 'Fall 2026';
  const decisionDate = application.decisionDate
    ? new Date(application.decisionDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50 no-print">
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            Official Letter of Admission
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Letter Body */}
        <div className="p-10 overflow-y-auto printable-area bg-white text-slate-800 leading-relaxed font-sans">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-indigo-900">
            <div className="w-16 h-16 bg-indigo-900 text-amber-300 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-black shadow-md border-2 border-amber-400">
              IEM
            </div>
            <h1 className="text-2xl font-serif font-black tracking-wider text-slate-900 uppercase">
              Institute of Engineering & Management (IEM)
            </h1>
            <p className="text-xs tracking-widest text-slate-500 uppercase font-semibold">
              Office of the Director & Board of Admissions
            </p>
            <p className="text-[11px] text-slate-400">
              Sector-V, Salt Lake Electronics Complex, Kolkata • www.iem.edu.in
            </p>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 my-6">
            <span>Date: <strong>{decisionDate}</strong></span>
            <span>Application Reference: <strong className="font-mono text-brand-700">{application.applicationNumber}</strong></span>
          </div>

          <div className="mb-6 text-sm">
            <p className="font-bold text-slate-900 text-base">Dear {studentName},</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
            <p>
              On behalf of the Faculty and the Admissions Committee of <strong>Institute of Engineering & Management (IEM)</strong>, it is our distinct privilege to offer you admission to the{' '}
              <strong className="text-brand-900">{programName} ({degree})</strong> for the <strong>{intakeTerm}</strong> academic session.
            </p>

            <p>
              Your academic background, dedication, and visionary statement of purpose distinguished your candidacy among thousands of exceptional applicants from around the country. The admissions committee was especially impressed by your scholastic achievements and passion for your chosen discipline.
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl my-4 text-xs">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-emerald-600" /> Admission Terms & Next Steps:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-emerald-800">
                <li><strong>Academic Program:</strong> {programName}</li>
                <li><strong>Degree Conferred:</strong> {degree}</li>
                <li><strong>Academic Intake:</strong> {intakeTerm}</li>
                <li><strong>Campus Orientation:</strong> August 15, 2026 (Salt Lake Campus)</li>
                <li><strong>Enrollment Status:</strong> Provisional admission confirmed pending physical verification of original certificates.</li>
              </ul>
            </div>

            <p>
              At IEM, you will join an extraordinary cohort of scholars, researchers, and innovators dedicated to answering the defining questions of our era.
            </p>

            <p>
              Please accept our warmest congratulations on your admission. We look forward to welcoming you into our IEM collegiate community!
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end">
            <div>
              <div className="font-serif italic text-lg text-indigo-900 font-bold mb-1">
                Dr. Harshit R.
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mb-1" />
              <div className="text-xs font-bold text-slate-800">Dr. Harshit R.</div>
              <div className="text-[11px] text-slate-500">Chief Admissions Officer & Dean of Enrollment</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 border-4 border-amber-500 rounded-full flex flex-col items-center justify-center p-1 text-[9px] font-black uppercase text-amber-700 tracking-tighter opacity-80 rotate-[-10deg]">
                <span>Official</span>
                <span className="text-[11px] font-extrabold">SEAL</span>
                <span>Admissions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionLetterModal;
