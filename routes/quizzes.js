const express = require('express');
const { body } = require('express-validator');
const quizController = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get quizzes for a course (authenticated users)
router.get('/course/:courseId', authenticate, quizController.getQuizzesByCourse);

// Create quiz (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('course').isMongoId().withMessage('Please provide a valid course ID'),
  body('questions').isArray({ min: 1 }).withMessage('Quiz must have at least one question'),
  body('questions.*.text').trim().isLength({ min: 5 }).withMessage('Question text must be at least 5 characters'),
  body('questions.*.options').isArray({ min: 2, max: 6 }).withMessage('Each question must have 2-6 options'),
  body('questions.*.correctAnswer').isInt({ min: 0 }).withMessage('Correct answer index is required'),
  body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
  body('timeLimit').optional().isInt({ min: 5 }).withMessage('Time limit must be at least 5 minutes')
], quizController.createQuiz);

// Attempt quiz (authenticated users)
router.post('/:id/attempt', authenticate, [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').isMongoId().withMessage('Question ID must be valid'),
  body('answers.*.selectedOption').isInt({ min: 0 }).withMessage('Selected option must be a valid index')
], quizController.attemptQuiz);

module.exports = router;