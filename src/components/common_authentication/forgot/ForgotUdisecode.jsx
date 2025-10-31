import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from "../../../utils/toast";
import { saveToIndexedDB ,getFromIndexedDB,removeFromIndexedDB } from "../../../utils/indexedDBUtils";
import Loading from "../../loading_ui/Loading"; 
import { useNavigate } from "react-router-dom";
import { requestUdisecodeRecovery } from '../ForgotCredentials';
import PageWrapper from '../../../PageWrapper';

function ForgotUdisecode() {
   const navigate = useNavigate();
  // State for email/password input
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });

  // Holds current recovery status (email phase or password phase)
  const [response, setResponse] = useState({
    message: 'email',
    success: false,
    id: ''
  });

  // Tracks final submission
  const [submitted, setSubmitted] = useState(null);

  // Triggers useEffect to re-run
  const [effectTrigger, setEffectTrigger] = useState(false);

  // Loading state for UI
  const [loading, setLoading] = useState(false);
  
  // 🔁 Load cached recovery state from IndexedDB on mount or trigger change
  useEffect(() => {
    const loadFromDB = async () => {
      setLoading(true)
      const storedData = await getFromIndexedDB("forgot-udisecode-info");

      if (storedData) {
        const isExpired =
          Date.now() > (storedData.createdAt + (storedData.expiresIn || 0));

        // ❌ If expired, remove and exit
        if (isExpired) {
          setLoading(false)
          await removeFromIndexedDB("forgot-udisecode-info");
          return;
        }

        // ✅ If valid, use stored state to resume
        setResponse({
          message: storedData.message || 'email',
          success: storedData.success || false,
          id: storedData.id || ''
        });
        setLoading(false)
      }
    };

    loadFromDB();
    setLoading(false)
  }, [effectTrigger, submitted]);

  // 📤 Handle submit for both email and password phases
  const handleSubmit = async () => {
    const isEmailPhase = response.message === "email" && !response.success;
    const isPasswordPhase = response.message === "email" && response.success;

    try {
      // 🛑 Validate email before request
      if (isEmailPhase) {
        if (!formData.email) {
          showError('Please enter email address');
          return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          showError("Invalid email address");
          return;
        }
      }

      if (!formData.role) {
            showError("Please select a role");
          return;
      }

      setLoading(true)

      const res = await requestUdisecodeRecovery(formData, response.id,navigate);

      if (res) setEffectTrigger(true);

      // ❌ Error feedback for wrong email or password
      if (res.success === false) {
        if (isEmailPhase) {
          setLoading(false)
          showError("We couldn't find any account linked to this email. Please double-check and try again.");
        } else {
          setLoading(false)
          showError("The password you entered is incorrect. Please try again.");
        }
        return;
      }

      // 🧠 Save step info in IndexedDB for 5 minutes
      await saveToIndexedDB("forgot-udisecode-info", {
        id: res.id || '',
        message: res.message,
        success: res.success,
        createdAt: Date.now(),
        expiresIn: 5 * 60 * 1000, // 5 minutes
      });

      setEffectTrigger(true)

      // ✅ Final step: password verified, show success & cleanup
      if (res.message === 'password' && res.success) {
        await removeFromIndexedDB("forgot-udisecode-info");
        setSubmitted(true);
        setLoading(false)
        showSuccess("Your UDISE or Institute Code has been sent to your registered email.");
      }

      setLoading(false);

    } catch (err) {
      setLoading(false)
      showError("Something went wrong. Please try again.");
    }
  };

  // 📝 Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

   const handleBackClick = async () => {
      await removeFromIndexedDB("forgot-udisecode-info");
    // Then navigate
    navigate("/");
  };

  // 🔃 Show loader while waiting
  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1c] text-white px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold text-yellow-400">
          Forgot UDISE or Institute Code?
        </h1>

        {response.message === 'email' && response.success !== true &&
          <div className="space-y-2 text-left">
        <label className="text-sm text-gray-300">Select Your Role</label>
        <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="" disabled>Select Role</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
          </select>
        </div>}


        {/* Email Input Phase */}
        {response.message === 'email' && response.success !== true && (
          <div className="space-y-2 text-left">
            <label className="text-sm text-gray-300">Enter Your Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        )}

        {/* Password Input Phase */}
        {response.message === 'email' && response.success === true && submitted===null && (
          <>
          <div className="space-y-2 text-left">
            <label className="text-sm text-gray-300">Enter Your Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your Password"
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            </div>
          </>
        )}

        {submitted===null&&
          <button
          onClick={handleSubmit}
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition duration-200"
        >
          Submit
          </button>
        }

        {/* Success Message */}
        {submitted===true && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mt-4">
            <p className="text-lg font-semibold">Code Sent Successfully!</p>
            <p>Your UDISE or Institute Code has been sent to your registered email. Please check your inbox.</p>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Still need help? Contact us at{' '}
          <a href="mailto:support@eduspark.in" className="text-yellow-400 underline">
            support@eduspark.in
          </a>
        </p>

         <button
      onClick={handleBackClick}
      className="inline-block mt-6 text-sm font-medium text-yellow-400 hover:underline"
    >
      ← Back to Home
    </button>
      </div>
      </div>
      </PageWrapper>
  );
}

export default ForgotUdisecode;
