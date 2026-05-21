const express = require('express');
const mongoose = require('mongoose');
const University = require('../models/University');

const router = express.Router();

function dbReady(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: 'Database not ready — please wait a moment and retry' });
    return false;
  }
  return true;
}

router.get('/', async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const unis = await University.find({});
    res.json(unis);
  } catch (err) {
    console.error('GET /api/universities error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const uni = await University.findOne({ id: req.params.id });
    if (!uni) return res.status(404).json({ message: 'University not found' });
    res.json(uni);
  } catch (err) {
    console.error('GET /api/universities/:id error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;
