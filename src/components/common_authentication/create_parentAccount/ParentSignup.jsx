// 📦 Import React and hooks
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 🛠️ Import utility functions and components
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";

// 🧾 Custom hooks for validation and signup API
import useFormValidation_Parent from './useFormValidation_Parent';
import useParentSignup from './useParentSignup';
import PageWrapper from '../../../PageWrapper';

function ParentSignup() {
  const location = useLocation();
  const code = location.state?.code; // 🔗 Extract UDISE code passed via route
  const navigate = useNavigate();
  // 📌 Form validation errors
  const [errors, setFormErrors] = useState({});

  // ⏳ Loading state to show spinner while API call happens
  const [loading, setLoading] = useState(false);

  // 🧠 Main form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    udisecode: code, // Set UDISE code from route state
  });

  // 📥 Handles input changes and validates individual fields on the fly
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // 🧪 Validate current field only
      const fieldError = useFormValidation_Parent(updatedData, name);

      // 🔄 Update error state for that field
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: fieldError[name] || "", // Clear error if validation passed
      }));

      return updatedData;
    });
  };

  // ✅ Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 Validate all fields before submit
    const errors = useFormValidation_Parent(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError("⚠️ Please fix form errors before submitting.");
      return;
    }

    try {
      setLoading(true); // Show loading spinner
      const result = await useParentSignup(formData); // 📡 Call signup API

      // ✅ If signup is successful, reset form and show success toast
      if (result.success) {
        setFormData({
          name: '',
          email: '',
          mobileNumber: '',
          password: '',
          confirmPassword: '',
          udisecode: '',
        });
        setFormErrors({});
        setLoading(false);
        return showSuccess('Signup successful');
      }

    } catch (error) {
      setLoading(false);

      // 🚨 Handle specific known error responses from backend
      if (error.response.data.success === "Mob-Notfound") {
        setFormErrors((prev) => ({
          ...prev,
          mobileNumber: "📵 Mobile number not found. Please use the number registered during admission."
        }));
        return showError("📵 Mobile number not found. Please use the number registered during admission.");
      } else if (error.response.data.success === "account-existe") {
        setFormErrors((prev) => ({
          ...prev,
          email: "An account with this email already exists for this school"
        }));
        return showError("An account with this email already exists for this school");
      }
      showError("Something went wrong. Please try again.");
    }
  };

  // ⏳ Show loading spinner if signup is in progress
  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center px-4 py-6">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg flex flex-col lg:flex-row overflow-hidden">

        {/* 🔒 Left Side – Signup Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
              {/* 🔙 Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-black hover:underline mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-center text-black mb-6">
            Parent Signup
          </h1>
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* 🧍 Full Name */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

            {/* 📧 Email */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

            {/* 📱 Mobile Number */}
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number"
              className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}

            {/* 🔐 Password */}
            <label className="block text-sm font-medium text-black mb-1">
              Password must be at least 8 characters, include a lowercase letter and a number.
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

            {/* 🔁 Confirm Password */}
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full px-5 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}

            {/* 🚀 Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Sign Up
            </button>
          </form>

          {/* 📃 Terms & Policy */}
          <p className="mt-6 text-xs text-gray-600 text-center">
            By signing up, you agree to our{' '}
            <a href="#" className="underline text-blue-600">Terms of Service</a> and{' '}
            <a href="#" className="underline text-blue-600">Privacy Policy</a>
          </p>
        </div>

        {/* 🎓 Right Side – EduSpark Info Panel */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 sm:p-12 flex flex-col justify-center items-start text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black mb-4 flex items-center gap-2">
            Welcome to EduSpark🎓
          </h2>

          {/* 📣 Features list */}
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
            EduSpark is your digital bridge between <span className="font-semibold text-blue-600">school</span> and <span className="font-semibold text-blue-600">home</span>. Our Parent Dashboard empowers you to:
          </p>

          <ul className="text-gray-800 text-base space-y-3 pl-4 mb-6">
            <li className="flex items-start gap-2"><span className="text-xl">📊</span> <span>Track your child's academic performance</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">📅</span> <span>Access class schedules and homework</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">💬</span> <span>Communicate with teachers and staff</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">💳</span> <span>View and manage fee payments</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">📥</span> <span>Get important school announcements</span></li>
          </ul>

          {/* 📝 Admission Mobile Note */}
          <p className="text-sm sm:text-base font-medium text-gray-800 bg-yellow-50 border-l-4 border-yellow-500 px-4 py-3 rounded-md shadow-sm">
            📌 <strong className="text-black">Important:</strong> Please enter the <span className="text-blue-700 font-semibold">same mobile number</span> you provided at the time of your child's <span className="font-semibold">school admission</span>. This number is required during signup to <span className="text-blue-700 font-semibold">securely link</span> your parent account with your child’s student profile. <br className="hidden sm:block" />
            <span className="text-gray-700 italic">Using a different number may result in signup failure or delayed verification.</span>
          </p>
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default ParentSignup;
