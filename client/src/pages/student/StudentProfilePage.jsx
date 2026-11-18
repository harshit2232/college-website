import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Phone, MapPin, GraduationCap, ShieldAlert, Save, Award } from 'lucide-react';

export const StudentProfilePage = () => {
  const { user, studentProfile, updateStudentProfileData } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: 'Prefer not to say',
    nationality: 'Indian',
    passportOrIdNumber: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    emergencyEmail: '',
    institution: '',
    level: 'Senior Secondary (12th)',
    yearOfPassing: 2022,
    percentageOrCgpa: '',
    majorSubjects: '',
    bio: '',
  });

  useEffect(() => {
    if (studentProfile) {
      setFormData({
        dateOfBirth: studentProfile.dateOfBirth
          ? new Date(studentProfile.dateOfBirth).toISOString().slice(0, 10)
          : '',
        gender: studentProfile.gender || 'Prefer not to say',
        nationality: studentProfile.nationality || 'Indian',
        passportOrIdNumber: studentProfile.passportOrIdNumber || '',
        street: studentProfile.address?.street || '',
        city: studentProfile.address?.city || '',
        state: studentProfile.address?.state || '',
        country: studentProfile.address?.country || 'India',
        zipCode: studentProfile.address?.zipCode || '',
        emergencyName: studentProfile.emergencyContact?.name || '',
        emergencyRelation: studentProfile.emergencyContact?.relationship || '',
        emergencyPhone: studentProfile.emergencyContact?.phone || '',
        emergencyEmail: studentProfile.emergencyContact?.email || '',
        institution: studentProfile.academicHistory?.[0]?.institution || '',
        level: studentProfile.academicHistory?.[0]?.level || 'Senior Secondary (12th)',
        yearOfPassing: studentProfile.academicHistory?.[0]?.yearOfPassing || 2022,
        percentageOrCgpa: studentProfile.academicHistory?.[0]?.percentageOrCgpa || '',
        majorSubjects: studentProfile.academicHistory?.[0]?.majorSubjects || '',
        bio: studentProfile.bio || '',
      });
    }
  }, [studentProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateStudentProfileData({
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        gender: formData.gender,
        nationality: formData.nationality,
        passportOrIdNumber: formData.passportOrIdNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
        },
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelation,
          phone: formData.emergencyPhone,
          email: formData.emergencyEmail,
        },
        academicHistory: [
          {
            level: formData.level,
            institution: formData.institution,
            boardOrUniversity: 'CBSE / Recognized Board',
            yearOfPassing: Number(formData.yearOfPassing),
            percentageOrCgpa: formData.percentageOrCgpa,
            majorSubjects: formData.majorSubjects,
          },
        ],
        bio: formData.bio,
      });
    } catch (err) {
      // handled by context toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
            Student Candidate Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain your personal, contact, and academic credentials.
          </p>
        </div>

        <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-600" />
          <span className="text-xs font-bold text-brand-900">
            Profile Completion: {studentProfile?.profileCompletion || 60}%
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" /> Personal Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
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
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Passport / National ID #</label>
              <input
                type="text"
                name="passportOrIdNumber"
                placeholder="e.g. P12345678"
                value={formData.passportOrIdNumber}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" /> Permanent Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Academic Qualifying Record */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-600" /> Academic Qualifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualification Level</label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Attended</label>
              <input
                type="text"
                name="institution"
                placeholder="High School or University Name"
                value={formData.institution}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year of Passing</label>
              <input
                type="number"
                name="yearOfPassing"
                value={formData.yearOfPassing}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Percentage / CGPA</label>
              <input
                type="text"
                name="percentageOrCgpa"
                placeholder="e.g. 92.4% or 3.9/4.0"
                value={formData.percentageOrCgpa}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-brand-700"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="block font-semibold text-slate-700">Personal Background & Interests</label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself, research experience, and key interests..."
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfilePage;
