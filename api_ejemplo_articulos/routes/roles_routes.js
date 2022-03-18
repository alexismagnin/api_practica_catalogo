const express = require('express');
const router = express.Router();
const handler = require('../controllers/rol.controller')

router.get('/', handler.getAll);
router.post('/', handler.add);
router.put('/:id', handler.update)
router.delete('/:id', handler.delete) 

module.exports = router;