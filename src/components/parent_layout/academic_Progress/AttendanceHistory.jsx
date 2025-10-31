import axios from 'axios';
import React, { useState } from 'react';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from "../../../utils/toast";
import PageWrapper from '../../../PageWrapper';

function AttendanceHistory({ studentId }) {
  const [selectedDate, setSelectedDate] = useState('2025-07-06');
  const [attendance, setAttendance] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);
  const [error, setError] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setAttendance(null);
    setError('');
  };

  const handleShowAttendance = async () => {
    try {
      const response = await axios.get(`${BaseUrl}student/attendance-history/parent`, {
        params: { studentId, selectedDate },
        withCredentials: true,
      });

      setAttendance(response.data.response.attendanceRecords[0]);
      setStudentRecord(response.data.response);
    } catch (error) {
      showError('Failed to fetch attendance history. Please try again.');
    }
  };

  return (
    <PageWrapper>
      <div className="p-4 md:p-6  bg-zinc-50 min-h-screen text-black rounded-xl shadow-lg mt-12">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-black border-b border-yellow-600 pb-2">
          🎓 Student Attendance Status
        </h2>

        {/* Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div>
            <label className="block font-semibold mb-1">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border border-yellow-600 bg-white text-black px-3 py-2 rounded w-full sm:w-auto focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <button
            onClick={handleShowAttendance}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded transition"
          >
            Show Attendance
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 font-medium mb-4">{error}</p>}

        {/* Attendance Summary */}
        {attendance && (
          <div className="bg-white border border-yellow-600 rounded-2xl shadow-xl p-6 w-full max-w-xl mx-auto mt-6 text-black">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📋 Attendance Summary
            </h2>

            <div className="space-y-3 text-sm sm:text-base">
              <p className="flex items-center gap-2">
                <span className="font-semibold">👩‍🏫 Teacher:</span>
                <span>{studentRecord.teacherName}</span>
              </p>

              <p className="flex items-center gap-2">
                <span className="font-semibold">🏫 Class:</span>
                <span>{studentRecord.className}</span>
              </p>

              <p className="flex items-center gap-2">
                <span className="font-semibold">📅 Date:</span>
                <span>{studentRecord.date}</span>
              </p>

              <p className="flex items-center gap-2">
                <span className="font-semibold">🧒 Student:</span>
                <span>{attendance.name}</span>
              </p>

              <p className="flex items-center gap-2">
                <span className="font-semibold">✅ Status:</span>
                <span className={attendance.status === 'Present' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {attendance.status}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <span className="font-semibold">📝 Comment:</span>
                <span className="italic">{attendance.comment || "No comments"}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default AttendanceHistory;
