import React from "react";
import DashboardFooter from "../../components/layouts/DashboardFooter.jsx";

const AdminFooter = () => {
  return (
    <DashboardFooter
      panelLabel="Admin Panel"
      description="Securely manage users, educator verification, course approvals, and platform operations."
      sections={[
        {
          title: "Admin",
          items: [
            { label: "Dashboard", to: "/admin" },
            { label: "Verify Educators", to: "/admin/verify-educators" },
            { label: "Course Reviews", to: "/admin/approvals" },
            { label: "Create Reviewer", to: "/admin/reviewers" },
          ],
        },
        {
          title: "Help & Policy",
          items: [
            { label: "Admin Help Center", to: "/admin/help" },
            { label: "Contact Support", to: "/admin/contact" },
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms & Conditions", to: "/terms" },
          ],
        },
      ]}
    />
  );
};

export default AdminFooter;
