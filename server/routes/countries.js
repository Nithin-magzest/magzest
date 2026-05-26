const express = require('express');
const mongoose = require('mongoose');
const Country = require('../models/Country');

const router = express.Router();

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not ready' });
  }
  try {
    const countries = await Country.find({}).sort({ name: 1 });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
