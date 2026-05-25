/**
 * GOOGLE AUTH BUTTON (Presentational Component)
 * Wraps the official @react-oauth/google provider.
 */
import { GoogleLogin } from "@react-oauth/google";
import PropTypes from "prop-types";

// Accept onSuccess and onError as props from the parent (e.g., Login.jsx)
export default function GoogleAuthButton({ onSuccess, onError, text = "signin_with"}) {
  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // Pass the Google token UP to the parent component - Backend
          if (onSuccess) onSuccess(credentialResponse);
        }}
        onError={() => {
          // Pass the error UP to the parent component to handle UX (e.g., setting error state)
          if (onError) onError();
        }}
        text={text}
        useOneTap={false} // if set this true then if the user is already logged into a Google account in their browser, allowing them to sign in with a single click
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