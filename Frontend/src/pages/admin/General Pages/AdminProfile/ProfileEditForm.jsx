import React from "react";
// Import our shared UI components so we don't have to rewrite the same styling logic
import { Field, AvatarMini, inputClass } from "./ProfileSharedUI";

export default function ProfileEditForm({
  form,          // The object holding the current form values (name, email, etc.)
  editing,       // Boolean flag: true if the user clicked "Edit Profile", false if just viewing
  updateField,   // Function to handle typing in the input fields
  onPickAvatar,  // Function to handle uploading a new profile picture
  submitProfile, // Function triggered when the form is finally saved
}) {
  return (
    // Main container card for the form with a nice frosted glass effect
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      
      {/* Title and status badge (view/editing)*/}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-dark">
          Profile Details
        </h2>
        {/* Shows the user immediately if they can type in the boxes or not */}
        <span className="text-xs font-semibold text-muted">
          {editing ? "Editing" : "View Only"}
        </span>
      </div>

      
      <form
        id="profileForm"
        onSubmit={submitProfile}
        className="mt-4 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          
          {/* Full Name Input Box */}
          <Field label="Full Name">
            <input
              // Disable typing if we aren't in edit mode
              disabled={!editing}
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              // The inputClass helper automatically switches between "read-only style" and "editable style"
              className={inputClass(!editing)}
              placeholder="Admin name"
            />
          </Field>

          {/* Email show read only */}
          <Field label="Email (read-only)">
            <input
              disabled // read-only, never editable
              value={form.email}
              // We pass true to inputClass to force the disabled styling permanently
              className={inputClass(true)}
              placeholder="admin@edupath.com"
            />
          </Field>
          
        </div>
      </form>
    </div>
  );
}