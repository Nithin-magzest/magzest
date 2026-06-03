const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all rooms for current user
router.get('/rooms', authMiddleware, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ participants: req.user.id.toString() });
    res.json(rooms.map(r => r.toJSON()));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single room
router.get('/rooms/:roomId', authMiddleware, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/rooms/:roomId/messages', authMiddleware, async (req, res) => {
  const { content, senderName } = req.body;
  try {
    const message = {
      senderId: req.user.id.toString(),
      senderName,
      senderRole: req.user.role,
      content,
      timestamp: new Date(),
      read: false,
    };
    const room = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      { $push: { messages: message } },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const newMsg = room.messages[room.messages.length - 1];

    // Notify other participants in real time
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    room.participants
      .filter(p => p !== req.user.id.toString())
      .forEach(pid => {
        const sid = userSockets.get(String(pid));
        if (sid) io.to(sid).emit('chat:new-message', { roomId: room.id });
      });

    res.json(newMsg.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Log a call event into the shared room
router.post('/rooms/call-log', authMiddleware, async (req, res) => {
  const { participantIds, callStatus, callDuration, callerName } = req.body;
  try {
    const room = await ChatRoom.findOne({
      participants: { $all: participantIds.map(String), $size: participantIds.length },
    });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const message = {
      senderId: req.user.id.toString(),
      senderName: callerName,
      senderRole: req.user.role,
      content: '',
      type: 'call',
      callStatus,
      callDuration: callDuration || 0,
      timestamp: new Date(),
      read: false,
    };
    const updated = await ChatRoom.findByIdAndUpdate(
      room._id,
      { $push: { messages: message } },
      { new: true }
    );
    const newMsg = updated.messages[updated.messages.length - 1];

    // Notify other participants in real time
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    updated.participants
      .filter(p => p !== req.user.id.toString())
      .forEach(pid => {
        const sid = userSockets.get(String(pid));
        if (sid) io.to(sid).emit('chat:new-message', { roomId: updated.id });
      });

    res.json(newMsg.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send file in chat (+ auto-handle offer letters)
router.post('/rooms/:roomId/files', authMiddleware, upload.single('file'), async (req, res) => {
  const { senderName, isOfferLetter } = req.body;
  try {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file?.originalname || 'File';
    const fileSize = req.file?.size || 0;
    const offerFlag = isOfferLetter === 'true';

    const message = {
      senderId: req.user.id.toString(),
      senderName,
      senderRole: req.user.role,
      content: fileName,
      type: 'file',
      fileUrl,
      fileName,
      fileSize,
      isOfferLetter: offerFlag,
      timestamp: new Date(),
      read: false,
    };

    const room = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      { $push: { messages: message } },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const newMsg = room.messages[room.messages.length - 1];

    // If offer letter: auto-save to student's documents + update application status
    if (offerFlag && req.user.role === 'counselor') {
      const studentId = room.participants.find(p => p !== req.user.id.toString());
      if (studentId) {
        const doc = {
          name: 'Offer Letter',
          type: 'Offer Letter',
          url: fileUrl,
          uploadedDate: new Date().toISOString().split('T')[0],
          status: 'verified',
        };
        await User.findByIdAndUpdate(studentId, { $push: { documents: doc } });

        const student = await User.findById(studentId);
        const activeApp = student?.applications?.find(a =>
          !['offer_received', 'accepted', 'rejected', 'enrolled'].includes(a.status)
        );
        if (activeApp) {
          await User.updateOne(
            { _id: studentId, 'applications._id': activeApp._id },
            { $set: { 'applications.$.status': 'offer_received', 'applications.$.offerLetterUrl': fileUrl, 'applications.$.updatedDate': new Date().toISOString() } }
          );
        }
      }
    }

    // If student sends a doc, save to their own documents too
    if (!offerFlag && req.user.role === 'student' && fileUrl) {
      const doc = {
        name: fileName,
        type: 'Other',
        url: fileUrl,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      await User.findByIdAndUpdate(req.user.id, { $push: { documents: doc } });
    }

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    room.participants
      .filter(p => p !== req.user.id.toString())
      .forEach(pid => {
        const sid = userSockets.get(String(pid));
        if (sid) io.to(sid).emit('chat:new-message', { roomId: room.id });
      });

    res.json(newMsg.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Schedule a meeting
router.post('/rooms/:roomId/meetings', authMiddleware, async (req, res) => {
  const { senderName, meetingDate, meetingTime, meetingNotes } = req.body;
  try {
    const message = {
      senderId: req.user.id.toString(),
      senderName,
      senderRole: req.user.role,
      content: `Meeting on ${meetingDate} at ${meetingTime}`,
      type: 'meeting',
      meetingDate,
      meetingTime,
      meetingNotes: meetingNotes || '',
      timestamp: new Date(),
      read: false,
    };

    const room = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      { $push: { messages: message } },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const newMsg = room.messages[room.messages.length - 1];

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    room.participants
      .filter(p => p !== req.user.id.toString())
      .forEach(pid => {
        const sid = userSockets.get(String(pid));
        if (sid) io.to(sid).emit('chat:new-message', { roomId: room.id });
      });

    res.json(newMsg.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all messages from others as read
router.put('/rooms/:roomId/read', authMiddleware, async (req, res) => {
  try {
    await ChatRoom.updateOne(
      { _id: req.params.roomId },
      { $set: { 'messages.$[elem].read': true } },
      { arrayFilters: [{ 'elem.senderId': { $ne: req.user.id.toString() } }] }
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or get existing room
router.post('/rooms', authMiddleware, async (req, res) => {
  const { participantIds, participantNames } = req.body;
  try {
    const existing = await ChatRoom.findOne({ participants: { $all: participantIds, $size: participantIds.length } });
    if (existing) return res.json(existing.toJSON());
    const room = await ChatRoom.create({ participants: participantIds, participantNames, messages: [] });
    res.json(room.toJSON());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
