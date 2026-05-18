const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true },
});

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

// Share io and userSockets with route handlers
const userSockets = new Map(); // userId -> socketId
app.set('io', io);
app.set('userSockets', userSockets);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/students', require('./routes/students'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

// WebRTC signaling
io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSockets.set(String(userId), socket.id);
    socket.data.userId = String(userId);
  });

  const relay = (event, to, payload) => {
    const sid = userSockets.get(String(to));
    if (sid) io.to(sid).emit(event, payload);
  };

  socket.on('call:invite',  ({ to, from, fromName }) => relay('call:incoming', to, { from, fromName }));
  socket.on('call:accept',  ({ to, from })           => relay('call:accepted', to, { from }));
  socket.on('call:reject',  ({ to })                 => relay('call:rejected', to, {}));
  socket.on('call:end',     ({ to })                 => relay('call:ended',    to, {}));
  socket.on('call:offer',   ({ to, offer })           => relay('call:offer',   to, { offer, from: socket.data.userId }));
  socket.on('call:answer',  ({ to, answer })          => relay('call:answer',  to, { answer }));
  socket.on('call:ice',         ({ to, candidate })   => relay('call:ice',         to, { candidate }));
  socket.on('chat:call-logged', ({ to })              => relay('chat:call-logged', to, {}));

  socket.on('disconnect', () => {
    if (socket.data.userId) userSockets.delete(socket.data.userId);
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
