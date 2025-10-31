import React, { useState } from 'react';
import StudentMarks from './StudentMarks';
import StudentAttendance from './StudentAttendance';
import StudentProfileCard from './StudentProfileCard';
import { X, Menu } from 'lucide-react';
import { useLocation } from "react-router-dom";
import PageWrapper from '../../../PageWrapper';

function StudentDetailsPage() {
  const [activeSection, setActiveSection] = useState('marks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
  const location = useLocation();
  const { studentId, studentName, studentClass } = location.state || {};

  const renderRightContent = () => {
    switch (activeSection) {
      case 'marks':
        return <StudentMarks studentId={studentId} />;
      case 'attendance':
        return <StudentAttendance studentId={studentId} />;
      case 'about':
        return <StudentProfileCard studentId={studentId} />;
      default:
        return null;
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  return (
    <PageWrapper>
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Sidebar (Desktop & Modal for Mobile) */}
      <div
        className={`fixed z-40 md:relative top-0 left-0 h-full w-64 bg-white p-6 shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:w-1/4`}
      >
        {/* Close Button for Mobile */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Dummy Profile Image */}
        <div className="flex flex-col items-center">
          <img
            src="/images/avatar.png"
            alt="Student Profile"
            className="w-28 h-28 rounded-full mb-4 border-2 border-blue-400"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-1">{ studentName}</h2>
          <p className="text-sm text-gray-500 mb-4">{ studentClass}</p>
        </div>

        {/* Sidebar Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => handleSectionChange('marks')}
            className={`py-2 rounded font-medium ${
              activeSection === 'marks'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Student Marks
          </button>
          <button
            onClick={() => handleSectionChange('attendance')}
            className={`py-2 rounded font-medium ${
              activeSection === 'attendance'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Attendance History
          </button>
          <button
            onClick={() => handleSectionChange('about')}
            className={`py-2 rounded font-medium ${
              activeSection === 'about'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            About Student
          </button>
        </div>
      </div>

      {/* Overlay on Mobile when Sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Right Content */}
      <div className="flex-1 p-4 overflow-y-auto">{renderRightContent()}</div>
      </div>
     </PageWrapper>
  );
}

export default StudentDetailsPage;
