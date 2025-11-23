/**
 * Run: npm run seed
 * This will insert sample feedback items for each category to populate the UI.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/srm_happiness';

const sampleFeedback = [
  { category: 'Academics', text: 'Faculty are very helpful and the labs are great.', timestamp: new Date(), sentiment_label: 'Positive', sentiment_score: 0.6 },
  { category: 'Academics', text: 'Too much coursework this semester, struggling to keep up.', timestamp: new Date(Date.now()-86400000*2), sentiment_label: 'Negative', sentiment_score: -0.5 },
  { category: 'Hostel', text: 'Rooms are clean and maintenance is prompt.', timestamp: new Date(), sentiment_label: 'Positive', sentiment_score: 0.5 },
  { category: 'Hostel', text: 'Water supply is irregular sometimes.', timestamp: new Date(Date.now()-86400000*3), sentiment_label: 'Neutral', sentiment_score: 0.0 },
  { category: 'Hostel Mess', text: 'Food quality has improved a lot!', timestamp: new Date(), sentiment_label: 'Positive', sentiment_score: 0.7 },
  { category: 'Transport', text: 'Buses are often late and crowded.', timestamp: new Date(), sentiment_label: 'Negative', sentiment_score: -0.6 },
  { category: 'Canteens', text: 'Good variety in canteen and pocket-friendly.', timestamp: new Date(), sentiment_label: 'Positive', sentiment_score: 0.4 },
  { category: 'Events', text: 'Events are engaging and inclusive.', timestamp: new Date(), sentiment_label: 'Positive', sentiment_score: 0.5 }
];

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB - seeding feedback');
    await Feedback.insertMany(sampleFeedback);
    console.log('Seeded sample feedback.');
    mongoose.disconnect();
  }).catch(err => {
    console.error('Seed failed', err);
  });
