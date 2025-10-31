// Replace entire TeacherProfile component with this updated version
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import { useParams } from "react-router-dom";
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import departments from "../../data/departments";
import { useNavigate } from "react-router-dom";
import PageWrapper from '../../../PageWrapper';

function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teachersData, setTeachersData] = useState({});
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [subjectList, setSubjectList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const teacherData = await axios.get(`${BaseUrl}admin/teachers/${id}`, { withCredentials: true });
        setTeachersData(teacherData.data[0]);
        setFormData(teacherData.data[0]);

        const subjectListData = await getFromIndexedDB('school-subjects-List-admin');
        if (subjectListData) setSubjectList(subjectListData);
      } catch (error) {
        showError(" Unable to load teacher data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required.";
        else if (!/^[A-Za-z\s]+$/.test(value)) error = "Only letters and spaces allowed.";
        else if (value.length < 3 || value.length > 25) error = "Name must be 3-25 characters.";
        break;

      case "email":
        if (!value.trim()) error = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format.";
        break;

      case "phonenumber":
        if (!value) error = "Phone number is required.";
        else if (!/^\d{7,15}$/.test(value.replace(/[\s-]/g, ''))) error = "Must be 7-15 digits.";
        break;

      case "subject":
        if (!value) error = "Subject is required.";
        break;

      case "department":
        if (!value) error = "Department is required.";
        else if (!departments.includes(value)) error = "Invalid department.";
        break;

      case "employId":
        if (!value) error = "Employee ID is required.";
        else if (value.toString().length !== 8) error = "Must be exactly 8 digits.";
        break;

      case "govidnumber":
        if (formData.govidtype && !value) {
          error = `${formData.govidtype} number required.`;
        } else if (formData.govidtype) {
          const type = formData.govidtype.toLowerCase();
          if (type === "aadhar" && !/^\d{12}$/.test(value)) error = "Aadhar must be 12 digits.";
          if (type === "license" && !/^[A-Z]{2}\d{2}[0-9A-Z]{11,13}$/.test(value)) error = "Invalid license format.";
          if (type === "voterid" && !/^[A-Z]{3}\d{7}$/.test(value)) error = "Invalid voter ID format.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live validation
    if (editMode) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  setLoading(true);
    const errors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      showError("Please fix the highlighted errors.");
      return;
    }

    try {
      const res = await axios.put(`${BaseUrl}admin/update-teacher/${id}`, formData, { withCredentials: true });
      if (res.data.success) {
        showSuccess("Profile updated successfully!");
        setTeachersData(formData);
        setEditMode(false);
         setLoading(false);
      } else {
         setLoading(false);
        showError("Update failed.");
      }
    } catch (err) {
       setLoading(false);
      showError("Something went wrong.");
    }
  };

  const handleDeleteAccount = async (item) => {
  if (!window.confirm(`Are you sure you want to ${item} this teacher account? This action cannot be undone.`)) return;

  try {
    const response = await axios.delete(`${BaseUrl}admin/delete-teacher/${id}/${item}`, {
      withCredentials: true,
    });

    if (response.data.success) {
      showSuccess(`Account ${item} successfully`);

      setTimeout(() => {
        navigate("/admin/teachers");
      }, 1000);
     
    } else {
      showError("Failed to delete account");
    }
  } catch (error) {
    showError("Something went wrong while deleting the account");
  }
};


  const handleCancel = () => {
    setFormData(teachersData);
    setFormErrors({});
    setEditMode(false);
  };

  const handleBack = () => {
    window.scrollTo(0, 0);
    window.history.back();
  };

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 p-3 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b text-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="text-gray-600 hover:text-black text-lg">
              <FaArrowLeft />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold">Teacher Profile</h2>
          </div>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md">
              <FaEdit className="mr-1" /> Edit
            </button>
          )}
        </div>

        <div className="flex flex-col items-center text-center pt-5 pb-4">
          <img  src={formData.profilePicUrl || "/images/avatar.png"} alt="Avatar" className="w-20 h-20 rounded-full shadow-md" />
          <h3 className="mt-2 text-base font-medium text-gray-800">{formData.name||""}</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email" name="email" value={formData.email || ""} onChange={handleChange} readOnly={!editMode} error={formErrors.email} />
            <Input label="Name" name="name" value={formData.name || ""} onChange={handleChange} readOnly={!editMode} error={formErrors.name} />
            <Input label="Phone Number" name="phonenumber" value={formData.phonenumber || ""} onChange={handleChange} readOnly={!editMode} error={formErrors.phonenumber} />

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select name="subject" value={formData.subject || ""} onChange={handleChange} disabled={!editMode}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="" disabled>Select Subject</option>
                {subjectList.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
              {formErrors.subject && <p className="text-red-600 text-xs mt-1">{formErrors.subject}</p>}
            </div>

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select name="department" value={formData.department || ""} onChange={handleChange} disabled={!editMode}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
              {formErrors.department && <p className="text-red-600 text-xs mt-1">{formErrors.department}</p>}
            </div>

            <Input label="Employee ID" name="employid" value={formData.employId || ""} readOnly error={formErrors.employId} />
            <Input label="School Name" name="schoolname" value={formData.schoolname || ""} readOnly />
            <Input label="UDISE Code" name="udisecode" value={formData.udisecode || ""} readOnly />

            <div className="mb-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Govt ID Type</label>
              {editMode ? (
                <select name="govidtype" value={formData.govidtype || ""} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select ID Type --</option>
                  {["Aadhar", "License", "VoterId"].map((idType, index) => (
                    <option key={index} value={idType}>{idType}</option>
                  ))}
                </select>
              ) : (
                <input type="text" name="govidtype" value={formData.govidtype || ""} readOnly
                  className="w-full px-3 py-2 border rounded-md text-sm bg-gray-100 text-gray-600" />
              )}
            </div>

            <Input label="Govt ID Number" name="govidnumber" value={formData.govidnumber || ""} onChange={handleChange} readOnly={!editMode} error={formErrors.govidnumber} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Classes</label>
            {formData.assignedClasses?.length ? (
              <ul className="bg-gray-50 border rounded-md p-2 text-sm text-gray-800">
                {formData.assignedClasses.map((cls, i) => <li key={i} className="list-disc ml-5">{cls}</li>)}
              </ul>
            ) : (
              <p className="text-sm italic text-gray-500 bg-gray-50 p-2 border rounded-md">No classes assigned yet.</p>
            )}
          </div>

         {editMode && (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
    {/* Left-side: Delete & Block */}
    <div className="flex gap-2">
      <button
        type="button"
       onClick={() => handleDeleteAccount("deleted")}
        className="px-4 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition"
      >
        Delete 🗑️
      </button>
 {formData.status === 'blocked' ? (
  <button
    type="button"
    onClick={() => handleDeleteAccount("active")} // 👈 unblock
    className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
  >
    Unblock 🔓
  </button>
) : (
  <button
    type="button"
    onClick={() => handleDeleteAccount("blocked")} // 👈 block
    className="px-4 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition"
  >
    Block 🚫
  </button>
)}

    </div>

    {/* Right-side: Cancel & Save */}
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleCancel}
        className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
      >
        Save
      </button>
    </div>
  </div>
)}

        </form>
      </div>
      </div>
      </PageWrapper>
  );
}

// ✅ Reusable Input Component with Error
function Input({ label, name, value, onChange, type = 'text', readOnly = false, error }) {
  return (
    <PageWrapper>
    <div className="flex flex-col text-sm">
      <label htmlFor={name} className="text-gray-700 font-medium mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
          readOnly ? 'bg-gray-100 border-gray-300 text-gray-600' : 'bg-white border-gray-300 focus:ring-gray-400'
        }`}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
      </PageWrapper>
  );
}

export default TeacherProfile;
