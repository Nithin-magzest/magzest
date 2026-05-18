import mongoose from 'mongoose';

const CounselorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'counselor' },
  specialization: [String],
  assignedStudents: [String],
  experience: Number,
}, { timestamps: true });

export default mongoose.model('Counselor', CounselorSchema);
