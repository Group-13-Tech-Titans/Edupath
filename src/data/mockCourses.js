export const mockCourses = [
  {
    id: 'course-1',
    title: 'Introduction to Data Science',
    description: 'Learn the fundamentals of data science including statistics, data visualization, and machine learning basics.',
    category: 'Data Science',
    specialization: 'Data Science',
    level: 'Beginner',
    rating: 4.5,
    educatorName: 'Dr. Sarah Williams',
    educatorId: 'educator-1',
    thumbnail: 'https://via.placeholder.com/400x250/20c6a5/ffffff?text=Data+Science',
    status: 'approved',
    createdAt: '2024-01-15',
    content: {
      modules: [
        {
          id: 'mod-1',
          title: 'Module 1: Statistics Fundamentals',
          lessons: [
            { id: 'les-1', title: 'Introduction to Statistics', type: 'video', duration: '15 min', completed: false },
            { id: 'les-2', title: 'Probability Basics', type: 'video', duration: '20 min', completed: false },
            { id: 'les-3', title: 'Quiz: Statistics', type: 'quiz', duration: '10 min', completed: false }
          ]
        },
        {
          id: 'mod-2',
          title: 'Module 2: Data Visualization',
          lessons: [
            { id: 'les-4', title: 'Introduction to Visualization', type: 'video', duration: '18 min', completed: false },
            { id: 'les-5', title: 'Creating Charts', type: 'video', duration: '25 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-1', title: 'Statistics Cheat Sheet', type: 'pdf', url: '#' },
        { id: 'mat-2', title: 'Data Visualization Guide', type: 'pdf', url: '#' }
      ]
    }
  },
  {
    id: 'course-2',
    title: 'Advanced Web Development',
    description: 'Master modern web development with React, Node.js, and advanced JavaScript patterns.',
    category: 'Web Development',
    specialization: 'Web Development',
    level: 'Advanced',
    rating: 4.8,
    educatorName: 'Prof. Michael Chen',
    educatorId: 'educator-2',
    thumbnail: 'https://via.placeholder.com/400x250/13b49a/ffffff?text=Web+Dev',
    status: 'approved',
    createdAt: '2024-01-20',
    content: {
      modules: [
        {
          id: 'mod-3',
          title: 'Module 1: React Fundamentals',
          lessons: [
            { id: 'les-6', title: 'React Components', type: 'video', duration: '30 min', completed: false },
            { id: 'les-7', title: 'State Management', type: 'video', duration: '35 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-3', title: 'React Documentation', type: 'pdf', url: '#' }
      ]
    }
  },
  {
    id: 'course-3',
    title: 'Machine Learning Basics',
    description: 'Get started with machine learning algorithms and their practical applications.',
    category: 'Data Science',
    specialization: 'Data Science',
    level: 'Intermediate',
    rating: 4.6,
    educatorName: 'Dr. Sarah Williams',
    educatorId: 'educator-1',
    thumbnail: 'https://via.placeholder.com/400x250/20c6a5/ffffff?text=ML+Basics',
    status: 'pending',
    createdAt: '2024-02-01',
    content: {
      modules: [
        {
          id: 'mod-4',
          title: 'Module 1: Introduction to ML',
          lessons: [
            { id: 'les-8', title: 'What is Machine Learning?', type: 'video', duration: '20 min', completed: false },
            { id: 'les-9', title: 'Supervised vs Unsupervised', type: 'video', duration: '25 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-4', title: 'ML Basics Guide', type: 'pdf', url: '#' }
      ]
    }
  },
  {
    id: 'course-4',
    title: 'Full Stack Development',
    description: 'Build complete web applications from frontend to backend.',
    category: 'Web Development',
    specialization: 'Web Development',
    level: 'Intermediate',
    rating: 4.7,
    educatorName: 'Prof. Michael Chen',
    educatorId: 'educator-2',
    thumbnail: 'https://via.placeholder.com/400x250/13b49a/ffffff?text=Full+Stack',
    status: 'pending',
    createdAt: '2024-02-05',
    content: {
      modules: [
        {
          id: 'mod-5',
          title: 'Module 1: Backend Setup',
          lessons: [
            { id: 'les-10', title: 'Node.js Introduction', type: 'video', duration: '22 min', completed: false },
            { id: 'les-11', title: 'Express Framework', type: 'video', duration: '28 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-5', title: 'Backend Guide', type: 'pdf', url: '#' }
      ]
    }
  },
  {
    id: 'course-5',
    title: 'Python for Beginners',
    description: 'Learn Python programming from scratch with hands-on exercises.',
    category: 'Programming',
    specialization: 'Programming',
    level: 'Beginner',
    rating: 4.4,
    educatorName: 'Dr. Sarah Williams',
    educatorId: 'educator-1',
    thumbnail: 'https://via.placeholder.com/400x250/20c6a5/ffffff?text=Python',
    status: 'approved',
    createdAt: '2024-01-10',
    content: {
      modules: [
        {
          id: 'mod-6',
          title: 'Module 1: Python Basics',
          lessons: [
            { id: 'les-12', title: 'Variables and Data Types', type: 'video', duration: '15 min', completed: false },
            { id: 'les-13', title: 'Control Structures', type: 'video', duration: '20 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-6', title: 'Python Cheat Sheet', type: 'pdf', url: '#' }
      ]
    }
  },
  {
    id: 'course-6',
    title: 'Cloud Computing Fundamentals',
    description: 'Understand cloud services, deployment, and infrastructure.',
    category: 'Cloud Computing',
    specialization: 'Cloud Computing',
    level: 'Intermediate',
    rating: 4.3,
    educatorName: 'Prof. Michael Chen',
    educatorId: 'educator-2',
    thumbnail: 'https://via.placeholder.com/400x250/13b49a/ffffff?text=Cloud',
    status: 'pending',
    createdAt: '2024-02-10',
    content: {
      modules: [
        {
          id: 'mod-7',
          title: 'Module 1: Cloud Basics',
          lessons: [
            { id: 'les-14', title: 'Introduction to Cloud', type: 'video', duration: '18 min', completed: false },
            { id: 'les-15', title: 'AWS Services', type: 'video', duration: '30 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-7', title: 'Cloud Guide', type: 'pdf', url: '#' }
      ]
    }
  },
  {
    id: 'course-7',
    title: 'UI/UX Design Principles',
    description: 'Master the art of user interface and experience design.',
    category: 'Design',
    specialization: 'Design',
    level: 'Beginner',
    rating: 4.5,
    educatorName: 'Dr. Sarah Williams',
    educatorId: 'educator-1',
    thumbnail: 'https://via.placeholder.com/400x250/20c6a5/ffffff?text=UI+UX',
    status: 'approved',
    createdAt: '2024-01-25',
    content: {
      modules: [
        {
          id: 'mod-8',
          title: 'Module 1: Design Fundamentals',
          lessons: [
            { id: 'les-16', title: 'Color Theory', type: 'video', duration: '20 min', completed: false },
            { id: 'les-17', title: 'Typography Basics', type: 'video', duration: '15 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-8', title: 'Design Principles', type: 'pdf', url: '#' }
      ]
    }
  },
  {
    id: 'course-8',
    title: 'Cybersecurity Essentials',
    description: 'Learn how to protect systems and data from cyber threats.',
    category: 'Security',
    specialization: 'Security',
    level: 'Intermediate',
    rating: 4.6,
    educatorName: 'Prof. Michael Chen',
    educatorId: 'educator-2',
    thumbnail: 'https://via.placeholder.com/400x250/13b49a/ffffff?text=Security',
    status: 'pending',
    createdAt: '2024-02-12',
    content: {
      modules: [
        {
          id: 'mod-9',
          title: 'Module 1: Security Basics',
          lessons: [
            { id: 'les-18', title: 'Threat Landscape', type: 'video', duration: '25 min', completed: false },
            { id: 'les-19', title: 'Encryption Methods', type: 'video', duration: '30 min', completed: false }
          ]
        }
      ],
      materials: [
        { id: 'mat-9', title: 'Security Guide', type: 'pdf', url: '#' }
      ]
    }
  }
];


