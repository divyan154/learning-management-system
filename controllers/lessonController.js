const { validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to access lessons' });
    }

    const lessons = await Lesson.find({ course: courseId })
      .sort({ order: 1 })
      .select('title videoUrl resourceLinks order');

    res.json({
      message: 'Lessons retrieved successfully',
      lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error while fetching lessons' });
  }
};

const createLesson = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, videoUrl, resourceLinks, course, order } = req.body;

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = await Lesson.create({
      title,
      videoUrl,
      resourceLinks: resourceLinks || [],
      course,
      order
    });

    // Add lesson to course
    await Course.findByIdAndUpdate(course, {
      $addToSet: { lessons: lesson._id }
    });

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Server error while creating lesson' });
  }
};

module.exports = {
  getLessonsByCourse,
  createLesson
};