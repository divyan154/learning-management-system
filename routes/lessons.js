const express = require('express');
const { body } = require('express-validator');
const lessonController = require('../controllers/lessonController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get lessons for a course (authenticated users)
router.get('/course/:courseId', authenticate, lessonController.getLessonsByCourse);

// Create lesson (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('videoUrl').isURL().withMessage('Please enter a valid video URL'),
  body('course').isMongoId().withMessage('Please provide a valid course ID'),
  body('order').isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('resourceLinks.*.title').optional().trim().isLength({ min: 1 }).withMessage('Resource title is required'),
  body('resourceLinks.*.url').optional().isURL().withMessage('Resource URL must be valid')
], lessonController.createLesson);

module.exports = router;