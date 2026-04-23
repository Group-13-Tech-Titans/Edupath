import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";
import AddCourseContentModal from "../../components/educator/AddCourseContentModal";
import CourseContentList from "../../components/educator/CourseContentList";

export default function EducatorAddContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, courses, updateCourseContent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const course = useMemo(
    () => courses.find((c) => c.id === id || c._id === id) || null,
    [courses, id]
  );

  const isOwner =
    currentUser?.role === "educator" &&
    Boolean(course) &&
    course.createdByEducatorEmail === currentUser?.email;

  const courseContents = useMemo(() => {
    const items = course?.content?.items;
    return Array.isArray(items) ? items : [];
  }, [course]);

  const handleAddContent = (newContent) => {
    if (!isOwner) return;
    const next = [...courseContents];
    if (editIndex !== null) next[editIndex] = newContent;
    else next.push(newContent);
    updateCourseContent(course.id, next);
    setEditIndex(null);
    setIsModalOpen(false);
  };

  const handleDelete = (indexToDelete) => {
    if (!isOwner) return;
    const next = courseContents.filter((_, idx) => idx !== indexToDelete);
    updateCourseContent(course.id, next);
  };

  if (!course) {
    return (
      <PageShell>
        <p className="text-sm text-muted">Course not found.</p>
      </PageShell>
    );
  };

  return (
    <PageShell>
      <div className="space-y-4">
        <div className="glass-card p-5">
          <h1 className="text-xl font-semibold text-text-dark">Manage Course Content</h1>
          <p className="mt-1 text-xs text-muted">
            Course: {course.title}
          </p>
          {!isOwner && (
            <p className="mt-2 text-xs text-rose-600">You can only edit your own courses.</p>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditIndex(null);
                setIsModalOpen(true);
              }}
              disabled={!isOwner}
              className="btn-primary px-5 py-2 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              + Add Content
            </button>
            <button
              type="button"
              onClick={() => navigate(`/educator/courses/${course.id}`)}
              className="btn-soft px-5 py-2 text-xs"
            >
              Back to course
            </button>
          </div>

          {courseContents.length === 0 ? (
            <p className="text-xs text-muted">No content added yet.</p>
          ) : (
            <CourseContentList
              contents={courseContents}
              onEdit={isOwner ? (idx) => {
                setEditIndex(idx);
                setIsModalOpen(true);
              } : undefined}
              onDelete={isOwner ? handleDelete : undefined}
            />
          )}
        </div>

        <AddCourseContentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditIndex(null);
          }}
          onAddContent={handleAddContent}
          initialData={editIndex !== null ? courseContents[editIndex] : null}
        />
      </div>
    </PageShell>
  );
}
