import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../data/mockCourses';

const ReviewerCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [reviewData, setReviewData] = useState({
    decision: '',
    rating: 5,
    comment: ''
  });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const foundCourse = mockCourses.find(c => c.id === id);
    if (foundCourse && foundCourse.specialization === currentUser?.specialization) {
      setCourse(foundCourse);
    }
  }, [id, currentUser]);

  const handleChange = (e) => {
    setReviewData({ ...reviewData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!reviewData.decision) {
      alert('Please select a decision');
      return;
    }

    // Save review decision
    const reviews = JSON.parse(localStorage.getItem('course_reviews') || '[]');
    reviews.push({
      courseId: id,
      ...reviewData,
      reviewedBy: currentUser?.email || currentUser?.id,
      reviewerName: currentUser?.name || currentUser?.fullName,
      reviewedAt: new Date().toISOString()
    });
    localStorage.setItem('course_reviews', JSON.stringify(reviews));

    setShowToast(true);
    setTimeout(() => {
      navigate('/reviewer/review-queue');
    }, 1500);
  };

  if (!course) {
    return (
      <PageShell title="Course not found">
        <p className="text-muted">This course is not assigned to you or doesn't exist.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <button onClick={() => navigate('/reviewer/review-queue')} className="btn btn-ghost btn-sm mb-md">← Back to Queue</button>

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
          <span className="badge badge-warning">{course.status}</span>
          <span className="text-muted" style={{ fontSize: '12px' }}>By {course.educatorName}</span>
        </div>
      </div>

      <div className="card mb-md">
        <h2 className="mb-md">Course Content</h2>
        {course.content.modules.map((module, modIdx) => (
          <div key={module.id} className="mb-md" style={{ borderBottom: modIdx < course.content.modules.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: '18px' }}>
            <h3 className="mb-sm">{module.title}</h3>
            <div className="flex flex-col gap-sm">
              {module.lessons.map(lesson => (
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {course.content.materials.length > 0 && (
        <div className="card mb-md">
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
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="mb-md">Review Decision</h2>
        <div className="flex flex-col gap-md">
          <div>
            <label>Decision *</label>
            <div className="grid grid-2 gap-sm mt-sm">
              <button
                type="button"
                onClick={() => setReviewData({ ...reviewData, decision: 'approve' })}
                className={`btn ${reviewData.decision === 'approve' ? 'btn-success' : 'btn-ghost'}`}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setReviewData({ ...reviewData, decision: 'reject' })}
                className={`btn ${reviewData.decision === 'reject' ? 'btn-danger' : 'btn-ghost'}`}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => setReviewData({ ...reviewData, decision: 'approve-minor' })}
                className={`btn ${reviewData.decision === 'approve-minor' ? 'btn-warning' : 'btn-ghost'}`}
              >
                Approve (Minor Changes)
              </button>
              <button
                type="button"
                onClick={() => setReviewData({ ...reviewData, decision: 'approve-major' })}
                className={`btn ${reviewData.decision === 'approve-major' ? 'btn-warning' : 'btn-ghost'}`}
              >
                Approve (Major Changes)
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="rating">Rating (1-5) *</label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              className="input mt-sm"
              value={reviewData.rating}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="comment">Comments</label>
            <textarea
              id="comment"
              name="comment"
              className="input mt-sm"
              value={reviewData.comment}
              onChange={handleChange}
              rows="4"
              placeholder="Add your review comments..."
            />
          </div>

          <button onClick={handleSubmit} className="btn btn-primary">Submit Review</button>
        </div>
      </div>

      <Toast
        message="Review submitted successfully!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </PageShell>
  );
};

export default ReviewerCourseDetail;


