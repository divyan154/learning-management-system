const { validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to access quizzes' });
    }

    const quizzes = await Quiz.find({ course: courseId })
      .select('title description passingScore timeLimit questions.text questions.options.text');

    res.json({
      message: 'Quizzes retrieved successfully',
      quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error while fetching quizzes' });
  }
};

const createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, questions, course, passingScore, timeLimit } = req.body;

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Process questions to ensure proper format
    const processedQuestions = questions.map(question => {
      const options = question.options.map((option, index) => ({
        text: option.text,
        isCorrect: index === question.correctAnswer
      }));

      return {
        text: question.text,
        options,
        correctAnswer: question.correctAnswer
      };
    });

    const quiz = await Quiz.create({
      title,
      description,
      questions: processedQuestions,
      course,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 30
    });

    // Add quiz to course
    await Course.findByIdAndUpdate(course, {
      $addToSet: { quizzes: quiz._id }
    });

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error while creating quiz' });
  }
};

const attemptQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: quizId } = req.params;
    const { answers } = req.body;

    // Get quiz with questions
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: quiz.course
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to attempt this quiz' });
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedOption;
      
      if (isCorrect) correctAnswers++;

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Save attempt to enrollment
    const quizAttempt = {
      quiz: quizId,
      score,
      answers: processedAnswers,
      attemptedAt: new Date()
    };

    await Enrollment.findByIdAndUpdate(enrollment._id, {
      $push: { quizAttempts: quizAttempt }
    });

    res.json({
      message: 'Quiz submitted successfully',
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      passed: score >= quiz.passingScore
    });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    res.status(500).json({ message: 'Server error while submitting quiz' });
  }
};

module.exports = {
  getQuizzesByCourse,
  createQuiz,
  attemptQuiz
};