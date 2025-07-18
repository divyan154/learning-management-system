const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// const getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.find()
//       .populate('lessons', 'title')
//       .populate('quizzes', 'title')
//       .select('-enrolledUsers');

//     res.json({
//       message: 'Courses retrieved successfully',
//       courses
//     });
//   } catch (error) {
//     console.error('Get courses error:', error);
//     res.status(500).json({ message: 'Server error while fetching courses' });
//   }
// };

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.render("courses/index", { courses });
  } catch (error) {
    console.error(error);
    res.render("courses/index", { courses: [] });
  }
};
// router.get("/courses", async (req, res) => {
//   try {
//     const courses = await Course.find();
//     res.render("courses/index", { courses });
//   } catch (error) {
//     console.error(error);
//     res.render("courses/index", { courses: [] });
//   }
// });

const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("lessons")
      .populate("quizzes");
    console.log("Course found:", course);
    if (!course) {
      req.flash("error_msg", "Course not found");
      return res.redirect("/courses");
    }

    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: req.params.id,
      });
    }

    res.render("courses/show", { course, enrollment });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error loading course");
    res.redirect("/courses");
  }
};


const createCourse = async (req, res) => {
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
};


const enrollInCourse = async (req, res) => {
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
}


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

const manageCourse = async (req, res) => {
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
}

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  enrollInCourse,
  getEnrolledCourses
  , manageCourse
};