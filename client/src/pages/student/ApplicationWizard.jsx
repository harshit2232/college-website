import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { programApi, applicationApi, documentApi, paymentApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  User,
  BookOpen,
  Upload,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Trash2,
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ApplicationWizard = () => {
  const [searchParams] = useSearchParams();
  const programIdParam = searchParams.get('programId');
  const appIdParam = searchParams.get('appId');

  const { user, studentProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // All programs for selection if not preselected
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [applicationId, setApplicationId] = useState(appIdParam || null);
  const [applicationNumber, setApplicationNumber] = useState('');

  // Step 1: Program & Term
  const [intakeTerm, setIntakeTerm] = useState('Fall 2026');

  // Step 2: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    nationality: 'Indian',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  });

  // Step 3: Academic Info
  const [academicInfo, setAcademicInfo] = useState({
    highestQualification: 'Senior Secondary (12th Grade)',
    institution: '',
    boardOrUniversity: 'CBSE',
    graduationYear: 2024,
    cgpaOrPercentage: '',
    majorSubject: '',
    testName: 'SAT',
    testScore: '',
    statementOfPurpose: '',
  });

  // Step 4: Documents Upload
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docTypeToUpload, setDocTypeToUpload] = useState('high_school_marksheet');

  // Step 5: Payment Simulator
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '123',
    cardHolder: user?.name || 'Applicant',
  });
  const [paymentDone, setPaymentDone] = useState(false);

  // Initialize
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // Fetch all active programs
        const progRes = await programApi.getPrograms();
        if (progRes.success) {
          setPrograms(progRes.programs);
          if (programIdParam) {
            const found = progRes.programs.find((p) => p._id === programIdParam);
            if (found) setSelectedProgram(found);
          }
        }

        // If resuming existing application
        if (appIdParam) {
          const appRes = await applicationApi.getApplicationById(appIdParam);
          if (appRes.success && appRes.application) {
            const a = appRes.application;
            setApplicationId(a._id);
            setApplicationNumber(a.applicationNumber);
            setSelectedProgram(a.program);
            setIntakeTerm(a.intakeTerm || 'Fall 2026');
            if (a.currentStep) setCurrentStep(a.currentStep);
            if (a.personalInfo) {
              setPersonalInfo((prev) => ({
                ...prev,
                ...a.personalInfo,
                street: a.personalInfo.address?.street || '',
                city: a.personalInfo.address?.city || '',
                state: a.personalInfo.address?.state || '',
                country: a.personalInfo.address?.country || 'India',
                zipCode: a.personalInfo.address?.zipCode || '',
                emergencyName: a.personalInfo.emergencyContact?.name || '',
                emergencyRelation: a.personalInfo.emergencyContact?.relation || '',
                emergencyPhone: a.personalInfo.emergencyContact?.phone || '',
              }));
            }
            if (a.academicInfo) {
              setAcademicInfo((prev) => ({
                ...prev,
                ...a.academicInfo,
                testName: a.academicInfo.standardizedTest?.name || '',
                testScore: a.academicInfo.standardizedTest?.score || '',
              }));
            }
            if (a.documents) setDocuments(a.documents);
            if (a.paymentStatus === 'paid') setPaymentDone(true);
          }
        } else if (studentProfile) {
          // Pre-populate with student profile defaults
          setPersonalInfo((prev) => ({
            ...prev,
            fullName: user?.name || prev.fullName,
            email: user?.email || prev.email,
            phone: user?.phone || prev.phone,
            dateOfBirth: studentProfile.dateOfBirth
              ? new Date(studentProfile.dateOfBirth).toISOString().slice(0, 10)
              : '',
            gender: studentProfile.gender || prev.gender,
            nationality: studentProfile.nationality || prev.nationality,
            street: studentProfile.address?.street || '',
            city: studentProfile.address?.city || '',
            state: studentProfile.address?.state || '',
            country: studentProfile.address?.country || 'India',
            zipCode: studentProfile.address?.zipCode || '',
            emergencyName: studentProfile.emergencyContact?.name || '',
            emergencyRelation: studentProfile.emergencyContact?.relationship || '',
            emergencyPhone: studentProfile.emergencyContact?.phone || '',
          }));

          if (studentProfile.academicHistory?.[0]) {
            const ac = studentProfile.academicHistory[0];
            setAcademicInfo((prev) => ({
              ...prev,
              highestQualification: ac.level || prev.highestQualification,
              institution: ac.institution || '',
              boardOrUniversity: ac.boardOrUniversity || '',
              graduationYear: ac.yearOfPassing || 2024,
              cgpaOrPercentage: ac.percentageOrCgpa || '',
              majorSubject: ac.majorSubjects || '',
            }));
          }

          if (studentProfile.standardizedTests?.[0]) {
            const st = studentProfile.standardizedTests[0];
            setAcademicInfo((prev) => ({
              ...prev,
              testName: st.testName || '',
              testScore: st.score || '',
            }));
          }
        }
      } catch (err) {
        console.error('Wizard init error:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [programIdParam, appIdParam, studentProfile]);

  // Handle Step 1 Save & Next
  const handleStep1Submit = async () => {
    if (!selectedProgram) {
      toast.error('Please select an academic program to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      // Create or update draft application
      if (!applicationId) {
        const res = await applicationApi.createApplication({
          programId: selectedProgram._id,
          intakeTerm,
        });
        if (res.success) {
          setApplicationId(res.application._id);
          setApplicationNumber(res.application.applicationNumber);
        }
      }
      setCurrentStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Step 2 Save & Next
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phone) {
      toast.error('Please fill in your name, email, and contact phone.');
      return;
    }

    try {
      setSubmitting(true);
      if (applicationId) {
        await applicationApi.updateStep(applicationId, {
          step: 2,
          personalInfo: {
            fullName: personalInfo.fullName,
            email: personalInfo.email,
            phone: personalInfo.phone,
            dateOfBirth: personalInfo.dateOfBirth,
            gender: personalInfo.gender,
            nationality: personalInfo.nationality,
            address: {
              street: personalInfo.street,
              city: personalInfo.city,
              state: personalInfo.state,
              country: personalInfo.country,
              zipCode: personalInfo.zipCode,
            },
            emergencyContact: {
              name: personalInfo.emergencyName,
              relation: personalInfo.emergencyRelation,
              phone: personalInfo.emergencyPhone,
            },
          },
        });
      }
      setCurrentStep(3);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Step 3 Save & Next
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (!academicInfo.institution || !academicInfo.cgpaOrPercentage) {
      toast.error('Please provide your prior institution and GPA / percentage.');
      return;
    }

    try {
      setSubmitting(true);
      if (applicationId) {
        await applicationApi.updateStep(applicationId, {
          step: 3,
          academicInfo: {
            highestQualification: academicInfo.highestQualification,
            institution: academicInfo.institution,
            boardOrUniversity: academicInfo.boardOrUniversity,
            graduationYear: Number(academicInfo.graduationYear),
            cgpaOrPercentage: academicInfo.cgpaOrPercentage,
            majorSubject: academicInfo.majorSubject,
            standardizedTest: {
              name: academicInfo.testName,
              score: academicInfo.testScore,
            },
            statementOfPurpose: academicInfo.statementOfPurpose,
          },
        });
      }
      setCurrentStep(4);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Document Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB maximum limit.');
      return;
    }

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docTypeToUpload);
      formData.append('title', file.name);
      if (applicationId) {
        formData.append('applicationId', applicationId);
      }

      const res = await documentApi.uploadDocument(formData);
      if (res.success) {
        setDocuments((prev) => [...prev, res.document]);
        toast.success(`'${file.name}' uploaded successfully!`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingDoc(false);
      e.target.value = null; // reset input
    }
  };

  // Handle Document Delete
  const handleDeleteDoc = async (docId) => {
    try {
      const res = await documentApi.deleteDocument(docId);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d._id !== docId));
        toast.info('Document removed.');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Step 4 Next
  const handleStep4Submit = () => {
    if (documents.length === 0) {
      toast.warning('Please upload at least one credential document (e.g. Marksheet or ID Proof).');
      return;
    }
    setCurrentStep(5);
  };

  // Step 5: Pay Fee & Final Submission
  const handlePayFee = async () => {
    if (!applicationId) return;

    try {
      setSubmitting(true);
      const payRes = await paymentApi.simulatePayment({
        applicationId,
        paymentMethod,
        billingDetails: {
          name: personalInfo.fullName || user.name,
          email: personalInfo.email || user.email,
          last4: '4242',
          bankName: 'IEM Gateway Secure Simulator',
        },
      });

      if (payRes.success) {
        setPaymentDone(true);
        toast.success('Fee payment processed successfully! Receipt generated.');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Final Application
  const handleFinalSubmit = async () => {
    if (!applicationId) return;

    try {
      setSubmitting(true);
      const res = await applicationApi.submitApplication(applicationId);
      if (res.success) {
        toast.success('Application submitted for faculty review!', 'Congratulations 🎉');
        navigate(`/student/applications/${applicationId}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Preparing application form...
      </div>
    );
  }

  const stepLabels = [
    { num: 1, title: 'Program', icon: GraduationCap },
    { num: 2, title: 'Personal', icon: User },
    { num: 3, title: 'Academic & SOP', icon: BookOpen },
    { num: 4, title: 'Documents', icon: Upload },
    { num: 5, title: 'Payment & Submit', icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
          Admissions Wizard • Session 2026-2027
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
          University Admission Application
        </h1>
        {applicationNumber && (
          <p className="font-mono text-xs text-brand-700 font-bold">
            Application Reference: {applicationNumber}
          </p>
        )}
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-center">
          {stepLabels.map((st) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div key={st.num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-sm'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                    isCurrent ? 'text-brand-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  {st.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Step Content Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* STEP 1: PROGRAM SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 1: Academic Degree Selection</h2>
              <p className="text-slate-500 text-xs">
                Select your intended major and upcoming academic semester.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Select Degree Program *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                  {programs.map((prog) => {
                    const isSelected = selectedProgram?._id === prog._id;
                    return (
                      <div
                        key={prog._id}
                        onClick={() => setSelectedProgram(prog)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-brand-700">{prog.degree}</span>
                            <span className="font-mono text-slate-500">₹{prog.applicationFee}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs leading-snug">{prog.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {prog.department} • {prog.duration}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-brand-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intake Term</label>
                  <select
                    value={intakeTerm}
                    onChange={(e) => setIntakeTerm(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50"
                  >
                    <option value="Fall 2026">Fall 2026 (Starts August)</option>
                    <option value="Spring 2027">Spring 2027 (Starts January)</option>
                  </select>
                </div>

                {selectedProgram && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Application Fee</span>
                    <p className="font-mono font-bold text-base text-slate-900">
                      ₹{selectedProgram.applicationFee}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleStep1Submit}
                disabled={!selectedProgram || submitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-brand-500/20"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL INFORMATION */}
        {currentStep === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6 animate-fade-in text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 2: Personal & Contact Information</h2>
              <p className="text-slate-500 text-xs">
                Provide your legal identity and emergency contact details for official records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={personalInfo.gender}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={personalInfo.nationality}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Address */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2">Residential Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={personalInfo.street}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, street: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Country</label>
                  <input
                    type="text"
                    value={personalInfo.country}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Postal / Zip Code</label>
                  <input
                    type="text"
                    value={personalInfo.zipCode}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-brand-500/20"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ACADEMIC HISTORY & SOP */}
        {currentStep === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-6 animate-fade-in text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 3: Academic Background & Statement</h2>
              <p className="text-slate-500 text-xs">
                Enter your qualifying education and personal statement for faculty evaluation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prior Degree / Qualification *</label>
                <select
                  value={academicInfo.highestQualification}
                  onChange={(e) => setAcademicInfo({ ...academicInfo, highestQualification: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                >
                  <option value="Senior Secondary (12th Grade)">Senior Secondary (12th Grade)</option>
                  <option value="Bachelor of Technology / Science">Bachelor of Technology / Science</option>
                  <option value="Bachelor of Business / Arts">Bachelor of Business / Arts</option>
                  <option value="Master Degree">Master Degree</option>
                  <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution / School Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Public School"
                  value={academicInfo.institution}
                  onChange={(e) => setAcademicInfo({ ...academicInfo, institution: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Board / University</label>
                <input
                  type="text"
                  placeholder="e.g. CBSE / State Board / University of Mumbai"
                  value={academicInfo.boardOrUniversity}
                  onChange={(e) => setAcademicInfo({ ...academicInfo, boardOrUniversity: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passing Year</label>
                  <input
                    type="number"
                    value={academicInfo.graduationYear}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, graduationYear: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPA / Score % *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 94.2% or 3.8/4.0"
                    value={academicInfo.cgpaOrPercentage}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, cgpaOrPercentage: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standardized Test Name (Optional)</label>
                <input
                  type="text"
                  placeholder="SAT, ACT, GRE, IELTS, etc."
                  value={academicInfo.testName}
                  onChange={(e) => setAcademicInfo({ ...academicInfo, testName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Score</label>
                <input
                  type="text"
                  placeholder="e.g. 1450/1600 or 7.5 Band"
                  value={academicInfo.testScore}
                  onChange={(e) => setAcademicInfo({ ...academicInfo, testScore: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>
            </div>

            {/* SOP */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Statement of Purpose (SOP)
              </label>
              <textarea
                rows={5}
                placeholder="Share your academic interests, career ambitions, and reasons for applying to IEM..."
                value={academicInfo.statementOfPurpose}
                onChange={(e) => setAcademicInfo({ ...academicInfo, statementOfPurpose: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50 leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-brand-500/20"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: DOCUMENT UPLOADS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 4: Document Verification Uploads</h2>
              <p className="text-slate-500 text-xs">
                Upload legible copies of your grade sheets, certificates, and identification (PDF, JPG, PNG under 10MB).
              </p>
            </div>

            {/* Upload form */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
                  <select
                    value={docTypeToUpload}
                    onChange={(e) => setDocTypeToUpload(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="high_school_marksheet">Senior Secondary Marksheet</option>
                    <option value="degree_certificate">Degree / Graduation Certificate</option>
                    <option value="transcript">Official Academic Transcript</option>
                    <option value="id_proof">Government ID / Passport</option>
                    <option value="passport_photo">Passport Photo</option>
                    <option value="resume_cv">Curriculum Vitae / Resume</option>
                    <option value="other">Other Supporting Document</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Select File</label>
                  <label className="flex items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl cursor-pointer bg-white transition">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingDoc}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
                    />
                    <div className="flex items-center gap-2 text-slate-600">
                      <Upload className="w-4 h-4 text-brand-600" />
                      <span className="font-medium">
                        {uploadingDoc ? 'Uploading...' : 'Choose File to Upload'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Uploaded Files Table */}
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Uploaded Documents ({documents.length})</h3>
              {documents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                  No documents attached yet. Please upload your transcripts and ID proof.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{doc.title}</p>
                          <p className="text-[10px] text-slate-400">{doc.documentType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold uppercase">
                          {doc.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleStep4Submit}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-brand-500/20"
              >
                <span>Continue to Fee Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FEE PAYMENT SIMULATOR & FINAL SUBMIT */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Step 5: Application Fee & Submission</h2>
              <p className="text-slate-500 text-xs">
                Pay the application fee and formally submit your package for admissions review.
              </p>
            </div>

            {/* Fee Breakdown Card */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700">Total Application Fee</span>
                <h3 className="text-lg font-bold text-indigo-950 mt-0.5">
                  {selectedProgram?.name || 'Selected Program'}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-700">
                  ₹{selectedProgram?.applicationFee || 1200}
                </span>
                <span className="block text-[10px] text-slate-500">Non-refundable fee</span>
              </div>
            </div>

            {/* Payment simulator box */}
            {!paymentDone ? (
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" /> Secure Payment Gateway Simulator
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                    Test Mode Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      disabled
                      value={cardDetails.cardNumber}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardDetails.cardHolder}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      disabled
                      value={cardDetails.cardExpiry}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CVV</label>
                    <input
                      type="text"
                      disabled
                      value={cardDetails.cardCvc}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePayFee}
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {submitting ? 'Processing Payment...' : `Simulate Payment of ₹${selectedProgram?.applicationFee || 1200}`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Application Fee Paid Successfully!</h4>
                  <p className="text-[11px] text-emerald-700">
                    Your payment voucher has been recorded. Click below to submit your application to the Admissions Committee.
                  </p>
                </div>
              </div>
            )}

            {/* Final Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!paymentDone || submitting}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition disabled:opacity-50 text-sm"
              >
                <span>Submit Application to Committee</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationWizard;
