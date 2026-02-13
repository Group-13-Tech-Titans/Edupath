# EduPath - React Frontend

A complete React frontend application for an educational platform with Role-Based Access Control (RBAC) and a modern mint/teal glassmorphism theme.

## Features

- **Role-Based Access Control (RBAC)** with 4 roles:
  - Student
  - Educator
  - Admin
  - Reviewer (Review Panelist)

- **Modern UI/UX**:
  - Glassmorphism design with mint/teal theme
  - Smooth animations using Framer Motion
  - Fully responsive design
  - Professional card-based layouts

- **Complete Feature Set**:
  - Authentication system
  - Course management
  - Course review system
  - Mentor request system
  - User management (Admin)
  - Reviewer account creation (Admin)

## Tech Stack

- React 18
- Vite
- React Router DOM
- Framer Motion
- CSS3 (Custom theme with CSS variables)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Demo Credentials

### Admin
- Username/Email: `admin`
- Password: `Admin@123`

### Student
- Email: `student1@edupath.com`
- Password: `Student@123`

### Educator
- Email: `educator1@edupath.com`
- Password: `Educator@123`

### Reviewer
- Reviewers can be created by Admin in the Admin Panel
- After creation, reviewers can login with their email and password

## Project Structure

```
src/
├── pages/
│   ├── auth/
│   │   └── Login.jsx
│   ├── student/
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentCourses.jsx
│   │   ├── StudentCourseView.jsx
│   │   ├── StudentMentorRequest.jsx
│   │   └── StudentProfile.jsx
│   ├── educator/
│   │   ├── EducatorDashboard.jsx
│   │   ├── EducatorCourses.jsx
│   │   ├── EducatorCreateCourse.jsx
│   │   └── EducatorProfile.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminReviewPanelists.jsx
│   │   ├── AdminCourseReviewQueue.jsx
│   │   ├── AdminCourseReviewDetail.jsx
│   │   ├── AdminUsers.jsx
│   │   └── AdminSettings.jsx
│   └── reviewer/
│       ├── ReviewerDashboard.jsx
│       ├── ReviewerReviewQueue.jsx
│       ├── ReviewerCourseDetail.jsx
│       └── ReviewerHistory.jsx
├── components/
│   ├── common/
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleRedirect.jsx
│   │   ├── PageShell.jsx
│   │   ├── StatsCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   ├── student/
│   │   └── StudentNavbar.jsx
│   ├── educator/
│   │   └── EducatorNavbar.jsx
│   ├── admin/
│   │   └── AdminNavbar.jsx
│   └── reviewer/
│       └── ReviewerNavbar.jsx
├── context/
│   └── AuthContext.jsx
├── data/
│   ├── mockUsers.js
│   └── mockCourses.js
├── styles/
│   └── theme.css
├── App.jsx
└── main.jsx
```

## Key Features by Role

### Student
- View available courses
- Enroll in courses
- Track course progress
- Request mentors
- View profile

### Educator
- Create and manage courses
- Submit courses for review
- View course statistics
- Manage profile

### Admin
- Manage users (students and educators)
- Create reviewer accounts
- Review courses
- View platform statistics
- Access settings

### Reviewer
- Review courses in their specialization
- Submit review decisions
- View review history
- Track assigned queue

## Data Storage

The application uses localStorage for data persistence:
- `edupath_auth` - Current user session
- `edupath_reviewers` - Reviewer accounts
- `mentor_requests` - Mentor requests
- `course_reviews` - Course review history
- `course_progress_{courseId}` - Student course progress
- `educator_courses` - Courses created by educators
- `all_courses` - All courses (updated after reviews)

## Theme Customization

The theme is defined in `src/styles/theme.css` using CSS variables. You can customize:
- Colors (backgrounds, text, primary, status colors)
- Shadows
- Border radius
- Spacing
- Typography

## License

This project is created for educational purposes.


