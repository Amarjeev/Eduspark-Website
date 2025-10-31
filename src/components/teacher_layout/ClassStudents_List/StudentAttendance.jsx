import axios from 'axios';
import React, { useState } from 'react';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from "../../../utils/toast";
import PageWrapper from '../../../PageWrapper';


function StudentAttendance({ studentId }) {
  const [selectedDate, setSelectedDate] = useState('');
    const [attendance, setAttendance] = useState(null);
    const [studentRecord, setStudentRecord] = useState(null);
  const [error, setError] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setStudentStatus(null);
    setError('');
  };

 const handleShowAttendance = async () => {
  try {
    const response = await axios.get(`${BaseUrl}student/attendance-history/teacher`, {
      params: { studentId, selectedDate },
      withCredentials: true,
    });

    // Set the single attendance record
    setAttendance(response.data.response.attendanceRecords[0]);

    // Set the full attendance object
    setStudentRecord(response.data.response);
  } catch (error) {
   showError('Failed to fetch attendance history. Please try again.');
  }
};


  return (
    <PageWrapper>
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-md text-black">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-black">
        🎓 Student Attendance Status
      </h2>

      {/* Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border px-3 py-2 rounded w-full sm:w-auto"
          />
        </div>

        <button
          onClick={handleShowAttendance}
          className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Show Attendance
        </button>
      </div>

      {/* Results */}
      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

{attendance && (
  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 w-full max-w-xl mx-auto mt-6">
    <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
      📋 Attendance Summary
    </h2>

    <div className="space-y-3 text-sm sm:text-base">
      <p className="flex items-center gap-2">
        <span className="text-gray-600 font-semibold">👩‍🏫 Teacher:</span>
        <span className="text-gray-800">{studentRecord.teacherName}</span>
      </p>

      <p className="flex items-center gap-2">
        <span className="text-gray-600 font-semibold">🏫 Class:</span>
        <span className="text-gray-800">{studentRecord.className}</span>
      </p>

      <p className="flex items-center gap-2">
        <span className="text-gray-600 font-semibold">📅 Date:</span>
        <span className="text-gray-800">{studentRecord.date}</span>
      </p>

      <p className="flex items-center gap-2">
        <span className="text-gray-600 font-semibold">🧒 Student:</span>
        <span className="text-gray-800">{attendance.name}</span>
      </p>

      <p className="flex items-center gap-2">
        <span className="text-gray-600 font-semibold">✅ Status:</span>
        <span className={attendance.status === 'Present' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
          {attendance.status}
        </span>
      </p>

      <p className="flex items-center gap-2">
        <span className="text-gray-600 font-semibold">📝 Comment:</span>
        <span className="text-gray-800 italic">{attendance.comment || "No comments"}</span>
      </p>
    </div>
  </div>
)}

      </div>
       </PageWrapper>
  );
}

export default StudentAttendance;
