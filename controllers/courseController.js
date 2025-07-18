const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('lessons', 'title')
      .populate('quizzes', 'title')
      .select('-enrolledUsers');

    res.json({
      message: 'Courses retrieved successfully',
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lessons', 'title videoUrl resourceLinks order')
      .populate('quizzes', 'title description passingScore timeLimit');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course retrieved successfully',
      course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error while fetching course' });
  }
};

const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, instructor, price } = req.body;

    const course = await Course.create({
      title,
      description,
      instructor,
      price,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error while creating course' });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId
    });

    // Add user to course's enrolled users
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledUsers: userId }
    });

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title description instructor price')
      .sort({ enrolledAt: -1 });

    res.json({
      message: 'Enrolled courses retrieved successfully',
      enrollments
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error while fetching enrolled courses' });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  enrollInCourse,
  getEnrolledCourses
};