const { validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');


const showQuizPage = async (req, res) => {
  // console.log("Request to attempt quiz: recieved", req.params.id);
try {
  const quiz = await Quiz.findById(req.params.id).populate("course");

  if (!quiz) {
    req.flash("error_msg", "Quiz not found");
    return res.redirect("/courses");
  }

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: quiz.course._id,
  });

  if (!enrollment) {
    req.flash("error_msg", "You must be enrolled in this course");
    return res.redirect(`/courses/${quiz.course._id}`);
  }

  res.render("quiz/attempt", { quiz });
} catch (error) {
  console.error(error);
  req.flash("error_msg", "Error loading quiz");
  res.redirect("/courses");
} }
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
  console.log("Attempting quiz with ID:", req.params.id); 
  try {
    const quiz = await Quiz.findById(req.params.id);
    const answers = req.body.answers; // This will be an object, not array

    // Convert to array of { questionId, selectedOption }
    const answerArray = Object.keys(answers).map((index) => ({
      questionId: quiz.questions[index]._id,
      selectedOption: parseInt(answers[index]),
    }));

    let correctAnswers = 0;
    const processedAnswers = answerArray.map((answer) => {
      const question = quiz.questions.id(answer.questionId);
      const isCorrect = question.correctAnswer === answer.selectedOption;

      if (isCorrect) correctAnswers++;

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    });

    // Calculate score
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Update enrollment
    await Enrollment.findOneAndUpdate(
      { user: req.user.id, course: quiz.course },
      {
        $push: {
          quizAttempts: {
            quiz: req.params.id,
            score,
            answers: processedAnswers,
          },
        },
      }
    );

    req.flash("success_msg", `Quiz completed! Score: ${score}%`);
    res.redirect(`/api/courses/${quiz.course._id}`);
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error submitting quiz");
    res.redirect(`/quiz/${req.params.id}`);
  }
};

module.exports = {
  getQuizzesByCourse,
  createQuiz,
  attemptQuiz,
  showQuizPage
};