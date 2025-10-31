import React, { useState ,useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import StudentProfile from '../student_Profile/StudentProfile';
import AcademicProgress from '../academic_Progress/AcademicProgress';
import SchoolNotification from '../school_Messages/SchoolNotification';
import Timetable from '../time_Table/Timetable';
import FeesPaymentHistory from '../fee_Payment/FeesPaymentHistory';
import OurTeachers from '../our_Teachers/OurTeachers';
import ParentHomework from '../parent_homework/ParentHomework';
import { useLocation } from "react-router-dom";
import { getFromIndexedDB, saveToIndexedDB } from '../../../utils/indexedDBUtils';


const TeacherChat = () => <div>This is the Teacher Chat section.</div>;
const LiveClasses = () => <div>This is the Live Classes section.</div>;
const LibraryAccess = () => <div>This is the Library Access section.</div>;
const TransportInfo = () => <div>This is the Transport Info section.</div>;



function ParentHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCard, setActiveCard] = useState('');
  const location = useLocation();
  const { studentId , className ,url} = location.state || {};


    // Load saved value from IndexedDB on mount
  useEffect(() => {
    getFromIndexedDB("activeCard").then((savedCard) => {
      if (savedCard) {
        setActiveCard(savedCard);
      }
    });
  }, []);

  // Save to IndexedDB whenever it changes
  useEffect(() => {
    if (activeCard) {
      saveToIndexedDB("activeCard", activeCard);
    }
  }, [activeCard]);

  // Mapping
const cardComponents = {
  "Student Profile": StudentProfile,
  "Academic Progress": AcademicProgress,
  "Exam Timetable": '',
  "School Notices": SchoolNotification,
  "Fee Payment": FeesPaymentHistory,
  "Homework Tracker": ParentHomework,
  "Our Teachers": OurTeachers,
  "Teacher Chat": TeacherChat,
  "Live Classes": LiveClasses,
  "Class Timetable": Timetable,
  "Library Access": LibraryAccess,
  "Transport Info": TransportInfo,
};

const emojiMap = {
  "Student Profile": "🎓",
  "Academic Progress": "📈",
  "Exam Timetable": "🗓️",
  "School Notices": "📢",
  "Fee Payment": "💰",
  "Homework Tracker": "📚",
  "Our Teachers": "👩‍🏫",
  "Teacher Chat": "💬",
  "Live Classes": "🎥",
  "Class Timetable": "📅",
  "Library Access": "📖",
  "Transport Info": "🚌",
};


  const cards = Object.keys(cardComponents).map((title) => ({
    title,
    desc: '',
    link: '#',
  }));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white text-black mt-18">

      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md">
        <h1 className="text-black font-semibold">Parent Dashboard</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FaBars className="text-xl text-black" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64 w-full z-40 md:relative absolute bg-white`}>
        <Sidebar
          className="h-full shadow-lg border-r"
          style={{
            height: '100vh',
            overflowY: 'auto',
            paddingTop: '1rem',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
          }}
        >
          <Menu
            menuItemStyles={{
              button: {
                backgroundColor: "#ffffff",
                color: "#111827",
                margin: "0.25rem 0.5rem",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
              },
              label: {
                fontWeight: 500,
              },
              hover: {
                backgroundColor: "#e0e7ff",
                color: "#1e3a8a",
              },
              active: {
                backgroundColor: "#c7d2fe",
                color: "#1e3a8a",
                fontWeight: "600",
              },
            }}
          >
            <div className="px-4 pb-2 mt-5">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {cards
              .filter((card) =>
                card.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((card) => (
                <MenuItem
                  key={card.title}
                  active={activeCard === card.title}
                  onClick={() => {
                    setActiveCard(card.title);
                    setSidebarOpen(false);
                  }}
                >
                  {emojiMap[card.title] || "📦"} {card.title}
                </MenuItem>
              ))}
          </Menu>
        </Sidebar>
      </div>

{/* Main Content Area */}
<div className="flex-1 py-4 md:py-6 bg-zinc-50 overflow-y-auto max-h-screen w-full">
  {activeCard && cardComponents[activeCard] ? (
    <div className="min-h-[650px] bg-zinc-50 rounded-2xl shadow p-4 sm:p-6 md:p-8 w-full">
      {React.createElement(cardComponents[activeCard], { studentId, className, url })}
    </div>
  ) : (
    <div className="text-gray-500 text-center mt-20 text-xl">
      Select an option from the sidebar to begin.
    </div>
  )}
</div>

    </div>
  );
}

export default ParentHome;
