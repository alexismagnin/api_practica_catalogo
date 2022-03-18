const express = require('express');
const router = express.Router();
const handler = require('../controllers/usuario.controller')

router.get('/', handler.getAll);
router.get('/:id/roles', handler.getUserRoles);
router.post('/', handler.add);
router.put('/:id', handler.update)

module.exports = router;