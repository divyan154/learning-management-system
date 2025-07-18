const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const { authorize, authenticate } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is logged in for web routes
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Please log in to access this page');
    return res.redirect('/login');
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    req.flash('error_msg', 'Admin access required');
    return res.redirect('/');
  }
  next();
};

// Home page
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().limit(6);
    res.render('index', { courses });
  } catch (error) {
    console.error(error);
    res.render('index', { courses: [] });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'Login successful');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server error');
    res.redirect('/login');
  }
});

// Handle register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'User already exists');
      return res.redirect('/register');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'Registration successful');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Registration failed');
    res.redirect('/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie("token"); 
  req.flash('success_msg', 'Logged out successfully');
  res.redirect('/');
});

// Dashboard
router.get('/dashboard',authenticate, async (req, res) => {
  // console.log(req.user);
  try {
    if (req.user.role === 'admin') {
      const courses = await Course.find({ createdBy: req.user.id });
      const totalUsers = await User.countDocuments();
      const totalCourses = await Course.countDocuments();
      
      res.render('dashboard/admin', { 
        courses, 
        totalUsers, 
        totalCourses 
      });
    } else {
      const enrollments = await Enrollment.find({ user: req.user.id })
        .populate('course');
      
      res.render('dashboard/user', { enrollments });
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
});

// Courses page
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.render('courses/index', { courses });
  } catch (error) {
    console.error(error);
    res.render('courses/index', { courses: [] });
  }
});


// Create course page (admin only)
router.get('/courses/create', requireAdmin, (req, res) => {
  res.render('admin/create-course.ejs');
});


// Single course page
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lessons')
      .populate('quizzes');
     console.log("Course found:", course);
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/courses');
    }
  
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: req.params.id
      });
    }

    res.render('courses/show', { course, enrollment });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading course');
    res.redirect('/courses');
  }
});

// Enroll in course
router.post('/courses/:id/enroll', authenticate, async (req, res) => {
  try {
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    });

    if (existingEnrollment) {
      req.flash('error_msg', 'Already enrolled in this course');
      return res.redirect(`/courses/${req.params.id}`);
    }

    await Enrollment.create({
      user: req.user.id,
      course: req.params.id
    });

    req.flash('success_msg', 'Successfully enrolled in course');
    res.redirect(`/courses/${req.params.id}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Enrollment failed');
    res.redirect(`/courses/${req.params.id}`);
  }
});



// Handle create course
router.post('/courses/create', requireAdmin, async (req, res) => {
  try {
    const { title, description, instructor, price } = req.body;
    
    await Course.create({
      title,
      description,
      instructor,
      price: parseFloat(price),
      createdBy: req.user.id
    });

    req.flash('success_msg', 'Course created successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Failed to create course');
    res.redirect('/courses/create');
  }
});

// Manage course (admin only)
router.get('/courses/:id/manage', requireAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lessons')
      .populate('quizzes');
    
    if (!course) {
      req.flash('error_msg', 'Course not found');
      return res.redirect('/dashboard');
    }

    res.render('admin/manage-course', { course });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading course');
    res.redirect('/dashboard');
  }
});

// Add lesson page
router.get('/courses/:id/lessons/create', requireAdmin, async (req, res) => {
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
});

// Handle create lesson
router.post('/courses/:id/lessons/create', requireAdmin, async (req, res) => {
  try {
    const { title, videoUrl, order, resourceLinks } = req.body;
    
    const lesson = await Lesson.create({
      title,
      videoUrl,
      order: parseInt(order),
      course: req.params.id,
      resourceLinks: resourceLinks ? JSON.parse(resourceLinks) : []
    });

    await Course.findByIdAndUpdate(req.params.id, {
      $addToSet: { lessons: lesson._id }
    });

    req.flash('success_msg', 'Lesson created successfully');
    res.redirect(`/courses/${req.params.id}/manage`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Failed to create lesson');
    res.redirect(`/courses/${req.params.id}/lessons/create`);
  }
});

// Quiz attempt page
router.get('/quiz/:id', authenticate, async (req, res) => {
 
  console.log("Request to attempt quiz: recieved",req.params.id);
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course');
    
    if (!quiz) {
      req.flash('error_msg', 'Quiz not found');
      return res.redirect('/courses');
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: quiz.course._id
    });

    if (!enrollment) {
      req.flash('error_msg', 'You must be enrolled in this course');
      return res.redirect(`/courses/${quiz.course._id}`);
    }

    res.render('quiz/attempt', { quiz });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading quiz');
    res.redirect('/courses');
  }
});

// Handle quiz submission
router.post('/quiz/:id/submit', authorize, async (req, res) => {
  console.log("Request to submit quiz: recieved",req.params.id);
  try {
    const quiz = await Quiz.findById(req.params.id);
    const { answers } = req.body;
    
    let correctAnswers = 0;
    const processedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const selectedOption = parseInt(answers[index]);
      const isCorrect = question.correctAnswer === selectedOption;
      
      if (isCorrect) correctAnswers++;
      
      processedAnswers.push({
        questionId: question._id,
        selectedOption,
        isCorrect
      });
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Update enrollment with quiz attempt
    await Enrollment.findOneAndUpdate(
      { user: req.user.id, course: quiz.course },
      {
        $push: {
          quizAttempts: {
            quiz: req.params.id,
            score,
            answers: processedAnswers
          }
        }
      }
    );

    req.flash('success_msg', `Quiz completed! Score: ${score}%`);
    res.redirect(`/courses/${quiz.course}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error submitting quiz');
    res.redirect(`/quiz/${req.params.id}`);
  }
});

module.exports = router;