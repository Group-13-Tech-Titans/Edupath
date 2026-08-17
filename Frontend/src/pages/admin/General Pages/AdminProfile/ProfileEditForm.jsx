import React from "react";

import { Field, AvatarMini, inputClass } from "./ProfileSharedUI";

//profile edit form component
export default function ProfileEditForm({
  form,          
  editing,       
  updateField,   
  onPickAvatar, 
  submitProfile, 
}) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      
      {/* Form header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-dark">
          Profile Details
        </h2>
        {/* Edit mode indicator */}
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
              disabled={!editing} //
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              
              className={inputClass(!editing)}
              placeholder="Admin name"
            />
          </Field>

          {/* Email show read only */}
          <Field label="Email (read-only)">
            <input
              disabled // read-only
              value={form.email}
              
              className={inputClass(true)}
            />
          </Field>
          
        </div>
      </form>
    </div>
  );
}