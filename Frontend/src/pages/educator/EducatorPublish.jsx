import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AddCourseContentModal from "../../components/educator/AddCourseContentModal";
import CourseContentList from "../../components/educator/CourseContentList";

export default function EducatorPublish() {
  const [courseContents, setCourseContents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contents, setContents] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleSaveContent = (data) => {
    if (editIndex !== null) {
      const updated = [...contents];
      updated[editIndex] = data;
      setContents(updated);
      setEditIndex(null);
    } else {
      setContents([...contents, data]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (index) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleReorder = (from, to) => {
    const updated = [...contents];
    const movedItem = updated.splice(from, 1)[0];
    updated.splice(to, 0, movedItem);
    setContents(updated);
  };
  useEffect(() => {
    const storedContents =
      JSON.parse(localStorage.getItem("courseContents")) || [];

    setCourseContents(storedContents);
  }, []);

  const handleDeleteContent = (indexToDelete) => {
    const updatedContents = courseContents.filter(
      (_, index) => index !== indexToDelete
    );

    setCourseContents(updatedContents);

    localStorage.setItem(
      "courseContents",
      JSON.stringify(updatedContents)
    );
  };


  return (
    <div className="min-h-screen from-teal-300 via-green-200 to-gray-100 p-6">

      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Publish New Course
          </h1>
          <p className="text-500 text-sm mt-1">
            Create a course, add your content (video, files, quizzes), and publish when ready.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="px-4 py-2 border border-teal-500 text-teal-600 rounded-full hover:bg-teal-50 transition">
            Save Draft
          </button>

          <button className="px-6 py-2 bg-teal-500 text-white rounded-full shadow hover:bg-teal-600 transition">
            Publish
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT SIDE */}
        <div>
          <h2 className="text-xl text-gray-800 mb-2 font-bold">
            Course Details
          </h2>
          <p className="text-500 text-sm mb-6">
            Basic course information visible to students.
          </p>

          {/* Course Title */}
          <div className="mb-5">
            <label className="font-bold block text-sm font-medium mb-2">
              Course Title
            </label>
            <input
              type="text"
              placeholder="Eg: python for beginners"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="font-bold block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Write a clear description: what students will learn, outcomes, prerequisites..."
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* Course Content */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold font-medium">
                Course Content
              </label>

              <button
                onClick={() => {
                  setEditIndex(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-1 text-sm bg-teal-500 text-white rounded-full"
              >
                + Add Course Content
              </button>

            </div>

            <div className="mt-8 space-y-4">
              {courseContents.length === 0 && (
                <div className="border rounded-lg p-4 bg-gray-50 text-gray-500 text-sm"> No content added yet. Click <b>Add Course Content</b> to begin.</div>
              )}

              {courseContents.map((content, index) => (
                <div
                  key={index}
                  className="border rounded-2xl p-5 bg-gray-50 shadow-sm relative"
                >
                  <button
                    onClick={() => handleDeleteContent(index)}
                    className="absolute top-4 right-4 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>

                  <h3 className="font-bold text-lg text-teal-600">
                    {content.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Section: {content.section || "General"}
                  </p>

                  <p className="text-sm capitalize font-semibold mb-2">
                    Type: {content.type}
                  </p>

                  {/* VIDEO */}
                  {content.type === "video" && (
                    <>
                      <p>{content.description}</p>
                      {content.file && (
                        <p className="text-sm text-gray-400">
                          File: {content.file.name}
                        </p>
                      )}
                    </>
                  )}

                  {/* PDF */}
                  {content.type === "pdf" && (
                    <>
                      <p>{content.description}</p>
                      {content.file && (
                        <p className="text-sm text-gray-400">
                          File: {content.file.name}
                        </p>
                      )}
                    </>
                  )}

                  {/* QUIZ */}
                  {content.type === "quiz" && (
                    <div className="space-y-3">
                      {content.quizzes.map((quiz, i) => (
                        <div key={i} className="border rounded-xl p-3 bg-white">
                          <p className="font-semibold">
                            Q{i + 1}: {quiz.question}
                          </p>

                          <p className="text-sm text-gray-500">
                            {quiz.description}
                          </p>

                          <ul className="list-disc ml-6 mt-2">
                            {quiz.answers.map((ans, idx) => (
                              <li
                                key={idx}
                                className={
                                  idx === quiz.correctIndex
                                    ? "text-teal-600 font-semibold"
                                    : ""
                                }
                              >
                                {ans}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white shadow-md rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Course Setup
          </h2>
          <p className="text-500 text-sm mb-6">
            Quick settings for your course.
          </p>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-bold font-medium mb-2">
              Category
            </label>
            <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none">
              <option>Select Category</option>
              <option>Programming</option>
              <option>Business</option>
              <option>Design</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <label className="block text-sm font-bold font-medium mb-2">
              Difficulty
            </label>
            <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none">
              <option>Select Difficulty</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          {/* Price */}
          <div className="mb-4">
            <label className="block text-sm font-bold font-medium mb-2">
              Price (LKR)
            </label>
            <input
              type="number"
              placeholder="Eg: 5000"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* Thumbnail */}
          <div className="mb-6">
            <label className="block text-sm font-bold font-medium mb-2">
              Thumbnail (optional)
            </label>
            <input
              type="file"
              className="w-full text-gray-500 text-sm p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </div>

          {/* Buttons */}
          <button className="w-full mb-3 py-2 border border-teal-500 text-teal-600 rounded-full hover:bg-teal-50 transition">
            Preview
          </button>

          <button className="w-full py-3 bg-teal-500 text-white rounded-full shadow hover:bg-teal-600 transition">
            Publish
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-16">
        © 2026 EduPath. All rights reserved.
      </div>

      <AddCourseContentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditIndex(null);
        }}
        onSave={handleSaveContent}
        editData={editIndex !== null ? contents[editIndex] : null}
      />



    </div>


  );
};


