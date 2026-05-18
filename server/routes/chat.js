const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const authMiddleware = require('../middleware/auth');

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
