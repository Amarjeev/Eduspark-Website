import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from "../../../utils/toast";
import { saveToIndexedDB ,getFromIndexedDB,removeFromIndexedDB } from "../../../utils/indexedDBUtils";
import Loading from "../../loading_ui/Loading"; 
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { useParams } from 'react-router-dom';
import PageWrapper from '../../../PageWrapper';

function ForgotPassword() {
  const { role } = useParams();
  const currentRole = role?.toLowerCase(); // 🔍 Extract user role from URL param
  const navigate = useNavigate();

  const [currentItem, setCurrentItem] = useState('email'); // 📌 Track current step in form flow
  const [userId, setUserId] = useState(''); // 🧑 Holds the ID returned from the server
  const [loading, setLoading] = useState(false); // 🔄 Controls loading screen visibility

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  }); // 📝 Stores form field values


  // ✅ Save the current step (email, otp, password) in IndexedDB for recovery on refresh
  useEffect(() => {
    const saveToDB = async () => {
      setLoading(true)
      await saveToIndexedDB('forgot-password-current-item', {
        value: currentItem,
        timestamp: Date.now()
      });
      setLoading(false)
    };
    if (currentItem !== 'email') {
      saveToDB();
    }
  }, [currentItem]);

  // ✅ On first render, try to restore previous step from IndexedDB (if not expired)
  useEffect(() => {
    const loadFromIndexedDB = async () => {
      setLoading(true)
      const item = await getFromIndexedDB('forgot-password-current-item');

      if (item) {
        const now = Date.now();
        const isExpired = now - item.timestamp > 10 * 60 * 1000; // ⏰ 10-minute expiry

        if (!isExpired) {
          setCurrentItem(item.value); // ♻️ Restore step
          setLoading(false)
        }
        setLoading(false)
      }
    };
    loadFromIndexedDB();
    setLoading(false)
  }, []);

  // 🔁 Handles input field changes and updates local state accordingly
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🚀 Handle OTP sending logic after validating email input
  const handleSendOTP = async () => {
    if (!formData.email) return showError('Email is required!');
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError("Invalid email address");
      return;
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BaseUrl}forgot-password/${currentRole}`, {
        email: formData.email,
      });

      if (response.data.success) {
        setCurrentItem('otp'); // ➡️ Move to OTP step
        setUserId(response.data.id); // 🧾 Store user ID for future use
        setLoading(false)
        return
      }
    } catch (error) {
      setLoading(false)
      if (error.response.data.success === 'not-found') {
        return showError("This email is not associated with any registered account.");
      } else if (error.response.data.success === "id-missing") {
        return navigate('/')
      }
      await removeFromIndexedDB('forgot-password-current-item');
      setCurrentItem('email');
      showError("Something went wrong. Please try again later.");
    }
  };

  // ✅ Verifies OTP and progresses to password reset form if successful
  const handleVerifyOTP = async () => {
    if (!formData.otp) return showError('Please fill the OTP field.');
    if (formData.otp.length !== 6) return showError('OTP must be exactly 6 digits.');
    setLoading(true)
    try {
      const response = await axios.post(`${BaseUrl}forgot-password/${currentRole}`, {
        enterdOtp: formData.otp,
        id: userId
      });

      if (response.data.success) {
        setCurrentItem('password'); // ➡️ Move to password reset step
        setUserId(response.data.id);
        setLoading(false)
        return;
      }
    } catch (error) {
      setLoading(false)
      if (error.response.data.success === "expire") {
        showError("Your OTP has expired. Please request a new one to continue.");
        return
      } else if (error.response.data.success === false) {
        showError("Incorrect OTP. Please try again.")
        return
      } else if (error.response.data.success === "id-missing") {
        return navigate('/')
      }
      await removeFromIndexedDB('forgot-password-current-item');
      setCurrentItem('email');
      showError("Something went wrong during verification. Please try again later.");
    }
  };

  // 🔒 Handles password reset logic after validating password rules
  const handleResetPassword = async () => {
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword)
      return showError(!newPassword ? "New password is required." : "Please confirm your password.");

    if (!/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword))
      return showError("Password must be at least 8 characters, include a lowercase letter and a number.");

    if (newPassword !== confirmPassword) return showError("Passwords do not match.");

    setLoading(true)
    setCurrentItem('hide') // 🚫 Hide form while processing

    try {
      const response = await axios.post(`${BaseUrl}forgot-password/${currentRole}`, {
        newPassword,
        confirmPassword,
        id: userId
      });

      if (response.data.success) {
        setFormData({
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
        }); // 🧹 Reset form state
        await removeFromIndexedDB('forgot-password-current-item');
        setCurrentItem('email');
        setLoading(false)
        showSuccess("Your password has been reset successfully!");
        return
      }
    } catch (error) {
      setLoading(false)
      if (error.response.data.success === "id-missing") {
        return navigate('/')
      }
      await removeFromIndexedDB('forgot-password-current-item');
      setCurrentItem('email');
      showError("Unable to reset password at the moment. Please try again later.");
    }
  };

  // ⏳ Display loading screen when state is active
  if (loading) return <Loading />


  return (
    <PageWrapper>
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1c] text-white px-4">
      <div className="max-w-md w-full space-y-6 text-center">

        <h1 className="text-3xl font-bold text-yellow-400">
          Forgot Your Password?
        </h1>

        <p className="text-sm text-gray-300">
          Reset your password using your registered email.
        </p>
       {currentItem==='password'&&<p className="text-sm text-red-500">
          Password must be at least 8 characters, include a lowercase letter and a number
        </p>}

      {currentItem!=='password'&&<ul className="text-sm text-gray-400 list-disc list-inside space-y-2 text-left">
          <li>Use the email associated with your EduSpark account.</li>
          <li>OTP will be sent to your registered email address.</li>
           <li>OTP is valid for <strong className="text-yellow-400">2 minutes</strong> only.</li>
           <li>Do not share the OTP with anyone.</li>
          <li>
            If you don’t receive an email, contact your school admin or{' '}
            <a
              href="mailto:support@eduspark.in"
              className="text-yellow-400 underline hover:text-yellow-300"
            >
              EduSpark Support
            </a>.
          </li>
        </ul>}

        {/* Email Input */}
      {currentItem==='email'&& <div className="space-y-2 text-left">
          <label className="text-sm text-gray-300">Enter Your Email</label>
          <input
            type="email"
            name="email"
            maxLength={254}
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleSendOTP}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition duration-200"
          >
            Send OTP
          </button>
        </div>}

        {/* OTP Input */}
      {currentItem==='otp'&& <div className="space-y-2 text-left">
          <label className="text-sm text-gray-300">Enter OTP</label>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter OTP"
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleVerifyOTP}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition duration-200"
          >
            Verify OTP
          </button>
        </div>}

        {/* New Password Inputs */}
      {currentItem==="password"&& <div className="space-y-2 text-left">
          <label className="text-sm text-gray-300">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <label className="text-sm text-gray-300">Re-enter Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
         {currentItem !=='hide'&&<button
            onClick={handleResetPassword}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition duration-200"
          >
            Reset Password
          </button>}
        </div>}

        <p className="text-sm text-gray-400 mt-4">
          Still need help? Contact us at{' '}
          <a
            href="mailto:support@eduspark.in"
            className="text-yellow-400 underline"
          >
            support@eduspark.in
          </a>
        </p>

        <Link
          to="/"
          onClick={async () => {
            setLoading(true)
            await removeFromIndexedDB('forgot-password-current-item');
            setCurrentItem('email');
            setLoading(false)
          }}
          className="inline-block mt-6 text-sm font-medium text-yellow-400 hover:underline"
          >
          ← Back to Home
        </Link>

      </div>
      </div>
      </PageWrapper>
  );
}

export default ForgotPassword;
