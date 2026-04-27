import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { state, currentUser, courses, lessonProgress, mentorRequests } = useApp();

    const email = currentUser?.email;
    const progress = lessonProgress[email] || {};
    const approvedCourses = courses.filter((c) => c.status === "approved");

    const completedCount = Object.values(progress).reduce(
        (acc, lessons) => acc + (lessons ? lessons.length : 0),
        0
    );

    const [hasPathway, setHasPathway] = useState(false);
    const [activePathway, setActivePathway] = useState(null);
    const [loadingPathway, setLoadingPathway] = useState(true);

    // 🟢 NEW: State for the Delete Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchPathwayStatus = async () => {
            try {
                const token = localStorage.getItem("edupath_token");
                if (!token) return;

                const { data } = await axios.get("http://localhost:5000/api/pathway/my", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.hasPathway && data.pathway) {
                    setHasPathway(true);
                    setActivePathway(data.pathway);
                } else {
                    setHasPathway(false);
                }
            } catch (err) {
                console.error("Failed to fetch pathway status", err);
            } finally {
                setLoadingPathway(false);
            }
        };

        fetchPathwayStatus();
    }, []);

    // 🟢 NEW: Function to handle the actual deletion
    const handleDeleteJourney = async () => {
        try {
            setIsDeleting(true);
            const token = localStorage.getItem("edupath_token");
            await axios.delete("http://localhost:5000/api/pathway/my", {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Instantly update the UI to show the "Find Your Pathway" button
            setHasPathway(false);
            setActivePathway(null);
            setShowDeleteModal(false);
        } catch (err) {
            alert("Failed to delete pathway. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    let pathwayProgress = 0;
    let completedSteps = 0;
    let totalSteps = 0;

    if (activePathway && activePathway.steps) {
        totalSteps = activePathway.steps.length;
        completedSteps = activePathway.steps.filter(s => s.isCompleted).length;
        pathwayProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    }

    return (
        <PageShell>
            <div className="max-w-5xl mx-auto space-y-8 pb-12">

                <div className="pt-4">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800">
                        Welcome back, {currentUser?.name || "Student"} 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Ready to continue your learning journey?</p>
                </div>

                {/* 🚀 MAIN HERO: PATHWAY BANNER */}
                {loadingPathway ? (
                    <div className="w-full h-56 bg-slate-200 animate-pulse rounded-[32px]"></div>
                ) : hasPathway && activePathway ? (
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-[32px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="w-full md:w-2/3">
                                <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-4 shadow-sm">
                                    {activePathway.level} Level
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
                                    {activePathway.pathName}
                                </h2>
                                <p className="text-emerald-50 text-sm sm:text-base max-w-md opacity-90">
                                    You've completed {completedSteps} out of {totalSteps} milestones. Keep up the great momentum!
                                </p>

                                <div className="mt-6 flex items-center gap-4">
                                    <div className="flex-1 max-w-sm bg-black/15 rounded-full h-3 shadow-inner overflow-hidden">
                                        <div
                                            className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${pathwayProgress}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-sm tracking-wider">{pathwayProgress}%</span>
                                </div>

                                <div className="mt-8 flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={() => navigate("/student/journey")}
                                        className="bg-white text-teal-700 px-8 py-3.5 rounded-full font-black shadow-xl hover:scale-105 transition-transform active:scale-95"
                                    >
                                        RESUME JOURNEY →
                                    </button>

                                    {/* 🟢 NEW: Restart Journey Button */}
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="text-white/80 hover:text-white text-sm font-semibold underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all"
                                    >
                                        Restart Journey
                                    </button>
                                </div>
                            </div>

                            <div className="hidden md:flex w-1/3 justify-end pr-8">
                                <span className="text-[100px] drop-shadow-2xl hover:scale-110 transition-transform duration-500 cursor-default">
                                    🚀
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-[32px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-slate-700 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="w-full md:w-2/3">
                                <span className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                                    No Active Journey
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
                                    Find Your Perfect Path
                                </h2>
                                <p className="text-slate-300 text-sm sm:text-base max-w-md">
                                    Take our quick interactive questionnaire to discover a curated, step-by-step curriculum built specifically for your goals.
                                </p>

                                <button
                                    onClick={() => navigate("/student/path-finder")}
                                    className="mt-8 bg-primary text-white px-8 py-3.5 rounded-full font-black shadow-xl shadow-primary/20 hover:scale-105 hover:brightness-110 transition-all active:scale-95"
                                >
                                    FIND YOUR PATHWAY ✨
                                </button>
                            </div>

                            <div className="hidden md:flex w-1/3 justify-end pr-8">
                                <span className="text-[100px] drop-shadow-2xl hover:rotate-12 transition-transform duration-500 cursor-default">
                                    🧭
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl">
                            📚
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Courses</p>
                            <p className="text-3xl font-black text-slate-800">{approvedCourses.length}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl">
                            ✅
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Lessons Done</p>
                            <p className="text-3xl font-black text-slate-800">{completedCount}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-3xl">
                            🔥
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Study Streak</p>
                            <p className="text-3xl font-black text-slate-800">7 Days</p>
                        </div>
                    </div>
                </div>

                {/* 🤝 MENTORSHIP SESSIONS */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <span>🤝</span> Mentorship Sessions
                        </h2>
                        <button
                            onClick={() => navigate("/student/mentor")}
                            className="text-primary text-sm font-bold hover:underline"
                        >
                            Request New Session
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(state.mentorRequests || []).filter(r => r.userEmail === currentUser?.email).length > 0 ? (
                            (state.mentorRequests || [])
                                .filter(r => r.userEmail === currentUser?.email)
                                .map((req) => (
                                    <div key={req.id} className={`p-6 rounded-[32px] border-2 transition-all ${req.status === 'accepted' ? 'border-emerald-100 bg-emerald-50/50' :
                                            req.status === 'rejected' ? 'border-red-100 bg-red-50/50' :
                                                'border-slate-100 bg-white'
                                        }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{req.field} Session</h3>
                                                <p className="text-xs text-slate-500">Mentor: <span className="font-bold text-slate-700">{req.mentorName || "Assigning..."}</span></p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        {req.status === 'accepted' ? (
                                            <div className="space-y-4">
                                                <div className="flex gap-4 p-3 bg-white rounded-2xl border border-emerald-100 text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Date</span>
                                                        <span className="font-bold text-slate-700">{req.scheduledDate}</span>
                                                    </div>
                                                    <div className="flex flex-col border-l pl-4">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Time</span>
                                                        <span className="font-bold text-slate-700">{req.scheduledTime}</span>
                                                    </div>
                                                </div>
                                                <a
                                                    href={req.meetingLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block w-full bg-slate-800 text-white text-center font-bold py-3 rounded-full shadow-lg hover:opacity-90 transition-all"
                                                >
                                                    JOIN SESSION →
                                                </a>
                                            </div>
                                        ) : req.status === 'rejected' ? (
                                            <div className="bg-white p-4 rounded-2xl border border-red-100">
                                                <p className="text-sm text-red-600 font-medium">
                                                    Unfortunately, this request was declined. You can try requesting another session with a different mentor or field.
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">
                                                Your request is being reviewed by the mentor. You'll see the schedule here once accepted.
                                            </p>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <div className="md:col-span-2 p-10 border-2 border-dashed border-slate-200 rounded-[32px] text-center">
                                <p className="text-slate-400 font-medium mb-4">You haven't requested any mentor sessions yet.</p>
                                <button
                                    onClick={() => navigate("/student/mentor")}
                                    className="bg-primary/10 text-primary font-bold px-6 py-2.5 rounded-full hover:bg-primary/20 transition-all"
                                >
                                    Request Your First Session
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* 🟢 NEW: Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
                            ⚠️
                        </div>
                        <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Abandon Journey?</h2>
                        <p className="text-center text-slate-500 mb-8">
                            Are you sure you want to delete your current learning pathway? You will lose all your progress and milestones for this specific journey.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeleteJourney}
                                disabled={isDeleting}
                                className="w-full bg-red-500 text-white font-bold py-3.5 rounded-full shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete Journey"}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="w-full bg-slate-100 text-slate-700 font-bold py-3.5 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </PageShell>
    );
};

export default StudentDashboard;
