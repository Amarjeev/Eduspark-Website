import React, { useEffect, useState } from 'react';
import { showSuccess, showError } from "../../../utils/toast";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { useParams } from "react-router-dom";
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import Loading from '../../loading_ui/Loading';
import PageWrapper from '../../../PageWrapper';

function StudentFeesHistory() {
  const { role } = useParams(); // 👈 Get role from route parameters
  const [studentData, setStudentData] = useState(null); // 💾 State to hold fee data
  const [paymentHistoryData, setPaymentHistory] = useState([]); // 💾 State to hold payment history
  const [studentProfile, setStudentProfile] = useState(null); // 💾 State to hold student profile
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const fetchStudentFeeHistory = async () => {
      try {
        setLoading(true)
        // 📥 Get student profile from IndexedDB
        const studentProfile = await getFromIndexedDB("student_ProfileData");
        setStudentProfile(studentProfile);

        // 📡 Fetch student fee history from backend
        const response = await axios.get(`${BaseUrl}get/student-fees/History/${role}`, {
          withCredentials: true,
        });
        // ✅ Set data in state
        setStudentData(response?.data?.data);
        setPaymentHistory(response?.data?.data?.paymentHistory);
        setLoading(false)
      } catch (error) {
        setLoading(false)
      showError("Failed to load fee history. Please try again.");
      }
    };

    fetchStudentFeeHistory();
  }, []);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-black text-yellow-400 p-6">
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 space-y-6 mt-15">

        {/* 🧾 Student Details Section */}
        <div className="space-y-1 border-b border-yellow-600 pb-4">
          <h2 className="text-2xl font-bold text-yellow-300">Student Details</h2>
          <p><span className="font-semibold text-white">Name:</span> {studentProfile?.name}</p>
          <p><span className="font-semibold text-white">Student ID:</span> {studentProfile?.employId}</p>
          <p><span className="font-semibold text-white">Class:</span> {studentProfile?.className}</p>
        </div>

        {/* 💳 Fee Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-yellow-600 pb-4">
          {/* Total Fee */}
          <div className="bg-yellow-400 text-black p-4 rounded-xl shadow-lg hover:scale-[1.01] transition-transform">
            <p className="text-sm font-semibold">Total Fee</p>
            <p className="text-2xl font-bold">₹{studentData?.totalFee || 0}</p>
          </div>

          {/* Balance Fee */}
          <div className="bg-lime-300 text-black p-4 rounded-xl shadow-lg hover:scale-[1.01] transition-transform">
            <p className="text-sm font-semibold">Balance Fee</p>
            <p className="text-2xl font-bold">₹{studentData?.balancePaying || 0}</p>
          </div>
        </div>

      {/* 📄 Payment History Table */}
<div>
  <h3 className="text-xl font-semibold text-white mb-3">Payment History</h3>

  {/* 🖱️ Scrollable table container on small screens */}
  <div className="overflow-x-auto max-w-full max-h-[400px] rounded-lg border border-yellow-600">
    <table className="min-w-full w-full table-auto bg-gray-800 rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-yellow-500 text-black">
          <th className="text-left px-4 py-2">#</th>
          <th className="text-left px-4 py-2">Amount Paid</th>
          <th className="text-left px-4 py-2">Paid Date</th>
        </tr>
      </thead>
      <tbody>
        {paymentHistoryData?.map((entry, index) => (
          <tr key={index} className="border-b border-yellow-700">
            <td className="px-4 py-2 text-white">{index + 1}</td>
            <td className="px-4 py-2 text-white">₹{entry.amount}</td>
            <td className="px-4 py-2 text-white">
              {/* 🗓️ Format date as DD/MM/YYYY */}
              {new Date(entry.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* ❗ No payment records fallback message */}
    {!studentData?.balancePaying && (
      <p className="text-white mt-4">No payment records found.</p>
    )}
  </div>
</div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default StudentFeesHistory;
