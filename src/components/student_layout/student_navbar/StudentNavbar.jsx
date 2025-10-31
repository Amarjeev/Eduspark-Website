import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import updateProfileData from "./updateProfileData";
import { showSuccess, showError } from "../../../utils/toast";
import uploadImage from '../../../utils/uploadImage';
import { getFromIndexedDB ,removeFromIndexedDB } from "../../../utils/indexedDBUtils";
import useUserSchoolData from "../../../hooks/useUserSchoolData";
import Loading from "../../loading_ui/Loading";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { useNavigate } from "react-router-dom";

function StudentNavbar() {
  const navigate = useNavigate();
  // State for profile dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // State for mobile menu toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // State to show/hide password change form
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // State to store selected profile image
  const [profileImage, setProfileImage] = useState(null);

  // State to store profile data fetched from IndexedDB
  const [profileData, setProfileData] = useState(null);

  // States for handling password input fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for loading screen
  const [loading, setLoading] = useState(false);

  // Trigger state to refetch profile data after update
  const [trigger, setTrigger] = useState(false);

  // Fetch profile data from IndexedDB on mount or when trigger changes
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getFromIndexedDB("student_ProfileData");
        setProfileData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError("Failed to load profile data. Please try again.");
      }
    };
    fetchProfile();
  }, [trigger]);

 // 🔐 Handle logout: clear token, IndexedDB, and redirect
  const handleLogout = async () => {
    try {
      // 🛠️ Send logout request to backend
      const response = await axios.post(`${BaseUrl}logout/student`, {}, {
        withCredentials: true,
      });

      // 🧹 Remove teacher data from IndexedDB
      await removeFromIndexedDB('teacher_ProfileData');

      // 🔁 Navigate to home/login
      navigate("/");
    } catch (error) {
      showError('Logout failed. Please try again.')
      // Optional: show toast or message to user
    }
  }



  // Handle profile image upload and update
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB max size
    if (file.size > maxSizeInBytes) {
      setLoading(false);
      showError("Only images up to 10MB are allowed.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);

    const formData = new FormData();
    formData.append("image", file);
    const result = await uploadImage(formData, 'student');

    if (result) {
      useUserSchoolData('student'); // Refresh school-related data if needed
      setLoading(false);
      setTrigger(true); // Trigger refetch of profile data
      showSuccess("Profile picture uploaded successfully!");
    } else {
      setLoading(false);
      showError("Profile picture Upload failed. Try again.");
    }
  };

  // Handle password update form submission
  const handlePasswordUpdate = async () => {
    const current = currentPassword.trim();
    const newPass = newPassword.trim();
    const confirm = confirmPassword.trim();

    // Basic client-side validation
    if (!current || !newPass || !confirm) {
      showError("Please fill all password fields.");
      return;
    }

    if (current === newPass) {
      showError("New password must be different from the current password.");
      return;
    }

    if (newPass !== confirm) {
      showError("New password and confirm password do not match.");
      return;
    }

    if (newPass.length < 5 || newPass.length > 8) {
      showError("Password must be 5 to 8 characters long.");
      return;
    }

    // Proceed with password update
    setLoading(true);
    const payload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    try {
      await updateProfileData(payload, 'student');
      showSuccess("Password changed successfully!");
      // Reset form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.status === "C-incorrect") {
        showError("Current password is incorrect.");
        return;
      }
      showError("Failed to change password.");
    }
  };

  // Reset password form and close
  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
  };

  // Show loading spinner during async tasks
  if (loading) return <Loading />;

 return (
  <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-white/10 border-b border-white/10 shadow-md">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
          <span className="text-xl">🎓</span>
        </div>
        <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow-sm">
          Eduspark
        </span>
      </div>

      {/* Hamburger Icon */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6 text-white font-medium">
        <Link to="/student/dashboard" className="hover:text-cyan-400 transition">Home</Link>
        <Link to="#about" className="hover:text-cyan-400 transition">About</Link>
        <Link to="#services" className="hover:text-cyan-400 transition">Services</Link>
        <Link to="#contact" className="hover:text-cyan-400 transition">Contact</Link>
        <div className="relative group">
          <button className="hover:text-cyan-400 transition">Pages ▼</button>
          <div className="absolute hidden group-hover:block bg-black text-white mt-2 rounded shadow-lg py-2 w-60 z-50">
            <Link to="/student/timetable" className="block px-4 py-2 hover:bg-cyan-600">📅 Timetable</Link>
            <Link to="/student/teacher-list" className="block px-4 py-2 hover:bg-cyan-600">👩‍🏫 Teachers List</Link>
            <Link to="/student/progress-report" className="block px-4 py-2 hover:bg-cyan-600">📊 Progress Report</Link>
            <Link to="/student/school-announcement" className="block px-4 py-2 hover:bg-cyan-600">📢 School Messages</Link>
            <Link to="#" className="block px-4 py-2 hover:bg-cyan-600">💬 Chat with Teachers</Link>
            <Link to="#" className="block px-4 py-2 hover:bg-cyan-600">🎥 Online Classes</Link>
            <Link to="/student/Home-Work" className="block px-4 py-2 hover:bg-cyan-600">✏️ Home Work</Link>
          </div>
        </div>
      </div>

     {/* Profile Dropdown */}
<div className="relative ml-4 sm:ml-2">
  <button
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="flex items-center gap-2 bg-white/20 text-white px-3 py-1.5 rounded-full hover:bg-white/30 transition"
  >
    <img
      src={profileImage || profileData?.url || "/images/avatar.png"}
      alt="Profile"
      className="w-8 h-8 rounded-full"
    />
    <ChevronDown size={18} />
  </button>

  {dropdownOpen && (
    <div className="absolute right-0 mt-3 w-[90vw] sm:w-80 md:w-96 bg-gray-900 text-gray-100 rounded-lg shadow-xl z-50 border border-gray-700 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="p-4">
        {/* Avatar Upload */}
        <div className="flex justify-center relative">
          <div className="w-24 h-24 rounded-full border-4 border-gray-800 overflow-hidden">
            <img
              className="object-cover w-full h-full"
              src={profileImage || profileData?.url || "/images/avatar.png"}
              alt="User"
            />
          </div>
          <div className="absolute bottom-0 right-2 flex space-x-1">
            {/* Camera Upload */}
            <label className="bg-gray-700 p-1 rounded-full cursor-pointer hover:bg-gray-600">
              <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageChange} />
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2-3h6l2 3h4v13H3V7z" />
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </label>

            {/* File Upload */}
            <label className="bg-gray-700 p-1 rounded-full cursor-pointer hover:bg-gray-600">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm8 0v4a1 1 0 001 1h4v10H4V4h8z" />
              </svg>
            </label>
          </div>
        </div>

        {/* Info Fields */}
        <div className="mt-5 space-y-3">
          {["Name", "Class", "School Code", "Student ID"].map((label, i) => (
            <div key={i}>
              <label className="text-sm text-gray-400 block mb-1">{label}</label>
              <input
                type="text"
                value={
                  label === "Name"
                    ? profileData.name
                    : label === "Class"
                    ? profileData.className
                    : label === "School Code"
                    ? profileData.udisecode
                    : profileData.employId
                }
                readOnly
                className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 text-sm"
                placeholder={label}
              />
            </div>
          ))}
        </div>

        {/* Toggle Password */}
        {!showPasswordForm && (
          <div className="mt-4 text-center">
            <button
              className="text-sm font-semibold text-cyan-400 hover:underline"
              onClick={() => setShowPasswordForm(true)}
            >
              🔐 Change Password
            </button>
          </div>
        )}

        {/* Password Form */}
        {showPasswordForm && (
          <div className="mt-4 border-t border-gray-700 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Update Password</h3>

            <input
              type="password"
              placeholder="Current Password"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400 text-white text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password (5-8 characters)"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400 text-white text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Re-enter New Password"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400 text-white text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex justify-between mt-2">
              <button
                onClick={handlePasswordUpdate}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="block w-full text-center rounded text-red-500 hover:text-red-300 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )}
</div>
    </div>

    {/* Mobile Menu */}
    {menuOpen && (
      <div className="md:hidden bg-black text-white px-4 py-4 space-y-3">
        <Link to="/student/dashboard" className="block hover:text-cyan-400">Home</Link>
        <Link to="#about" className="block hover:text-cyan-400">About</Link>
        <Link to="#services" className="block hover:text-cyan-400">Services</Link>
        <Link to="#contact" className="block hover:text-cyan-400">Contact</Link>
        <hr className="border-gray-700" />
        <Link to="/student/timetable" className="block hover:text-cyan-400">📅 Timetable</Link>
        <Link to="/student/teacher-list" className="block hover:text-cyan-400">👩‍🏫 Teachers List</Link>
        <Link to="/student/progress-report" className="block hover:text-cyan-400">📊 Progress Report</Link>
        <Link to="/student/school-announcement" className="block hover:text-cyan-400">📢 School Messages</Link>
        <Link to="#" className="block hover:text-cyan-400">💬 Chat with Teachers</Link>
        <Link to="#" className="block hover:text-cyan-400">🎥 Online Classes</Link>
        <Link to="/student/Home-Work" className="block hover:text-cyan-400">✏️ Home Work</Link>
      </div>
    )}
  </nav>
);

}

export default StudentNavbar;
