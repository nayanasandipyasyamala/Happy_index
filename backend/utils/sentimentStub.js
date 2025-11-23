// Simple rule-based sentiment stub.
// Returns { score: -1..1, label: 'Positive'|'Neutral'|'Negative' }

// This is intentionally simple and deterministic so the scaffold works offline.
// Replace the exported function with ML model inference later.

const positiveWords = ['good','great','excellent','amazing','love','loved','nice','pleasant','happy','satisfied','best','enjoyed'];
const negativeWords = ['bad','terrible','awful','hate','hated','worst','disappointed','dirty','delay','problem','angry','sick','unhappy'];

function polarity(text) {
  if (!text) return { score: 0, label: 'Neutral' };
  const t = text.toLowerCase();
  let score = 0;
  positiveWords.forEach(w => { if (t.includes(w)) score += 1; });
  negativeWords.forEach(w => { if (t.includes(w)) score -= 1; });

  // normalize by length of text (rough)
  const lenAdj = Math.min(5, Math.max(1, Math.floor(t.split(/\s+/).length / 5)));
  score = score / (2 * lenAdj);

  // clamp
  if (score > 1) score = 1;
  if (score < -1) score = -1;

  // map to labels
  let label = 'Neutral';
  if (score >= 0.15) label = 'Positive';
  else if (score <= -0.15) label = 'Negative';

  return { score: parseFloat(score.toFixed(3)), label };
}

module.exports = { polarity };
