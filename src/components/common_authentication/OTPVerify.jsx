// 📦 React & Libraries
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🌐 Base URL & Utilities
import { BaseUrl } from "../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../utils/toast";
import Loading from '../loading_ui/Loading';
import PageWrapper from '../../PageWrapper';

function OTPVerify() {
  const { role } = useParams();
  const location = useLocation();
  const email = location.state?.email;
  const uidsecode = location.state?.uidsecode;

  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      setIsOtpExpired(true);
      setErrorMessage("OTP expired. Please resend OTP.");
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = () => {
    const m = String(Math.floor(timer / 60)).padStart(2, "0");
    const s = String(timer % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (canResend) {
      setLoading(true);
      try {
        const response = await axios.post(`${BaseUrl}${role}/resend-otp`, { email });
        if (response.data.success) {
          setTimer(180);
          setCanResend(false);
          setIsOtpExpired(false);
          setErrorMessage("");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      } catch (error) {
        showError("Something went wrong while resending the OTP. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMessage("Please enter the full 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}${role}/verify-otp`, {
        fullOtp,
        email,
        uidsecode
      }, { withCredentials: true });

      if (response.data.status) {
        if(`${role}`==="admin")navigate("/admin/dashboard");
        if (`${role}` === "teacher") navigate("/teacher/dashboard");
        if (`${role}` === "student") navigate("/student/dashboard");
        if (`${role}` === "parent") navigate("/parent/dashboard");
      }
    } catch (error) {
      if (error.response?.data?.status === 'wrongOtp') {
        return showError('The OTP you entered is incorrect. Please try again.');
      }
      showError("Something went wrong while verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-r from-gray-100 to-blue-100">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200 transition-all duration-300">
        <h1 className="text-3xl font-bold text-blue-700 mb-3 tracking-tight">OTP Verification</h1>

        <p className="text-gray-700 mb-1">
          You are verifying as <span className="capitalize font-semibold text-black">{role}</span>
        </p>
        <p className="text-gray-600 text-sm mb-6">
          A 6-digit OTP has been sent to{" "}
          <span className="font-medium text-blue-600">{email}</span>
        </p>

        {/* 🔢 OTP Boxes */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              disabled={isOtpExpired}
              className={`w-12 h-14 sm:w-12 sm:h-14 text-center text-xl font-semibold border rounded-xl outline-none transition duration-200 text-black focus:ring-2 ${
                isOtpExpired
                  ? "bg-gray-100 border-gray-300"
                  : "bg-white border-gray-300 focus:ring-blue-400"
              }`}
            />
          ))}
        </div>

        {/* 🔐 Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isOtpExpired}
          className={`w-full py-3 rounded-xl font-semibold transition duration-300 ${
            isOtpExpired
              ? "bg-gray-300 text-white cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Verify OTP
        </button>

        {/* ⏱️ Timer */}
        <p className="text-sm text-gray-500 mt-4 mb-2">
          Time remaining: <span className="font-semibold text-black">{formatTimer()}</span>
        </p>

        {/* 🔁 Resend Button */}
        <button
          onClick={handleResend}
          disabled={!canResend}
          className={`px-5 py-2 mt-1 text-sm font-medium rounded-xl transition duration-300 ${
            canResend
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
        >
          Resend OTP
        </button>

        {/* ⚠️ Error Message */}
        {errorMessage && (
          <p className="mt-4 text-sm text-red-600 font-medium">{errorMessage}</p>
        )}
      </div>
      </div>
      </PageWrapper>
  );
}

export default OTPVerify;
