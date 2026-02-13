import React, { useState } from "react";
import AddCourseContentModal from "../../components/educator/AddCourseContentModal";
import CourseContentList from "../../components/educator/CourseContentList";

export default function EducatorAddContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseContents, setCourseContents] = useState([]);

  const handleAddContent = (newContent) => {
    setCourseContents((prev) => [...prev, newContent]);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Course Content</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-teal-500 text-white rounded-xl"
      >
        + Add Content
      </button>

      <CourseContentList contents={courseContents} />

      <AddCourseContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddContent={handleAddContent}
      />
    </div>
  );
}
