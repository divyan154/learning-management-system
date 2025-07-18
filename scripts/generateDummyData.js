const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI
);
const hashedPassword = async (password) => {
  return bcrypt.hash(password, 10);
}
const generateDummyData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Enrollment.deleteMany({});

    console.log('👥 Creating users...');
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@lms.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create instructor users
    const instructor1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@lms.com',
      password: 'instructor123',
      role: 'admin'
    });

    const instructor2 = await User.create({
      name: 'Prof. Michael Chen',
      email: 'michael@lms.com',
      password: 'instructor123',
      role: 'admin'
    });

    // Create student users
    const students = await User.create([
      {
        name: 'John Smith',
        email: 'john@student.com',
        password: 'student123',
        role: 'user'
      },
      {
        name: 'Emma Wilson',
        email: 'emma@student.com',
        password: 'student123',
        role: 'user'
      },
      {
        name: 'David Brown',
        email: 'david@student.com',
        password: 'student123',
        role: 'user'
      },
      {
        name: 'Lisa Garcia',
        email: 'lisa@student.com',
        password: 'student123',
        role: 'user'
      },
      {
        name: 'Alex Thompson',
        email: 'alex@student.com',
        password: 'student123',
        role: 'user'
      }
    ]);

    console.log('📚 Creating courses...');

    // Create courses
    const courses = await Course.create([
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming including variables, functions, objects, and DOM manipulation. Perfect for beginners who want to start their web development journey.',
        instructor: 'Dr. Sarah Johnson',
        price: 99.99,
        createdBy: instructor1._id
      },
      {
        title: 'React.js Complete Guide',
        description: 'Master React.js from basics to advanced concepts. Build real-world applications using hooks, context, routing, and state management with Redux.',
        instructor: 'Prof. Michael Chen',
        price: 149.99,
        createdBy: instructor2._id
      },
      {
        title: 'Node.js Backend Development',
        description: 'Build scalable backend applications with Node.js and Express. Learn about APIs, databases, authentication, and deployment strategies.',
        instructor: 'Dr. Sarah Johnson',
        price: 129.99,
        createdBy: instructor1._id
      },
      {
        title: 'Python for Data Science',
        description: 'Dive into data science with Python. Learn pandas, numpy, matplotlib, and machine learning basics with scikit-learn.',
        instructor: 'Prof. Michael Chen',
        price: 179.99,
        createdBy: instructor2._id
      },
      {
        title: 'Web Design with CSS',
        description: 'Create beautiful and responsive websites using modern CSS techniques including Flexbox, Grid, animations, and responsive design principles.',
        instructor: 'Dr. Sarah Johnson',
        price: 89.99,
        createdBy: instructor1._id
      }
    ]);

    console.log('🎥 Creating lessons...');

    // Create lessons for JavaScript Fundamentals
    const jsLessons = await Lesson.create([
      {
        title: 'Introduction to JavaScript',
        videoUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
        resourceLinks: [
          { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
          { title: 'JavaScript.info', url: 'https://javascript.info/' }
        ],
        course: courses[0]._id,
        order: 1
      },
      {
        title: 'Variables and Data Types',
        videoUrl: 'https://www.youtube.com/watch?v=9emXNzqCKyg',
        resourceLinks: [
          { title: 'JavaScript Data Types', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures' }
        ],
        course: courses[0]._id,
        order: 2
      },
      {
        title: 'Functions and Scope',
        videoUrl: 'https://www.youtube.com/watch?v=N8ap4k_1QEQ',
        resourceLinks: [
          { title: 'Function Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' }
        ],
        course: courses[0]._id,
        order: 3
      },
      {
        title: 'Objects and Arrays',
        videoUrl: 'https://www.youtube.com/watch?v=X0ipw1k7ygU',
        resourceLinks: [
          { title: 'Working with Objects', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects' }
        ],
        course: courses[0]._id,
        order: 4
      },
      {
        title: 'DOM Manipulation',
        videoUrl: 'https://www.youtube.com/watch?v=5fb2aPlgoys',
        resourceLinks: [
          { title: 'DOM Introduction', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction' }
        ],
        course: courses[0]._id,
        order: 5
      }
    ]);

    // Create lessons for React.js
    const reactLessons = await Lesson.create([
      {
        title: 'React Introduction and Setup',
        videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
        resourceLinks: [
          { title: 'React Documentation', url: 'https://reactjs.org/docs/getting-started.html' },
          { title: 'Create React App', url: 'https://create-react-app.dev/' }
        ],
        course: courses[1]._id,
        order: 1
      },
      {
        title: 'Components and JSX',
        videoUrl: 'https://www.youtube.com/watch?v=QFaFIcGhPoM',
        resourceLinks: [
          { title: 'JSX Introduction', url: 'https://reactjs.org/docs/introducing-jsx.html' }
        ],
        course: courses[1]._id,
        order: 2
      },
      {
        title: 'Props and State',
        videoUrl: 'https://www.youtube.com/watch?v=IYvD9oBCuJI',
        resourceLinks: [
          { title: 'State and Lifecycle', url: 'https://reactjs.org/docs/state-and-lifecycle.html' }
        ],
        course: courses[1]._id,
        order: 3
      },
      {
        title: 'React Hooks',
        videoUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
        resourceLinks: [
          { title: 'Hooks API Reference', url: 'https://reactjs.org/docs/hooks-reference.html' }
        ],
        course: courses[1]._id,
        order: 4
      }
    ]);

    // Create lessons for Node.js
    const nodeLessons = await Lesson.create([
      {
        title: 'Node.js Introduction',
        videoUrl: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
        resourceLinks: [
          { title: 'Node.js Documentation', url: 'https://nodejs.org/en/docs/' }
        ],
        course: courses[2]._id,
        order: 1
      },
      {
        title: 'Express.js Framework',
        videoUrl: 'https://www.youtube.com/watch?v=L72fhGm1tfE',
        resourceLinks: [
          { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html' }
        ],
        course: courses[2]._id,
        order: 2
      },
      {
        title: 'Working with Databases',
        videoUrl: 'https://www.youtube.com/watch?v=0oXYLzuucwE',
        resourceLinks: [
          { title: 'MongoDB Tutorial', url: 'https://docs.mongodb.com/manual/tutorial/' }
        ],
        course: courses[2]._id,
        order: 3
      }
    ]);

    // Create lessons for Python Data Science
    const pythonLessons = await Lesson.create([
      {
        title: 'Python Basics for Data Science',
        videoUrl: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
        resourceLinks: [
          { title: 'Python.org Tutorial', url: 'https://docs.python.org/3/tutorial/' }
        ],
        course: courses[3]._id,
        order: 1
      },
      {
        title: 'NumPy and Pandas',
        videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
        resourceLinks: [
          { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/' }
        ],
        course: courses[3]._id,
        order: 2
      }
    ]);

    // Create lessons for CSS
    const cssLessons = await Lesson.create([
      {
        title: 'CSS Fundamentals',
        videoUrl: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
        resourceLinks: [
          { title: 'CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }
        ],
        course: courses[4]._id,
        order: 1
      },
      {
        title: 'Flexbox Layout',
        videoUrl: 'https://www.youtube.com/watch?v=JJSoEo8JSnc',
        resourceLinks: [
          { title: 'Flexbox Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }
        ],
        course: courses[4]._id,
        order: 2
      }
    ]);

    // Update courses with lesson references
    await Course.findByIdAndUpdate(courses[0]._id, { lessons: jsLessons.map(l => l._id) });
    await Course.findByIdAndUpdate(courses[1]._id, { lessons: reactLessons.map(l => l._id) });
    await Course.findByIdAndUpdate(courses[2]._id, { lessons: nodeLessons.map(l => l._id) });
    await Course.findByIdAndUpdate(courses[3]._id, { lessons: pythonLessons.map(l => l._id) });
    await Course.findByIdAndUpdate(courses[4]._id, { lessons: cssLessons.map(l => l._id) });

    console.log('❓ Creating quizzes...');

    // Create quizzes
    const jsQuiz = await Quiz.create({
      title: 'JavaScript Basics Quiz',
      description: 'Test your knowledge of JavaScript fundamentals',
      course: courses[0]._id,
      passingScore: 70,
      timeLimit: 15,
      questions: [
        {
          text: 'What is the correct way to declare a variable in JavaScript?',
          options: [
            { text: 'var x = 5;', isCorrect: true },
            { text: 'variable x = 5;', isCorrect: false },
            { text: 'v x = 5;', isCorrect: false },
            { text: 'declare x = 5;', isCorrect: false }
          ],
          correctAnswer: 0
        },
        {
          text: 'Which of the following is NOT a JavaScript data type?',
          options: [
            { text: 'String', isCorrect: false },
            { text: 'Boolean', isCorrect: false },
            { text: 'Float', isCorrect: true },
            { text: 'Number', isCorrect: false }
          ],
          correctAnswer: 2
        },
        {
          text: 'How do you create a function in JavaScript?',
          options: [
            { text: 'function myFunction() {}', isCorrect: true },
            { text: 'create myFunction() {}', isCorrect: false },
            { text: 'def myFunction() {}', isCorrect: false },
            { text: 'function = myFunction() {}', isCorrect: false }
          ],
          correctAnswer: 0
        },
        {
          text: 'What does DOM stand for?',
          options: [
            { text: 'Document Object Model', isCorrect: true },
            { text: 'Data Object Management', isCorrect: false },
            { text: 'Dynamic Object Method', isCorrect: false },
            { text: 'Document Oriented Model', isCorrect: false }
          ],
          correctAnswer: 0
        },
        {
          text: 'Which method is used to add an element to the end of an array?',
          options: [
            { text: 'append()', isCorrect: false },
            { text: 'push()', isCorrect: true },
            { text: 'add()', isCorrect: false },
            { text: 'insert()', isCorrect: false }
          ],
          correctAnswer: 1
        }
      ]
    });

    const reactQuiz = await Quiz.create({
      title: 'React Fundamentals Quiz',
      description: 'Test your understanding of React concepts',
      course: courses[1]._id,
      passingScore: 75,
      timeLimit: 20,
      questions: [
        {
          text: 'What is JSX?',
          options: [
            { text: 'A JavaScript extension', isCorrect: false },
            { text: 'A syntax extension for JavaScript', isCorrect: true },
            { text: 'A new programming language', isCorrect: false },
            { text: 'A CSS framework', isCorrect: false }
          ],
          correctAnswer: 1
        },
        {
          text: 'Which hook is used for state management in functional components?',
          options: [
            { text: 'useEffect', isCorrect: false },
            { text: 'useState', isCorrect: true },
            { text: 'useContext', isCorrect: false },
            { text: 'useReducer', isCorrect: false }
          ],
          correctAnswer: 1
        },
        {
          text: 'What is the purpose of useEffect hook?',
          options: [
            { text: 'To manage state', isCorrect: false },
            { text: 'To handle side effects', isCorrect: true },
            { text: 'To create components', isCorrect: false },
            { text: 'To handle events', isCorrect: false }
          ],
          correctAnswer: 1
        }
      ]
    });

    const nodeQuiz = await Quiz.create({
      title: 'Node.js Backend Quiz',
      description: 'Test your Node.js and Express knowledge',
      course: courses[2]._id,
      passingScore: 70,
      timeLimit: 25,
      questions: [
        {
          text: 'What is Node.js?',
          options: [
            { text: 'A JavaScript runtime built on Chrome\'s V8 engine', isCorrect: true },
            { text: 'A web browser', isCorrect: false },
            { text: 'A database', isCorrect: false },
            { text: 'A CSS framework', isCorrect: false }
          ],
          correctAnswer: 0
        },
        {
          text: 'Which command is used to install packages in Node.js?',
          options: [
            { text: 'node install', isCorrect: false },
            { text: 'npm install', isCorrect: true },
            { text: 'install npm', isCorrect: false },
            { text: 'package install', isCorrect: false }
          ],
          correctAnswer: 1
        }
      ]
    });

    const pythonQuiz = await Quiz.create({
      title: 'Python Data Science Quiz',
      description: 'Test your Python and data science knowledge',
      course: courses[3]._id,
      passingScore: 80,
      timeLimit: 30,
      questions: [
        {
          text: 'Which library is primarily used for data manipulation in Python?',
          options: [
            { text: 'NumPy', isCorrect: false },
            { text: 'Pandas', isCorrect: true },
            { text: 'Matplotlib', isCorrect: false },
            { text: 'Scikit-learn', isCorrect: false }
          ],
          correctAnswer: 1
        },
        {
          text: 'What does NumPy stand for?',
          options: [
            { text: 'Numerical Python', isCorrect: true },
            { text: 'Number Python', isCorrect: false },
            { text: 'New Python', isCorrect: false },
            { text: 'Next Python', isCorrect: false }
          ],
          correctAnswer: 0
        }
      ]
    });

    const cssQuiz = await Quiz.create({
      title: 'CSS Design Quiz',
      description: 'Test your CSS and web design skills',
      course: courses[4]._id,
      passingScore: 65,
      timeLimit: 15,
      questions: [
        {
          text: 'Which CSS property is used to change the text color?',
          options: [
            { text: 'text-color', isCorrect: false },
            { text: 'color', isCorrect: true },
            { text: 'font-color', isCorrect: false },
            { text: 'text-style', isCorrect: false }
          ],
          correctAnswer: 1
        },
        {
          text: 'What does CSS stand for?',
          options: [
            { text: 'Cascading Style Sheets', isCorrect: true },
            { text: 'Computer Style Sheets', isCorrect: false },
            { text: 'Creative Style Sheets', isCorrect: false },
            { text: 'Colorful Style Sheets', isCorrect: false }
          ],
          correctAnswer: 0
        }
      ]
    });

    // Update courses with quiz references
    await Course.findByIdAndUpdate(courses[0]._id, { quizzes: [jsQuiz._id] });
    await Course.findByIdAndUpdate(courses[1]._id, { quizzes: [reactQuiz._id] });
    await Course.findByIdAndUpdate(courses[2]._id, { quizzes: [nodeQuiz._id] });
    await Course.findByIdAndUpdate(courses[3]._id, { quizzes: [pythonQuiz._id] });
    await Course.findByIdAndUpdate(courses[4]._id, { quizzes: [cssQuiz._id] });

    console.log('📝 Creating enrollments and progress...');

    // Create enrollments with progress
    const enrollments = [];

    // John enrolls in JavaScript and React courses
    const johnJsEnrollment = await Enrollment.create({
      user: students[0]._id,
      course: courses[0]._id,
      completedLessons: [
        { lesson: jsLessons[0]._id, completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { lesson: jsLessons[1]._id, completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { lesson: jsLessons[2]._id, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      ],
      quizAttempts: [
        {
          quiz: jsQuiz._id,
          score: 85,
          answers: [
            { questionId: jsQuiz.questions[0]._id, selectedOption: 0, isCorrect: true },
            { questionId: jsQuiz.questions[1]._id, selectedOption: 2, isCorrect: true },
            { questionId: jsQuiz.questions[2]._id, selectedOption: 0, isCorrect: true },
            { questionId: jsQuiz.questions[3]._id, selectedOption: 1, isCorrect: false },
            { questionId: jsQuiz.questions[4]._id, selectedOption: 1, isCorrect: true }
          ],
          attemptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      progress: 60
    });

    const johnReactEnrollment = await Enrollment.create({
      user: students[0]._id,
      course: courses[1]._id,
      completedLessons: [
        { lesson: reactLessons[0]._id, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      ],
      progress: 25
    });

    // Emma enrolls in multiple courses
    const emmaJsEnrollment = await Enrollment.create({
      user: students[1]._id,
      course: courses[0]._id,
      completedLessons: jsLessons.map(lesson => ({
        lesson: lesson._id,
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      })),
      quizAttempts: [
        {
          quiz: jsQuiz._id,
          score: 92,
          answers: [
            { questionId: jsQuiz.questions[0]._id, selectedOption: 0, isCorrect: true },
            { questionId: jsQuiz.questions[1]._id, selectedOption: 2, isCorrect: true },
            { questionId: jsQuiz.questions[2]._id, selectedOption: 0, isCorrect: true },
            { questionId: jsQuiz.questions[3]._id, selectedOption: 0, isCorrect: true },
            { questionId: jsQuiz.questions[4]._id, selectedOption: 1, isCorrect: true }
          ],
          attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      progress: 100
    });

    const emmaCssEnrollment = await Enrollment.create({
      user: students[1]._id,
      course: courses[4]._id,
      completedLessons: [
        { lesson: cssLessons[0]._id, completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ],
      progress: 50
    });

    // David enrolls in Node.js
    const davidNodeEnrollment = await Enrollment.create({
      user: students[2]._id,
      course: courses[2]._id,
      completedLessons: [
        { lesson: nodeLessons[0]._id, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { lesson: nodeLessons[1]._id, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      ],
      quizAttempts: [
        {
          quiz: nodeQuiz._id,
          score: 75,
          answers: [
            { questionId: nodeQuiz.questions[0]._id, selectedOption: 0, isCorrect: true },
            { questionId: nodeQuiz.questions[1]._id, selectedOption: 1, isCorrect: true }
          ],
          attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      progress: 67
    });

    // Lisa enrolls in Python
    const lisaPythonEnrollment = await Enrollment.create({
      user: students[3]._id,
      course: courses[3]._id,
      completedLessons: [
        { lesson: pythonLessons[0]._id, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      ],
      progress: 50
    });

    // Alex enrolls in React
    const alexReactEnrollment = await Enrollment.create({
      user: students[4]._id,
      course: courses[1]._id,
      completedLessons: [
        { lesson: reactLessons[0]._id, completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { lesson: reactLessons[1]._id, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { lesson: reactLessons[2]._id, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      ],
      quizAttempts: [
        {
          quiz: reactQuiz._id,
          score: 67,
          answers: [
            { questionId: reactQuiz.questions[0]._id, selectedOption: 1, isCorrect: true },
            { questionId: reactQuiz.questions[1]._id, selectedOption: 0, isCorrect: false },
            { questionId: reactQuiz.questions[2]._id, selectedOption: 1, isCorrect: true }
          ],
          attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      progress: 75
    });

    // Update courses with enrolled users
    await Course.findByIdAndUpdate(courses[0]._id, { 
      enrolledUsers: [students[0]._id, students[1]._id] 
    });
    await Course.findByIdAndUpdate(courses[1]._id, { 
      enrolledUsers: [students[0]._id, students[4]._id] 
    });
    await Course.findByIdAndUpdate(courses[2]._id, { 
      enrolledUsers: [students[2]._id] 
    });
    await Course.findByIdAndUpdate(courses[3]._id, { 
      enrolledUsers: [students[3]._id] 
    });
    await Course.findByIdAndUpdate(courses[4]._id, { 
      enrolledUsers: [students[1]._id] 
    });

    console.log('✅ Dummy data generated successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${1 + 2 + 5} (1 admin, 2 instructors, 5 students)`);
    console.log(`📚 Courses created: ${courses.length}`);
    console.log(`🎥 Lessons created: ${jsLessons.length + reactLessons.length + nodeLessons.length + pythonLessons.length + cssLessons.length}`);
    console.log(`❓ Quizzes created: 5`);
    console.log(`📝 Enrollments created: 6`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@lms.com / admin123');
    console.log('Instructor 1: sarah@lms.com / instructor123');
    console.log('Instructor 2: michael@lms.com / instructor123');
    console.log('Student 1: john@student.com / student123');
    console.log('Student 2: emma@student.com / student123');
    console.log('Student 3: david@student.com / student123');
    console.log('Student 4: lisa@student.com / student123');
    console.log('Student 5: alex@student.com / student123');

  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
  } finally {
    mongoose.connection.close();
  }
};

generateDummyData();

// Instructor 1: sarah@lms.com / instructor123
// Instructor 2: michael@lms.com / instructor123
// Student 1: john@student.com / student123
// Student 2: emma@student.com / student123
// Student 3: david@student.com / student123
// Student 4: lisa@student.com / student123
// Admin: admin@lms.com / admin123