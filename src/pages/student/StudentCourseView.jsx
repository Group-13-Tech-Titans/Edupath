import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import Toast from '../../components/common/Toast';
import { mockCourses } from '../../data/mockCourses';

const StudentCourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const foundCourse = mockCourses.find(c => c.id === id);
    setCourse(foundCourse);

    // Load completed lessons from localStorage
    const stored = localStorage.getItem(`course_progress_${id}`);
    if (stored) {
      setCompletedLessons(JSON.parse(stored));
    }
  }, [id]);

  const toggleLessonComplete = (lessonId) => {
    const newCompleted = completedLessons.includes(lessonId)
      ? completedLessons.filter(l => l !== lessonId)
      : [...completedLessons, lessonId];
    
    setCompletedLessons(newCompleted);
    localStorage.setItem(`course_progress_${id}`, JSON.stringify(newCompleted));
    setShowToast(true);
  };

  if (!course) {
    return <PageShell title="Course not found" />;
  }

  const totalLessons = course.content.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progress = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

  return (
    <PageShell>
      <Link to="/student/courses" className="btn btn-ghost btn-sm mb-md">← Back to Courses</Link>
      
      <div className="card mb-md">
        <img
          src={course.thumbnail}
          alt={course.title}
          style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-input)', marginBottom: '18px' }}
        />
        <h1 className="mb-sm">{course.title}</h1>
        <p className="text-muted mb-md">{course.description}</p>
        <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{course.category}</span>
          <span className="badge badge-info">{course.level}</span>
          <span style={{ fontSize: '12px', fontWeight: 700 }}>⭐ {course.rating}</span>
          <span className="text-muted" style={{ fontSize: '12px' }}>By {course.educatorName}</span>
        </div>
        
        <div className="card" style={{ background: 'rgba(32, 198, 165, 0.1)', padding: '14px' }}>
          <div className="flex flex-between flex-center mb-sm">
            <span style={{ fontSize: '12px', fontWeight: 800 }}>PROGRESS</span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.5)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      <div className="card mb-md">
        <h2 className="mb-md">Course Content</h2>
        {course.content.modules.map((module, modIdx) => (
          <div key={module.id} className="mb-md" style={{ borderBottom: modIdx < course.content.modules.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: '18px' }}>
            <h3 className="mb-sm">{module.title}</h3>
            <div className="flex flex-col gap-sm">
              {module.lessons.map(lesson => {
                const isCompleted = completedLessons.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className="flex flex-between flex-center"
                    style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-input)' }}
                  >
                    <div className="flex flex-center gap-sm">
                      <span style={{ fontSize: '20px' }}>{lesson.type === 'video' ? '▶' : '📝'}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{lesson.title}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>{lesson.duration}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleLessonComplete(lesson.id)}
                      className={`btn btn-sm ${isCompleted ? 'btn-success' : 'btn-ghost'}`}
                    >
                      {isCompleted ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {course.content.materials.length > 0 && (
        <div className="card">
          <h3 className="mb-md">Materials</h3>
          <div className="flex flex-col gap-sm">
            {course.content.materials.map(material => (
              <div
                key={material.id}
                className="flex flex-between flex-center"
                style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-input)' }}
              >
                <div className="flex flex-center gap-sm">
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <span style={{ fontWeight: 700 }}>{material.title}</span>
                </div>
                <a href={material.url} className="btn btn-sm btn-ghost" target="_blank" rel="noopener noreferrer">Download</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toast
        message="Progress saved!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </PageShell>
  );
};

export default StudentCourseView;


