import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const EducatorCreateCourse = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showContentModal, setShowContentModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    thumbnail: 'https://via.placeholder.com/400x250/20c6a5/ffffff?text=New+Course'
  });
  const [contentItems, setContentItems] = useState([]);
  const [newContent, setNewContent] = useState({
    type: 'video',
    title: '',
    duration: '',
    url: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (e) => {
    setNewContent({ ...newContent, [e.target.name]: e.target.value });
  };

  const addContentItem = () => {
    if (newContent.title) {
      setContentItems([...contentItems, { ...newContent, id: Date.now() }]);
      setNewContent({ type: 'video', title: '', duration: '', url: '' });
      setShowContentModal(false);
    }
  };

  const removeContentItem = (id) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save course to localStorage (in a real app, this would go to backend)
    const courses = JSON.parse(localStorage.getItem('educator_courses') || '[]');
    const course = {
      ...formData,
      id: `course-${Date.now()}`,
      educatorId: currentUser?.id,
      educatorName: currentUser?.name,
      specialization: currentUser?.specialization || formData.category,
      rating: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      content: {
        modules: [{
          id: 'mod-1',
          title: 'Course Content',
          lessons: contentItems.map(item => ({
            id: `les-${item.id}`,
            title: item.title,
            type: item.type,
            duration: item.duration || 'N/A',
            completed: false
          }))
        }],
        materials: contentItems.filter(item => item.type === 'pdf' || item.type === 'ppt').map(item => ({
          id: `mat-${item.id}`,
          title: item.title,
          type: item.type,
          url: item.url || '#'
        }))
      }
    };
    
    courses.push(course);
    localStorage.setItem('educator_courses', JSON.stringify(courses));
    
    setShowToast(true);
    setTimeout(() => {
      navigate('/educator/courses');
    }, 1500);
  };

  return (
    <PageShell title="Create New Course">
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        <div className="card">
          <h3 className="mb-md">Course Information</h3>
          
          <div className="flex flex-col gap-md">
            <div>
              <label htmlFor="title">Course Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                className="input mt-sm"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                className="input mt-sm"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="grid grid-2 gap-md">
              <div>
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  className="input mt-sm"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Design">Design</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label htmlFor="level">Level *</label>
                <select
                  id="level"
                  name="level"
                  className="input mt-sm"
                  value={formData.level}
                  onChange={handleChange}
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-between flex-center mb-md">
            <h3>Course Content</h3>
            <button
              type="button"
              onClick={() => setShowContentModal(true)}
              className="btn btn-primary btn-sm"
            >
              + Add Content
            </button>
          </div>

          {contentItems.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '12px' }}>No content added yet. Click "Add Content" to get started.</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {contentItems.map(item => (
                <div
                  key={item.id}
                  className="flex flex-between flex-center"
                  style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-input)' }}
                >
                  <div className="flex flex-center gap-sm">
                    <span style={{ fontSize: '20px' }}>
                      {item.type === 'video' ? '▶' : item.type === 'quiz' ? '📝' : '📄'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.title}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>{item.type} • {item.duration || 'N/A'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeContentItem(item.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-sm">
          <button type="submit" className="btn btn-primary">Submit for Review</button>
          <button
            type="button"
            onClick={() => navigate('/educator/courses')}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>

      <Modal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        title="Add Content"
      >
        <div className="flex flex-col gap-md">
          <div>
            <label htmlFor="contentType">Content Type *</label>
            <select
              id="contentType"
              name="type"
              className="input mt-sm"
              value={newContent.type}
              onChange={handleContentChange}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF Document</option>
              <option value="ppt">PowerPoint</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          <div>
            <label htmlFor="contentTitle">Title *</label>
            <input
              id="contentTitle"
              name="title"
              type="text"
              className="input mt-sm"
              value={newContent.title}
              onChange={handleContentChange}
              required
            />
          </div>

          <div>
            <label htmlFor="contentDuration">Duration</label>
            <input
              id="contentDuration"
              name="duration"
              type="text"
              className="input mt-sm"
              value={newContent.duration}
              onChange={handleContentChange}
              placeholder="e.g., 15 min"
            />
          </div>

          <div>
            <label htmlFor="contentUrl">URL (optional)</label>
            <input
              id="contentUrl"
              name="url"
              type="text"
              className="input mt-sm"
              value={newContent.url}
              onChange={handleContentChange}
              placeholder="https://..."
            />
          </div>

          <button onClick={addContentItem} className="btn btn-primary">Add</button>
        </div>
      </Modal>

      <Toast
        message="Course submitted for review!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </PageShell>
  );
};

export default EducatorCreateCourse;


