// app.js — Dog Adoption Platform entry point.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const dogRoutes = require('./routes/dogRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/dogs', dogRoutes);

app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

async function start() {
  await db.connect(process.env.MONGODB_URI);
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Dog adoption API listening on ${port}`));
}

if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
}

module.exports = { app, db };
