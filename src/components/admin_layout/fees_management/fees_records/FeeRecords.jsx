import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from "../../../../BaseUrl/BaseUrl";
import { showError } from "../../../../utils/toast";
import Loading from "../../../loading_ui/Loading";
import { useNavigate } from "react-router-dom";
import { getFromIndexedDB, saveToIndexedDB } from '../../../../utils/indexedDBUtils';
import PageWrapper from '../../../../PageWrapper';

function FeeRecords() {
  const [selectedClass, setSelectedClass] = useState();
  const [classList, setClassList] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 loading state
  const navigate = useNavigate();
  // Initial fetch for class list and all records
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // start loading
    
            const classListData = await getFromIndexedDB('school-class-List-admin');
    if (classListData ) {
       setClassList(classListData)
    }

        
      } catch (error) {
        showError("Failed to load data. Please try again.");
      } finally {
        setLoading(false); // stop loading
      }
    };
    fetchData();
  }, []);

useEffect(() => {
  const loadInitialClass = async () => {
    const saved = await getFromIndexedDB('feesRecord_selected_class');
    if (saved) setSelectedClass(saved);
  };

  loadInitialClass();
}, []);


  // Fetch fee records on class change
  useEffect(() => {
    const fetchClassRecords = async () => {
      try {
        setLoading(true);
         await saveToIndexedDB('feesRecord_selected_class',selectedClass)
          const response = await axios.get(`${BaseUrl}admin/fees/records/${selectedClass}`, {
          withCredentials: true,
        });
        setFeeRecords(response.data);

      } catch (error) {
        setLoading(false)
        showError("Failed to load class records. Please try again.");
      } finally {
        setLoading(false); // stop loading
      }
    };

    if (selectedClass) {
      fetchClassRecords();
    }
  }, [selectedClass]);

  const handleViewHistory = (id) => {
    navigate(`/admin/fees/history/${id}`);
  };

  // Show loading screen
  if (loading) return <Loading />;

  return (
   <PageWrapper>
  <div className="min-h-screen bg-white text-gray-800 p-4 md:p-8">
    {/* 🎓 Filter Section */}
    <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow-md p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">🎓 Student Fee Records</h1>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-col w-full sm:w-64">
          <label className="text-gray-700 text-sm font-medium mb-1">
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {classList.map((cls, index) => (
              <option key={index} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* 📊 Table Section */}
    <div className="max-w-6xl mx-auto mt-8 overflow-x-auto rounded-xl border border-gray-200 shadow-md">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full table-auto text-sm text-gray-800 bg-white">
          <thead className="bg-gray-100 font-semibold sticky top-0 z-10">
            <tr>
              <th className="p-4 border-b text-left">#</th>
              <th className="p-4 border-b text-left">Student ID</th>
              <th className="p-4 border-b text-left">Student Name</th>
              <th className="p-4 border-b text-left">Class</th>
              <th className="p-4 border-b text-left">Total Fee (₹)</th>
              <th className="p-4 border-b text-left">Balance Fee (₹)</th>
              <th className="p-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {feeRecords.map((student, index) => (
              <tr
                key={student._id}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="p-4 border-b">{index + 1}</td>
                <td className="p-4 border-b">
                  {student.studentData?.studentId || "-"}
                </td>
                <td className="p-4 border-b font-medium">
                  {student.studentData?.name || "-"}
                </td>
                <td className="p-4 border-b">
                  {student.studentData?.className || "-"}
                </td>
                <td className="p-4 border-b">
                  ₹{student.totalFee?.toLocaleString() || 0}
                </td>
                <td
                  className={`p-4 border-b font-semibold ${
                    student.balancePaying === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{student.balancePaying?.toLocaleString() || 0}
                </td>
                <td className="p-4 border-b">
                  <button
                    onClick={() => handleViewHistory(student._id)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View Payment History
                  </button>
                </td>
              </tr>
            ))}
            {feeRecords.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-6 text-gray-500 italic border-b"
                >
                  No student records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
      </div>
      </PageWrapper>
);

}

export default FeeRecords;
