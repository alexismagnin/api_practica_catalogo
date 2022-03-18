const express = require('express');
const router = express.Router();
const handler = require('../controllers/politica.controller')

router.get('/', handler.getAll);

module.exports = router;
