// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');

// GET /api/stats/section/:section/counts
router.get('/section/:section/counts', async (req, res) => {
  try {
    const sectionParam = req.params.section || 'general';

    // match either category or section field
    const agg = await Feedback.aggregate([
      { $match: { $or: [ { category: sectionParam }, { section: sectionParam } ] } },
      { $group: { _id: { $toLower: '$sentiment' }, count: { $sum: 1 } } }
    ]);
    const counts = { positive: 0, neutral: 0, negative: 0 };
    agg.forEach(x => {
      const key = String(x._id || '').toLowerCase();
      if (key) counts[key] = x.count;
    });

    return res.json({ section: sectionParam, counts });
  } catch (err) {
    console.error('Stats endpoint error:', err);
    return res.status(500).json({ error: 'failed to get counts', details: err.message });
  }
});

module.exports = router;
