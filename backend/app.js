require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const sentimentRouter = require('./routes/sentiment');
const statsRouter = require('./routes/stats');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/sentiment', sentimentRouter);
app.use('/api/stats', statsRouter);

// mount sentiment route
const sentimentRoutes = require('./routes/sentiment');
app.use('/api/sentiment', sentimentRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/srm_happiness';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.get('/__debug/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().lean();
    res.json(users.map(u => ({ _id: u._id, email: u.email, name: u.name, passwordPreview: String(u.password).slice(0,6) })));
  } catch (err) {
    console.error('Debug users error', err);
    res.status(500).json({ message: 'error' });
  }
});

app.get('/__debug/feedbacks', async (req, res) => {
  try {
    const Feedback = require('./models/feedback');
    const items = await Feedback.find().sort({ createdAt: -1 }).lean();
    // return full server-side docs (internal fields visible here for debugging)
    res.json(items.map(it => ({
      _id: it._id,
      category: it.category,
      text: it.text,
      sentiment: it.sentiment,
      user: it.user,
      userName: it.userName,
      createdAt: it.createdAt
    })));
  } catch (err) {
    console.error('Debug feedbacks error', err);
    res.status(500).json({ message: 'error' });
  }
});
