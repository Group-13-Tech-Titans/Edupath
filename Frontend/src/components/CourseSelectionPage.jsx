import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

// Base URL handling for imports from different depths
const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";
const VISIBLE_COURSE_STATUSES = new Set(["published", "approved", "draft"]); // Include 'approved'

const CourseSelectionPage = ({ onClose, onSelect }) => {
  const [dbCourses, setDbCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // For admin/reviewer we should probably fetch all approved courses
        const { data } = await axios.get(`${API_BASE_URL}/courses`, config);
        
        setDbCourses(data.courses || data || []);
      } catch (err) {
        console.error("Failed to fetch courses for selector:", err);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchAllCourses();
  }, []);

  const filteredCourses = dbCourses.filter((course) => {
    const status = (course.status || "").toLowerCase();
    const isVisible = VISIBLE_COURSE_STATUSES.has(status) || !course.status; // Fallback if no status
    const matchesSearch = (course.title || "").toLowerCase().includes(search.toLowerCase());
    return isVisible && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-emerald-50/50 px-4 py-8 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-emerald-100/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Select a Platform Course</h1>
            <p className="text-slate-500 text-sm mt-1">Browse and attach existing EduPath courses to your pathway step.</p>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 text-slate-600 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition active:scale-95"
          >
            ← Back to Builder
          </button>
        </div>

        <div className="mb-8">
            <label htmlFor="courseSearch" className="sr-only">Search Courses</label>
            <input
                id="courseSearch"
                type="text"
                placeholder="Search by course title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg"
            />
        </div>

        {isLoadingCourses ? (
          <div className="text-center py-10 text-slate-500 font-bold">Fetching courses from database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <p className="col-span-full text-center text-slate-500 py-10 italic">No courses found matching your search.</p>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id || course._id}
                  className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={course.thumbnailUrl || course.thumbnail || "https://placehold.co/600x400?text=No+Image"}
                    alt="course"
                    className="w-full h-48 object-cover bg-slate-100"
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-2">{course.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{course.educatorName || course.createdByEducatorEmail || "EduPath Educator"}</p>

                    <div className="mt-auto flex items-center justify-between">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${course.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {course.status ? course.status.toUpperCase() : "ALL LEVELS"}
                      </span>
                      <button
                        onClick={() => onSelect(course)}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors active:scale-95"
                      >
                        + Select Course
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CourseSelectionPage.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default CourseSelectionPage;
