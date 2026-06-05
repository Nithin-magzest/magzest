const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

// Admin: list all meetings
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const meetings = await Meeting.find().sort({ scheduledDate: 1, scheduledTime: 1 });
      return res.json(meetings);
    }
    // Students and counselors see only their meetings
    const meetings = await Meeting.find({
      'participants.userId': req.user.id,
    }).sort({ scheduledDate: 1, scheduledTime: 1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin or Counselor: create meeting
router.post('/', auth, async (req, res) => {
  if (!['admin', 'counselor'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { title, scheduledDate, scheduledTime, duration, platform, meetingLink, participants, notes } = req.body;
    if (!title || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ message: 'Title, date, and time are required' });
    }
    let allParticipants = participants || [];
    let creatorName = req.user.name || '';
    // Auto-add counselor as participant and fetch their name
    if (req.user.role === 'counselor') {
      const alreadyIn = allParticipants.some(p => p.userId?.toString() === req.user.id?.toString());
      const User = require('../models/User');
      const self = await User.findById(req.user.id).select('name');
      creatorName = self?.name || req.user.name || '';
      if (!alreadyIn) {
        allParticipants = [{ userId: req.user.id, name: creatorName, role: 'counselor' }, ...allParticipants];
      }
    }
    const meeting = await Meeting.create({
      title, scheduledDate, scheduledTime,
      duration: duration || 60,
      platform: platform || 'other',
      meetingLink: meetingLink || '',
      participants: allParticipants,
      notes: notes || '',
      createdBy: req.user.id,
      createdByName: creatorName,
    });

    const isCallType = title.includes('📞');
    const callType = title.toLowerCase().includes('audio') ? 'audio' : 'video';

    // Notify each student participant via socket in real-time
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    if (io && userSockets) {
      allParticipants
        .filter(p => p.role === 'student')
        .forEach(p => {
          const sids = userSockets.get(String(p.userId));
          if (sids) {
            sids.forEach(sid => {
              // Always send meeting:scheduled
              io.to(sid).emit('meeting:scheduled', {
                _id: meeting._id,
                title,
                scheduledDate,
                scheduledTime,
                platform: platform || 'other',
                meetingLink: meetingLink || '',
                duration: meeting.duration,
                createdByName: creatorName,
              });
              // For call-type meetings also send call:scheduled with richer data
              if (isCallType) {
                io.to(sid).emit('call:scheduled', {
                  _id: meeting._id,
                  scheduledDate,
                  scheduledTime,
                  callType,
                  schedulerName: creatorName,
                  scheduledForName: p.name,
                });
              }
            });
          }
        });
    }

    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin or meeting creator: update meeting
router.put('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (req.user.role !== 'admin' && meeting.createdBy?.toString() !== req.user.id?.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updated = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Notify all participants (except the person making the update)
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    if (io && userSockets && updated) {
      updated.participants
        .filter(p => p.userId?.toString() !== req.user.id?.toString())
        .forEach(p => {
          const sids = userSockets.get(String(p.userId));
          if (sids) {
            sids.forEach(sid => io.to(sid).emit('meeting:updated', {
              _id:           updated._id,
              title:         updated.title,
              scheduledDate: updated.scheduledDate,
              scheduledTime: updated.scheduledTime,
              platform:      updated.platform,
              meetingLink:   updated.meetingLink,
              duration:      updated.duration,
            }));
          }
        });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin or meeting creator: delete meeting
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (req.user.role !== 'admin' && meeting.createdBy?.toString() !== req.user.id?.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
