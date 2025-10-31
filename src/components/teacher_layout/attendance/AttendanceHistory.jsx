import React, { useState, useEffect } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from "../../../utils/toast";
import Loading from '../../loading_ui/Loading';
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import { useParams } from 'react-router-dom';
import PageWrapper from '../../../PageWrapper';

function AttendanceHistory() {
  // States to handle filters and fetched data
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');
  const [attendanceTakenByTeacher, setAttendanceTakenByTeacher] = useState('');
  const [attendanceTakenDate, setAttendanceTakenDate] = useState('');
  const [attendanceClassName, setAttendanceClassName] = useState('');
  const [finalClassOptions, setFinalClassOptions] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { role } = useParams();

  // 🌐 Fetch class and teacher details on first render
useEffect(() => {
  (async () => {
    const classListData = await getFromIndexedDB(`school-class-List-${role}`);
    if (classListData ) {
      setFinalClassOptions(classListData)
    }
  })();
}, []);
 
  // Search attendance records from backend
  const handleSearch = async () => {
    if (selectedDate && selectedClass && statusFilter) {
      try {
         setLoading(true);
        const response = await axios.get(`${BaseUrl}attendance/history`, {
          params: {
            date: selectedDate,
            className: selectedClass,
            status: statusFilter,
          },
          withCredentials: true,
        });
         setLoading(false);

        // If status is All, use grouped data
        if (statusFilter === 'All') {
          setAttendanceData(response.data[0].attendanceRecords);
          setAttendanceClassName(response.data[0].className);
          setAttendanceTakenByTeacher(response.data[0].teacherName);
          setAttendanceTakenDate(response.data[0].date);
          return;
        } else {
          // If filtered, use flat data
          setAttendanceTakenByTeacher(response.data.teacherName);
          setAttendanceTakenDate(response.data.date);
           setAttendanceClassName(response.data.className);
          setAttendanceData(response.data.attendanceRecords);
        }
      } catch (error) {
         setLoading(false);
        // Handle custom error message
        if (error.response?.data?.responseMsg) {
          setAttendanceData([]);
          return setErrorMessage(error.response.data?.responseMsg);
        }
        showError("Error fetching attendance");
      }
    } else {
      showError("Please fill all filters before searching.");
    }
  };

  if (loading) return <Loading />;

  return (
    <PageWrapper>
   <div className="min-h-screen bg-white text-black py-10 px-4">
  <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-xl border border-gray-300">
    <h1 className="text-3xl font-bold text-center text-black mb-6">
      📋 Attendance History
    </h1>

    {/* Filters Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
          <CalendarDays size={18} /> Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-white text-black border border-gray-400 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-black flex items-center gap-2 mb-1">
          <Users size={18} /> Select Class
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full bg-white text-black border border-gray-400 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select Class</option>
          {finalClassOptions.map((cls, index) => (
            <option key={index} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-black mb-1 block">
          🎯 Filter by Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white text-black border border-gray-400 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
        >
          <option value="All">All</option>
          <option value="Present">✅ Present Only</option>
          <option value="Absent">❌ Absent Only</option>
        </select>
      </div>

      <div className="md:col-span-3 text-right mt-2">
        <button
              onClick={handleSearch}
               disabled={loading}
          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition"
        >
          🔍 Search Attendance
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-black">
          <tr>
            <th className="px-4 py-3">🆔 Student ID</th>
            <th className="px-4 py-3">👩‍🎓 Student Name</th>
            <th className="px-4 py-3">📌 Status</th>
            <th className="px-4 py-3">📝 Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {attendanceData.length > 0 ? (
            [
              <tr key="teacher-row" className="bg-gray-100 text-black font-medium">
                <td colSpan="6" className="px-4 py-3 text-black text-sm">
                  <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                    <span className="text-teal-600 font-semibold">📌 Attendance Taken By:</span>
                    <span>{attendanceTakenByTeacher}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-teal-600 font-semibold">🏧 Class:</span>
                    <span>{attendanceClassName}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-teal-600 font-semibold">🗓️ Date:</span>
                    <span>{attendanceTakenDate}</span>
                  </div>
                </td>
              </tr>,
              ...attendanceData
                .filter((student) => statusFilter === 'All' || student.status === statusFilter)
                .map((student, idx) => (
                  <tr key={`${student.id}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{student.id}</td>
                    <td className="px-4 py-3">{student.name}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        student.status === 'Present' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {student.status}
                    </td>
                    <td className="px-4 py-3">
                      {student.status === 'Absent' ? student.comment || 'No reason provided' : '-'}
                    </td>
                  </tr>
                )),
            ]
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500 italic">
                {errorMessage || "No records found for the selected filters."}
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

export default AttendanceHistory;
