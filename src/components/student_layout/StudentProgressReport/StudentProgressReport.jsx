import React, { useEffect, useState } from 'react';
import { X, Menu } from 'lucide-react';
import PageWrapper from '../../../PageWrapper';
import StudentExamMarks from './StudentExamMarks';
import { getFromIndexedDB } from "../../../utils/indexedDBUtils";
import StudentAttendanceHistory from './StudentAttendanceHistory';
import StudentProfileData from './StudentProfileData';

function StudentProgressReport() {
  const [activeSection, setActiveSection] = useState('marks');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);

  useEffect(() => {
  const fetchDraft = async () => {
    const profileData = await getFromIndexedDB("student_ProfileData");
    setProfileData(profileData);
  };

  fetchDraft();
}, []);

    const studentId = profileData?.employId;
    const studentName = profileData?.schoolname;
    const studentClass = profileData?.className;
    const profilePicUrl=profileData?.url;

  const renderRightContent = () => {
    switch (activeSection) {
      case 'marks':
        return <StudentExamMarks studentId={studentId} />;
      case 'attendance':
        return <StudentAttendanceHistory studentId={studentId} />;
      case 'about':
        return <StudentProfileData studentId={studentId} />;
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
      <div className="flex flex-col md:flex-row h-screen bg-black text-white relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-yellow-500 text-black shadow-md mt-19">
          <h2 className="text-xl font-bold">Student Progress</h2>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar (Mobile & Desktop) */}
        <div
          className={`fixed z-40 md:relative top-0 left-0 h-full w-64 bg-gray-900 p-6 shadow-lg transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out md:translate-x-0 md:w-1/4`}
        >
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center mb-4 md:hidden text-yellow-400">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Preview */}
          <div className="flex flex-col items-center text-center mb-6 mt-17">
            <img
              src={ profilePicUrl || "/images/avatar.png"}
              alt="Student Profile"
              className="w-28 h-28 rounded-full mb-3 border-4 border-yellow-400 shadow-lg object-cover"
            />
            <h2 className="text-lg font-bold text-yellow-300">{studentName}</h2>
            <p className="text-sm text-gray-400">{studentClass}</p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSectionChange('marks')}
              className={`py-2 px-4 rounded-lg font-medium transition ${
                activeSection === 'marks'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Student Marks
            </button>
            <button
              onClick={() => handleSectionChange('attendance')}
              className={`py-2 px-4 rounded-lg font-medium transition ${
                activeSection === 'attendance'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Attendance History
            </button>
            <button
              onClick={() => handleSectionChange('about')}
              className={`py-2 px-4 rounded-lg font-medium transition ${
                activeSection === 'about'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              About Student
            </button>
          </div>
        </div>

        {/* Background Overlay for Mobile Sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-black">
          {renderRightContent()}
        </div>
      </div>
    </PageWrapper>
  );
}

export default StudentProgressReport;
