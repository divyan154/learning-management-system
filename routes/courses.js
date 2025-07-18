const express = require('express');
const { body } = require('express-validator');
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all courses (public)
router.get('/', courseController.getAllCourses);

router.get("/create", authorize("admin"), (req, res) => {
  res.render("admin/create-course");
});
// Get single course (public)
router.get('/:id', courseController.getCourse);


// Create course (admin only)
router.post('/create', authenticate, authorize('admin'), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('instructor').trim().isLength({ min: 2, max: 50 }).withMessage('Instructor name must be between 2 and 50 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number')
], courseController.createCourse);

// Enroll in course (authenticated users)
router.post('/:id/enroll', authenticate, courseController.enrollInCourse);


// Get enrolled courses (authenticated users)
router.get('/enrolled/my-courses', authenticate, courseController.getEnrolledCourses);
router.get("/:id/manage",authorize('admin'), courseController.manageCourse);
module.exports = router;