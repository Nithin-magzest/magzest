const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  id: String,
  name: String,
  level: String,
  duration: String,
  tuitionFee: Number,
  currency: String,
  requirements: [String],
  description: String,
  department: String,
  intake: [String],
});

const UniversitySchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  country: String,
  city: String,
  logo: String,
  coverImage: String,
  ranking: Number,
  type: String,
  founded: Number,
  website: String,
  description: String,
  courses: [CourseSchema],
  facilities: [String],
  scholarships: [{
    name: String, amount: Number, currency: String, eligibility: String, deadline: String,
  }],
  applicationDeadlines: [{ intake: String, deadline: String }],
  averageFees: { undergraduate: Number, postgraduate: Number, currency: String },
  acceptanceRate: Number,
  totalStudents: Number,
  internationalStudents: Number,
  rating: Number,
  tags: [String],
});

module.exports = mongoose.model('University', UniversitySchema);
