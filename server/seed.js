require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Program = require('./models/Program');
const Application = require('./models/Application');
const Document = require('./models/Document');
const Payment = require('./models/Payment');
const Notification = require('./models/Notification');
const { samplePrograms } = require('./utils/seedData');

const seedDatabase = async () => {
  try {
    console.log('--- Starting University Admission Portal Database Seeding ---');
    await connectDB();

    // 1. Check or Seed Admin
    const adminEmail = 'rajh36073@gmail.com';
    let admin = await User.findOne({ email: { $in: ['rajh36073@gmail.com', 'rahj36073@gmail.com'] } });

    if (!admin) {
      admin = await User.create({
        name: 'Harshit (Chief Admissions Officer)',
        email: adminEmail,
        password: 'harshit@500',
        role: 'admin',
        department: 'Admissions Office',
        phone: '+91 98765 43210',
        status: 'active',
      });
      console.log(` Created Admin Account: ${admin.email} (Role: ${admin.role})`);
    } else {
      admin.email = adminEmail;
      admin.password = 'harshit@500';
      await admin.save();
      console.log(` Admin account synchronized to ${adminEmail}.`);
    }

    // 2. Check or Seed Faculty Members
    const faculty1Email = 'faculty@nexis.edu';
    let faculty1 = await User.findOne({ email: faculty1Email });
    if (!faculty1) {
      faculty1 = await User.create({
        name: 'Prof. Elena Rostova',
        email: faculty1Email,
        password: 'faculty@500',
        role: 'faculty',
        department: 'Computer Science',
        phone: '+1 617-555-0199',
        status: 'active',
      });
      console.log(` Created Faculty Account: ${faculty1.email} (Dept: ${faculty1.department})`);
    }

    // IEM Faculty
    const iemFacultyEmail = 'faculty@iem.edu.in';
    let iemFaculty = await User.findOne({ email: iemFacultyEmail });
    if (!iemFaculty) {
      iemFaculty = await User.create({
        name: 'Prof. S. Chatterjee',
        email: iemFacultyEmail,
        password: 'faculty@500',
        role: 'faculty',
        department: 'Computer Science',
        phone: '+91 98310 12345',
        status: 'active',
      });
      console.log(` Created IEM Faculty Account: ${iemFaculty.email}`);
    }

    const faculty2Email = 'business.faculty@nexis.edu';
    let faculty2 = await User.findOne({ email: faculty2Email });
    if (!faculty2) {
      faculty2 = await User.create({
        name: 'Dr. Marcus Sterling',
        email: faculty2Email,
        password: 'faculty@500',
        role: 'faculty',
        department: 'Business & Management',
        phone: '+1 617-555-0144',
        status: 'active',
      });
      console.log(` Created Faculty Account: ${faculty2.email} (Dept: ${faculty2.department})`);
    }

    // 3. Check or Seed Sample Student
    const studentEmail = 'student@nexis.edu';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Aarav Sharma',
        email: studentEmail,
        password: 'student@500',
        role: 'student',
        phone: '+91 98111 22334',
        status: 'active',
      });

      await StudentProfile.create({
        user: student._id,
        dateOfBirth: new Date('2003-05-14'),
        gender: 'Male',
        nationality: 'Indian',
        passportOrIdNumber: 'P8920192',
        address: {
          street: '42 Orchid Heights, Sector 18',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
          zipCode: '560001',
        },
        emergencyContact: {
          name: 'Rajesh Sharma',
          relationship: 'Father',
          phone: '+91 98111 22330',
          email: 'rajesh.sharma@example.com',
        },
        academicHistory: [
          {
            level: 'Senior Secondary (12th Grade)',
            institution: 'National Public School',
            boardOrUniversity: 'CBSE',
            yearOfPassing: 2022,
            percentageOrCgpa: '94.6%',
            majorSubjects: 'Physics, Chemistry, Mathematics, Computer Science',
          },
          {
            level: 'Secondary School (10th Grade)',
            institution: 'National Public School',
            boardOrUniversity: 'CBSE',
            yearOfPassing: 2020,
            percentageOrCgpa: '96.2%',
            majorSubjects: 'Science, Mathematics, Social Studies, English',
          },
        ],
        standardizedTests: [
          {
            testName: 'SAT',
            score: '1480 / 1600',
            testDate: new Date('2023-11-10'),
            registrationNumber: 'SAT-992011',
          },
        ],
        bio: 'Aspiring AI engineer with passion for machine learning, competitive algorithms, and open source development. Looking to pursue cutting-edge research in autonomous systems.',
        profileCompletion: 100,
      });
      console.log(` Created Sample Student: ${student.email}`);
    }

    const iemStudentEmail = 'student@iem.edu.in';
    let iemStudent = await User.findOne({ email: iemStudentEmail });
    if (!iemStudent) {
      iemStudent = await User.create({
        name: 'Aarav Sharma',
        email: iemStudentEmail,
        password: 'student@500',
        role: 'student',
        phone: '+91 98111 22334',
        status: 'active',
      });
      await StudentProfile.create({
        user: iemStudent._id,
        dateOfBirth: new Date('2003-05-14'),
        gender: 'Male',
        nationality: 'Indian',
        passportOrIdNumber: 'P8920192',
        address: {
          street: '42 Orchid Heights, Sector 18',
          city: 'Kolkata',
          state: 'West Bengal',
          zipCode: '700091',
          country: 'India',
        },
        emergencyContact: {
          name: 'Rajesh Sharma',
          relationship: 'Father',
          phone: '+91 98111 99887',
          email: 'rajesh.sharma@example.com',
        },
      });
      console.log(` Created IEM Student Account: ${iemStudent.email}`);
    }

    // 4. Seed Programs
    const existingProgramsCount = await Program.countDocuments();
    let seededPrograms = [];
    if (existingProgramsCount === 0) {
      seededPrograms = await Program.insertMany(samplePrograms);
      console.log(` Seeded ${seededPrograms.length} academic programs.`);
    } else {
      seededPrograms = await Program.find();
      console.log(` Programs already exist (${existingProgramsCount} found).`);
    }

    // 5. Check or Seed Sample Application for student
    const existingApps = await Application.countDocuments({ student: student._id });
    if (existingApps === 0 && seededPrograms.length > 0) {
      const targetProgram = seededPrograms[0]; // CSAI-BTECH

      // Create sample documents
      const doc1 = await Document.create({
        student: student._id,
        documentType: 'high_school_marksheet',
        title: 'Senior Secondary Grade Sheet (12th)',
        fileName: 'marksheet-12th-sample.pdf',
        originalName: 'Class_12_Marksheet_Aarav.pdf',
        fileUrl: '/uploads/sample_transcript.pdf',
        fileSize: 1024 * 450,
        mimeType: 'application/pdf',
        status: 'verified',
        verificationNotes: 'Official board seal verified. Score matches submitted profile.',
        verifiedBy: faculty1._id,
        verifiedAt: new Date(),
      });

      const doc2 = await Document.create({
        student: student._id,
        documentType: 'id_proof',
        title: 'National Identity / Passport Copy',
        fileName: 'passport-sample.pdf',
        originalName: 'Passport_Copy_Aarav.pdf',
        fileUrl: '/uploads/sample_id.pdf',
        fileSize: 1024 * 280,
        mimeType: 'application/pdf',
        status: 'verified',
        verificationNotes: 'Valid identification document.',
        verifiedBy: faculty1._id,
        verifiedAt: new Date(),
      });

      // Create Application first
      const application = await Application.create({
        applicationNumber: 'APP-2026-784102',
        student: student._id,
        program: targetProgram._id,
        status: 'Under Review',
        intakeTerm: 'Fall 2026',
        currentStep: 5,
        personalInfo: {
          fullName: student.name,
          email: student.email,
          phone: student.phone,
          dateOfBirth: new Date('2003-05-14'),
          gender: 'Male',
          nationality: 'Indian',
          address: {
            street: '42 Orchid Heights',
            city: 'Bengaluru',
            state: 'Karnataka',
            country: 'India',
            zipCode: '560001',
          },
        },
        academicInfo: {
          highestQualification: 'Senior Secondary (12th Grade)',
          institution: 'National Public School',
          boardOrUniversity: 'CBSE',
          graduationYear: 2022,
          cgpaOrPercentage: '94.6%',
          majorSubject: 'Computer Science & Mathematics',
          statementOfPurpose: 'Ever since building my first neural network classifier in high school, I have been captivated by the potential of artificial intelligence to revolutionize medical imaging and climate analytics. Institute of Engineering & Management (IEM) offers world-class lab facilities and exceptional mentorship that aligns perfectly with my aspirations.',
        },
        documents: [doc1._id, doc2._id],
        paymentStatus: 'paid',
        evaluation: {
          evaluatedBy: faculty1._id,
          evaluatedAt: new Date(),
          academicScore: 92,
          interviewScore: 88,
          statementScore: 95,
          totalScore: 92,
          recommendation: 'recommend',
          interviewNotes: 'Candidate demonstrated exemplary comprehension of data structures and neural architectures.',
          comments: 'High potential applicant. Recommended for scholarship consideration.',
        },
        statusHistory: [
          { status: 'Draft', updatedBy: student._id, note: 'Draft started' },
          { status: 'Submitted', updatedBy: student._id, note: 'Application submitted with payment' },
          { status: 'Under Review', updatedBy: faculty1._id, note: 'Assigned to Computer Science admissions committee' },
        ],
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });

      // Create sample payment with application reference
      const payment = await Payment.create({
        application: application._id,
        student: student._id,
        amount: targetProgram.applicationFee,
        currency: targetProgram.currency,
        transactionId: 'TXN-NX-2026-98124',
        receiptNumber: 'REC-2026-44019',
        paymentMethod: 'Credit Card',
        status: 'success',
        billingDetails: {
          name: student.name,
          email: student.email,
          last4: '4242',
          bankName: 'HDFC Bank Global',
        },
      });

      // Link payment and documents to application
      application.payment = payment._id;
      await application.save();

      doc1.application = application._id;
      await doc1.save();
      doc2.application = application._id;
      await doc2.save();

      // Create welcome notification
      await Notification.create({
        recipient: student._id,
        title: 'Welcome to IEM Admissions Portal! 🎓',
        message: 'Your portal account is active. Explore degree programs and track your application status anytime.',
        type: 'announcement',
      });

      console.log(` Seeded sample application ${application.applicationNumber} for Aarav Sharma.`);
    }

    console.log('--- Database Seeding Completed Successfully! ---');
    console.log(' Default Logins:');
    console.log('   Admin:   rajh36073@gmail.com / harshit@500');
    console.log('   Faculty: faculty@iem.edu.in / faculty@500');
    console.log('   Student: student@iem.edu.in / student@500');
  } catch (error) {
    console.error('Error during database seed:', error);
  }
};

// If run directly via node seed.js
if (require.main === module) {
  seedDatabase().then(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

module.exports = seedDatabase;
