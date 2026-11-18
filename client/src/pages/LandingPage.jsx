import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { programApi } from '../api/endpoints';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Search,
  ChevronRight,
} from 'lucide-react';

export const LandingPage = () => {
  const [featuredPrograms, setFeaturedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await programApi.getPrograms({ limit: 4 });
        if (data.success) {
          setFeaturedPrograms(data.programs.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching programs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
            <span>Admissions Now Open for Fall 2026 Academic Intake</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight font-serif max-w-4xl mx-auto leading-tight">
            Shape Your Tomorrow at <span className="text-brand-600 underline decoration-brand-300 decoration-wavy decoration-2">IEM College</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience premier engineering and management education at Institute of Engineering & Management (IEM), Kolkata — featuring advanced AI laboratories, top faculty, and stellar global placements.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/programs"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Degree Programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              Apply for Admission
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-700">#12</div>
              <div className="text-xs text-slate-500 font-medium mt-1">National Innovation Rank</div>
            </div>
            <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700">96.8%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Graduate Career Placement</div>
            </div>
            <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">₹50 Cr+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Annual Research Grants</div>
            </div>
            <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-700">120+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Global University Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Admission Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Seamless Application Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Your Path to Enrollment in 4 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-4">
              01
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Select Your Program</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore undergraduate and graduate degrees. Check eligibility criteria and application deadlines.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">
              02
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Upload Credentials</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit your transcripts, standardized scores, statement of purpose, and identity proof online.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
              03
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Pay Fee & Submit</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete the secure application processing payment and receive instant digital receipt voucher.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
              04
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">Track & Offer Letter</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow real-time status updates from the admissions committee and download your official admission offer.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Top Ranked Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              Featured Academic Programs
            </h2>
          </div>
          <Link
            to="/programs"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 group"
          >
            <span>View All Programs ({featuredPrograms.length}+)</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredPrograms.map((program) => (
            <div
              key={program._id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-bold text-[11px] rounded-lg">
                    {program.degree} • {program.department}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Fee: ₹{program.applicationFee}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 hover:text-brand-600 transition">
                  {program.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {program.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    Deadline: {new Date(program.applicationDeadline).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {program.seatCapacity - (program.enrolledCount || 0)} Seats Available
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-2">
                <Link
                  to={`/programs`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition"
                >
                  <span>Program Details & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
              Join the Cohort of 2026
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif mb-4 leading-tight">
              Begin Your Application for Admission Today
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-8">
              Take the first step toward transforming your career. Complete your online application in under 15 minutes with our step-by-step portal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-white text-brand-900 hover:bg-brand-50 rounded-xl text-xs font-bold transition shadow-md"
              >
                Create Applicant Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition"
              >
                Sign In to Existing Application
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
