const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'PayPal Simulator', 'Test Card Gateway'],
      default: 'Credit Card',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending', 'refunded'],
      default: 'success',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    billingDetails: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      last4: { type: String, default: '4242' },
      bankName: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
