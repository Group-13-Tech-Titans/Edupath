const API_BASE = import.meta.env.VITE_API_URL ?? "";

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
