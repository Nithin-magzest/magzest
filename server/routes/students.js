const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

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
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toJSON());
  } catch (err) {
    console.error('[GET /students/me]', err);
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

// Add document (student only) — accepts multipart/form-data with optional file
router.post('/me/documents', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  const { name, type, url: preExistingUrl } = req.body;
  const url = req.file ? `/uploads/${req.file.filename}` : (preExistingUrl || undefined);
  const docName = (name || req.file?.originalname || 'Document').trim();
  try {
    const doc = { name: docName, type: type || 'Other', url, uploadedDate: new Date().toISOString().split('T')[0], status: 'pending' };
    const user = await User.findByIdAndUpdate(req.user.id, { $push: { documents: doc } }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const newDoc = user.documents[user.documents.length - 1];
    res.json(newDoc.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete own document (student)
router.delete('/me/documents/:docId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { documents: { _id: req.params.docId } } });
    res.json({ message: 'Document deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new student (counselor only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'counselor') return res.status(403).json({ message: 'Forbidden' });
  const { password, role, _id, ...data } = req.body;
  if (!data.name || !data.email) return res.status(400).json({ message: 'Name and email are required' });
  try {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('student123', 10);
    const student = new User({ ...data, email: data.email.toLowerCase(), password: hashed, role: 'student' });
    await student.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { assignedStudents: student._id.toString() } });
    const obj = student.toJSON();
    delete obj.password;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Get student by ID (counselor or admin)
router.get('/:id', authMiddleware, async (req, res) => {
  if (!['counselor', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
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
