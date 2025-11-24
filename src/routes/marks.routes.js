// src/routes/marks.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/marks.controller');


router.post('/', ctrl.createMark);
router.get('/', ctrl.getAllMarks);
router.get('/:id', ctrl.getMarkById);
router.put('/:id', ctrl.updateMark);
router.delete('/:id', ctrl.deleteMark);


module.exports = router;