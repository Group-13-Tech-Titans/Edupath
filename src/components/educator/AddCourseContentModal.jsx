import React, { useState } from "react";

export default function AddCourseContentModal({ isOpen, onClose,
    onAddContent, }) {
    const [activeTab, setActiveTab] = useState("pdf");

    /* ---------------- VIDEO + PDF DESCRIPTION STATE ---------------- */
    const [videoDescription, setVideoDescription] = useState("");
    const [pdfDescription, setPdfDescription] = useState("");
    const [title, setTitle] = useState("");
    const [section, setSection] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    /* ---------------- MULTIPLE QUIZZES STATE ---------------- */
    const [quizzes, setQuizzes] = useState([
        {
            question: "",
            description: "",
            answers: ["", ""],
            correctIndex: 0,
        },
    ]);

    if (!isOpen) return null;

    const tabStyle = (tab) =>
        `flex items-center gap-2 px-6 py-2 rounded-full shadow-sm transition font-medium ${activeTab === tab
            ? "bg-teal-500 text-white shadow-md"
            : "bg-white text-gray-600 border"
        }`;

    /* ---------------- QUIZ FUNCTIONS ---------------- */

    const addQuiz = () => {
        setQuizzes([
            ...quizzes,
            {
                question: "",
                description: "",
                answers: ["", ""],
                correctIndex: 0,
            },
        ]);
    };

    const deleteQuiz = (quizIndex) => {
        if (quizzes.length === 1) return;
        setQuizzes(quizzes.filter((_, i) => i !== quizIndex));
    };

    const updateQuestion = (value, quizIndex) => {
        const updated = [...quizzes];
        updated[quizIndex].question = value;
        setQuizzes(updated);
    };

    const updateDescription = (value, quizIndex) => {
        const updated = [...quizzes];
        updated[quizIndex].description = value;
        setQuizzes(updated);
    };

    const addAnswer = (quizIndex) => {
        const updated = [...quizzes];
        updated[quizIndex].answers.push("");
        setQuizzes(updated);
    };

    const deleteAnswer = (quizIndex, answerIndex) => {
        const updated = [...quizzes];
        if (updated[quizIndex].answers.length <= 2) return;

        updated[quizIndex].answers.splice(answerIndex, 1);

        if (updated[quizIndex].correctIndex >= updated[quizIndex].answers.length) {
            updated[quizIndex].correctIndex = 0;
        }

        setQuizzes(updated);
    };

    const updateAnswer = (value, quizIndex, answerIndex) => {
        const updated = [...quizzes];
        updated[quizIndex].answers[answerIndex] = value;
        setQuizzes(updated);
    };

    const setCorrectAnswer = (quizIndex, answerIndex) => {
        const updated = [...quizzes];
        updated[quizIndex].correctIndex = answerIndex;
        setQuizzes(updated);
    };

    const handleSubmit = () => {
        let contentData = {
            title,
            section,
            type: activeTab,
        };

        if (activeTab === "video") {
            contentData.file = videoFile;
            contentData.description = videoDescription;
        }

        if (activeTab === "pdf") {
            contentData.file = pdfFile;
            contentData.description = pdfDescription;
        }

        if (activeTab === "quiz") {
            contentData.quizzes = quizzes;
        }

        // Get existing contents from localStorage
        const existingContents =
            JSON.parse(localStorage.getItem("courseContents")) || [];

        // Add new content
        const updatedContents = [...existingContents, contentData];

        // Save back to localStorage
        localStorage.setItem(
            "courseContents",
            JSON.stringify(updatedContents)
        );

        // Also call parent if exists
        if (onAddContent) {
            onAddContent(contentData);
        }


        // reset fields
        setTitle("");
        setSection("");
        setVideoDescription("");
        setPdfDescription("");
        setVideoFile(null);
        setPdfFile(null);
        setQuizzes([
            {
                question: "",
                description: "",
                answers: ["", ""],
                correctIndex: 0,
            },
        ]);

        onClose();
    };

    /* ---------------- UI ---------------- */

    return (
        <div className="fixed inset-0 bg-teal-100 bg-opacity-60 flex items-center justify-center z-50 p-6 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl p-10 relative max-h-[90vh] overflow-y-auto">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border-2 border-red-500 rounded-full text-red-500 hover:bg-red-50 transition"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    Add Course Content
                </h2>

                <p className="text-gray-500 mb-4">
                    Select content type and fill details.
                </p>

                {/* Tabs */}
                <div className="flex gap-4 mb-2">
                    <button onClick={() => setActiveTab("video")} className={tabStyle("video")}>
                        ▶ Video
                    </button>

                    <button onClick={() => setActiveTab("pdf")} className={tabStyle("pdf")}>
                        📄 PDF/PPT
                    </button>

                    <button onClick={() => setActiveTab("quiz")} className={tabStyle("quiz")}>
                        📝 Quiz
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">

                    {/* Title */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                            Content Title
                        </label>
                        <input
                            type="text"
                            placeholder="Eg: Python Data Types"
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Section */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                            Section (optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Eg: Module 01"
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        />
                    </div>

                    {/* VIDEO TAB */}
                    {activeTab === "video" && (
                        <div className="col-span-2 space-y-4">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Upload Video
                                </label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    className="w-full p-3 border rounded-xl bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Video Description
                                </label>
                                <textarea
                                    rows="4"
                                    value={videoDescription}
                                    onChange={(e) => setVideoDescription(e.target.value)}
                                    className="w-full p-1 border rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* PDF TAB */}
                    {activeTab === "pdf" && (
                        <div className="col-span-2 space-y-4">
                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    Upload File (PDF / PPT / PPTX)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.ppt,.pptx"
                                    onChange={(e) => setPdfFile(e.target.files[0])}
                                    className="w-full p-3 border rounded-xl bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-gray-700 mb-2">
                                    File Description
                                </label>
                                <textarea
                                    rows="4"
                                    value={pdfDescription}
                                    onChange={(e) => setPdfDescription(e.target.value)}
                                    className="w-full p-1 border rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* QUIZ TAB */}
                    {activeTab === "quiz" && (
                        <div className="col-span-2 space-y-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-teal-100">

                            {quizzes.map((quiz, quizIndex) => (
                                <div
                                    key={quizIndex}
                                    className="border rounded-2xl p-6 bg-gray-50 relative"
                                >
                                    {quizzes.length > 1 && (
                                        <button
                                            onClick={() => deleteQuiz(quizIndex)}
                                            className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-semibold"
                                        >
                                            Delete Quiz
                                        </button>
                                    )}

                                    <h3 className="font-bold text-lg mb-4 text-teal-600">
                                        Quiz {quizIndex + 1}
                                    </h3>

                                    <label className="block font-semibold mb-2">
                                        Question
                                    </label>

                                    <textarea
                                        rows="1"
                                        value={quiz.question}
                                        onChange={(e) =>
                                            updateQuestion(e.target.value, quizIndex)
                                        }
                                        className="w-full p-1 border rounded-xl mb-2"
                                    />

                                    {/* NEW: Question Description */}
                                    <label className="block font-semibold mb-2">
                                        Question Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={quiz.description}
                                        onChange={(e) =>
                                            updateDescription(e.target.value, quizIndex)
                                        }
                                        className="w-full p-1 border rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                                    />

                                    <div className="space-y-2">
                                        {quiz.answers.map((answer, answerIndex) => (
                                            <div key={answerIndex} className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={quiz.correctIndex === answerIndex}
                                                    onChange={() =>
                                                        setCorrectAnswer(quizIndex, answerIndex)
                                                    }
                                                    className="w-5 h-5 accent-teal-500"
                                                />

                                                <input
                                                    type="text"
                                                    value={answer}
                                                    onChange={(e) =>
                                                        updateAnswer(
                                                            e.target.value,
                                                            quizIndex,
                                                            answerIndex
                                                        )
                                                    }
                                                    className="flex-1 p-3 border rounded-xl"
                                                />

                                                {quiz.answers.length > 2 && (
                                                    <button
                                                        onClick={() =>
                                                            deleteAnswer(quizIndex, answerIndex)
                                                        }
                                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => addAnswer(quizIndex)}
                                        className="mt-4 text-teal-600 font-semibold hover:underline"
                                    >
                                        + Add Answer
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={addQuiz}
                                className="w-full py-3 border-2 border-dashed border-teal-400 text-teal-600 rounded-xl hover:bg-teal-50 transition"
                            >
                                + Add Another Quiz
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-6 mt-10">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-full border-2 border-teal-400 text-teal-600 shadow-sm hover:bg-teal-50 transition"
                    >
                        Cancel
                    </button>

                    <button onClick={handleSubmit} className="px-8 py-3 rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition">
                        Add Content
                    </button>
                </div>
            </div>
        </div>
    );
}
