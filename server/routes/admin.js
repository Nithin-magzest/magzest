const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

// Stats overview
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [students, counselors] = await Promise.all([
      User.find({ role: 'student' }),
      User.find({ role: 'counselor' }),
    ]);
    const totalApplications = students.reduce((sum, s) => sum + (s.applications?.length || 0), 0);
    const activeStudents = students.filter(s => s.status === 'active').length;
    res.json({ totalStudents: students.length, totalCounselors: counselors.length, totalApplications, activeStudents });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// List all counselors
router.get('/counselors', authMiddleware, adminOnly, async (req, res) => {
  try {
    const counselors = await User.find({ role: 'counselor' }).select('-password');
    res.json(counselors.map(c => c.toJSON()));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create counselor (admin only)
router.post('/counselors', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password, specialization, experience } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const counselor = new User({
      name, email: email.toLowerCase(), password: hashed, role: 'counselor',
      specialization: specialization || [], assignedStudents: [], experience: experience || 0,
    });
    await counselor.save();
    const obj = counselor.toJSON();
    delete obj.password;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Update counselor
router.put('/counselors/:id', authMiddleware, adminOnly, async (req, res) => {
  const { password, role, _id, ...updates } = req.body;
  try {
    const counselor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'counselor' },
      updates, { new: true }
    ).select('-password');
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' });
    res.json(counselor.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete counselor
router.delete('/counselors/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, role: 'counselor' });
    res.json({ message: 'Counselor deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create student (admin only)
router.post('/students', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password, phone, nationality, educationLevel, gpa, englishScore, budget, preferredCountries, interestedCourses, counselorId } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  try {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const student = new User({
      name, email: email.toLowerCase(), password: hashed, role: 'student',
      phone: phone || '', nationality: nationality || '', educationLevel: educationLevel || '',
      gpa: gpa || null, englishScore: englishScore || undefined,
      budget: budget || null, preferredCountries: preferredCountries || [],
      interestedCourses: interestedCourses || [], status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    });
    await student.save();
    if (counselorId) {
      await User.findByIdAndUpdate(counselorId, { $push: { assignedStudents: student._id.toString() } });
    }
    const obj = student.toJSON();
    delete obj.password;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// List all students
router.get('/students', authMiddleware, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students.map(s => s.toJSON()));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student status
router.put('/students/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { status }, { new: true }
    ).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/students/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    res.json({ message: 'Student deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// List all applications across all students
router.get('/applications', authMiddleware, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    const applications = [];
    for (const student of students) {
      for (const app of (student.applications || [])) {
        const appObj = app.toJSON ? app.toJSON() : app;
        applications.push({
          ...appObj,
          studentId: student._id.toString(),
          studentName: student.name,
          studentEmail: student.email,
          studentNationality: student.nationality,
        });
      }
    }
    res.json(applications);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (admin only)
router.put('/applications/:studentId/:appId', authMiddleware, adminOnly, async (req, res) => {
  const { status, notes } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    const update = { 'applications.$.updatedDate': today };
    if (status) update['applications.$.status'] = status;
    if (notes !== undefined) update['applications.$.notes'] = notes;

    const student = await User.findOneAndUpdate(
      { _id: req.params.studentId, 'applications._id': req.params.appId },
      { $set: update },
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Application not found' });

    const app = student.applications.id(req.params.appId);
    const appObj = app.toJSON ? app.toJSON() : app;
    res.json({
      ...appObj,
      studentId: student._id.toString(),
      studentName: student.name,
      studentEmail: student.email,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
