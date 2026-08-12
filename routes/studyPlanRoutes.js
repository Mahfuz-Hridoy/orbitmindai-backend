const express = require('express');
const router = express.Router();
const { generateStudyPlan, getStudyPlans, getStudyPlanById, deleteStudyPlan } = require('../controllers/studyPlanController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Protect all routes

router.post('/generate', generateStudyPlan);
router.get('/', getStudyPlans);
router.route('/:id')
  .get(getStudyPlanById)
  .delete(deleteStudyPlan);

module.exports = router;
