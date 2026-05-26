const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const University = require('../models/University');

const router = express.Router();

const WIKI_HEADERS = { 'User-Agent': 'EduAbroad/1.0 (university-info-fetcher; contact@eduabroad.com)' };

// Auto-fill university details by name using Wikipedia + Hipolabs
router.get('/autofill', async (req, res) => {
  const name = (req.query.name || '').trim();
  if (!name) return res.status(400).json({ message: 'name query param required' });

  const wikiTitle = name.replace(/ /g, '_');

  try {
    // 1. Hipolabs — basic info: country, website, domain
    const hipoRes = await axios.get('http://universities.hipolabs.com/search', {
      params: { name }, timeout: 8000,
    }).catch(() => null);
    const hipoList = hipoRes?.data || [];
    const hipo = hipoList.find(u => u.name.toLowerCase() === name.toLowerCase()) || hipoList[0] || null;

    // 2. Wikipedia summary for description
    const wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`, {
      timeout: 8000, headers: WIKI_HEADERS,
    }).catch(() => null);
    const wiki = wikiRes?.data;
    const description = (wiki?.extract || '').slice(0, 400);

    // 3. Wikipedia media-list — find a real campus photo (skip SVG coats of arms)
    let coverImage = '';
    const mediaRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/media-list/${wikiTitle}`, {
      timeout: 8000, headers: WIKI_HEADERS,
    }).catch(() => null);

    if (mediaRes?.data?.items) {
      const skipWords = ['coat', 'seal', 'logo', 'flag', 'badge', 'emblem', 'crest', 'shield', 'arms'];
      for (const item of mediaRes.data.items) {
        if (item.type !== 'image') continue;
        const titleLower = (item.title || item.caption || '').toLowerCase();
        if (skipWords.some(w => titleLower.includes(w))) continue;
        const srcs = item.srcset || [];
        const src = srcs[srcs.length - 1]?.src || srcs[0]?.src || '';
        const fullSrc = src.startsWith('//') ? 'https:' + src : src;
        if (!fullSrc || /\.svg(\?|$)/i.test(fullSrc)) continue;
        coverImage = fullSrc;
        break;
      }
    }

    // Fallback: Wikipedia summary thumbnail (skip SVG)
    if (!coverImage) {
      const thumb = wiki?.originalimage?.source || wiki?.thumbnail?.source || '';
      if (thumb && !/\.svg(\?|$)/i.test(thumb)) coverImage = thumb;
    }

    // 4. Build domain — try Hipolabs first, then Wikipedia external links
    const website = hipo?.web_pages?.[0]?.replace(/\/$/, '') || '';
    let domain = hipo?.domains?.[0] || '';
    if (!domain && website) {
      try { domain = new URL(website).hostname.replace('www.', ''); } catch {}
    }

    // If still no domain, scan Wikipedia external links for the official site
    if (!domain) {
      const extRes = await axios.get('https://en.wikipedia.org/w/api.php', {
        params: { action: 'query', titles: wikiTitle, prop: 'extlinks', ellimit: 30, format: 'json' },
        timeout: 8000, headers: WIKI_HEADERS,
      }).catch(() => null);
      const pages = extRes?.data?.query?.pages || {};
      const page = Object.values(pages)[0];
      const links = (page?.extlinks || []).map(l => l['*']);
      const skipDomains = ['wikipedia', 'facebook', 'twitter', 'linkedin', 'youtube', 'instagram', 'wikidata', 'wikimedia'];
      for (const link of links) {
        try {
          const h = new URL(link).hostname.replace('www.', '');
          if (!skipDomains.some(s => h.includes(s)) && (h.includes('.edu') || h.includes('.ac.') || h.endsWith('.in'))) {
            domain = h;
            break;
          }
        } catch {}
      }
    }

    const logo = domain ? `https://logo.clearbit.com/${domain}` : '';
    const logoFallback = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';

    const countryCurrency = {
      'United States': 'USD', 'United Kingdom': 'GBP', 'Canada': 'CAD',
      'Australia': 'AUD', 'Germany': 'EUR', 'Netherlands': 'EUR',
      'France': 'EUR', 'Singapore': 'SGD', 'New Zealand': 'NZD',
      'Sweden': 'SEK', 'Switzerland': 'CHF', 'Japan': 'JPY',
      'India': 'INR', 'South Korea': 'KRW', 'China': 'CNY',
    };
    const country = hipo?.country || '';
    const currency = countryCurrency[country] || 'USD';

    res.json({
      name: hipo?.name || name,
      country,
      website: website || (domain ? `https://www.${domain}` : ''),
      logo,
      logoFallback,
      coverImage,
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
