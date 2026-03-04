import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorAddContent = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const backTo = location.state?.backTo || "/educator/publish";

  const storageKey = useMemo(() => {
    const email = currentUser?.email || "unknown";
    return `edupath_publish_content_${email}`;
  }, [currentUser?.email]);

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const readList = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const addItem = () => {
    setErr("");

    const t = type.trim();
    const n = name.trim();

    if (!t || !n) {
      setErr("Please select a content type and enter a name.");
      return;
    }

    const list = readList();
    const newItem = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      type: t,
      name: n
    };

    const updated = [...list, newItem]; // append to end
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setName("");
    setType("");
  };

  return (
    <PageShell>
      <div className="space-y-5">
        <div className="glass-card p-6">
          <h1 className="text-xl font-semibold text-text-dark">Add Course Content</h1>
          <p className="mt-1 text-xs text-muted">
            Add videos, documents, PowerPoints, or quizzes. Each item will appear in your course content list.
          </p>

          {err && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-600">
              {err}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
            <div>
              <label className="font-semibold text-text-dark">Content Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring"
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="Video">Video</option>
                <option value="Document">Document</option>
                <option value="PowerPoint">PowerPoint</option>
                <option value="Quiz">Quiz</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-text-dark">Content Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eg: Intro to Variables"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 outline-none ring-primary/40 focus:ring"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate(backTo)} className="btn-soft px-7 py-2 text-xs">
              Back
            </button>

            <button type="button" onClick={addItem} className="btn-primary px-7 py-2 text-xs">
              Add Item
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EducatorAddContent;
