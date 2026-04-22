// Email validation
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation
export const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Contact number validation
export const contactRegex = /^0\d{9}$/;

// URL/Link validation
export const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/[^\s]*)?$/i;