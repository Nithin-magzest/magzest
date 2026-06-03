const mongoose = require('mongoose');

const EnglishScoreSchema = new mongoose.Schema(
  { type: { type: String }, score: Number },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema({
  studentId: String,
  universityId: String,
  universityName: String,
  courseId: String,
  courseName: String,
  status: { type: String, default: 'draft' },
  submittedDate: String,
  updatedDate: String,
  notes: String,
  intake: String,
  rejectedFrom: String,
});

const DocumentSchema = new mongoose.Schema({
  name: String,
  type: String,
  uploadedDate: String,
  status: { type: String, default: 'pending' },
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  phone: String,
  nationality: String,
  educationLevel: String,
  gpa: Number,
  englishScore: EnglishScoreSchema,
  preferredCountries: [String],
  budget: Number,
  interestedCourses: [String],
  applications: [ApplicationSchema],
  documents: [DocumentSchema],
  counselorId: String,
  joinedDate: String,
  status: { type: String, default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
