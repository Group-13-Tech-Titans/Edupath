import React from "react";

export default function PublicFooter() {
  return (
    <footer className="mt-10 border-t border-black/5 bg-white/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted sm:flex-row">
        
        <p>© 2026 EduPath. All rights reserved.</p>

        <div className="flex gap-4">
          <button className="hover:text-text-dark transition">
            Support
          </button>
          <button className="hover:text-text-dark transition">
            Terms
          </button>
          <button className="hover:text-text-dark transition">
            Privacy
          </button>
        </div>
      </div>
    </footer>
  );
}
