// 📥 React and hooks for state, navigation, and effects
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ⚠️ Toast for showing errors
import { showError } from "../../utils/toast";

// 🌀 Loading UI component
import Loading from "../loading_ui/Loading"; 

// 🔗 React Router Link
import { Link } from "react-router-dom";

// 🔒 Verifies session on mount
import SessionVerifier from "../../app_routes/SessionVerifier";

// 📡 Custom login handler hook
import useLoginHandler from "../../hooks/useLoginHandler";

import PageWrapper from "../../PageWrapper";

import { useLocation } from 'react-router-dom';

/**
 * 🚪 LoginForm component - Role-based login (Admin 👨‍💼, Parent 👪)
 * 🧠 Handles form inputs, validates UIDSE Code (for Admin)
 * 📡 Sends login request to backend and redirects to OTP page on success
 */
function LoginForm() {
  const location = useLocation();
  
  const { schoolCode } = location.state || {};
  // 📧 Email input state (default for testing)
  const [email, setEmail] = useState("");

  // 🔐 Password input state (default for testing)
  const [password, setPassword] = useState("");

  // 🆔 UIDSE Code state (Admin-only, 11 digits)
  const [uidsecode, setUidsecode] = useState(schoolCode);

  // 🔄 Loading state (for spinner & button)
  const [loading, setLoading] = useState(false);

  // 🔍 Get current role from route params (e.g. admin/teacher)
  const { role } = useParams();
  const currentRole = role?.toLowerCase();

  // 🧭 Navigation hook
  const navigate = useNavigate();

  // 🛡️ Check if user is already authenticated
  useEffect(() => {
    if (!schoolCode) {
      return navigate('/')
    }
    const check = async () => {
      const isAuth = await SessionVerifier(currentRole);
      if (isAuth) {
        if (currentRole === 'teacher') navigate('/teacher/dashboard');
        if (currentRole === 'admin') navigate('/admin/dashboard');
        if (currentRole === 'student') navigate('/student/dashboard');
        if (currentRole === 'parent') navigate('/parent/dashboard');
      }
    };
    if (currentRole) check();
  }, [currentRole]);

  /**
   * 📨 Handles form submit
   * ✅ Validates fields and triggers login
   * 🔁 Redirects to OTP on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // ⛔ Prevent page reload
    setLoading(true); // ⏳ Set loading state

    try {
      // 🔍 Validate UIDSE Code for Admin (must be 11 digits)
      if (uidsecode && uidsecode.length !== 11) {
        navigate('/')
        setLoading(false);
        return;
      }

      if (!email) {
        showError("Email is required.");
        setLoading(false);
        return;
      }

      // 📡 Call login handler with user credentials
      const response = await useLoginHandler(currentRole, password, uidsecode, email);

      // ✅ Redirect on success
      if (response.isAuth) {
        setLoading(false);
        navigate(`/${currentRole}/otp-verify`, {
          state: { email: email, uidsecode: uidsecode },
        });
        return;
      } else {
        // ❌ Show invalid credentials message
        setLoading(false);
        return showError("email  or password code is incorrect");
      }

    } catch (error) {
      setLoading(false);
      showError("Something went wrong. Please try again.");
    }
  };

  /**
   * ✍️ Update UIDSE input (only numbers, max 11 digits)
   */
  const handleUidseChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,11}$/.test(value)) {
      setUidsecode(value);
    }
  };

  return (
    <PageWrapper>
    <>
      {loading ? (
        // 🌀 Show loading while submitting
        <Loading />
      ) : (
       <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1f1f1f] to-[#2d2d2d] px-4">
           <div className="relative w-full max-w-md bg-[#2a2a2a] border border-white/10 text-white rounded-2xl p-8 shadow-[8px_8px_16px_#1c1c1c,_-8px_-8px_16px_#333]">

            {/* 🔙 Back button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 text-white text-sm hover:underline"
            >
              ← Back
            </button>

            {/* 🎯 Role-based heading */}
            <h1 className="text-3xl font-bold text-center text-white-400 mb-6">
              {currentRole} Login
            </h1>

            {/* 📝 Login form */}
            <form onSubmit={handleSubmit}>
              {/* 🆔 UIDSE Code Field */}
              {!uidsecode && <div className="mb-4">
                <label className="block text-white font-medium mb-1">
                  UIDSE Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="Enter 11-digit UIDSE code"
                  className="w-full p-3 border border-white/30 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/80"
                  value={uidsecode}
                  onChange={handleUidseChange}
                  required
                />
              </div>}

              {/* 📧 Email Field */}
              <div className="mb-4">
                <label className="block text-white font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-white/30 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/80"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* 🔐 Password Field */}
              <div className="mb-4">
                <label className="block text-white font-medium mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full p-3 border border-white/30 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/80"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* 🔗 Extra links for forgot or signup */}
              <div className="flex justify-between text-sm text-blue-300 mb-6">
            <Link to={`/forgot-password/${currentRole}`} className="hover:underline">
            Forgot Password?
            </Link>

                {currentRole === "parent" && (
                  <Link
                    to="/parent/signup"
                    state={{ code: "32040900705" }}
                    className="hover:underline"
                    >
                    Create Account
                  </Link>

                    )}
                    {currentRole === "admin" && (
                  <Link to="/admin/create-account" className="hover:underline">
                    Create Account
                  </Link>
                )}
              </div>

              {/* 🚀 Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-full font-semibold transition-all shadow ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
     </PageWrapper>
  );
}

export default LoginForm;
