import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CalendarCheck } from 'lucide-react';
import PageWrapper from '../../../PageWrapper';

function AttendanceDashboard() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-indigo-800 drop-shadow">
          🎯 Attendance Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ✅ Take Attendance Card */}
          <div
            onClick={() => navigate('/admin/take-attendance/admin')}
            className="cursor-pointer p-6 bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition group transform hover:scale-105 duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white text-indigo-600 p-3 rounded-full shadow-lg group-hover:bg-indigo-800 group-hover:text-white transition">
                <ClipboardList size={28} />
              </div>
              <h2 className="text-xl font-semibold tracking-wide group-hover:underline underline-offset-4">
                Take Attendance
              </h2>
            </div>
            <p className="mt-4 text-white/90 text-sm">
              Select a class and date, then mark present or absent for each student.
            </p>
          </div>

          {/* 📜 Attendance History Card */}
          <div
            onClick={() => navigate('/admin/attendance-history/admin')}
            className="cursor-pointer p-6 bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition group transform hover:scale-105 duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white text-teal-600 p-3 rounded-full shadow-lg group-hover:bg-teal-800 group-hover:text-white transition">
                <CalendarCheck size={28} />
              </div>
              <h2 className="text-xl font-semibold tracking-wide group-hover:underline underline-offset-4">
                Attendance History
              </h2>
            </div>
            <p className="mt-4 text-white/90 text-sm">
              Browse past attendance records by class and date.
            </p>
          </div>
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default AttendanceDashboard;
