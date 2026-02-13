import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageShell from '../../components/common/PageShell';
import Toast from '../../components/common/Toast';

const StudentMentorRequest = () => {
  const [formData, setFormData] = useState({
    specialization: '',
    sessionType: 'one-on-one',
    date: '',
    time: '',
    duration: '60',
    message: ''
  });
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to localStorage
    const requests = JSON.parse(localStorage.getItem('mentor_requests') || '[]');
    requests.push({
      ...formData,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('mentor_requests', JSON.stringify(requests));
    
    setShowToast(true);
    setFormData({
      specialization: '',
      sessionType: 'one-on-one',
      date: '',
      time: '',
      duration: '60',
      message: ''
    });
  };

  return (
    <PageShell title="Request a Mentor">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div>
            <label htmlFor="specialization">Specialization *</label>
            <select
              id="specialization"
              name="specialization"
              className="input mt-sm"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="">Select specialization</option>
              <option value="Data Science">Data Science</option>
              <option value="Web Development">Web Development</option>
              <option value="Programming">Programming</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Design">Design</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div>
            <label htmlFor="sessionType">Session Type *</label>
            <select
              id="sessionType"
              name="sessionType"
              className="input mt-sm"
              value={formData.sessionType}
              onChange={handleChange}
              required
            >
              <option value="one-on-one">One-on-One</option>
              <option value="group">Group Session</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>

          <div className="grid grid-2 gap-md">
            <div>
              <label htmlFor="date">Preferred Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                className="input mt-sm"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="time">Preferred Time *</label>
              <input
                id="time"
                name="time"
                type="time"
                className="input mt-sm"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration">Duration (minutes) *</label>
            <select
              id="duration"
              name="duration"
              className="input mt-sm"
              value={formData.duration}
              onChange={handleChange}
              required
            >
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="input mt-sm"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about what you'd like to discuss..."
            />
          </div>

          <button type="submit" className="btn btn-primary">Submit Request</button>
        </form>
      </motion.div>

      <Toast
        message="Mentor request submitted successfully!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </PageShell>
  );
};

export default StudentMentorRequest;


