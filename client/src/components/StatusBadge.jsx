import React from 'react';
import {
  Clock,
  Send,
  FileSearch,
  CheckCircle,
  Award,
  XCircle,
  Hourglass,
} from 'lucide-react';

const statusConfig = {
  Draft: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    label: 'Draft',
  },
  Submitted: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Send,
    label: 'Submitted',
  },
  'Under Review': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: FileSearch,
    label: 'Under Review',
  },
  Verified: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: CheckCircle,
    label: 'Verified',
  },
  Approved: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-500/20',
    icon: Award,
    label: 'Approved / Admitted',
  },
  Rejected: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    label: 'Rejected',
  },
  Waitlisted: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Hourglass,
    label: 'Waitlisted',
  },
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.Draft;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
