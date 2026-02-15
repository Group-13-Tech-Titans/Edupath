import React from "react";
import PageShell from "../../components/PageShell.jsx";
import { useApp } from "../../context/AppProvider.jsx";

const EducatorProfile = () => {
  const { currentUser } = useApp();
  const profile = currentUser?.profile || {};

  return (
    <PageShell>
      <div className="glass-card max-w-xl p-5 text-xs">
        <h1 className="text-xl font-semibold text-text-dark">Profile</h1>
        <p className="mt-1 text-muted">
          Your educator details and verification status. Editing is omitted in this
          demo.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-medium text-text-dark">{currentUser?.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-text-dark">{currentUser?.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Specialization tag</dt>
            <dd className="font-medium text-text-dark">
              {currentUser?.specializationTag || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Contact</dt>
            <dd className="font-medium text-text-dark">
              {profile.contact || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Verification status</dt>
            <dd className="font-medium text-text-dark">
              {currentUser?.status || "PENDING_VERIFICATION"}
            </dd>
          </div>
        </dl>
      </div>
    </PageShell>
  );
};

export default EducatorProfile;

