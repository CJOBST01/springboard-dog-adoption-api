// models/User.js — Mongoose user model with bcrypt-hashed passwords.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.statics.register = async function (username, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  return this.create({ username, passwordHash });
};

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_, ret) { delete ret.passwordHash; return ret; }
});

module.exports = mongoose.model('User', userSchema);
