import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import SearchBar from '../../components/common/SearchBar';
import { mockCourses } from '../../data/mockCourses';

const StudentCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(mockCourses.map(c => c.category))];

  const filteredCourses = useMemo(() => {
    return mockCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      return matchesSearch && matchesCategory && course.status === 'approved';
    });
  }, [searchTerm, selectedCategory]);

  return (
    <PageShell title="Available Courses">
      <div className="flex flex-between flex-center mb-md" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search courses..." />
        <select
          className="input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-3">
        {filteredCourses.map(course => (
          <motion.div
            key={course.id}
            whileHover={{ scale: 1.02, y: -2 }}
            className="card"
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-input)', marginBottom: '12px' }}
            />
            <h4 className="mb-sm">{course.title}</h4>
            <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px' }}>{course.description.substring(0, 100)}...</p>
            <div className="flex flex-between flex-center mb-sm">
              <span className="badge badge-primary">{course.category}</span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>⭐ {course.rating}</span>
            </div>
            <Link to={`/student/courses/${course.id}`} className="btn btn-primary w-full">View Course</Link>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center mt-lg">
          <p className="text-muted">No courses found</p>
        </div>
      )}
    </PageShell>
  );
};

export default StudentCourses;


