// routes/dogRoutes.js

const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const {
  register, listRegistered, listAdopted, adopt, remove
} = require('../controllers/dogController');

const router = express.Router();
router.use(requireAuth);

router.post('/', register);
router.get('/registered', listRegistered);
router.get('/adopted', listAdopted);
router.post('/:id/adopt', adopt);
router.delete('/:id', remove);

module.exports = router;
