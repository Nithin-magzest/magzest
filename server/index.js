const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
  console.error('Missing required env vars: JWT_SECRET and MONGODB_URI must be set in server/.env');
  process.exit(1);
}

const { connectDB } = require('./db');

const app = express();
const httpServer = createServer(app);
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
];

const io = new Server(httpServer, {
  cors: { origin: DEV_ORIGINS, credentials: true },
});

app.use(cors({ origin: DEV_ORIGINS, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Share io and userSockets with route handlers
const userSockets = new Map(); // userId -> socketId
app.set('io', io);
app.set('userSockets', userSockets);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/students', require('./routes/students'));
app.use('/api/counselors', require('./routes/counselors'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/favicon', require('./routes/favicon'));

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

  socket.on('call:invite',  ({ to, from, fromName, callType }) => relay('call:incoming', to, { from, fromName, callType }));
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

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function autoSeedIfEmpty() {
  const User = require('./models/User');
  const University = require('./models/University');
  const Country = require('./models/Country');
  const { universityData, countryData } = require('./seed');

  // Always sync latest university and country data on startup
  for (const u of universityData) {
    await University.updateOne({ id: u.id }, { $set: u }, { upsert: true });
  }
  for (const c of countryData) {
    await Country.updateOne({ id: c.id }, { $set: c }, { upsert: true });
  }

  const count = await User.countDocuments();
  if (count === 0) {
    console.log('Database is empty — running full seed...');
    await require('./seed').run();
    console.log('Auto-seed complete.');
  }
}

connectDB().then(autoSeedIfEmpty).catch((err) => {
  console.error('[Startup] Fatal DB error:', err.message);
  process.exit(1);
});
