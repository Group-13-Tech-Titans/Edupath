import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const StudentProfile = () => {
  const { currentUser } = useApp();
  const profile = currentUser?.profile || {};

  return (
    <PageShell>
      <div className="glass-card max-w-xl p-5">
        <h1 className="text-xl font-semibold text-text-dark">Profile</h1>
        <p className="mt-1 text-xs text-muted">
          Basic information from your registration. Editable fields are omitted in
          this demo.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-medium text-text-dark">
              {currentUser?.name || "Student"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-text-dark">{currentUser?.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Education level</dt>
            <dd className="font-medium text-text-dark">
              {profile.educationLevel || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Contact</dt>
            <dd className="font-medium text-text-dark">
              {profile.contact || "Not set"}
            </dd>
          </div>
        </dl>
      </div>
    </PageShell>
  );
};

export default StudentProfile;

