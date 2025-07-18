const { validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const getLessonPage = async (req, res) => {
   try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        req.flash('error_msg', 'Course not found');
        return res.redirect('/dashboard');
      }
      
      res.render('admin/create-lesson', { course });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error loading page');
      res.redirect('/dashboard');
    }
}

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
    const { title, videoUrl, order, resourceLinks } = req.body;

    const lesson = await Lesson.create({
      title,
      videoUrl,
      order: parseInt(order),
      course: req.params.id,
      resourceLinks: resourceLinks ? JSON.parse(resourceLinks) : [],
    });

    await Course.findByIdAndUpdate(req.params.id, {
      $addToSet: { lessons: lesson._id },
    });

    req.flash("success_msg", "Lesson created successfully");
    res.redirect(`/courses/${req.params.id}/manage`);
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Failed to create lesson");
    res.redirect(`/courses/${req.params.id}/lessons/create`);
  }
};

module.exports = {
  getLessonsByCourse,
  createLesson,
  getLessonPage
};