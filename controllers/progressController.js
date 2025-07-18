const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Get lesson to find course
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: lesson.course
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course' });
    }

    // Check if lesson is already completed
    const existingCompletion = enrollment.completedLessons.find(
      completion => completion.lesson.toString() === lessonId
    );

    if (existingCompletion) {
      return res.status(400).json({ message: 'Lesson already completed' });
    }

    // Mark lesson as completed
    enrollment.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date()
    });

    // Calculate new progress
    const totalLessons = await Lesson.countDocuments({ course: lesson.course });
    const completedLessons = enrollment.completedLessons.length;
    const newProgress = Math.round((completedLessons / totalLessons) * 100);

    enrollment.progress = newProgress;
    await enrollment.save();

    res.json({
      message: 'Lesson marked as completed',
      progress: newProgress,
      completedLessons,
      totalLessons
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({ message: 'Server error while marking lesson complete' });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    })
    .populate('completedLessons.lesson', 'title order')
    .populate('quizAttempts.quiz', 'title');

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedLessons = enrollment.completedLessons.length;

    // Get best quiz scores
    const quizScores = {};
    enrollment.quizAttempts.forEach(attempt => {
      const quizId = attempt.quiz._id.toString();
      if (!quizScores[quizId] || attempt.score > quizScores[quizId]) {
        quizScores[quizId] = attempt.score;
      }
    });

    res.json({
      message: 'Course progress retrieved successfully',
      progress: {
        overall: enrollment.progress,
        completedLessons,
        totalLessons,
        completedLessonsList: enrollment.completedLessons,
        quizScores,
        enrolledAt: enrollment.enrolledAt
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ message: 'Server error while fetching progress' });
  }
};

const getOverallProgress = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title instructor')
      .sort({ enrolledAt: -1 });

    const progressOverview = enrollments.map(enrollment => ({
      course: enrollment.course,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length,
      quizAttempts: enrollment.quizAttempts.length,
      enrolledAt: enrollment.enrolledAt
    }));

    res.json({
      message: 'Overall progress retrieved successfully',
      progressOverview
    });
  } catch (error) {
    console.error('Get overall progress error:', error);
    res.status(500).json({ message: 'Server error while fetching overall progress' });
  }
};

module.exports = {
  markLessonComplete,
  getCourseProgress,
  getOverallProgress
};