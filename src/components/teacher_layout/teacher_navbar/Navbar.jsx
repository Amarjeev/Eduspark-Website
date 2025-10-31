import React, { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showError } from "../../../utils/toast";
import { removeFromIndexedDB,getFromIndexedDB } from '../../../utils/indexedDBUtils';
import Loading from '../../loading_ui/Loading';
import PageWrapper from "../../../PageWrapper";


function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // for mobile menu
  const [showDropdown, setShowDropdown] = useState(false); // for avatar dropdown
  const [loading, setLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState("/images/avatar.png");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const navLinks = [
    { name: "Dashboard", to: "/teacher/dashboard" },
    { name: "Attendance", to: "#" },
    { name: "Students", to: "/teacher/student-list" },
    { name: "Timetable", to: "/teacher/class-timetable" },
    { name: "Homework", to: "#" },
  ];

  const handleLogout = async () => {
   setLoading(true)
  try {
    const response = await axios.post(`${BaseUrl}logout/teacher`, {}, {
      withCredentials: true,
    });

    if (response.data.success) {
      await removeFromIndexedDB("school-subjects-List-teacher");
      await removeFromIndexedDB("school-class-List-teacher");
      await removeFromIndexedDB('teacher_ProfileData');
      navigate("/");
       setLoading(false)
    }
  } catch (error) {
     setLoading(false)
    showError('Logout failed. Please try again.')
  }
  };
  

  useEffect(() => {
    (async () => {
      const profileUrl = await getFromIndexedDB("teacher_ProfileData");
      if (profileUrl?.url) setProfileUrl(profileUrl.url);
    })()
  },[])


  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <Loading />;

  return (
   <PageWrapper>
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          🎓 EduSpark
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Avatar + Mobile Toggle */}
        <div className="relative flex items-center gap-4">
          {/* ✅ Avatar Dropdown */}
          <div ref={dropdownRef} className="relative">
            <img
              src={profileUrl}
              alt="Profile"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full border-2 border-blue-500 object-cover cursor-pointer"
            />

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
                <button
                  onClick={() => {
                    navigate("/teacher/details");
                    setShowDropdown(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  👤 Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
      </header>
      </PageWrapper>

  );
}

export default Navbar;
