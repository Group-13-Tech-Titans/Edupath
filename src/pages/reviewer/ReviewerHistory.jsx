import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import { useAuth } from '../../context/AuthContext';
import { mockCourses } from '../../data/mockCourses';

const ReviewerHistory = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const allReviews = JSON.parse(localStorage.getItem('course_reviews') || '[]');
    const myReviews = allReviews.filter(r => 
      r.reviewedBy === currentUser?.email || r.reviewedBy === currentUser?.id
    );
    setReviews(myReviews);
  }, [currentUser]);

  const getCourseById = (courseId) => {
    return mockCourses.find(c => c.id === courseId);
  };

  const getDecisionBadge = (decision) => {
    const badges = {
      approve: { class: 'badge-success', text: 'Approved' },
      reject: { class: 'badge-danger', text: 'Rejected' },
      'approve-minor': { class: 'badge-warning', text: 'Approved (Minor)' },
      'approve-major': { class: 'badge-warning', text: 'Approved (Major)' }
    };
    return badges[decision] || { class: 'badge-info', text: decision };
  };

  return (
    <PageShell title="Review History">
      {reviews.length === 0 ? (
        <div className="text-center mt-lg">
          <p className="text-muted">No review history found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {reviews.map((review, idx) => {
            const course = getCourseById(review.courseId);
            if (!course) return null;
            const badge = getDecisionBadge(review.decision);
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex flex-between flex-center mb-sm">
                  <h3>{course.title}</h3>
                  <span className={`badge ${badge.class}`}>{badge.text}</span>
                </div>
                <div className="flex flex-between flex-center mb-sm">
                  <span className="text-muted" style={{ fontSize: '12px' }}>
                    Reviewed on {new Date(review.reviewedAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>⭐ {review.rating}/5</span>
                </div>
                {review.comment && (
                  <p className="text-muted" style={{ fontSize: '12px', marginTop: '12px' }}>
                    {review.comment}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default ReviewerHistory;


