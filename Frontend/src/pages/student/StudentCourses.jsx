import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PageShell from "../../components/PageShell.jsx";

const StudentCourses = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 FETCH DIRECTLY FROM DB: Ensures fresh data is always displayed
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch FRESH user data straight from the backend
        const { data: userData } = await axios.get("http://localhost:5000/api/auth/me", config);
        const freshUser = userData.user || userData;
        
        // 2. Extract IDs safely
        const enrolledCourseIds = freshUser.enrolledCourses?.map(c => String(c.courseId)) || [];

        // 3. Fetch all courses
        const { data: coursesData } = await axios.get("http://localhost:5000/api/courses", config);
        const allCourses = coursesData.courses || coursesData || [];

        // 4. Filter only the enrolled ones
        const filteredCourses = allCourses.filter(c => 
          enrolledCourseIds.includes(String(c._id || c.id))
        );

        setMyCourses(filteredCourses);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="p-10 text-center text-sm font-semibold text-muted animate-pulse">
          Loading your enrolled courses...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            My Courses
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Pick up right where you left off and continue your learning journey.
          </p>
        </div>
        
        {/* Course Grid */}
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          
          {myCourses.map((course) => (
            <div
              key={course._id || course.id}
              className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* 🖼️ Image Container with Hover Zoom */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={course.thumbnailUrl || course.thumbnail || "https://placehold.co/600x400/e2e8f0/64748b?text=EduPath+Course"}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Subtle dark gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* 📝 Content Body */}
              <div className="flex flex-col flex-1 p-6 sm:p-8">
                
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {course.category || "General"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">
                    {course.level || "All Levels"}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                  {course.description}
                </p>

                {/* Footer: Educator & Action Button */}
                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-inner">
                      {course.educatorName ? course.educatorName.charAt(0).toUpperCase() : "E"}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">
                      {course.educatorName || "EduPath"}
                    </span>
                  </div>

                  <Link
                    to={`/student/courses/${course._id || course.id}`}
                    className="bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md group-hover:bg-emerald-500 group-hover:shadow-emerald-500/40 transition-all active:scale-95"
                  >
                    Continue →
                  </Link>
                </div>
                
              </div>
            </div>
          ))}

          {/* 🟢 Empty State UI */}
          {myCourses.length === 0 && (
            <div className="col-span-full rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm mb-5">🎓</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">You haven't enrolled in any courses yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Your personal library is empty. Head over to your learning pathway to discover and join new courses!</p>
              <Link 
                to="/student/journey" 
                className="inline-block bg-emerald-500 text-white px-8 py-3 text-sm font-bold rounded-full shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all"
              >
                Explore Learning Journey
              </Link>
            </div>
          )}
          
        </div>
      </div>
    </PageShell>
  );
};

export default StudentCourses;