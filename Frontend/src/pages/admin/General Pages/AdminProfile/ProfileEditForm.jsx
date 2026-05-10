import React from "react";
import { Field, AvatarMini, inputClass } from "./ProfileSharedUI";

export default function ProfileEditForm({ form, editing, updateField, onPickAvatar, submitProfile }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-dark">Profile Details</h2>
        <span className="text-xs font-semibold text-muted">{editing ? "Editing" : "View Only"}</span>
      </div>
      
      <form id="profileForm" onSubmit={submitProfile} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <input 
              disabled={!editing} 
              value={form.fullName} 
              onChange={(e) => updateField("fullName", e.target.value)} 
              className={inputClass(!editing)} 
              placeholder="Admin name" 
            />
          </Field>
          
          <Field label="Email (read-only)">
            <input 
              disabled 
              value={form.email} 
              className={inputClass(true)} 
              placeholder="admin@edupath.com" 
            />
          </Field>
          
          <Field label="Phone">
            <input 
              disabled={!editing} 
              value={form.phone} 
              onChange={(e) => updateField("phone", e.target.value)} 
              className={inputClass(!editing)} 
              placeholder="+94 ..." 
            />
          </Field>
          
          <Field label="Avatar">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <AvatarMini avatar={form.avatar} name={form.fullName} />
              </div>
              <input 
                disabled={!editing} 
                type="file" 
                accept="image/*" 
                onChange={(e) => onPickAvatar(e.target.files?.[0])} 
                className={`block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary/15 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20 ${!editing ? "opacity-60 pointer-events-none" : ""}`} 
              />
            </div>
          </Field>
        </div>
        
        <Field label="Bio">
          <textarea 
            disabled={!editing} 
            value={form.bio} 
            onChange={(e) => updateField("bio", e.target.value)} 
            className={`${inputClass(!editing)} min-h-[110px] resize-none`} 
            placeholder="Short admin bio..." 
          />
        </Field>
      </form>
    </div>
  );
}