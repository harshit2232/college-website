import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

export const TimelineTracker = ({ currentStatus, submissionDate, decisionDate }) => {
  const steps = [
    { id: 'Draft', label: 'Draft Started', desc: 'Application initiated' },
    { id: 'Submitted', label: 'Submitted & Paid', desc: 'Fee verified' },
    { id: 'Under Review', label: 'Faculty Review', desc: 'Document verification' },
    { id: 'Decision', label: 'Final Decision', desc: 'Admission committee' },
  ];

  // Helper to determine stage index
  const getStageIndex = (status) => {
    switch (status) {
      case 'Draft':
        return 0;
      case 'Submitted':
        return 1;
      case 'Under Review':
      case 'Verified':
        return 2;
      case 'Approved':
      case 'Waitlisted':
      case 'Rejected':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />
        
        {/* Active track line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          let circleStyle = 'bg-white border-slate-300 text-slate-400';
          let textColor = 'text-slate-500';

          if (isCompleted) {
            circleStyle = 'bg-brand-600 border-brand-600 text-white';
            textColor = 'text-brand-900 font-semibold';
          } else if (isCurrent) {
            if (currentStatus === 'Approved') {
              circleStyle = 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-100';
              textColor = 'text-emerald-700 font-bold';
            } else if (currentStatus === 'Rejected') {
              circleStyle = 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100';
              textColor = 'text-rose-700 font-bold';
            } else {
              circleStyle = 'bg-white border-brand-600 text-brand-600 ring-4 ring-brand-100';
              textColor = 'text-brand-700 font-bold';
            }
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${circleStyle}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  currentStatus === 'Rejected' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4 animate-pulse" />
                  )
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center max-w-[100px]">
                <div className={`text-xs ${textColor}`}>
                  {idx === 3 && currentStatus === 'Approved'
                    ? 'Admitted 🎉'
                    : idx === 3 && currentStatus === 'Rejected'
                    ? 'Declined'
                    : idx === 3 && currentStatus === 'Waitlisted'
                    ? 'Waitlisted'
                    : step.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                  {idx === 1 && submissionDate
                    ? new Date(submissionDate).toLocaleDateString()
                    : idx === 3 && decisionDate
                    ? new Date(decisionDate).toLocaleDateString()
                    : step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTracker;
