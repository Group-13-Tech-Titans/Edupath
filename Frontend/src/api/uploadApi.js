const API_BASE = import.meta.env.VITE_API_URL ?? "";

/**
 * Builds a same-origin proxy download URL that streams the Cloudinary file
 * through the backend with the correct Content-Disposition header.
 *
 * This replaces the fl_attachment approach, which requires Cloudinary's strict
 * transformations to be whitelisted and causes HTTP 400 on many accounts.
 *
 * @param {string} url      – Cloudinary secure_url stored on the content item
 * @param {string} name     – display name of the item (used as download filename)
 * @param {string} format   – file extension without dot, e.g. "pdf", "docx"
 * @returns {string}        – /api/upload/download?url=...&filename=... proxy URL
 */
export function buildDownloadUrl(url, name, format) {
  if (!url) return url;
  // Videos are streamed inline — no proxy needed
  if (url.includes("/video/upload/")) return url;

  const safeName = (name || "file")
    .replace(/[^\w.\- ]/g, "_")
    .trim()
    .slice(0, 80);
  const filename = format ? `${safeName}.${format}` : safeName;

  return `${API_BASE}/api/upload/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
}

function getToken() {
  return window.localStorage.getItem("edupath_token");
}

/**
 * Upload a content file to the backend → Cloudinary.
 * @param {File}   file        - The File object from the input
 * @param {string} contentType - "Video" | "Document" | "PowerPoint" | "Certificate" | "Quiz"
 * @param {string} itemName    - Friendly display name for the content item
 * @param {function} onProgress - Optional callback(percent: number)
 * @returns {Promise<{success, item}>}
 */
export function uploadContentFile(file, contentType, itemName, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("contentType", contentType);
    formData.append("itemName", itemName || file.name);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || "Upload failed."));
        }
      } catch {
        reject(new Error("Invalid server response."));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled.")));

    xhr.open("POST", `${API_BASE}/api/upload/content`);
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

export async function uploadThumbnailFile(file, onProgress) {
  const result = await uploadContentFile(file, "Thumbnail", file.name, onProgress);
  if (!result?.success || !result.item) {
    throw new Error(result?.message || "Thumbnail upload failed.");
  }

  return {
    success: true,
    thumbnail: {
      name: result.item.name,
      url: result.item.url,
      publicId: result.item.publicId,
      resourceType: result.item.resourceType || "image",
      bytes: result.item.bytes || 0,
      format: result.item.format || "",
    },
  };
}

/**
 * Upload a profile avatar image to Cloudinary.
 * @param {File} file - The image File object from the input
 * @returns {Promise<{ success: boolean, url: string, publicId: string }>}
 */
export function uploadAvatarFile(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || "Avatar upload failed."));
        }
      } catch {
        reject(new Error("Invalid server response."));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled.")));

    xhr.open("POST", `${API_BASE}/api/upload/avatar`);
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
}

/**
 * Delete a content file from Cloudinary.
 * @param {string} publicId      - Cloudinary public_id
 * @param {string} resourceType  - "video" | "image" | "raw"
 */
export async function deleteContentFile(publicId, resourceType = "raw") {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/upload/content`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ publicId, resourceType }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Delete failed.");
  return data;
}
