// backend/models/feedback.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  userId: { type: String, default: null },
  // store both names to be compatible with older frontend/backend
  category: { type: String, default: 'general' }, // existing field in DB
  section: { type: String, default: 'general' },  // alias (kept for compatibility)
  text: { type: String, required: true },
  // store both sentiment/label for compatibility
  sentiment: { type: String, default: 'neutral' }, // existing field in DB
  label: { type: String, default: 'neutral' },     // alias (kept for compatibility)
  probabilities: { type: Schema.Types.Mixed, default: {} },
  userName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// index on category/section for faster aggregation
FeedbackSchema.index({ category: 1, section: 1, createdAt: -1 });

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
