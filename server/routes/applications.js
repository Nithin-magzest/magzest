const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get applications
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const user = await User.findById(req.user.id).select('applications');
      return res.json(user?.applications || []);
    }
    if (req.user.role === 'counselor') {
      const students = await User.find({ role: 'student' }).select('applications name');
      const apps = students.flatMap(s =>
        s.applications.map(a => ({ ...a.toJSON(), studentName: s.name, studentId: s._id }))
      );
      return res.json(apps);
    }
    res.json([]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create application (student only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  const today = new Date().toISOString().split('T')[0];
  try {
    const app = { ...req.body, studentId: req.user.id, submittedDate: today, updatedDate: today, status: 'submitted' };
    const user = await User.findByIdAndUpdate(req.user.id, { $push: { applications: app } }, { new: true }).select('-password');
    const newApp = user.applications[user.applications.length - 1];
    res.json(newApp.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
router.put('/:appId', authMiddleware, async (req, res) => {
  const { status, notes } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    const updateFields = { 'applications.$.status': status, 'applications.$.updatedDate': today };
    if (notes !== undefined) updateFields['applications.$.notes'] = notes;

    const user = await User.findOneAndUpdate(
      { 'applications._id': req.params.appId },
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'Application not found' });
    const app = user.applications.find(a => a._id.toString() === req.params.appId);
    res.json(app.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
