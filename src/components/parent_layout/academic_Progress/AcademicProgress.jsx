import React, { useEffect, useState } from 'react';
import { X, Menu } from 'lucide-react';
import PageWrapper from '../../../PageWrapper';
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import AttendanceHistory from './AttendanceHistory';
import ExamMarks from './ExamMarks';

function AcademicProgress({ studentId , url}) {
  const [activeSection, setActiveSection] = useState('marks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchDraft = async () => {
      const profile = await getFromIndexedDB('student_ProfileData');
      setProfileData(profile);
    };
    fetchDraft();
  }, []);

  // const studentId = profileData?.employId;
  const studentName = profileData?.schoolname;
  const studentClass = profileData?.className;
  const profilePicUrl = profileData?.url;

  const renderRightContent = () => {
    switch (activeSection) {
      case 'marks':
        return <ExamMarks studentId={studentId} />;
      case 'attendance':
        return <AttendanceHistory studentId={studentId} />;
      default:
        return null;
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsSidebarOpen(false); // Close drawer on mobile
  };

  return (
    <PageWrapper>
      <div className="flex flex-col h-screen bg-zinc-50 text-black">

        {/* Top Navbar */}
        <nav className=" bg-zinc-50 shadow-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Profile Avatar */}
            <img
              src={url || '/images/avatar.png'}
              alt="Profile"
              className="hidden md:block w-10 h-10 rounded-full border-2 border-yellow-400 object-cover shadow"
            />

            {/* Name + Class */}
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-semibold text-gray-800">{studentName}</span>
              <span className="text-sm text-gray-500">{studentClass}</span>
            </div>
          </div>

          {/* Right side nav buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleSectionChange('marks')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeSection === 'marks'
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-700 hover:bg-yellow-100'
              }`}
            >
              Exam Marks
            </button>
            <button
              onClick={() => handleSectionChange('attendance')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeSection === 'attendance'
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-700 hover:bg-yellow-100'
              }`}
            >
              Attendance History
            </button>
          </div>
        </nav>

        {/* Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 shadow-md transform transition-transform duration-300 ease-in-out">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-base font-semibold">Menu</h2>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Profile */}
              <div className="flex flex-col items-center text-center p-6 border-b">
                <img
                  src={url || '/images/avatar.png'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 object-cover shadow"
                />
                <h2 className="mt-3 text-md font-medium text-gray-800">{studentName}</h2>
                <p className="text-sm text-gray-500">{studentClass}</p>
              </div>

              {/* Buttons */}
              <div className="p-4 flex flex-col gap-3">
                <button
                  onClick={() => handleSectionChange('marks')}
                  className={`w-full py-2 px-4 rounded-lg text-left font-medium transition ${
                    activeSection === 'marks'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-100 hover:bg-yellow-100 text-gray-800'
                  }`}
                >
                  Exam Marks
                </button>
                <button
                  onClick={() => handleSectionChange('attendance')}
                  className={`w-full py-2 px-4 rounded-lg text-left font-medium transition ${
                    activeSection === 'attendance'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-100 hover:bg-yellow-100 text-gray-800'
                  }`}
                >
                  Attendance History
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderRightContent()}
        </main>
      </div>
    </PageWrapper>
  );
}

export default AcademicProgress;
