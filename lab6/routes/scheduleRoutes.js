const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/', scheduleController.getSchedule);
router.post('/create', scheduleController.createGame);
router.put('/update/:id', scheduleController.updateGame);
router.post('/delete/:id', scheduleController.deleteGame);
router.post('/record-result/:id', scheduleController.recordGameResult);
router.get('/:id/edit', scheduleController.getGameForEdit);

module.exports = router;