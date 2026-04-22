/**
 * GOOGLE AUTH BUTTON (Presentational Component)
 * Wraps the official @react-oauth/google provider.
 * Design Pattern: Presentational (Dumb) Component / Inversion of Control
 */
import { GoogleLogin } from "@react-oauth/google";
import PropTypes from "prop-types";

// 🟢 FIXED: Accept onSuccess and onError as props from the parent (e.g., Login.jsx)
export default function GoogleAuthButton({ onSuccess, onError, text = "signin_with"}) {
  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // Pass the Google token UP to the parent component
          if (onSuccess) onSuccess(credentialResponse);
        }}
        onError={() => {
          // Pass the error UP to the parent component to handle UX (e.g., setting error state)
          if (onError) onError();
        }}
        text={text}
        useOneTap={false} // Optional: Set to true if you want the Google popup to appear automatically
        theme="outline"
        size="large"
        width="100%"
      />
    </div>
  );
}

GoogleAuthButton.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  text: PropTypes.string,
};