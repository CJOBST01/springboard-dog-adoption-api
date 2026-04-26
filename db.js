// db.js — thin Mongoose connection helper.

const mongoose = require('mongoose');

async function connect(uri) {
  return mongoose.connect(uri);
}

async function disconnect() {
  return mongoose.disconnect();
}

module.exports = { connect, disconnect };
