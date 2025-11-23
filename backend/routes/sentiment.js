// backend/routes/sentiment.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const Feedback = require('../models/feedback'); // adjust path if your file is named differently

// Python ML service URL (can set process.env.PYTHON_ML_URL)
const PYTHON_ML_URL = process.env.PYTHON_ML_URL || 'http://127.0.0.1:5001';

// POST /api/sentiment/predict
router.post('/predict', async (req, res) => {
  try {
    const { text, userId, section, category } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text required' });
    }

    // forward to python ML service
    let pyResp;
    try {
      pyResp = await axios.post(`${PYTHON_ML_URL}/predict`, { text }, { timeout: 15000 });
    } catch (e) {
      console.error('Error calling Python ML service:', e?.response?.data ?? e.message ?? e);
      return res.status(502).json({ error: 'ML service unreachable', details: e?.response?.data ?? String(e) });
    }

    const label = pyResp.data?.label ?? null;
    const probabilities = pyResp.data?.probabilities ?? null;

    if (!label) {
      return res.status(500).json({ error: 'no label from ML service', details: pyResp.data });
    }

    // normalize fields: prefer category if provided, else section
    const cat = category || section || 'general';
    const sec = section || category || 'general';

    // save to MongoDB: store both names for compatibility
    try {
      const fb = new Feedback({
        userId: userId || null,
        category: cat,
        section: sec,
        text,
        sentiment: String(label),
        label: String(label),
        probabilities: probabilities || {},
        createdAt: new Date()
      });
      await fb.save();
      return res.json({ ok: true, label, probabilities, id: fb._id });
    } catch (dbErr) {
      console.error('DB save error:', dbErr);
      // still return prediction result but indicate DB save failed
      return res.status(200).json({ ok: false, label, probabilities, dbError: String(dbErr) });
    }
  } catch (err) {
    console.error('Error /api/sentiment/predict:', err?.response?.data ?? err.message ?? err);
    return res.status(500).json({ error: 'prediction failed', details: err?.response?.data ?? err.message });
  }
});

module.exports = router;
