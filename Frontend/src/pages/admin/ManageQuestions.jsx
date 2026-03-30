import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper to generate unique IDs for React list keys (Fixes S6479)
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    priority: 1,
    // Store objects with unique IDs to satisfy SonarLint key rules
    answers: [{ id: generateId(), value: "" }, { id: generateId(), value: "" }] 
  });

  const getAuthHeaders = () => {
    const myToken = localStorage.getItem("edupath_token");
    return {
      headers: { Authorization: `Bearer ${myToken}` }
    };
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/questions", getAuthHeaders());
      // Sort questions and attach unique IDs to answers for rendering
      const sortedQuestions = res.data.sort((a, b) => a.priority - b.priority).map(q => ({
        ...q,
        answersWithIds: (q.answers || []).map(ans => ({ id: generateId(), value: ans }))
      }));
      setQuestions(sortedQuestions);
    } catch (error) {
      console.error("Error fetching questions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index].value = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const addAnswer = () => {
    if (formData.answers.length < 4) {
      setFormData({
        ...formData,
        answers: [...formData.answers, { id: generateId(), value: "" }]
      });
    }
  };

  const removeAnswer = (index) => {
    const newAnswers = formData.answers.filter((_, i) => i !== index);
    setFormData({ ...formData, answers: newAnswers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Extract just the string values and clean up empty answers before submitting
    const cleanedAnswers = formData.answers.map(a => a.value.trim()).filter(a => a !== "");
    
    if (cleanedAnswers.length === 0) {
      alert("Please provide at least one answer.");
      return;
    }

    const payload = { ...formData, answers: cleanedAnswers };

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/questions/${editingId}`, payload, getAuthHeaders());
      } else {
        await axios.post("http://localhost:5000/api/admin/questions", payload, getAuthHeaders());
      }
      
      // Reset form
      setFormData({ 
        title: "", 
        subtitle: "", 
        priority: 1, 
        answers: [{ id: generateId(), value: "" }, { id: generateId(), value: "" }] 
      });
      setEditingId(null);
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error.response?.data || error);
      const backendMessage = error.response?.data?.message || error.message;
      alert(`Backend Error: ${backendMessage}`);
    }
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    const qAnswers = (q.answers || []).length > 0 ? q.answers : ["", ""];
    setFormData({
      title: q.title,
      subtitle: q.subtitle,
      priority: q.priority || 1,
      // Map old answers to the new object structure with IDs
      answers: qAnswers.map(ans => ({ id: generateId(), value: ans }))
    });
  };

  const handleDelete = async (id) => {
    // S7764: Changed window.confirm to globalThis.confirm
    if (globalThis.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/questions/${id}`, getAuthHeaders());
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question", error);
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black text-slate-800 mb-8">Manage PathFinder Questions</h1>

      {/* QUESTION FORM */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
        <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Question" : "Add New Question"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              {/* S6853: Added htmlFor and id */}
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-1">Question Title</label>
              <input 
                id="title"
                type="text" required
                placeholder="e.g., What is your education level?"
                className="w-full border border-slate-300 rounded-lg px-4 py-2"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="md:col-span-5">
              <label htmlFor="subtitle" className="block text-sm font-bold text-slate-700 mb-1">Subtitle / Hint</label>
              <input 
                id="subtitle"
                type="text" 
                placeholder="e.g., This helps us match your starting point."
                className="w-full border border-slate-300 rounded-lg px-4 py-2"
                value={formData.subtitle} 
                onChange={e => setFormData({...formData, subtitle: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="priority" className="block text-sm font-bold text-slate-700 mb-1">Priority No.</label>
              <input 
                id="priority"
                type="number" required min="1"
                className="w-full border border-slate-300 rounded-lg px-4 py-2"
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            {/* S6853: Changed label to p since it has no specific input */}
            <p className="block text-sm font-bold text-slate-700 mb-2">Answers (Max 4)</p>
            {formData.answers.map((answerObj, index) => (
              // S6479: Using generated stable ID instead of index
              <div key={answerObj.id} className="flex gap-2 mb-2 items-center">
                <span className="text-sm font-bold text-slate-400 w-6">{index + 1}.</span>
                <input 
                  type="text" placeholder={`Answer option ${index + 1}`} required
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={answerObj.value} 
                  onChange={e => handleAnswerChange(index, e.target.value)}
                />
                {formData.answers.length > 1 && (
                  <button type="button" onClick={() => removeAnswer(index)} className="text-red-500 font-bold px-3 py-1 hover:bg-red-50 rounded">
                    X
                  </button>
                )}
              </div>
            ))}
            
            {formData.answers.length < 4 && (
              <button type="button" onClick={addAnswer} className="text-emerald-600 font-bold text-sm mt-2 hover:underline">
                + Add Another Answer
              </button>
            )}
            {formData.answers.length === 4 && (
              <p className="text-xs text-orange-500 font-bold mt-2">Maximum of 4 answers reached.</p>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button type="submit" className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition">
              {editingId ? "Update Question" : "Save Question"}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { 
                  setEditingId(null); 
                  setFormData({ title: "", subtitle: "", priority: 1, answers: [{ id: generateId(), value: "" }, { id: generateId(), value: "" }] }); 
                }} 
                className="text-slate-500 font-bold hover:underline"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* QUESTION LIST */}
      <div>
        <h2 className="text-xl font-bold mb-4">Current Questions</h2>
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
              <div>
                <p className="text-xs font-extrabold text-emerald-600 mb-1">Priority: {q.priority}</p>
                <h3 className="font-black text-lg text-slate-800">{q.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{q.subtitle}</p>
                <div className="flex flex-col gap-1.5">
                  {/* S6479: Mapping using the stable IDs we generated during fetch */}
                  {(q.answersWithIds || []).map((ansObj) => (
                    <div key={ansObj.id} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                      <span className="text-slate-700 text-sm font-semibold">{ansObj.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(q)} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100">Edit</button>
                <button onClick={() => handleDelete(q._id)} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-slate-500 italic">No questions added yet.</p>}
        </div>
      </div>
    </div>
  );
}