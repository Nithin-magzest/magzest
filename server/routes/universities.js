const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const University = require('../models/University');

const router = express.Router();

const WIKI_HEADERS = { 'User-Agent': 'EduAbroad/1.0 (university-info-fetcher; contact@eduabroad.com)' };

// Returns true for URLs that are SVG files or Wikipedia thumbnails of SVG originals
function isSvgUrl(url) {
  return /\.svg(\?|$)/i.test(url) || /\.svg\//i.test(url);
}

const KNOWN_COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'China', 'Japan', 'South Korea',
  'New Zealand', 'Sweden', 'Switzerland', 'Netherlands', 'Ireland',
  'Malaysia', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal',
];

const COUNTRY_CURRENCY = {
  'United States': 'USD', 'United Kingdom': 'GBP', 'Canada': 'CAD',
  'Australia': 'AUD', 'Germany': 'EUR', 'Netherlands': 'EUR',
  'France': 'EUR', 'Singapore': 'SGD', 'New Zealand': 'NZD',
  'Sweden': 'SEK', 'Switzerland': 'CHF', 'Japan': 'JPY',
  'India': 'INR', 'South Korea': 'KRW', 'China': 'CNY',
  'Malaysia': 'MYR', 'Ireland': 'EUR',
};

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

    // 2. Wikipedia summary for description + short description
    const wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`, {
      timeout: 8000, headers: WIKI_HEADERS,
    }).catch(() => null);
    const wiki = wikiRes?.data;
    const description = (wiki?.extract || '').slice(0, 400);
    // wiki.description is the short Wikidata tagline, e.g. "private university in Andhra Pradesh, India"
    const wikiShort = wiki?.description || '';

    // 3. Determine country — Hipolabs first, then detect from Wikipedia description
    let country = hipo?.country || '';
    if (!country) {
      const searchText = (wikiShort + ' ' + description).toLowerCase();
      for (const c of KNOWN_COUNTRIES) {
        if (searchText.includes(c.toLowerCase())) { country = c; break; }
      }
    }

    // 4. Wikipedia media-list — find a real campus photo (not logos/coats of arms/SVGs)
    let coverImage = '';
    const mediaRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/media-list/${wikiTitle}`, {
      timeout: 8000, headers: WIKI_HEADERS,
    }).catch(() => null);

    if (mediaRes?.data?.items) {
      const skipWords = ['coat', 'seal', 'logo', 'flag', 'badge', 'emblem', 'crest', 'shield', 'arms', 'map', 'location'];
      for (const item of mediaRes.data.items) {
        if (item.type !== 'image') continue;
        const titleLower = (item.title || item.caption || '').toLowerCase();
        if (skipWords.some(w => titleLower.includes(w))) continue;
        const srcs = item.srcset || [];
        const src = srcs[srcs.length - 1]?.src || srcs[0]?.src || '';
        const fullSrc = src.startsWith('//') ? 'https:' + src : src;
        // Skip SVGs and Wikipedia thumbnails of SVG originals (e.g. file.svg.png pattern)
        if (!fullSrc || isSvgUrl(fullSrc)) continue;
        coverImage = fullSrc;
        break;
      }
    }

    // Fallback: Wikipedia summary thumbnail — only if it's not SVG-based
    if (!coverImage) {
      const thumb = wiki?.originalimage?.source || wiki?.thumbnail?.source || '';
      if (thumb && !isSvgUrl(thumb)) coverImage = thumb;
    }

    // 5. Build domain — Hipolabs first, then Wikipedia external links
    const website = hipo?.web_pages?.[0]?.replace(/\/$/, '') || '';
    let domain = hipo?.domains?.[0] || '';
    if (!domain && website) {
      try { domain = new URL(website).hostname.replace('www.', ''); } catch {}
    }

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
          if (!skipDomains.some(s => h.includes(s)) && (h.includes('.edu') || h.includes('.ac.') || h.endsWith('.in') || h.endsWith('.org'))) {
            domain = h;
            break;
          }
        } catch {}
      }
    }

    const logo = domain ? `https://logo.clearbit.com/${domain}` : '';
    const logoFallback = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
    const currency = COUNTRY_CURRENCY[country] || 'USD';

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
