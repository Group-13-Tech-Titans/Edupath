import React from "react";

export default function CourseContentList({ contents, onEdit, onDelete }) {
  if (!contents.length) return null;

  return (
    <div className="mt-8 space-y-4">
      {contents.map((content, index) => (
        <div
          key={content.id || index}
          className="border rounded-2xl p-5 bg-gray-50 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-end gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(index)}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
              >
                Delete
              </button>
            )}
          </div>
          <h3 className="font-bold text-lg text-teal-600">
            {content.title || "Untitled Content"}
          </h3>

          <p className="text-sm text-gray-500 mb-2">
            Section: {content.section || "General"}
          </p>

          <p className="text-sm font-semibold capitalize mb-2">
            Type: {content.type}
          </p>

          {content.type === "video" && (
            <div>
              <p className="text-gray-600">
                {content.description}
              </p>
              {content.file && (
                <p className="text-sm text-gray-400 mt-1">
                  File: {content.file.name}
                </p>
              )}
            </div>
          )}

          {content.type === "pdf" && (
            <div>
              <p className="text-gray-600">
                {content.description}
              </p>
              {content.file && (
                <p className="text-sm text-gray-400 mt-1">
                  File: {content.file.name}
                </p>
              )}
            </div>
          )}

          {content.type === "quiz" && (
            <div className="space-y-3">
              {content.quizzes.map((quiz, i) => (
                <div key={i} className="border rounded-xl p-3 bg-white">
                  <p className="font-semibold">
                    Q{i + 1}: {quiz.question}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {quiz.description}
                  </p>

                  <ul className="list-disc ml-6">
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
  );
}
