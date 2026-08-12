const express = require('express');
const router = express.Router();
const { generateSummary, getSummaries, deleteSummary } = require('../controllers/summaryController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Protect note summaries

router.post('/summarize', generateSummary);
router.get('/', getSummaries);
router.delete('/:id', deleteSummary);

module.exports = router;
