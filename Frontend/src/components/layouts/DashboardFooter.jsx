import React from "react";
import { Link } from "react-router-dom";

const DashboardFooter = ({
  panelLabel,
  description,
  sections,
}) => {
  return (
    <footer className="rounded-[28px] border border-black/5 bg-white/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="grid gap-6 sm:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
              EP
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-text-dark">EduPath</p>
              <p className="text-[11px] text-muted -mt-0.5">{panelLabel}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted">{description}</p>
        </div>

        {sections.map((section) => (
          <FooterCol
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-black/5 pt-4 text-center text-xs text-muted">
        {new Date().getFullYear()} EduPath {panelLabel} - All rights reserved.
      </div>
    </footer>
  );
};

const FooterCol = ({ title, items }) => (
  <div>
    <p className="text-sm font-semibold text-text-dark">{title}</p>
    <ul className="mt-3 space-y-2 text-xs text-muted">
      {items.map((item) => (
        <li key={item.label}>
          <Link
            to={item.to}
            className="cursor-pointer hover:text-text-dark hover:underline"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default DashboardFooter;
