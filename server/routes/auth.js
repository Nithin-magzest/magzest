const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const University = require('../models/University');
const authMiddleware = require('../middleware/auth');

function createMailer() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const router = express.Router();

function issueToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function sanitize(user) {
  const obj = user.toJSON();
  delete obj.password;
  return obj;
}

async function findOrCreateSocialUser({ providerId, providerField, email, name, avatar }) {
  let user = await User.findOne({ [providerField]: providerId });
  if (!user && email) user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = new User({
      name,
      email: email ? email.toLowerCase() : `${providerId}@social.gradzest`,
      [providerField]: providerId,
      avatar,
      role: 'student',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    });
  } else {
    if (!user[providerField]) user[providerField] = providerId;
    if (avatar && !user.avatar) user.avatar = avatar;
  }
  await user.save();
  return user;
}

// Google OAuth — supports both credential JWT (implicit flow) and access token flow
router.post('/google', async (req, res) => {
  const { credential, accessToken, userInfo } = req.body || {};

  if (!credential && !accessToken) {
    return res.status(400).json({ message: 'Google credential or accessToken required' });
  }

  try {
    let googleId, email, name, picture;

    if (credential) {
      // ID token flow — verify with google-auth-library
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) return res.status(501).json({ message: 'Google OAuth not configured on this server' });
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
      const payload = ticket.getPayload();
      ({ sub: googleId, email, name, picture } = payload);
    } else {
      // Access token flow — verify by calling Google's userinfo endpoint
      if (userInfo && userInfo.sub) {
        // Use pre-fetched userInfo from frontend to avoid extra round-trip
        ({ sub: googleId, email, name, picture } = userInfo);
      } else {
        const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        ({ sub: googleId, email, name, picture } = profileRes.data);
      }
    }

    const user = await findOrCreateSocialUser({
      providerId: googleId,
      providerField: 'googleId',
      email,
      name,
      avatar: picture,
    });

    res.json({ token: issueToken(user), user: sanitize(user) });
  } catch (err) {
    console.error('[auth/google]', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// GitHub OAuth step 1 — redirect to GitHub
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(501).json({ message: 'GitHub OAuth not configured on this server' });
  const redirect = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  res.redirect(redirect);
});

// GitHub OAuth step 2 — callback with code
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!clientId || !clientSecret) return res.redirect(`${frontendUrl}/login?error=github_not_configured`);

  try {
    // Exchange code for access token
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return res.redirect(`${frontendUrl}/login?error=github_token_failed`);

    // Fetch user profile
    const [profileRes, emailsRes] = await Promise.all([
      axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } }),
      axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}` } }),
    ]);

    const { id: githubId, name, login, avatar_url } = profileRes.data;
    const primaryEmail = emailsRes.data.find(e => e.primary && e.verified)?.email
      || emailsRes.data[0]?.email
      || null;

    const user = await findOrCreateSocialUser({
      providerId: String(githubId),
      providerField: 'githubId',
      email: primaryEmail,
      name: name || login,
      avatar: avatar_url,
    });

    const token = issueToken(user);
    // Redirect back to frontend with token in query param (frontend reads and stores it)
    res.redirect(`${frontendUrl}/login?social_token=${token}&role=${user.role}`);
  } catch (err) {
    console.error('[auth/github/callback]', err);
    res.redirect(`${frontendUrl}/login?error=github_failed`);
  }
});

// Facebook OAuth — verify access token from FB JS SDK
router.post('/facebook', async (req, res) => {
  const { accessToken: fbToken, userId: fbUserId } = req.body || {};
  if (!fbToken || !fbUserId) return res.status(400).json({ message: 'Facebook token and userId required' });

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) return res.status(501).json({ message: 'Facebook OAuth not configured on this server' });

  try {
    // Verify token with Facebook
    const verifyRes = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${fbToken}&access_token=${appId}|${appSecret}`
    );
    if (!verifyRes.data.data?.is_valid) return res.status(401).json({ message: 'Invalid Facebook token' });

    // Get profile
    const profileRes = await axios.get(
      `https://graph.facebook.com/${fbUserId}?fields=id,name,email,picture&access_token=${fbToken}`
    );
    const { id: facebookId, name, email, picture } = profileRes.data;

    const user = await findOrCreateSocialUser({
      providerId: facebookId,
      providerField: 'facebookId',
      email,
      name,
      avatar: picture?.data?.url,
    });

    res.json({ token: issueToken(user), user: sanitize(user) });
  } catch (err) {
    console.error('[auth/facebook]', err);
    res.status(401).json({ message: 'Facebook authentication failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toJSON();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userObj = user.toJSON();

    // Enrich student applications that are missing universityName/courseName
    if (userObj.role === 'student' && Array.isArray(userObj.applications)) {
      const missingIds = [...new Set(
        userObj.applications
          .filter(a => !a.universityName && a.universityId)
          .map(a => a.universityId)
      )];

      if (missingIds.length > 0) {
        const unis = await University.find({
          $or: [{ _id: { $in: missingIds } }, { id: { $in: missingIds } }]
        }).select('_id id name courses');
        const uniMap = {};
        unis.forEach(u => {
          uniMap[u._id.toString()] = u;
          if (u.id) uniMap[u.id] = u;
        });

        userObj.applications = userObj.applications.map(app => {
          if (!app.universityName && app.universityId) {
            const uni = uniMap[app.universityId.toString()] || uniMap[app.universityId];
            if (uni) {
              app.universityName = uni.name;
              if (!app.courseName && app.courseId) {
                const course = (uni.courses || []).find(c =>
                  c._id?.toString() === app.courseId?.toString() || c.id === app.courseId
                );
                if (course) {
                  app.courseName = course.name;
                  if (!app.intake && course.intake?.length) app.intake = course.intake[0];
                }
              }
            }
          }
          return app;
        });
      }
    }

    res.json(userObj);
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, phone, nationality } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name, email: email.toLowerCase(), password: hashed, role: 'student',
      phone: phone || '', nationality: nationality || '',
      status: 'active', joinedDate: new Date().toISOString().split('T')[0],
    });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toJSON();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await createMailer().sendMail({
        from: `"GradZest" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Reset your GradZest password',
        html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p><p>— The GradZest Team</p>`,
      });
    } catch (mailErr) {
      console.error('[auth/forgot-password] mail error:', mailErr.message);
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[auth/forgot-password]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  try {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('[auth/reset-password]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
