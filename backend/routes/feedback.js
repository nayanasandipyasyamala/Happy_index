const express = require('express');
const jwt = require('jsonwebtoken');
const Feedback = require('../models/feedback');
const User = require('../models/User');

const router = express.Router();
console.log('Feedback routes mounted');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// helper to extract token (tolerant)
function extractToken(req) {
  const auth = req.get('authorization') || req.get('Authorization') || '';
  if (!auth) return null;
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return auth;
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    console.log('requireAuth: missing token');
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.log('requireAuth: token invalid', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// POST create feedback (requires auth)
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('POST /api/feedback body:', req.body);
    console.log('Authenticated user payload:', req.user);

    const { category, text } = req.body;
    if (!category || !text) return res.status(400).json({ message: 'Missing fields' });

    // lookup user name if token provided
    let userName;
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id).select('name').lean();
      if (user) userName = user.name;
    }

    // simple sentiment stub (server-side); replace with real analyzer if available
    let sentiment = 'neutral';
    const t = String(text).toLowerCase();
    if (t.match(/\b(good|great|excellent|awesome|love|happy)\b/)) sentiment = 'positive';
    else if (t.match(/\b(bad|terrible|awful|hate|poor|sad)\b/)) sentiment = 'negative';

    const fb = await Feedback.create({
      category,
      text,
      sentiment,
      user: req.user?.id,
      userName
    });

    console.log('Saved feedback id=', fb._id.toString(), 'sentiment=', sentiment, 'userNamePresent=', !!userName);

    // return anonymized object for public UI
    return res.status(201).json({
      id: fb._id,
      category: fb.category,
      text: fb.text,
      sentiment: fb.sentiment,
      timestamp: fb.timestamp || fb.createdAt
    });
  } catch (err) {
    console.error('Feedback create error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET list feedbacks (public, anonymized)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = String(category);

    const items = await Feedback.find(filter).sort({ createdAt: -1 }).limit(200).lean();

    const publicItems = items.map((it) => ({
      id: it._id,
      category: it.category,
      text: it.text,
      sentiment: it.sentiment,
      timestamp: it.timestamp || it.createdAt
    }));

    return res.json(publicItems);
  } catch (err) {
    console.error('Feedback list error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
