const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: String,
  type: String,
  uploadedDate: String,
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
});

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
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'counselor', 'admin'], required: true },

  // Student fields
  phone: String,
  nationality: String,
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

  // Counselor fields
  specialization: [String],
  assignedStudents: [String],
  experience: Number,
}, { timestamps: true });

UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
