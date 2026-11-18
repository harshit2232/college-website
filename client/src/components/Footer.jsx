import React from 'react';
import { GraduationCap, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>IEM KOLKATA</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Institute of Engineering & Management (IEM) — Premier institution for engineering and management education. NAAC 'A' Grade, NIRF ranked & AICTE approved.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> NAAC 'A' Grade / NBA & AICTE Approved
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Academic Degrees</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/programs" className="hover:text-white transition">Computer Science & AI</Link></li>
              <li><Link to="/programs" className="hover:text-white transition">Data Science & Analytics</Link></li>
              <li><Link to="/programs" className="hover:text-white transition">Global MBA & Finance</Link></li>
              <li><Link to="/programs" className="hover:text-white transition">Robotics & Cyber Systems</Link></li>
              <li><Link to="/programs" className="hover:text-white transition">Biotechnology & Genomics</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Admissions Helpdesk</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>admissions@iem.edu.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 (033) 2357-2059 / +91 98300 00000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Sector V, Salt Lake Electronics Complex, Kolkata - 700091</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Portals</h4>
            <div className="space-y-2 text-xs">
              <Link to="/login" className="block p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition">
                <span className="font-semibold block text-white">Applicant Portal</span>
                <span className="text-[10px] text-slate-400">Track application status & pay fee</span>
              </Link>
              <Link to="/login" className="block p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition">
                <span className="font-semibold block text-white">Faculty & Committee Board</span>
                <span className="text-[10px] text-slate-400">Evaluate candidates & verify papers</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Institute of Engineering & Management (IEM). All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Admission</span>
            <span className="hover:text-slate-400 cursor-pointer">FERPA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
