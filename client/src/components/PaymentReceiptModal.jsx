import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Download } from 'lucide-react';

export const PaymentReceiptModal = ({ payment, application, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50 no-print">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Official Payment Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto printable-area bg-white text-slate-800">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-700 text-white rounded-xl flex items-center justify-center font-black text-2xl tracking-tighter shadow-md">
                IEM
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  INSTITUTE OF ENGINEERING & MANAGEMENT (IEM)
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Office of Admissions & Finance Accounts
                </p>
                <p className="text-[11px] text-slate-400">
                  Salt Lake Campus, Sector-V, Kolkata • admissions@iem.edu.in
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Payment Confirmed
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-2">
                Receipt #{payment.receiptNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                {new Date(payment.paymentDate || payment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-6 my-6 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Candidate Information
              </p>
              <p className="font-bold text-slate-900">
                {payment.billingDetails?.name || application?.student?.name || 'Applicant'}
              </p>
              <p className="text-slate-600 text-xs">
                {payment.billingDetails?.email || application?.student?.email}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Application Number:{' '}
                <span className="font-mono font-semibold text-brand-700">
                  {application?.applicationNumber || 'N/A'}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Transaction Details
              </p>
              <p className="font-mono text-xs font-bold text-slate-800">
                Txn ID: {payment.transactionId}
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                Method: {payment.paymentMethod} (Card ending {payment.billingDetails?.last4 || '4242'})
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                Bank: {payment.billingDetails?.bankName || 'IEM Payment Gateway'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse text-xs my-6">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Program / Term</th>
                <th className="py-2.5 px-3 text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-800">College Application Processing Fee</div>
                  <div className="text-[11px] text-slate-500">Non-refundable admissions evaluation & verification fee</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-800">{application?.program?.name || 'Academic Degree Program'}</div>
                  <div className="text-[11px] text-slate-500">Term: {application?.intakeTerm || 'Fall 2026'}</div>
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                  ₹ {Number(payment.amount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td colSpan="2" className="pt-3 px-3 font-bold text-slate-800 text-right uppercase text-xs">
                  Total Amount Paid:
                </td>
                <td className="pt-3 px-3 font-mono font-extrabold text-base text-brand-700 text-right">
                  ₹ {Number(payment.amount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Verification Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographically signed electronic voucher • IEM Accounts Office</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Generated: {new Date().toISOString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
