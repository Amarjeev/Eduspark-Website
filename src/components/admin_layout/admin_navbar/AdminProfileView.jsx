import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import {
  ArrowLeft, Camera, ImageIcon, Lock,
  User2, Mail, Phone, Building2, IdCard, Edit2, Check, X,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toast';
import uploadImage from '../../../utils/uploadImage';
import Loading from '../../loading_ui/Loading';
import PageWrapper from '../../../PageWrapper';

function AdminProfileView() {
  const navigate = useNavigate();

  // Refs for file input and camera input
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Delete account confirmation
  const [showDeleteConfirmCard, setShowDeleteConfirmCard] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  // Admin profile data
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(false);

  // Profile edit states
  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [Password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Image preview
  const [previewUrl, setPreviewUrl] = useState();

  // Fetch profile data on mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BaseUrl}get/admin/user-profile`, { withCredentials: true });
        setProfile(response?.data?.userData);
        if (response?.data?.userData?.profilePicUrl) {
          setPreviewUrl(response?.data?.userData?.profilePicUrl);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError("Error fetching admin profile");
      }
    };
    fetchAdminProfile();
  }, []);

  // Confirm delete account
  const confirmDeleteAccount = async () => {
    if (!deleteConfirmInput.trim()) return;
    if (deleteConfirmInput.trim() !== profile.udisecode) {
      return showError('Please enter the correct code to delete.');
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${BaseUrl}admin-delete-account`, {
        withCredentials: true,
        data: { deleteConfirmInput: deleteConfirmInput.trim() },
      });

      if (response.data.success) {
        setLoading(false);
        showSuccess("Account deleted successfully.");
        navigate('/');
      }

    } catch (error) {
      setLoading(false);
      showError("Something went wrong. Please try again.");
    }
  };

  // Handle gallery button click
  const handleFileClick = () => fileInputRef.current.click();

  // Handle camera button click
  const handleCameraClick = () => cameraInputRef.current.click();

  // Handle image upload and preview
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB max
    if (file.size > maxSizeInBytes) {
      showError("Only images up to 10MB are allowed.");
      setLoading(false);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadImage(formData, 'admin');

    if (result) {
      setPreviewUrl(result);
      setLoading(false);
      showSuccess("Profile picture uploaded successfully!");
    } else {
      setLoading(false);
      showError("Profile picture Upload failed. Try again.");
    }
  };

  // Cancel password update section
  const handleCancelPasswordChange = () => {
    setShowPasswordSection(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Begin editing a field
  const startEdit = (field) => {
    setEditField(field);
    setTempValue(profile[field]);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditField(null);
    setTempValue('');
  };

  // Save edited field or password
  const saveEdit = async () => {
    let item = editField;
    const payload = {};

    // Skip empty input
    if (!currentPassword && !Password && !confirmPassword) {
      if (!tempValue.trim()) return showError(`${editField} cannot be empty`);
    }

    // Name validation
    if (editField === 'name') {
      const name = tempValue.trim();
      if (!/^[A-Za-z\s]+$/.test(name)) return showError("Name must contain only letters and spaces.");
      if (name.length < 2) return showError("Name must be at least 2 characters.");
      if (name.length > 50) return showError("Name must be less than 50 characters.");
      payload.name = name;

    // Email validation
    } else if (editField === 'email') {
      const email = tempValue.trim();
      if (!email) return showError("Email is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Invalid email format.");
      payload.email = email;

    // Phone validation
    } else if (editField === 'phonenumber') {
      const phone = tempValue.trim();
      if (!phone) return showError("Phone number is required.");
      if (!/^\d{10,15}$/.test(phone)) return showError("Phone number must be 10 to 15 digits.");
      payload.phonenumber = phone;

    // School name validation
    } else if (editField === 'schoolname') {
      const school = tempValue.trim();
      if (!school || school.length < 3) return showError("School name must be at least 3 characters.");
      if (school.length > 120) return showError("School name must be less than 120 characters.");
      payload.schoolname = school;

    // Password update validation
    } else if (currentPassword) {
      if (!currentPassword || !Password || !confirmPassword) {
        return showError("All password fields are required.");
      } else if (!/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(Password)) {
        return showError("Password must be at least 8 characters, include a lowercase letter and a number.");
      }
      if (Password !== confirmPassword) {
        return showError("Passwords do not match.");
      }

      payload.currentPassword = currentPassword;
      payload.Password = Password;
      payload.confirmPassword = confirmPassword;
      item = 'password';
    }

    // Submit update request
    try {
      setLoading(true);
      const response = await axios.post(`${BaseUrl}admin-profileEdit/${item}`, payload, {
        withCredentials: true,
      });

      // Handle password response
      if (response.data.updatedField === 'password') {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
        setLoading(false);
        showSuccess(`${item} updated successfully`);
        return;
      }

      // Handle profile field update
      if (response.data.success) {
        setProfile((prev) => ({ ...prev, [editField]: tempValue }));
        setEditField(null);
        setLoading(false);
        showSuccess(`${item} updated successfully`);
      }
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.success === 'current-password-wrong') {
        return showError("Current password is incorrect.");
      }
      if (error.response?.data?.success === 'exists-email') {
        return showError("This email is already linked to another account. Please try a different email.");
      }
      showError("Something went wrong. Please try again later.");
    }
  };

  // Fields that can be edited with associated icons
  const editableFields = [
    { key: 'name', icon: User2, label: 'Name' },
    { key: 'email', icon: Mail, label: 'Email' },
    { key: 'phonenumber', icon: Phone, label: 'Phone' },
    { key: 'schoolname', icon: Building2, label: 'School Name' },
  ];

  // Show loader while data is being fetched
  if (loading) return <Loading />;


  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 text-black">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-gray-800 bg-white p-2 rounded-full shadow-md border border-gray-200 z-10"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-6">

        {/* Avatar Section */}
        <div className="flex flex-col items-center text-black">
          <div className="relative group mb-4">
            {/* Profile Image */}
                <img
                  src={previewUrl || "/images/avatar.png"}
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
          <h2 className="text-2xl font-bold text-gray-800">
          {profile?.name?.split(' ').slice(0, 2).join(' ')}
          </h2>
          <p className="text-sm font-semibold text-black bg-blue-100 px-3 py-1 rounded-full mt-1">Admin</p>
          <p className="text-xs mt-1 inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium shadow-sm">
            School Code: <span className="text-black font-semibold">{profile.udisecode}</span>
          </p>
        </div>

       {/* Foldable Change Password Section */}
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm text-black">

  <div
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setShowPasswordSection(!showPasswordSection)}
  >
    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
      <Lock size={14} className="text-blue-500" /> Change Password
    </h3>
    {showPasswordSection ? (
      <ChevronUp size={16} className="text-gray-500" />
    ) : (
      <ChevronDown size={16} className="text-gray-500" />
    )}
  </div>

  {showPasswordSection && (
    <div className="mt-3 space-y-3">
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
      />
      <input
        type="password"
        placeholder="New Password"
        value={Password}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancelPasswordChange}
          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={saveEdit}
          disabled={!currentPassword}
          className="bg-blue-600 text-white px-3 py-1.5 text-xs rounded-md hover:bg-blue-700"
        >
          Update
        </button>
      </div>
    </div>
  )}
</div>


        {/* Editable Fields */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <User2 size={18} className="text-blue-500" /> Personal Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            {editableFields.map(({ key, icon: Icon, label }) => (
              <div key={key} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
                <Icon className="w-4 h-4 text-blue-500" />
                <div className="flex-1 flex justify-between items-center">
                  {editField === key ? (
                    <>
                      <input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full text-sm border rounded px-2 py-1"
                      />
                      <div className="flex gap-1 ml-2">
                        <button onClick={saveEdit}><Check size={16} className="text-green-600" /></button>
                        <button onClick={cancelEdit}><X size={16} className="text-red-500" /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{profile[key]}</span>
                      <button onClick={() => startEdit(key)} className="text-gray-400 hover:text-blue-600 ml-2">
                        <Edit2 size={14} />
                        </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* create here */}
        {showDeleteConfirmCard && (
    <div className="bg-white border border-red-200 rounded-xl shadow-md p-4 mt-4 text-center space-y-4">
    <h3 className="text-lg font-semibold text-red-600">Confirm Delete Account</h3>
    <p className="text-sm text-gray-600">
    This action cannot be undone. Please type <span className="text-black font-mono font-semibold bg-red-50 px-2 py-0.5 rounded">
    "{profile.udisecode}"
    </span>to confirm.
    </p>

    <input
      type="text"
      placeholder={`type ${profile.udisecode}`}
      value={deleteConfirmInput}
      onChange={(e) => setDeleteConfirmInput(e.target.value)}
      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
    />

    <div className="flex justify-center gap-2 mt-3">
      <button
    onClick={() => {
    setShowDeleteConfirmCard(false);
    setDeleteConfirmInput('');
  }}
        className="px-4 py-1.5 rounded-md bg-gray-200 text-sm text-gray-700 hover:bg-gray-300"
      >
        Cancel
      </button>
      <button
        disabled={!deleteConfirmInput}
        onClick={confirmDeleteAccount}
        className={`px-4 py-1.5 rounded-md text-sm text-white transition ${
          !deleteConfirmInput
             ? "bg-red-300 cursor-not-allowed"
    : "bg-red-600 hover:bg-red-700"
        }`}
      >
        Confirm Delete
      </button>
    </div>
  </div>
 )}
       {/* Delete Account */}
<div className="text-center mt-6">
  <button
    onClick={() => setShowDeleteConfirmCard(true)}
    className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm shadow-sm ${
      editField ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    disabled={!!editField}
  >
    Delete Account
  </button>
</div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default AdminProfileView;
