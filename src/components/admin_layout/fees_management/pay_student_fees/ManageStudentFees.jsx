import React, { useState } from "react";
import axios from "axios"; // 🌐 For making HTTP requests
import { BaseUrl } from "../../../../BaseUrl/BaseUrl"; // 🔗 Base API URL
import { showSuccess, showError } from "../../../../utils/toast"; // ✅ Toast functions
import Loading from "../../../loading_ui/Loading"; // 🌀 Loading animation
import PageWrapper from "../../../../PageWrapper";

function ManageStudentFees() {
  // ✅ State variables
  const [loading, setLoading] = useState(false); // ⏳ Loading indicator
  const [studentProfile, setStudentProfile] = useState({}); // 👤 Stores fetched student data
  const [duplicateError, setDuplicateError] = useState(""); // ❌ Error if student ID not found
  const [warningMsg, setWarningMsg] = useState(null); // ⚠️ For form validation or logic warnings

  // 📝 Form state
  const [formData, setFormData] = useState({
    studentId: "",       // 🎫 Input for student ID
    studentData: null,   // 👤 Holds entire student object
    totalFee: "",        // 💰 Total fee assigned
    currentPaying: "",   // 💵 Payment being made now
    balancePaying: "",   // 💸 Remaining balance
    payDate: "",         // 📅 Date of payment
  });

  // 🖊️ Handles input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔍 Searches student by ID
  const handleSearch = async () => {
    setLoading(true);
    try {
      const studentID = formData.studentId;
      const response = await axios.get(
        `${BaseUrl}admin/student-profile/${studentID}`,
        { withCredentials: true }
      );

      const profile = response.data;

      // 🎯 Set fetched profile in both UI & form
      setStudentProfile(profile);
      setFormData((prev) => ({
        ...prev,
        totalFee: profile.totalFee,
        balancePaying: profile.balanceAmount,
        studentData: profile,
      }));
      setDuplicateError('')
      setLoading(false);
    } catch (error) {
      showError("Failed to fetch student profile. Please try again.");
      setDuplicateError(error.response?.data?.error || "Unknown error");
      setLoading(false);
    }
  };

  // 📤 Handles fee submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { studentID, totalFee, currentPaying, payDate, studentData } = formData;
    const currentPayment = Number(currentPaying);
    const balanceBefore = Number(formData.balancePaying);
    const totalAmount = Number(totalFee);

    // ✅ Validation checks
    if (!studentData || !totalFee || !currentPaying || !payDate) {
      setWarningMsg("⚠️ Please fill all required fields.");
      setLoading(false);
      return;
    }

    if (currentPayment === 0) {
      setWarningMsg("⚠️ Please enter a valid amount.");
      setLoading(false);
      return;
    }

    if (currentPayment > totalAmount) {
      setWarningMsg("❌ Invalid payment amount. Cannot exceed total fee.");
      setLoading(false);
      return;
    }

    if (currentPayment > balanceBefore) {
      setWarningMsg(
        `❌ Invalid payment amount. Cannot exceed remaining balance of ₹${balanceBefore}.`
      );
      setLoading(false);
      return;
    }

    try {
      // 💾 Submit to backend
      await axios.post(`${BaseUrl}admin/student-fees`, formData, {
        withCredentials: true,
      });

      showSuccess("✅ Fee submitted successfully!");
      setWarningMsg("");

      // 🔄 Reset form & UI
      setFormData({
        studentId: "",
        studentData: null,
        totalFee: "",
        currentPaying: "",
        balancePaying: 0,
        payDate: "",
      });

      setStudentProfile({});
      setLoading(false);
    } catch (error) {
      showError(" Failed to submit fee. Please try again.");
      setLoading(false);

      if (error.response?.data?.status === "warning") {
        return setWarningMsg(error.response.data.message);
      }

      showError("❌ Failed to submit fee. Please try again.");
    }
  };

  // ❌ Cancel resets everything
  const handleCancel = () => {
    setFormData({
      studentId: "",
      studentData: null,
      totalFee: "",
      currentPaying: "",
      balancePaying: 0,
      payDate: "",
    });
    setStudentProfile({});
    setWarningMsg("");
  };

  // ⏳ Loading spinner
  if (loading) return <Loading />;

  return (
    <PageWrapper>
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-black px-6 py-12">
    {/* 🏷️ Title */}
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-black tracking-wide">
      🏦 Student Fee Payment System
    </h2>

    {/* 🔲 Layout: Left (Search) + Right (Form) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">

      {/* 🔍 Left: Search student */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-semibold text-black mb-4">🔍 Search Student</h3>
        <input
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          placeholder="Enter Student ID"
          className="w-full px-4 py-3 bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        {duplicateError && (
          <h1 className="mb-6 text-red-500 text-lg">{duplicateError}</h1>
        )}
        <button
          onClick={handleSearch}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition"
        >
          Search Student
        </button>

        {warningMsg && (
          <div className="bg-red-100 px-6 py-4 mx-2 my-4 rounded-md text-lg flex items-center max-w-lg">
            <svg viewBox="0 0 24 24" className="text-red-600 w-5 h-5 mr-3">
              <path
                fill="currentColor"
                d="M11.983,0a12.206,12.206,0,0,0-8.51,3.653A11.8,11.8,0,0,0,0,12.207A11.779,11.779,0,0,0,11.8,24h.214A12.111,12.111,0,0,0,24,11.791h0A11.766,11.766,0,0,0,11.983,0ZM10.5,16.542a1.476,1.476,0,0,1,1.449-1.53h.027a1.527,1.527,0,0,1,1.523,1.47,1.475,1.475,0,0,1-1.449,1.53h-.027A1.529,1.529,0,0,1,10.5,16.542ZM11,12.5v-6a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Z"
              />
            </svg>
            <span className="text-red-800">{warningMsg}</span>
          </div>
        )}
      </div>

      {/* 💳 Right: Fee form entry */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        {studentProfile && studentProfile.studentId ? (
          <>
            {/* 🧍 Student Profile Display */}
            <div className="flex items-center space-x-4 mb-6">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Student"
                className="w-16 h-16 rounded-full border-2 border-blue-400 shadow-md"
              />
              <div>
                <h4 className="text-lg font-bold">{studentProfile.name}</h4>
                <p className="text-sm text-blue-700">📘 Class: {studentProfile.className}</p>
                <p className="text-sm text-blue-700">
                  📅 Admission:{" "}
                  {new Date(studentProfile.admissionDate).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>

            {/* ✅ Message if payment is already done */}
            {formData.balancePaying === 0 && (
              <h1 className="text-green-600 mb-3 font-semibold">
                ✅ Payment already completed. No pending balance.
              </h1>
            )}

            {/* 💳 Fee Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Total Fee Amount (₹)
                </label>
                <input
                  type="number"
                  name="totalFee"
                  readOnly
                  value={formData.totalFee}
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Balance Amount (₹)
                </label>
                <input
                  type="number"
                  name="balancePaying"
                  value={formData.balancePaying}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 cursor-not-allowed"
                />
              </div>

              {formData.balancePaying !== 0 && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Paying Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="currentPaying"
                      value={formData.currentPaying}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-400"
                      min={0}
                      max={formData.totalFee}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Payment Date</label>
                    <input
                      type="date"
                      name="payDate"
                      value={formData.payDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* 💾 Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold text-white tracking-wide shadow-md"
                  >
                    💰 Submit Payment
                  </button>
                </>
              )}

              {/* ❌ Cancel Button */}
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 font-bold text-white tracking-wide shadow-md"
              >
                ❌ Cancel
              </button>
            </form>
          </>
        ) : (
          <p className="text-black text-center mt-6">
            Enter a valid student ID to view profile and make payment.
          </p>
        )}
      </div>
    </div>
      </div>
      </PageWrapper>
);

}

export default ManageStudentFees;
