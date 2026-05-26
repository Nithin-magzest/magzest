const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const University = require('../models/University');

const router = express.Router();

// Auto-fill university details by name using Wikipedia + Hipolabs
router.get('/autofill', async (req, res) => {
  const name = (req.query.name || '').trim();
  if (!name) return res.status(400).json({ message: 'name query param required' });

  try {
    // 1. Hipolabs — basic info: country, website, domain
    const hipoRes = await axios.get('http://universities.hipolabs.com/search', {
      params: { name }, timeout: 8000,
    }).catch(() => null);

    const hipoList = hipoRes?.data || [];
    // Pick closest match (prefer exact, fallback to first)
    const hipo = hipoList.find(u => u.name.toLowerCase() === name.toLowerCase()) || hipoList[0] || null;

    // 2. Wikipedia summary
    const wikiTitle = name.replace(/ /g, '_');
    const wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`, {
      timeout: 8000,
      headers: { 'User-Agent': 'EduAbroad/1.0 (university-info-fetcher; contact@eduabroad.com)' },
    }).catch(() => null);

    const wiki = wikiRes?.data;
    const description = (wiki?.extract || '').slice(0, 400);

    // 3. Build website & logo from hipo data
    const website = hipo?.web_pages?.[0]?.replace(/\/$/, '') || '';
    const domain = hipo?.domains?.[0] || (website ? new URL(website).hostname.replace('www.', '') : '');
    const logo = domain ? `https://logo.clearbit.com/${domain}` : '';

    // 4. Guess country-based currency
    const countryCurrency = {
      'United States': 'USD', 'United Kingdom': 'GBP', 'Canada': 'CAD',
      'Australia': 'AUD', 'Germany': 'EUR', 'Netherlands': 'EUR',
      'France': 'EUR', 'Singapore': 'SGD', 'New Zealand': 'NZD',
      'Sweden': 'SEK', 'Switzerland': 'CHF', 'Japan': 'JPY',
    };
    const country = hipo?.country || '';
    const currency = countryCurrency[country] || 'USD';

    res.json({
      name: hipo?.name || name,
      country,
      website,
      logo,
      description: description.trim(),
      avgCurrency: currency,
    });
  } catch (err) {
    console.error('autofill error:', err.message);
    res.status(500).json({ message: 'Failed to fetch university details' });
  }
});

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
