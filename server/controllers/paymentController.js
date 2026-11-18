const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Program = require('../models/Program');
const Notification = require('../models/Notification');

// Helper to generate transaction ID and receipt number
const generateTxnId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TXN-NX-${ts}-${rand}`;
};

const generateReceiptNo = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `REC-${year}-${rand}`;
};

// @desc    Simulate / process application fee payment
// @route   POST /api/payments/simulate
// @access  Private (Student)
exports.simulatePayment = async (req, res, next) => {
  try {
    const { applicationId, paymentMethod, billingDetails } = req.body;

    const application = await Application.findById(applicationId).populate('program');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pay for this application.',
      });
    }

    if (application.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Application fee has already been paid for this application.',
      });
    }

    const feeAmount = application.program?.applicationFee || 1200;
    const currency = application.program?.currency || 'INR';

    const transactionId = generateTxnId();
    const receiptNumber = generateReceiptNo();

    const payment = await Payment.create({
      application: application._id,
      student: req.user.id,
      amount: feeAmount,
      currency: currency,
      transactionId,
      receiptNumber,
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'success',
      billingDetails: {
        name: billingDetails?.name || req.user.name,
        email: billingDetails?.email || req.user.email,
        address: billingDetails?.address || '',
        last4: billingDetails?.last4 || '4242',
        bankName: billingDetails?.bankName || 'IEM Payment Gateway',
      },
    });

    // Update application
    application.payment = payment._id;
    application.paymentStatus = 'paid';
    application.statusHistory.push({
      status: application.status,
      updatedBy: req.user.id,
      note: `Application fee of ${currency} ${feeAmount} paid successfully. Receipt: ${receiptNumber}`,
    });

    await application.save();

    // Trigger Notification
    await Notification.create({
      recipient: req.user.id,
      title: 'Payment Received! 💳',
      message: `Your payment of ${currency} ${feeAmount} for application ${application.applicationNumber} was successful. Transaction: ${transactionId}`,
      type: 'payment',
      relatedApplication: application._id,
      link: `/student/applications/${application._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully! Fee receipt generated.',
      payment,
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment receipt by application ID
// @route   GET /api/payments/application/:applicationId
// @access  Private
exports.getPaymentByApplication = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      application: req.params.applicationId,
    })
      .populate('application', 'applicationNumber intakeTerm')
      .populate('student', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment record found for this application.',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payment records (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('application', 'applicationNumber')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalRevenue,
      payments,
    });
  } catch (err) {
    next(err);
  }
};
