import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setToken } from "../api/client"; // ✅ use correct token key
import * as authApi from "../api/authApi"; // ✅ to refresh /me

export default function GoogleAuthButton() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const onSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API}/api/auth/google`, {
        credential: credentialResponse.credential,
      });

      // ✅ store token in edupath_token (NOT "token")
      setToken(res.data.token);

      // ✅ immediately refresh current user from backend (so ProtectedRoute won’t bounce)
      const me = await authApi.getMe();
      localStorage.setItem("edupath_user", JSON.stringify(me));

      const role = me.role;

      if (role === "pending")
        return navigate("/signup/role", { replace: true });
      if (role === "student") return navigate("/student", { replace: true });
      if (role === "educator") return navigate("/educator", { replace: true });
      if (role === "admin") return navigate("/admin", { replace: true });
      if (role === "reviewer") return navigate("/reviewer", { replace: true });

      navigate("/", { replace: true });
    } catch (err) {
      alert(
        err?.response?.data?.message || err.message || "Google sign-in failed",
      );
    }
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => alert("Google failed")}
      />
    </div>
  );
}
