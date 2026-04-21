import React, { useState, useEffect } from "react";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx";

const AdminReviewers = () => {
  // 1. New State to hold real database reviewers
  const [reviewers, setReviewers] = useState([]); 
  const [loadingList, setLoadingList] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specializationTag: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Fetch real reviewers from the database on load
  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      const token = localStorage.getItem("edupath_token");
      const { data } = await axios.get("http://localhost:5000/api/auth/admin/reviewers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewers(data.reviewers);
      setLoadingList(false);
    } catch (err) {
      console.error("Failed to load reviewers", err);
      setLoadingList(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. REAL API CALL to save to database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("edupath_token");
      
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/admin/create-user",
        { 
          ...form, 
          role: "reviewer" // Force the role so the backend knows what to do
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Reviewer account created and saved to database!");
      setForm({ name: "", email: "", password: "", specializationTag: "" });
      
      // Instantly add the newly created reviewer to the UI list on the right
      setReviewers(prev => [...prev, data.user]);
      
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create reviewer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="grid gap-5 md:grid-cols-2">
        
        {/* CREATE REVIEWER FORM */}
        <div className="glass-card p-5 text-xs">
          <h1 className="text-xl font-semibold text-text-dark">Reviewer accounts</h1>
          <p className="mt-1 text-muted">
            Create reviewer logins. They will be saved directly to the database.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="font-medium">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            <div>
              <label className="font-medium">Specialization tag</label>
              <input
                name="specializationTag"
                value={form.specializationTag}
                onChange={handleChange}
                placeholder="Eg: ReactJS, Data Science"
                required
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 outline-none ring-primary/40 focus:ring"
              />
            </div>
            
            {error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-[11px] text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                {success}
              </p>
            )}
            
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-70">
              {isSubmitting ? "Creating..." : "Create reviewer"}
            </button>
          </form>
        </div>

        {/* LIST EXISTING REVIEWERS */}
        <div className="glass-card p-5 text-xs">
          <h2 className="text-sm font-semibold text-text-dark">Existing reviewers</h2>
          <ul className="mt-3 space-y-2">
            
            {loadingList && <li className="text-muted">Loading from database...</li>}
            
            {!loadingList && reviewers.map((r) => (
              <li
                key={r._id || r.id} // Use MongoDB _id
                className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2 shadow-sm"
              >
                <div>
                  <p className="font-medium text-text-dark">{r.name}</p>
                  <p className="text-[11px] text-muted">{r.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  {r.specializationTag || "No Specialization"}
                </span>
              </li>
            ))}
            
            {!loadingList && reviewers.length === 0 && (
              <li className="text-muted">No reviewer accounts in database yet.</li>
            )}
            
          </ul>
        </div>
      </div>
    </PageShell>
  );
};

export default AdminReviewers;
