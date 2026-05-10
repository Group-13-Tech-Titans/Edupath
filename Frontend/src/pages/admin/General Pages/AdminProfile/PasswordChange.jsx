import React, { useState } from "react";
import axios from "axios";
import { Field, inputClass } from "./ProfileSharedUI";

export default function PasswordChange({ changePasswordApi, getAuthHeader }) {
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!pwd.currentPassword) return setPwdMsg({ type: "error", text: "Enter current password." });
    if (pwd.newPassword.length < 6) return setPwdMsg({ type: "error", text: "New password must be at least 6 characters." });
    if (pwd.newPassword !== pwd.confirmPassword) return setPwdMsg({ type: "error", text: "Passwords do not match." });

    setIsUpdatingPassword(true);
    try {
      const payload = { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword };
      await axios.patch(changePasswordApi, payload, getAuthHeader());

      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwdMsg({ type: "success", text: "Password updated successfully!" });
    } catch (err) {
      setPwdMsg({ type: "error", text: err.response?.data?.message || "Failed to update password." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <h2 className="text-base font-semibold text-text-dark">Change Password</h2>
      {pwdMsg && (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm bg-white/70 ${pwdMsg.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"}`}>
          {pwdMsg.text}
        </div>
      )}
      <form onSubmit={handlePasswordChange} className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Current Password">
          <input type="password" value={pwd.currentPassword} onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} className={inputClass(false)} placeholder="••••••" />
        </Field>
        <Field label="New Password">
          <input type="password" value={pwd.newPassword} onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} className={inputClass(false)} placeholder="min 6 chars" />
        </Field>
        <Field label="Confirm Password">
          <input type="password" value={pwd.confirmPassword} onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))} className={inputClass(false)} placeholder="re-type" />
        </Field>
        <div className="sm:col-span-3">
          <button type="submit" disabled={isUpdatingPassword} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:brightness-95 disabled:opacity-70">
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}