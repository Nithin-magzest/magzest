const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const University = require('../models/University');
const authMiddleware = require('../middleware/auth');
const { checkEligibility } = require('../lib/eligibilityChecker');

const router = express.Router();

// Get applications
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const user = await User.findById(req.user.id).select('applications');
      return res.json(user?.applications || []);
    }
    if (req.user.role === 'counselor') {
      const students = await User.find({ role: 'student', counselorId: req.user.id }).select('applications name');
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
  if (!req.body.universityName || !req.body.courseName) {
    return res.status(400).json({ message: 'universityName and courseName are required' });
  }
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  try {
    const app = { ...req.body, studentId: req.user.id, submittedDate: today, updatedDate: now, status: 'submitted' };
    const user = await User.findByIdAndUpdate(req.user.id, { $push: { applications: app } }, { new: true }).select('-password');
    const newApp = user.applications[user.applications.length - 1];
    res.json(newApp.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to application
router.post('/:appId/comments', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });
  try {
    const poster = await User.findById(req.user.id).select('name role');
    const comment = { author: poster.name, authorRole: poster.role, text: text.trim() };
    const user = await User.findOneAndUpdate(
      { 'applications._id': req.params.appId },
      { $push: { 'applications.$.comments': comment } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Application not found' });
    const app = user.applications.find(a => a._id.toString() === req.params.appId);
    res.json(app.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
router.put('/:appId', authMiddleware, async (req, res) => {
  const { status, notes } = req.body;
  try {
    // Find current status before updating (to store rejectedFrom)
    const existing = await User.findOne({ 'applications._id': req.params.appId }).select('applications.$');
    const currentStatus = existing?.applications?.[0]?.status;

    const updateFields = { 'applications.$.status': status, 'applications.$.updatedDate': new Date().toISOString() };
    if (notes !== undefined) updateFields['applications.$.notes'] = notes;
    if (status === 'rejected' && currentStatus) updateFields['applications.$.rejectedFrom'] = currentStatus;

    const user = await User.findOneAndUpdate(
      { 'applications._id': req.params.appId },
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'Application not found' });
    const app = user.applications.find(a => a._id.toString() === req.params.appId);

    // Notify student in real-time via socket
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    if (io && userSockets && status) {
      const sids = userSockets.get(String(user._id));
      if (sids) {
        sids.forEach(sid => io.to(sid).emit('application:updated', {
          appId: req.params.appId,
          status,
          universityName: app.universityName,
          courseName: app.courseName,
        }));
      }
    }

    res.json(app.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check eligibility for all courses in a university (bulk)
router.post('/check-eligibility-bulk', authMiddleware, async (req, res) => {
  const { universityId, studentId } = req.body;
  if (!universityId) return res.status(400).json({ message: 'universityId required' });
  try {
    let student;
    if (req.user.role === 'student') {
      student = await User.findById(req.user.id).select('-password');
    } else if (studentId) {
      student = await User.findById(studentId).select('-password');
    } else {
      return res.status(400).json({ message: 'studentId required for non-student users' });
    }
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const query = { $or: [{ id: universityId }] };
    if (mongoose.isValidObjectId(universityId)) query.$or.push({ _id: universityId });
    const uni = await University.findOne(query);
    if (!uni) return res.status(404).json({ message: 'University not found' });

    const results = {};
    for (const course of uni.courses) {
      const key = course.id || course._id?.toString();
      results[key] = checkEligibility(student, course.requirements || []);
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Check eligibility for a single course
router.post('/check-eligibility', authMiddleware, async (req, res) => {
  const { universityId, courseId, studentId } = req.body;
  if (!universityId || !courseId) return res.status(400).json({ message: 'universityId and courseId required' });
  try {
    let student;
    if (req.user.role === 'student') {
      student = await User.findById(req.user.id).select('-password');
    } else if (studentId) {
      student = await User.findById(studentId).select('-password');
    } else {
      return res.status(400).json({ message: 'studentId required for non-student users' });
    }
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const query = { $or: [{ id: universityId }] };
    if (mongoose.isValidObjectId(universityId)) query.$or.push({ _id: universityId });
    const uni = await University.findOne(query);
    if (!uni) return res.status(404).json({ message: 'University not found' });

    const course = uni.courses.find(c => c.id === courseId || c._id?.toString() === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json(checkEligibility(student, course.requirements || []));
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;
