import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function MentorShareProfile() {
  const navigate = useNavigate();
  const qrCanvasRef = useRef(null);

  // ====== CONFIG ======
  const DEFAULT_PROFILE_PAGE = "mentor-profile.html";

  // ====== HELPERS ======
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    const toastText = document.getElementById("toastText");
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("active");
    setTimeout(() => toast.classList.remove("active"), 2200);
  }

  // Prototype QR (same logic as your HTML)
  function drawFakeQR(seedText) {
    const c = qrCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);

    let hash = 0;
    for (let i = 0; i < seedText.length; i++) {
      hash = (hash * 31 + seedText.charCodeAt(i)) >>> 0;
    }

    const grid = 25;
    const cell = Math.floor(c.width / grid);

    function finder(x, y) {
      ctx.fillStyle = "#000";
      ctx.fillRect(x, y, cell * 7, cell * 7);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
    }

    finder(cell, cell);
    finder(c.width - cell * 8, cell);
    finder(cell, c.height - cell * 8);

    for (let r = 0; r < grid; r++) {
      for (let col = 0; col < grid; col++) {
        const inTopLeft = r < 8 && col < 8;
        const inTopRight = r < 8 && col > grid - 9;
        const inBotLeft = r > grid - 9 && col < 8;
        if (inTopLeft || inTopRight || inBotLeft) continue;

        hash = (hash ^ (hash << 13)) >>> 0;
        hash = (hash ^ (hash >> 17)) >>> 0;
        hash = (hash ^ (hash << 5)) >>> 0;

        const on = hash % 7 < 3;
        if (on) {
          ctx.fillStyle = "#000";
          ctx.fillRect(col * cell, r * cell, cell, cell);
        }
      }
    }

    ctx.fillStyle = "#5DD9C1";
    ctx.beginPath();
    ctx.arc(c.width - 18, c.height - 18, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // ====== INIT ======
  useEffect(() => {
    const url = new URL(window.location.href);

    const mentorName = url.searchParams.get("name") || "Dr. Sarah Johnson";
    const mentorTitle =
      url.searchParams.get("title") ||
      "Senior Full-Stack Developer & Technical Mentor";
    const profileUrl =
      url.searchParams.get("profile") ||
      window.location.origin + "/" + DEFAULT_PROFILE_PAGE;

    const nameEl = document.getElementById("mentorName");
    const titleEl = document.getElementById("mentorTitle");
    const shareLinkInput = document.getElementById("shareLink");
    if (nameEl) nameEl.textContent = mentorName;
    if (titleEl) titleEl.textContent = mentorTitle;
    if (shareLinkInput) shareLinkInput.value = profileUrl;

    drawFakeQR(profileUrl);
  }, []);

  // ====== ACTIONS (same features) ======
  const goBack = () => navigate("/mentor/profile");

  const openProfile = () => {
    const url = new URL(window.location.href);
    const profileUrl =
      url.searchParams.get("profile") ||
      window.location.origin + "/" + DEFAULT_PROFILE_PAGE;
    window.open(profileUrl, "_blank");
  };

  const copyLink = async () => {
    const url = new URL(window.location.href);
    const profileUrl =
      url.searchParams.get("profile") ||
      window.location.origin + "/" + DEFAULT_PROFILE_PAGE;
    await copyText(profileUrl);
    showToast("Profile link copied!");
  };



  const shareWeb = async () => {
    const url = new URL(window.location.href);
    const mentorName = url.searchParams.get("name") || "Dr. Sarah Johnson";
    const profileUrl =
      url.searchParams.get("profile") ||
      window.location.origin + "/" + DEFAULT_PROFILE_PAGE;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My EduPath Mentor Profile",
          text: `Check out my mentor profile on EduPath: ${mentorName}`,
          url: profileUrl
        });
        showToast("Shared successfully!");
      } catch (e) {
        showToast("Share cancelled");
      }
    } else {
      await copyLink();
    }
  };

  const openEmail = () => {
    const url = new URL(window.location.href);
    const profileUrl =
      url.searchParams.get("profile") ||
      window.location.origin + "/" + DEFAULT_PROFILE_PAGE;

    const subject = encodeURIComponent("My EduPath Mentor Profile");
    const body = encodeURIComponent(
      `Hi,\n\nHere is my EduPath mentor profile:\n${profileUrl}\n\nThanks!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const openLinkedIn = () => {
    const url = new URL(window.location.href);
    const profileUrl =
      url.searchParams.get("profile") ||
      window.location.origin + "/" + DEFAULT_PROFILE_PAGE;

    const li =
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
      encodeURIComponent(profileUrl);
    window.open(li, "_blank");
  };

  const openWhatsApp = () => {
    const url = new URL(window.location.href);
    const profileUrl =
      url.searchParams.get("profile") ||
      window.location.origin + "/" + DEFAULT_PROFILE_PAGE;

    const wa =
      "https://wa.me/?text=" +
      encodeURIComponent(`My EduPath mentor profile: ${profileUrl}`);
    window.open(wa, "_blank");
  };

  const downloadQR = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "edupath-profile-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("QR downloaded!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* EXACT HTML CSS (scoped to this page content only) */}
      <style>{`
        .shareHtml * { margin: 0; padding: 0; box-sizing: border-box; }

        .shareHtml {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .shareHtml .page-header {
          background: white;
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .shareHtml .page-header h1 { color: #2c3e50; font-size: 28px; }
        .shareHtml .page-header p { color: #7f8c8d; font-size: 14px; margin-top: 6px; }

        .shareHtml .btn-primary {
          background: #5DD9C1;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .shareHtml .btn-primary:hover {
          background: #4AC4AD;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(93,217,193,0.3);
        }

        .shareHtml .btn-secondary {
          background: white;
          color: #5DD9C1;
          border: 2px solid #5DD9C1;
          padding: 10px 22px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .shareHtml .btn-secondary:hover { background: #5DD9C1; color: white; }

        .shareHtml .content-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
        }

        .shareHtml .content-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .shareHtml .section-title {
          color: #2c3e50;
          font-size: 20px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .shareHtml .section-title svg { width: 24px; height: 24px; stroke: #5DD9C1; }

        .shareHtml .mentor-card {
          display: flex;
          gap: 18px;
          align-items: center;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 18px;
          border-left: 4px solid #5DD9C1;
          margin-bottom: 20px;
        }

        .shareHtml .mentor-avatar {
          width: 78px;
          height: 78px;
          border-radius: 50%;
          border: 4px solid #5DD9C1;
          object-fit: cover;
          flex-shrink: 0;
        }

        .shareHtml .mentor-info h2 { color: #2c3e50; font-size: 18px; margin-bottom: 4px; }
        .shareHtml .mentor-info p { color: #7f8c8d; font-size: 13px; line-height: 1.5; }

        .shareHtml .badge-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .shareHtml .badge { padding: 7px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .shareHtml .badge-verified { background: #5DD9C1; color: white; }
        .shareHtml .badge-rating { background: #A8E6CF; color: #2c3e50; }

        .shareHtml .field-label { color: #2c3e50; font-weight: 700; font-size: 14px; margin-bottom: 8px; }

        .shareHtml .share-row { display: flex; gap: 10px; align-items: center; }
        .shareHtml .share-input {
          flex: 1;
          padding: 12px 14px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
        }
        .shareHtml .share-input:focus { border-color: #5DD9C1; }

        .shareHtml .hint { color: #7f8c8d; font-size: 12px; margin-top: 8px; }

        .shareHtml .share-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .shareHtml .share-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
          background: white;
          cursor: pointer;
          transition: all 0.25s;
          font-weight: 700;
          color: #2c3e50;
          font-size: 13px;
        }

        .shareHtml .share-btn:hover {
          border-color: #5DD9C1;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .shareHtml .share-btn svg { width: 18px; height: 18px; fill: #5DD9C1; }

        .shareHtml .qr-box {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
          border: 2px dashed #5DD9C1;
        }

        .shareHtml .qr-box h3 { color: #2c3e50; font-size: 16px; margin-bottom: 10px; }

        .shareHtml .qr-canvas-wrap {
          width: 200px;
          height: 200px;
          margin: 10px auto 12px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e0e0e0;
        }

        .shareHtml .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: white;
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          display: none;
          align-items: center;
          gap: 10px;
          border-left: 5px solid #5DD9C1;
          z-index: 9999;
          max-width: 320px;
        }

        .shareHtml .toast.active { display: flex; }

        .shareHtml .toast-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #5DD9C1;
          flex-shrink: 0;
        }

        .shareHtml .toast-text { color: #2c3e50; font-size: 13px; line-height: 1.4; }

        @media (max-width: 1024px) { .shareHtml .content-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .shareHtml .share-buttons { grid-template-columns: 1fr; }
          .shareHtml .mentor-card { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* EXACT HTML UI CONTENT */}
      <div className="shareHtml">
        <div className="page-header">
          <div>
            <h1 style={{ fontWeight: 600 }}>Share Profile</h1>
            <p>Copy your public profile link, share on social media, or use the QR code.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn-secondary" onClick={goBack}>
              Back to Profile
            </button>
            <button className="btn-primary" onClick={copyLink}>
              Copy Link
            </button>
          </div>
        </div>

        <div className="content-grid">
          {/* LEFT */}
          <div className="content-section">
            <h3 className="section-title" style={{ fontWeight: 600 }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 007.54.54l3.7-3.7a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3.7 3.7a5 5 0 007.07 7.07l1.72-1.71" />
              </svg>
              Your Public Profile
            </h3>

            <div className="mentor-card">
              <img
                className="mentor-avatar"
                alt="Mentor"
                src="data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='75' cy='75' r='75' fill='%235DD9C1'/%3E%3Cpath d='M75 70C88.255 70 99 59.255 99 46C99 32.745 88.255 22 75 22C61.745 22 51 32.745 51 46C51 59.255 61.745 70 75 70Z' fill='white'/%3E%3Cpath d='M75 80C54.29 80 37.5 89.455 37.5 100V128H112.5V100C112.5 89.455 95.71 80 75 80Z' fill='white'/%3E%3C/svg%3E"
              />
              <div className="mentor-info">
                <h2 id="mentorName">Dr. Sarah Johnson</h2>
                <p id="mentorTitle">Senior Full-Stack Developer & Technical Mentor</p>

                <div className="badge-row">
                  <span className="badge badge-verified">✓ Verified</span>
                  <span className="badge badge-rating">4.9 Rating</span>
                </div>
              </div>
            </div>

            <div className="field-label" style={{ fontWeight: 600 }}>
              Public Profile Link
            </div>
            <div className="share-row">
              <input id="shareLink" className="share-input" type="text" readOnly />
              <button className="btn-primary" onClick={copyLink}>
                Copy
              </button>
            </div>
            <div className="hint">
              Tip: This link is safe to share. Anyone with the link can view your mentor profile.
            </div>

            <div style={{ marginTop: "22px" }}>
              <div className="field-label" style={{ fontWeight: 600 }}>
                Share Quickly
              </div>
              <div className="share-buttons">
                <button className="share-btn" onClick={shareWeb}>
                  <svg viewBox="0 0 24 24">
                    <path d="M18 8a3 3 0 10-2.83-4H15a3 3 0 003 3zM6 14a3 3 0 102.83 4H9a3 3 0 00-3-3zM18 16a3 3 0 10-2.83 4H15a3 3 0 003-3z" />
                    <path
                      d="M8.59 13.51l6.83 3.98M15.42 6.51L8.59 10.5"
                      fill="none"
                      stroke="#5DD9C1"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Share (System)
                </button>

                <button className="share-btn" onClick={openEmail}>
                  <svg viewBox="0 0 24 24">
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5" />
                  </svg>
                  Email
                </button>

                <button className="share-btn" onClick={openLinkedIn}>
                  <svg viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C0 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </button>

                <button className="share-btn" onClick={openWhatsApp}>
                  <svg viewBox="0 0 24 24">
                    <path d="M20.52 3.48A11.88 11.88 0 0012 .06 11.94 11.94 0 001.62 18.03L0 24l6.12-1.59A11.94 11.94 0 0012 24h.06a11.94 11.94 0 008.46-20.52zM12 22.02a10 10 0 01-5.1-1.41l-.36-.21-3.63.93.96-3.54-.24-.39A10.02 10.02 0 1112 22.02zm5.79-7.53c-.3-.15-1.77-.87-2.04-.96-.27-.09-.48-.15-.69.15-.21.3-.78.96-.96 1.17-.18.21-.36.24-.66.09-.3-.15-1.29-.48-2.46-1.53-.9-.81-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.21-.3.33-.51.12-.21.06-.39-.03-.54-.09-.15-.69-1.65-.96-2.25-.24-.57-.48-.48-.69-.48h-.6c-.21 0-.54.09-.81.39-.27.3-1.05 1.02-1.05 2.49s1.08 2.88 1.23 3.09c.15.21 2.13 3.24 5.16 4.53.72.3 1.29.48 1.74.6.73.24 1.38.21 1.89.12.57-.09 1.77-.72 2.01-1.41.24-.69.24-1.29.18-1.41-.06-.12-.27-.18-.57-.33z" />
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>


          </div>

          {/* RIGHT */}
          <div className="content-section">
            <h3 className="section-title" style={{ fontWeight: 600 }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 4h8v4h-8v-4z" />
              </svg>
              QR Code
            </h3>

            <div className="qr-box">
              <h3 style={{ fontWeight: 600 }}>Scan to View Profile</h3>
              <div className="qr-canvas-wrap">
                <canvas
                  ref={qrCanvasRef}
                  id="qrCanvas"
                  width="180"
                  height="180"
                  style={{ borderRadius: "10px" }}
                ></canvas>
              </div>
              <button className="btn-primary" onClick={downloadQR}>
                Download QR
              </button>
              <div className="hint" style={{ marginTop: "10px" }}>
                For your report/prototype: this QR is generated locally (no backend).
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                background: "#f8f9fa",
                borderRadius: "12px",
                padding: "16px",
                borderLeft: "4px solid #5DD9C1"
              }}
            >
              <div className="field-label" style={{ marginBottom: "8px", fontWeight: 600 }}>
                Privacy Note
              </div>
              <div style={{ color: "#7f8c8d", fontSize: "13px", lineHeight: "1.6" }}>
                Only share your profile if you’re comfortable. In a real system, you can add “public/private profile”
                settings.
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div id="toast" className="toast">
          <div className="toast-dot"></div>
          <div className="toast-text" id="toastText">
            Copied!
          </div>
        </div>
      </div>
    </>
  );
}