const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Program code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree level is required'],
      enum: ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BBA', 'MBA', 'B.A.', 'M.A.', 'Ph.D', 'Diploma'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'], // e.g. "4 Years", "2 Years"
      default: '4 Years',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    eligibilityCriteria: [
      {
        type: String,
      },
    ],
    applicationFee: {
      type: Number,
      required: [true, 'Application fee is required'],
      min: 0,
      default: 50,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    seatCapacity: {
      type: Number,
      required: [true, 'Seat capacity is required'],
      min: 1,
      default: 60,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    intakeSeason: {
      type: String,
      required: true,
      default: 'Fall 2026',
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Program', programSchema);
