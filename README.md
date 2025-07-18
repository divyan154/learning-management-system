# Learning Management System (LMS) Backend

A complete backend API for a Learning Management System built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Course Management**: Create, view, and enroll in courses
- **Lessons**: Video-based lessons with resource links
- **Quizzes**: Interactive quizzes with multiple-choice questions
- **Progress Tracking**: Track lesson completion and quiz attempts
- **Security**: Comprehensive security measures including rate limiting, input validation, and password hashing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lms
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Courses
- `GET /api/courses` - Get all courses (public)
- `GET /api/courses/:id` - Get single course (public)
- `POST /api/courses` - Create course (admin only)
- `POST /api/courses/:id/enroll` - Enroll in course (authenticated)
- `GET /api/courses/enrolled/my-courses` - Get enrolled courses (authenticated)

### Lessons
- `GET /api/courses/courseId/lessons` - Get lessons for a course (enrolled users)
- `POST /api/courses/courseId/lessons/create` - Create lesson (admin only)

### Quizzes
- `POST /api/courses/courseId/quizzes` - Attempt quiz (enrolled users)

### Progress
- `POST /api/progress/lesson/:lessonId/complete` - Mark lesson as completed
- `GET /api/progress/course/:courseId` - Get progress for a course
- `GET /api/progress/overview` - Get overall progress

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a course (admin)
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript programming",
    "instructor": "Jane Smith",
    "price": 99.99
  }'
```

### Enroll in a course
```bash
curl -X POST http://localhost:5000/api/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a lesson (admin)
```bash
curl -X POST http://localhost:5000/api/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Introduction to Variables",
    "videoUrl": "https://example.com/video1.mp4",
    "course": "COURSE_ID",
    "order": 1,
    "resourceLinks": [
      {
        "title": "MDN Variables Guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Variables"
      }
    ]
  }'
```

### Create a quiz (admin)
```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "JavaScript Basics Quiz",
    "description": "Test your knowledge of JavaScript fundamentals",
    "course": "COURSE_ID",
    "questions": [
      {
        "text": "What is the correct way to declare a variable in JavaScript?",
        "options": [
          {"text": "var x = 5;"},
          {"text": "variable x = 5;"},
          {"text": "v x = 5;"},
          {"text": "declare x = 5;"}
        ],
        "correctAnswer": 0
      }
    ],
    "passingScore": 70,
    "timeLimit": 30
  }'
```

### Attempt a quiz
```bash
curl -X POST http://localhost:5000/api/quizzes/QUIZ_ID/attempt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "answers": [
      {
        "questionId": "QUESTION_ID",
        "selectedOption": 0
      }
    ]
  }'
```

### Mark lesson as completed
```bash
curl -X POST http://localhost:5000/api/progress/lesson/LESSON_ID/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

The system uses MongoDB with the following collections:
- **users** - User accounts and authentication
- **courses** - Course information
- **lessons** - Lesson content and resources
- **quizzes** - Quiz questions and configuration
- **enrollments** - User enrollments and progress tracking

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- Role-based access control
- CORS configuration
- Helmet for security headers

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and descriptive error messages.

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

Make sure MongoDB is running on your local machine or update the `MONGODB_URI` in your `.env` file to point to your MongoDB instance.

## License

MIT License
