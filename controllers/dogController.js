// controllers/dogController.js — dog registration, listing, adoption, removal.

const Dog = require('../models/Dog');

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

async function register(req, res) {
  const { name, description } = req.body || {};
  if (!name || !description) {
    return res.status(400).json({ error: 'name and description are required' });
  }
  const dog = await Dog.create({ name, description, owner: req.userId });
  return res.status(201).json({ dog });
}

async function listRegistered(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { owner: req.userId };
  if (req.query.status === 'available' || req.query.status === 'adopted') {
    filter.status = req.query.status;
  }
  const [dogs, total] = await Promise.all([
    Dog.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Dog.countDocuments(filter)
  ]);
  return res.json({ dogs, page, limit, total });
}

async function listAdopted(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { adopter: req.userId };
  const [dogs, total] = await Promise.all([
    Dog.find(filter).skip(skip).limit(limit).sort({ adoptedAt: -1 }),
    Dog.countDocuments(filter)
  ]);
  return res.json({ dogs, page, limit, total });
}

async function adopt(req, res) {
  const { thankYouMessage } = req.body || {};
  if (!thankYouMessage) {
    return res.status(400).json({ error: 'thankYouMessage is required' });
  }
  const dog = await Dog.findById(req.params.id);
  if (!dog) return res.status(404).json({ error: 'Dog not found' });
  if (dog.status === 'adopted') return res.status(409).json({ error: 'Dog already adopted' });
  if (dog.owner.toString() === req.userId) {
    return res.status(403).json({ error: 'You cannot adopt your own dog' });
  }
  dog.status = 'adopted';
  dog.adopter = req.userId;
  dog.thankYouMessage = thankYouMessage;
  dog.adoptedAt = new Date();
  await dog.save();
  return res.json({ dog });
}

async function remove(req, res) {
  const dog = await Dog.findById(req.params.id);
  if (!dog) return res.status(404).json({ error: 'Dog not found' });
  if (dog.owner.toString() !== req.userId) {
    return res.status(403).json({ error: 'You can only remove dogs you registered' });
  }
  if (dog.status === 'adopted') {
    return res.status(409).json({ error: 'Adopted dogs cannot be removed' });
  }
  await dog.deleteOne();
  return res.json({ message: 'Dog removed' });
}

module.exports = { register, listRegistered, listAdopted, adopt, remove };
