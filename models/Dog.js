// models/Dog.js — Mongoose dog model.
//
// Status moves from 'available' (when registered) to 'adopted' (after a
// successful adoption). The adopter and thank-you message are recorded once
// adoption happens.

const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'adopted'],
      default: 'available',
      index: true
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    thankYouMessage: { type: String, default: null },
    adoptedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dog', dogSchema);
