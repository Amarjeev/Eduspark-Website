// ✅ React and routing imports
import React, { useEffect, useState } from "react";
import { Link,  useNavigate } from "react-router-dom";

// ✅ UI icons
import { ChevronDown, Menu, X } from "lucide-react";

// ✅ Helper functions and modules
import updateProfileData from "./updateProfileData";
import { showSuccess, showError } from "../../../utils/toast";
import uploadImage from "../../../utils/uploadImage";
import { getFromIndexedDB, removeFromIndexedDB } from "../../../utils/indexedDBUtils";
import useUserSchoolData from "../../../hooks/useUserSchoolData";

// ✅ Reusable components
import Loading from "../../loading_ui/Loading";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import PageWrapper from "../../../PageWrapper";

function ParentNavbar() {
  const navigate = useNavigate();

  // UI state for dropdowns, menus, password form, and loading screen
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile image preview and full profile data object
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Password field state values
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fields that are editable in the profile UI
  const editableFields = ["name", "email", "udisecode", "mobileNumber"];
  const [editingStates, setEditingStates] = useState({});
  const [editedValues, setEditedValues] = useState({});

  // Used to re-trigger profile data fetch
  const [trigger, setTrigger] = useState(false);


  // 🔁 Load profile data from IndexedDB whenever component mounts or `trigger` updates
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        useUserSchoolData('parent'); // Load user school data into IndexedDB
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for data to be available
        const data = await getFromIndexedDB("parent_ProfileData"); // Read profile from IndexedDB
        setProfileData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError("Failed to load profile data. Please try again.");
      }
    };
    fetchProfile();
  }, [trigger]);

  // 🧩 Pre-fill editable form fields based on loaded profile data
  useEffect(() => {
    if (profileData) {
      const values = {};
      editableFields.forEach((key) => {
        values[key] = profileData[key] || "";
      });
      setEditedValues(values);
    }
  }, [profileData]);

  // 🔓 Handle user logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await axios.post(`${BaseUrl}logout/parent`, {}, { withCredentials: true }); // Send logout request
      await removeFromIndexedDB("parent_ProfileData"); // Clear profile data
      setLoading(false);
      navigate("/"); // Redirect to home/login
    } catch (error) {
      setLoading(false);
      showError("Logout failed. Please try again.");
    }
  };

  // 📸 Handle profile image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setLoading(false);
      showError("Only images up to 10MB are allowed.");
      return;
    }

    const imageUrl = URL.createObjectURL(file); // Preview selected image
    setProfileImage(imageUrl);

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadImage(formData, "parent"); // Upload image
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (result) {
      setTrigger(!trigger); // Re-fetch profile data
      showSuccess("Profile picture uploaded successfully!");
    } else {
      showError("Profile picture Upload failed. Try again.");
    }
    setLoading(false);
  };

  // 🔒 Validate and update password
  const handlePasswordUpdate = async () => {
    const current = currentPassword.trim();
    const newPass = newPassword.trim();
    const confirm = confirmPassword.trim();

    // Validate password fields
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

    setLoading(true);
    try {
      await updateProfileData({ currentPassword, newPassword, confirmPassword }, "parent");
      showSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      if (error.response?.data?.status === "C-incorrect") {
        showError("Current password is incorrect.");
      } else {
        showError("Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ❌ Cancel password form and clear input
  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
  };

  // ✏️ Start editing a specific field
  const handleEditToggle = (field) => {
    setEditingStates((prev) => ({ ...prev, [field]: true }));
  };

  // 💾 Save changes to a specific field after validation
  const handleFieldSave = async (field) => {
    try {
      const value = editedValues[field]?.trim();

      // -----------------------
      // Name validation
      if (field === "name") {
        if (!value) return showError("Please fill in the name field");
        if (!/^[A-Za-z\s]+$/.test(value)) return showError("Name can only contain letters and spaces");
        if (value.length < 3) return showError("Name must be at least 3 characters");
        if (value.length > 30) return showError("Name must not exceed 30 characters");
      }

      // -----------------------
      // Email validation
      if (field === "email") {
        if (!value) return showError("Please enter your email");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return showError("Please enter a valid email address");
        }
        if (value.length > 254) {
          return showError("Email must not exceed 254 characters");
        }
      }

      // -----------------------
      // Mobile number validation
      if (field === "mobileNumber") {
        if (!value) return showError("Mobile number is required");
        if (!/^[6-9]\d{9}$/.test(value)) {
          return showError("Mobile number must be a valid 10-digit Indian number starting with 6-9");
        }
      }

      setLoading(true);
      await updateProfileData({ [field]: editedValues[field] }, "parent", 'profile-Edit');
      showSuccess(`${field} updated`);
      setEditingStates((prev) => ({ ...prev, [field]: false }));
      setTrigger(!trigger); // Re-fetch profile data
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response.data.success === 'E-Duplicate') {
        showError('Email already exists. Please use a different one');
        return;
      }
      showError("Failed to update profile please try again!");
    }
  };

  // 🔙 Cancel editing and restore original value
  const handleFieldCancel = (field) => {
    setEditedValues((prev) => ({ ...prev, [field]: profileData[field] }));
    setEditingStates((prev) => ({ ...prev, [field]: false }));
  };

  // ⏳ Render loading screen while fetching or saving data
  if (loading) return <Loading />;

  return (
    <PageWrapper>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-zinc-50 border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Hamburger Icon */}
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="text-black focus:outline-none"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <span className="text-xl">🎓</span>
            </div>
            <span className="text-2xl font-extrabold text-black tracking-wide drop-shadow-sm">
              Eduspark
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-black font-medium">
            <Link to="/parent/dashboard#home" className="hover:text-cyan-400 transition">Home</Link>
            <Link to="/parent/dashboard#about" className="hover:text-cyan-400 transition">About</Link>
            <Link to="/parent/dashboard#services" className="hover:text-cyan-400 transition">Services</Link>
            <Link to="/parent/dashboard#contact" className="hover:text-cyan-400 transition">Contact</Link>
          </div>


          {/* Profile Dropdown */}
          <div className="relative ml-4 sm:ml-2">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-zinc-50 text-white px-3 py-1.5 rounded-full hover:bg-white/30 transition"
            >
              <img
                src={profileImage || profileData?.url || "/images/avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <ChevronDown size={18} />
            </button>

            {/* Enhanced Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-[90vw] sm:w-80 md:w-96 bg-white text-gray-800 rounded-xl shadow-2xl z-50 border border-gray-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="p-6">
                  {/* Enhanced Avatar Section */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative">
                        <img
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          src={profileImage || profileData?.url || "/images/avatar.png"}
                          alt="User Profile"
                        />
                      </div>

                      {/* Upload Buttons */}
                      <div className="absolute -bottom-2 right-0 flex space-x-2">
                        <label className="bg-cyan-600 p-2 rounded-full cursor-pointer hover:bg-cyan-700 shadow-md transition-all duration-200 transform hover:scale-110">
                          <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageChange} />
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2-3h6l2 3h4v13H3V7z" />
                            <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                        </label>

                        <label className="bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-md transition-all duration-200 transform hover:scale-110">
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm8 0v4a1 1 0 001 1h4v10H4V4h8z" />
                          </svg>
                        </label>
                      </div>
                    </div>

                    {/* User Name Display */}
                    {profileData?.name && (
                      <div className="mt-4 text-center">
                        <h3 className="text-xl font-bold text-gray-800">{profileData.name}</h3>
                        <p className="text-sm text-gray-500">{profileData.email}</p>
                      </div>
                    )}
                  </div>
                    <div className="mt-5 space-y-3">
  {editableFields.map((fieldKey) => {
    const label =
      fieldKey === "name"
        ? "Full Name"
        : fieldKey === "email"
        ? "Email Address"
        : fieldKey === "udisecode"
        ? "School Code"
        : "Mobile Number";

    const isEditing = editingStates[fieldKey];

    // 🔒 School Code should not be editable
    if (fieldKey === "udisecode") {
      return (
        <div key={fieldKey}>
          <label className="text-sm text-gray-600 block mb-1">{label}</label>
          <input
            type="text"
            value={profileData[fieldKey] || ""}
            readOnly
            className="w-full px-3 py-2 rounded bg-gray-100 text-gray-800 border border-gray-300 text-sm cursor-not-allowed"
          />
        </div>
      );
    }

    // ✏️ Editable fields (name, email, mobile)
    return (
      <div key={fieldKey}>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm text-gray-600 block">{label}</label>
          {!isEditing ? (
            <button
              onClick={() => handleEditToggle(fieldKey)}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
                <button
                disabled={loading}
                onClick={() => handleFieldSave(fieldKey)}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => handleFieldCancel(fieldKey)}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

    <input
  type="text"
  value={
    isEditing
      ? editedValues?.[fieldKey] ?? ""  // fallback if undefined
      : profileData?.[fieldKey] ?? ""   // fallback if undefined or null
  }
  readOnly={!isEditing}
  onChange={(e) =>
    setEditedValues((prev) => ({
      ...prev,
      [fieldKey]: e.target.value,
    }))
  }
  className={`w-full px-3 py-2 rounded bg-gray-50 text-gray-800 placeholder-gray-400 border border-gray-300 text-sm ${
    isEditing ? "focus:outline-none focus:ring-2 focus:ring-cyan-500" : ""
  }`}
/>
      </div>
    );
  })}
</div>


                  {/* Password Change Section */}
                  {!showPasswordForm ? (
                    <div className="mt-4 text-center">
                      <button
                        className="text-sm font-semibold text-cyan-600 hover:underline flex items-center justify-center"
                        onClick={() => setShowPasswordForm(true)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Change Password
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">Update Password</h3>

                      <input
                        type="password"
                        placeholder="Current Password"
                        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />

                      <input
                        type="password"
                        placeholder="New Password (5-8 characters)"
                        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />

                      <input
                        type="password"
                        placeholder="Re-enter New Password"
                        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />

                      <div className="flex justify-between mt-2">
                        <button
                          onClick={handlePasswordUpdate}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden bg-zinc-50 text-black px-4 py-4 space-y-3 absolute top-full left-0 right-0 shadow-md">
              <Link to="/parent/dashboard" className="block hover:text-cyan-400">Home</Link>
              <Link to="#about" className="block hover:text-cyan-400">About</Link>
              <Link to="#services" className="block hover:text-cyan-400">Services</Link>
              <Link to="#contact" className="block hover:text-cyan-400">Contact</Link>
              <hr className="border-gray-700" />
            </div>
          )}
        </div>
      </nav>
    </PageWrapper>
  );
}

export default ParentNavbar;