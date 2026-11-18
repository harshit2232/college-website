const mongoose = require('mongoose');

const academicHistorySchema = new mongoose.Schema({
  level: {
    type: String, // e.g. "High School (10th)", "Senior Secondary (12th)", "Undergraduate", "Postgraduate"
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  boardOrUniversity: {
    type: String,
    required: true,
  },
  yearOfPassing: {
    type: Number,
    required: true,
  },
  percentageOrCgpa: {
    type: String,
    required: true,
  },
  majorSubjects: {
    type: String,
    default: '',
  },
});

const standardizedTestSchema = new mongoose.Schema({
  testName: {
    type: String, // SAT, ACT, GRE, GMAT, TOEFL, IELTS, JEE, etc.
    required: true,
  },
  score: {
    type: String,
    required: true,
  },
  testDate: {
    type: Date,
  },
  registrationNumber: {
    type: String,
    default: '',
  },
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    nationality: {
      type: String,
      default: 'Indian',
    },
    passportOrIdNumber: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      zipCode: { type: String, default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    academicHistory: [academicHistorySchema],
    standardizedTests: [standardizedTestSchema],
    bio: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    profileCompletion: {
      type: Number,
      default: 20, // percentage calculated based on filled fields
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
