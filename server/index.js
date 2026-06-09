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
if (!process.env.SMTP_PASS) {
  console.warn('[warn] SMTP_PASS is not set — emails will not be delivered. Set SMTP_PASS in server/.env to enable email features.');
}

const { connectDB } = require('./db');
const { initActivityLogger } = require('./middleware/logActivity');

const app = express();
const httpServer = createServer(app);
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Share io and userSockets with route handlers
const userSockets = new Map(); // userId -> Set<socketId>
app.set('io', io);
app.set('userSockets', userSockets);

// Nodemailer transporter — configure SMTP credentials in server/.env
const nodemailer = require('nodemailer');
const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT)  || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'nithin@magzest.in',
    pass: process.env.SMTP_PASS || '',
  },
});

app.set('mailer', mailer);

// Public email subscription / free registration
const Subscriber = require('./models/Subscriber');
app.post('/api/subscribe', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const name  = (req.body.name  || '').trim();
  const phone = (req.body.phone || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Already subscribed' });

    const sub = await Subscriber.create({ name, email, phone });

    // Notify all connected admin sockets
    io.to('admin-room').emit('admin:new_subscriber', {
      name:         sub.name,
      email:        sub.email,
      phone:        sub.phone,
      subscribedAt: sub.subscribedAt,
    });

    // Send thank-you email to the new subscriber
    const greeting = sub.name ? `Hi ${sub.name},` : 'Hello,';
    mailer.sendMail({
      from:    '"Gradzest" <nithin@magzest.in>',
      to:      sub.email,
      subject: 'Thank you for registering with Gradzest!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
          <div style="background:#3b0764;padding:32px 24px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">Gradzest</h1>
            <p style="color:#e9d5ff;margin:8px 0 0;font-size:13px;">Your Global Education Partner</p>
          </div>
          <div style="background:#fff;padding:32px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <p style="font-size:16px;">${greeting}</p>
            <p style="font-size:15px;line-height:1.6;">
              Thank you for registering with <strong>Gradzest</strong>! We're thrilled to have you on board.
            </p>
            <p style="font-size:15px;line-height:1.6;">
              Our team will reach out to you shortly to discuss how we can help you achieve your study-abroad goals.
            </p>
            <div style="margin:28px 0;padding:20px;background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:4px;">
              <p style="margin:0;font-size:14px;color:#5b21b6;">
                <strong>What happens next?</strong><br/>
                A Gradzest counselor will contact you to understand your preferences and guide you through the best university options worldwide.
              </p>
            </div>
            <p style="font-size:14px;color:#6b7280;">
              If you have any questions, simply reply to this email — we're always happy to help.
            </p>
            <p style="font-size:15px;margin-top:24px;">
              Warm regards,<br/>
              <strong>The Gradzest Team</strong>
            </p>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
            © ${new Date().getFullYear()} Gradzest · nithin@magzest.in
          </p>
        </div>
      `,
    }).catch(err => console.error('[mailer] thank-you email failed:', err.message));

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Give the activity logger access to the socket server
initActivityLogger(io);

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
app.use('/api/unilogo', require('./routes/unilogo'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));

// WebRTC signaling
io.on('connection', (socket) => {
  socket.on('register', async (userId) => {
    const uid = String(userId);
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);
    socket.data.userId = uid;
    try {
      const User = require('./models/User');
      const user = await User.findById(userId).select('role');
      if (user?.role === 'admin') socket.join('admin-room');
    } catch {}
  });

  const relay = (event, to, payload) => {
    const sids = userSockets.get(String(to));
    if (sids) sids.forEach(sid => io.to(sid).emit(event, payload));
  };

  socket.on('call:invite',  ({ to, from, fromName, fromRole, callType }) => relay('call:incoming', to, { from, fromName, fromRole, callType }));
  socket.on('call:accept',  ({ to, from })           => relay('call:accepted', to, { from }));
  socket.on('call:reject',  ({ to })                 => relay('call:rejected', to, {}));
  socket.on('call:end',     ({ to })                 => relay('call:ended',    to, {}));
  socket.on('call:offer',   ({ to, offer })           => relay('call:offer',   to, { offer, from: socket.data.userId }));
  socket.on('call:answer',  ({ to, answer })          => relay('call:answer',  to, { answer }));
  socket.on('call:ice',         ({ to, candidate })   => relay('call:ice',         to, { candidate }));
  socket.on('chat:call-logged', ({ to })              => relay('chat:call-logged', to, {}));

  socket.on('disconnect', () => {
    if (socket.data.userId) {
      const sids = userSockets.get(socket.data.userId);
      if (sids) {
        sids.delete(socket.id);
        if (sids.size === 0) userSockets.delete(socket.data.userId);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function autoSeedIfEmpty() {
  const User = require('./models/User');
  const University = require('./models/University');
  const Country = require('./models/Country');
  const { universityData, countryData } = require('./seed');

  // Insert new universities/countries from seed data without overwriting existing (admin-enriched) records
  for (const u of universityData) {
    await University.updateOne({ id: u.id }, { $setOnInsert: u }, { upsert: true });
  }
  for (const c of countryData) {
    await Country.updateOne({ id: c.id }, { $setOnInsert: c }, { upsert: true });
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
