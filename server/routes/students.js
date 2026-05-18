const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all students (counselor only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'counselor') return res.status(403).json({ message: 'Forbidden' });
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students.map(s => s.toJSON()));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current student profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current student profile
router.put('/me', authMiddleware, async (req, res) => {
  const { password, role, _id, ...updates } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add document (student only)
router.post('/me/documents', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  const { name, type } = req.body;
  try {
    const doc = { name, type, uploadedDate: new Date().toISOString().split('T')[0], status: 'pending' };
    const user = await User.findByIdAndUpdate(req.user.id, { $push: { documents: doc } }, { new: true }).select('-password');
    const newDoc = user.documents[user.documents.length - 1];
    res.json(newDoc.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new student (counselor only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'counselor') return res.status(403).json({ message: 'Forbidden' });
  const { password, role, _id, ...data } = req.body;
  try {
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('student123', 10);
    const student = new User({ ...data, password: hashed, role: 'student' });
    await student.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { assignedStudents: student._id.toString() } });
    res.status(201).json(student.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Get student by ID (counselor only)
router.get('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'counselor') return res.status(403).json({ message: 'Forbidden' });
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request document for student (counselor only)
router.post('/:id/documents', authMiddleware, async (req, res) => {
  if (req.user.role !== 'counselor') return res.status(403).json({ message: 'Forbidden' });
  const { name, type } = req.body;
  try {
    const doc = { name, type, uploadedDate: new Date().toISOString().split('T')[0], status: 'pending' };
    const user = await User.findByIdAndUpdate(req.params.id, { $push: { documents: doc } }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Student not found' });
    const newDoc = user.documents[user.documents.length - 1];
    res.json(newDoc.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document status (counselor only)
router.put('/:id/documents/:docId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'counselor') return res.status(403).json({ message: 'Forbidden' });
  const { status } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, 'documents._id': req.params.docId },
      { $set: { 'documents.$.status': status } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
