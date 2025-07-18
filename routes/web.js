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


// Middleware to check if user is admin


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


// router.post("/quiz/:id/submit", authorize, async (req, res) => {
//   console.log("Request to submit quiz: recieved", req.params.id);
//   try {
//     const quiz = await Quiz.findById(req.params.id);
//     const { answers } = req.body;

//     let correctAnswers = 0;
//     const processedAnswers = [];

//     quiz.questions.forEach((question, index) => {
//       const selectedOption = parseInt(answers[index]);
//       const isCorrect = question.correctAnswer === selectedOption;

//       if (isCorrect) correctAnswers++;

//       processedAnswers.push({
//         questionId: question._id,
//         selectedOption,
//         isCorrect,
//       });
//     });

//     const score = Math.round((correctAnswers / quiz.questions.length) * 100);

//     // Update enrollment with quiz attempt
//     await Enrollment.findOneAndUpdate(
//       { user: req.user.id, course: quiz.course },
//       {
//         $push: {
//           quizAttempts: {
//             quiz: req.params.id,
//             score,
//             answers: processedAnswers,
//           },
//         },
//       }
//     );

//     req.flash("success_msg", `Quiz completed! Score: ${score}%`);
//     res.redirect(`/courses/${quiz.course}`);
//   } catch (error) {
//     console.error(error);
//     req.flash("error_msg", "Error submitting quiz");
//     res.redirect(`/quiz/${req.params.id}`);
//   }
// });

// Login page
// router.get('/login', (req, res) => {
//   res.render('auth/login');
// });

// Register page
// router.get('/register', (req, res) => {
 
// });

// // Handle login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !(await user.comparePassword(password))) {
//       req.flash('error_msg', 'Invalid credentials');
//       return res.redirect('/login');
//     }

//     req.session.user = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     };

//     req.flash('success_msg', 'Login successful');
//     res.redirect('/dashboard');
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Server error');
//     res.redirect('/login');
//   }
// });

// // Handle register
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
    
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       req.flash('error_msg', 'User already exists');
//       return res.redirect('/register');
//     }

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || 'user'
//     });

//     req.session.user = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     };

//     req.flash('success_msg', 'Registration successful');
//     res.redirect('/dashboard');
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Registration failed');
//     res.redirect('/register');
//   }
// });

// Logout


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




// Create course page (admin only)
// router.get("/courses/create", requireAdmin, (req, res) => {
//   res.render("admin/create-course.ejs");
// });


// Single course page
// router.get('/courses/:id', async (req, res) => {
  
// });

// Enroll in course
// router.post('/courses/:id/enroll', authenticate, async (req, res) => {
// });



// Handle create course
// router.post('/courses/create', requireAdmin, async (req, res) => {
  
// });

// Manage course (admin only)
// router.get('/courses/:id/manage', requireAdmin, async (req, res) => {
  
// });

// Add lesson page
// router.get('/courses/:id/lessons/create', requireAdmin, async (req, res) => {
 
// });

// Handle create lesson
// router.post('/courses/:id/lessons/create', requireAdmin, async (req, res) => {
  
// });

// Quiz attempt page
// router.get('/quiz/:id', authenticate, async (req, res) => {
 
  
// });

// Handle quiz submission
// router.post('/quiz/:id/submit', authorize, async (req, res) => {
//   console.log("Request to submit quiz: recieved", req.params.id);
//   try {
//     const quiz = await Quiz.findById(req.params.id);
//     const { answers } = req.body;

//     let correctAnswers = 0;
//     const processedAnswers = [];

//     quiz.questions.forEach((question, index) => {
//       const selectedOption = parseInt(answers[index]);
//       const isCorrect = question.correctAnswer === selectedOption;

//       if (isCorrect) correctAnswers++;

//       processedAnswers.push({
//         questionId: question._id,
//         selectedOption,
//         isCorrect,
//       });
//     });

//     const score = Math.round((correctAnswers / quiz.questions.length) * 100);

//     // Update enrollment with quiz attempt
//     await Enrollment.findOneAndUpdate(
//       { user: req.user.id, course: quiz.course },
//       {
//         $push: {
//           quizAttempts: {
//             quiz: req.params.id,
//             score,
//             answers: processedAnswers,
//           },
//         },
//       }
//     );

//     req.flash("success_msg", `Quiz completed! Score: ${score}%`);
//     res.redirect(`/courses/${quiz.course}`);
//   } catch (error) {
//     console.error(error);
//     req.flash("error_msg", "Error submitting quiz");
//     res.redirect(`/quiz/${req.params.id}`);
//   }
// });

module.exports = router;