import React, { useState, useRef, useEffect } from 'react';
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useUserSchoolData from "../../../hooks/useUserSchoolData";
import PageWrapper from '../../../PageWrapper';

function AdminDashboard() {
  const [activeCard, setActiveCard] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    useUserSchoolData('admin');
  }, []);

  const cards = [
    { title: "Add Teacher", desc: "Create and manage teacher accounts.", link: "/admin/teacher-signup" },
    { title: "Add Student", desc: "Register new students into the system.", link: "/admin/student-signup" },
    { title: "Student List", desc: "View all enrolled students.", link: "/admin/students" },
    { title: "Add Exam Marks", desc: "Input and track student exam results.", link:"/admin/exam-marks/add/admin" },
    { title: "All Teachers", desc: "List and manage all teacher profiles.", link: "/admin/teachers" },
    { title: "Parents List", desc: "List and manage parent records." },
    { title: "School Announcements", desc: "Create and send announcements to parents and students.",link:"/admin/school-announcements" },
    { title: "Fees Management", desc: "Track and manage student payment details.", link: "/admin/feesconfig/option" },
    { title: "Class Management", desc: "Manage classes, assign teachers, and schedules.", link: "/admin/class-management" },
    { title: "Attendance Tracking", desc: "Record and view student attendance.",link:"/admin/attendance-Dashboard/admin" },
    { title: "Timetable Management", desc: "Create and manage school timetables.", link: "/admin/timetable/option" },
    { title: "Events & Calendar", desc: "Schedule and view school events and holidays." },
    { title: "Restricted Class Entry", desc: "Assign and manage class access for teachers.", link: "/admin/teacher-class-access" },
    { title: "Notifications", desc: "Send notifications to students, parents, and teachers." },
    { title: "Reports & Analytics", desc: "Generate reports on various school data." },
    { title: "Library Management", desc: "Manage library inventory and book issuance." },
    { title: "Transport Management", desc: "Manage school transport routes and details." },
  ];

  const emojiMap = {
    "Add Teacher": "👨‍🏫",
    "Add Student": "🎓",
    "Student List": "📋",
    "Add Exam Marks": "📝",
    "All Teachers": "👩‍🏫",
    "Parents List": "👪",
    "School Announcements": "💬",
    "Fees Management": "💰",
    "Class Management": "🏫",
    "Attendance Tracking": "✅",
    "Timetable Management": "📅",
    "Events & Calendar": "🎉",
    "Restricted Class Entry": "🔐",
    "Notifications": "🔔",
    "Reports & Analytics": "📊",
    "Library Management": "📖",
    "Transport Management": "🚌",
  };

  const cardRefs = useRef({});

  useEffect(() => {
    if (cardRefs.current[activeCard]) {
      cardRefs.current[activeCard].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeCard]);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row min-h-screen bg-white text-black">

        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md">
          <h1 className="text-black font-semibold">Admin Dashboard</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars className="text-xl text-black" />
          </button>
        </div>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64`}>
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
                .filter((card) => card.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((card) => (
                  <MenuItem
                    key={card.title}
                    active={activeCard === card.title}
                    onClick={() => {
                      setActiveCard(card.title);
                      setSidebarOpen(false);
                    }}
                    component={card.link ? <Link to={card.link} /> : undefined}
                  >
                    {emojiMap[card.title] || "📦"} {card.title}
                  </MenuItem>
                ))}
            </Menu>
          </Sidebar>
        </div>

        {/* Main Content */}
        <div
          className="flex-1 p-6 md:p-10"
          style={{
            background: "#ffffff",
            borderLeft: "1px solid #e5e7eb",
            color: "#111827",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 md:mt-10">
            {cards.map((card, index) => {
              const cardContent = (
                <div
                  key={index}
                  ref={(el) => (cardRefs.current[card.title] = el)}
                  className="rounded-2xl p-6 h-48 flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.03] cursor-pointer"
                  style={{
                    background: activeCard === card.title ? "#c7d2fe" : "#f9fafb",
                    border: "1px solid #e5e7eb",
                    boxShadow: activeCard === card.title
                      ? "0 8px 32px 0 rgba(59, 130, 246, 0.5)"
                      : "0 8px 24px 0 rgba(0, 0, 0, 0.1)",
                  }}
                  onClick={() => setActiveCard(card.title)}
                >
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2 select-none"
                    style={{ color: activeCard === card.title ? "#1e3a8a" : "#111827" }}>
                    <span className="text-3xl">{emojiMap[card.title] || "📦"}</span> {card.title}
                  </h2>
                  <p className="text-sm text-gray-700 line-clamp-3">{card.desc}</p>
                </div>
              );

              return card.link ? (
                <Link to={card.link} key={index}>
                  {cardContent}
                </Link>
              ) : (
                cardContent
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AdminDashboard;
