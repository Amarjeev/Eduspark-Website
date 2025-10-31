import React, { useState ,useEffect,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, Building2, BadgeCheck, IdCard, User2, Camera, Lock,
  Edit2, Check, X, ChevronDown, ChevronUp, ArrowLeft,Image as ImageIcon
} from 'lucide-react';

import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showSuccess, showError } from "../../../utils/toast";
import axios from 'axios';
import Loading from '../../loading_ui/Loading';
import uploadImage from '../../../utils/uploadImage';
import PageWrapper from '../../../PageWrapper';

function TeacherDetails() {
  const navigate = useNavigate();

  // UI State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  // Data State
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [teacherId, setTeacherId] = useState("");

  // Loading State
  const [loading, setLoading] = useState(false);

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState("/images/avatar.png");
   const cameraInputRef = useRef(null);

  // Fetch teacher profile on mount
  useEffect(() => {
    (async () => {
      setLoading(true); // Start loading indicator
      try {
                  // Fetch teacher data from server
const teacherData = await axios.get(
  `${BaseUrl}get/teacher/user-profile`,
  {
    withCredentials: true
  }
        );

        setTeacherId(teacherData.data.userData._id);
        setTeacherProfile(teacherData.data.userData);
      } catch (error) {
        setLoading(false)
        showError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false); // Stop loading indicator
      }
    })();
  }, [selectedImage]);

  // Handle inline edit click
  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  // Save updated email or phone number
  const handleSave = async (field) => {
    setLoading(true);

    // Field-specific validation
    switch (field) {
      case "email":
        if (!tempValue.trim()) {
          alert("Email is required.");
          return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempValue)) {
          alert("Email is invalid.");
          return;
        }
        break;

      case "phonenumber":
        if (!tempValue.trim()) {
          alert("Phone number is required.");
          return;
        } else if (!/^\d{7,15}$/.test(tempValue.replace(/[\s-]/g, ""))) {
          alert("Phone number must be 7 to 15 digits (no country code).");
          return;
        }
        break;
    }

    // Send update request to server
    try {
      const response = await axios.put(
        `${BaseUrl}teacher-avatar/update-teacher-profile/${teacherId}/${field}`,
        { tempValue },
        { withCredentials: true }
      );
      if (response.data.success) {
        setEditingField(null);
        setLoading(false);
        showSuccess("Updated successfully!");
      }
    } catch (error) {
      setLoading(false);
      // Handle duplicate email
      if (error.response && error.response.status === 409) {
        return showError("⚠️ Email already exists. Please use a different one.");
      }
      showError("Something went wrong while updating the profile. Please try again.");
    }
  };

  // Update teacher password
  const handlePasswordUpdate = async () => {
    try {
      // Validate new password
      if (newPassword) {
        if (newPassword.length < 5 || newPassword.length > 10) {
          showError("New password must be 5–10 characters long.");
          return;
        }
        if (confirmPassword && confirmPassword !== newPassword) {
          showError("New passwords do not match.");
          return;
        }
      } else {
        showError("New password is required.");
        return;
      }

      // Validate current password
      if (!currentPassword) {
        showError("Current password is required.");
        return;
      }
      setLoading(true)
      // Prepare request payload
      const tempValue = {
        current: currentPassword,
        new: newPassword,
        confirm: confirmPassword,
      };

      // Send password update request
      const response = await axios.put(
        `${BaseUrl}teacher-avatar/update-teacher-profile/${teacherId}/password`,
        { tempValue },
        { withCredentials: true }
      );
        setLoading(false)
      // Handle response
      if (response.data && response.data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showSuccess("Password updated successfully.");
      } else {
        showError(response.data.error || "Failed to update password.");
      }
    } catch (error) {
      setLoading(false)
      // Handle server or network error
      const message = error.response?.data?.error || "An error occurred while updating password.";
      showError(message);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingField(null);
  };

  // Navigate back to dashboard
  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

    const handleButtonClick = () => {
    fileInputRef.current.click(); // Open file/camera picker
  };

    const handleFileClick = () => fileInputRef.current.click();        // 📁 Gallery
  const handleCameraClick = () => cameraInputRef.current.click();    // 📷 Camera
  const handleImageChange = async (e) => {
        setLoading(true)
  const file = e.target.files[0];
  if (!file) return;

    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

  if (file.size > maxSizeInBytes) {
    showError("Only images up to 10MB are allowed.");
    setLoading(false)
    return; // Stop further execution
  }


    // 👁️ Create preview URL for frontend
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl); // local preview

    // 📦 Prepare file for upload
    const formData = new FormData();
  formData.append("image", file); // Use file directly
  

    const result = await uploadImage(formData, 'teacher');
    if (result) {
    setSelectedImage(result);
    setLoading(false)
    showSuccess("Profile picture uploaded successfully!");
    } else {
    setLoading(false)
    showError("Profile picture Upload failed. Try again.");
    }

};


  // Show loading component if data is still loading
  if (loading) return <Loading />;

  return (
     <PageWrapper> 
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 text-black">
      {/* Back Button */}
      <button 
        onClick={handleBack}
        className="fixed top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-gray-800 bg-white p-2 rounded-full shadow-md border border-gray-200 z-10"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-6">
        
        {/* Avatar & Header */}
        <div className="flex flex-col items-center text-black">
       <div className="relative group mb-4">
      {/* Profile Image */}
      <img
        src={teacherProfile?.profilePicUrl || selectedImage}
        alt="Teacher Avatar"
        className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
      />

      {/* Buttons */}
      <div className="absolute bottom-0 right-1 flex space-x-1">
        {/* Camera button */}
        <button
          onClick={handleCameraClick}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md"
          title="Capture with Camera"
        >
          <Camera size={16} />
        </button>

        {/* Gallery/file button */}
        <button
          onClick={handleFileClick}
          className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition shadow-md"
          title="Choose from Gallery"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* Hidden Inputs */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
          <h2 className="text-2xl font-bold text-gray-800">{teacherProfile ?.name}</h2>
          <p className="text-sm font-semibold text-black bg-blue-100 px-3 py-1 rounded-full mt-1">
            {teacherProfile ?.subject} Teacher
          </p>
          <p className="text-xs text-gray-500 mt-1">{teacherProfile?.schoolname}</p>

          {/* Change Password Toggle */}
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 bg-white rounded-full shadow-sm border border-blue-100"
          >
            <Lock size={14} /> 
            {showPasswordForm ? (
              <>
                <span>Hide Password Form</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>Change Password</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 text-black">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              <Lock size={16} className="text-blue-500" /> Change Password
            </h3>
            <input
        type="password"
        value={currentPassword}
         maxLength={20}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Current Password"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      />

      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New Password"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter New Password"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      />
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
               disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
                Update Password
              </button>
            </div>
          </div>
        )}

        {/* Info Grid with Edit Functionality */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
            <User2 size={18} className="text-blue-500" /> Personal Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            {/* Editable Email */}
            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
              <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
              {editingField === 'email' ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="email"
                    value={tempValue}
                     maxLength={50}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button 
                    onClick={() => handleSave('email')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex justify-between items-center">
                  <span>{teacherProfile ?.email}</span>
                  <button 
                    onClick={() => handleEdit('email', teacherProfile.email)}
                    className="text-gray-400 hover:text-blue-600 ml-2"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Editable Phone */}
            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
              <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
              {editingField === 'phone' ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="tel"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button 
                    onClick={() => handleSave('phonenumber')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex justify-between items-center">
                  <span>{teacherProfile?.phonenumber}</span>
                  <button 
                    onClick={() => handleEdit('phone',teacherProfile.phonenumber)}
                    className="text-gray-400 hover:text-blue-600 ml-2"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Non-editable fields */}
            <div className="flex items-center gap-2 p-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Department: {teacherProfile?.department}</span>
            </div>
            <div className="flex items-center gap-2 p-2">
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <span>Employee ID: {teacherProfile?.employId}</span>
            </div>
            <div className="flex items-center gap-2 p-2">
              <IdCard className="w-4 h-4 text-blue-500" />
              <span>UDISE CODE : {teacherProfile?.udisecode}</span>
            </div>
            <div className="flex items-center gap-2 p-2">
              <IdCard className="w-4 h-4 text-blue-500" />
              <span>{teacherProfile?.govidtype} No: {teacherProfile?.govidnumber}</span>
            </div>
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ChevronDown size={18} className="text-blue-500" /> Assigned Classes
          </h3>
          <div className="flex flex-wrap gap-2">
            {teacherProfile?.assignedClasses.map((cls, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-black text-sm rounded-full"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>
        </div>
      </div>
                 </PageWrapper>
  
  );
}

export default TeacherDetails;