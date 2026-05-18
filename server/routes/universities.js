const express = require('express');
const University = require('../models/University');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const unis = await University.find({});
    res.json(unis);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const uni = await University.findOne({ id: req.params.id });
    if (!uni) return res.status(404).json({ message: 'University not found' });
    res.json(uni);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
