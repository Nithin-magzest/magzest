const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: String,
  type: String,
  url: String,
  uploadedDate: String,
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
});

const CommentSchema = new mongoose.Schema({
  author: String,
  authorRole: String,
  text: { type: String, required: true },
}, { timestamps: true });

const ApplicationSchema = new mongoose.Schema({
  studentId: String,
  universityId: String,
  universityName: String,
  courseId: String,
  courseName: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'offer_received', 'accepted', 'rejected', 'enrolled'],
    default: 'submitted',
  },
  submittedDate: String,
  updatedDate: String,
  notes: String,
  intake: String,
  offerLetterUrl: String,
  rejectedFrom: String,

  // Application details
  studyMode: String,
  scholarshipInterest: Boolean,

  // Personal info
  dateOfBirth: String,
  gender: String,
  passportNumber: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },

  // Academic background
  educationLevel: String,
  previousInstitution: String,
  previousDegree: String,
  previousMajor: String,
  graduationYear: String,
  percentage: String,

  // English proficiency
  englishTest: {
    type: { type: String },
    score: Number,
    testDate: String,
  },

  // Financial
  fundingSource: String,
  sponsorName: String,

  // Statement of purpose
  whyCourse: String,
  careerGoals: String,
  whyUniversity: String,

  // Documents checklist
  documentsChecklist: {
    passport: Boolean,
    transcripts: Boolean,
    degreeCertificate: Boolean,
    englishCertificate: Boolean,
    bankStatement: Boolean,
    referenceLetters: Boolean,
    sop: Boolean,
  },

  comments: [CommentSchema],
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['student', 'counselor', 'admin'], required: true },
  isAppTeam: { type: Boolean, default: false },
  // Social login provider IDs
  googleId: { type: String, sparse: true },
  githubId: { type: String, sparse: true },
  facebookId: { type: String, sparse: true },
  avatar: String,

  // Student fields
  phone: String,
  nationality: String,
  dateOfBirth: String,
  gender: String,
  maritalStatus: String,
  placeOfBirth: String,
  passport: {
    number: String,
    issueDate: String,
    expiryDate: String,
    issuingCountry: String,
  },
  educationLevel: String,
  gpa: Number,
  englishScore: { type: { type: String, enum: ['IELTS', 'TOEFL', 'PTE', 'Duolingo'] }, score: Number },
  preferredCountries: [String],
  budget: Number,
  interestedCourses: [String],
  applications: [ApplicationSchema],
  documents: [DocumentSchema],
  counselorId: String,
  joinedDate: String,
  status: { type: String, enum: ['active', 'inactive', 'enrolled'], default: 'active' },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Counselor fields
  specialization: [String],
  assignedStudents: [String],
  experience: Number,
  title: String,
  bio: String,
  languages: [String],
  certifications: [String],
  linkedIn: String,
  website: String,
  dateOfBirth: String,
  gender: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  educationBackground: {
    degree: String,
    institution: String,
    graduationYear: String,
  },
}, { timestamps: true });

UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
