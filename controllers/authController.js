// controllers/authController.js — register and login.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

async function register(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    const user = await User.register(username, password);
    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await user.checkPassword(password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ token: issueToken(user), user });
}

module.exports = { register, login };
