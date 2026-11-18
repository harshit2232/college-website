const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Verified', 'Approved', 'Rejected', 'Waitlisted'],
      default: 'Draft',
    },
    currentStep: {
      type: Number,
      default: 1, // 1: Program info, 2: Personal info, 3: Academic & Statement, 4: Documents, 5: Payment & Finalize
    },
    intakeTerm: {
      type: String,
      default: 'Fall 2026',
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      dateOfBirth: { type: Date },
      gender: { type: String, default: '' },
      nationality: { type: String, default: '' },
      address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        zipCode: { type: String, default: '' },
      },
      emergencyContact: {
        name: { type: String, default: '' },
        relation: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
    },
    academicInfo: {
      highestQualification: { type: String, default: '' },
      institution: { type: String, default: '' },
      boardOrUniversity: { type: String, default: '' },
      graduationYear: { type: Number },
      cgpaOrPercentage: { type: String, default: '' },
      majorSubject: { type: String, default: '' },
      standardizedTest: {
        name: { type: String, default: '' },
        score: { type: String, default: '' },
        examDate: { type: Date },
      },
      statementOfPurpose: { type: String, default: '' },
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    evaluation: {
      evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      evaluatedAt: {
        type: Date,
        default: null,
      },
      academicScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      interviewScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      statementScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      totalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      recommendation: {
        type: String,
        enum: ['pending', 'recommend', 'reject', 'waitlist', 'need_info'],
        default: 'pending',
      },
      interviewNotes: {
        type: String,
        default: '',
      },
      comments: {
        type: String,
        default: '',
      },
      interviewDate: {
        type: Date,
        default: null,
      },
    },
    statusHistory: [statusHistorySchema],
    submittedAt: {
      type: Date,
      default: null,
    },
    decisionDate: {
      type: Date,
      default: null,
    },
    admissionOfferNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Application', applicationSchema);
