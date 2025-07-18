const express = require('express');
const { body } = require('express-validator');
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mark lesson as completed
router.post('/lesson/:lessonId/complete', authenticate, progressController.markLessonComplete);

// Get user's progress for a course
router.get('/course/:courseId', authenticate, progressController.getCourseProgress);

// Get user's overall progress
router.get('/overview', authenticate, progressController.getOverallProgress);

module.exports = router;