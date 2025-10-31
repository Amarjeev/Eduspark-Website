import React, { useState, useEffect } from "react";
import countries from "../../data/indianStates";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
  import { getFromIndexedDB} from '../../../utils/indexedDBUtils';
import PageWrapper from "../../../PageWrapper";


// ======================================================================
// MAIN COMPONENT - StudentList
// ======================================================================
function StudentsList() {
  // ====================================================================
  // STATE MANAGEMENT SECTION - All state variables for the component
  // ====================================================================
  const [editingStudent, setEditingStudent] = useState(null); // Currently edited student
  const [viewingStudent, setViewingStudent] = useState(null); // Currently viewed student
  const [searchTerm, setSearchTerm] = useState(""); // Search input value
  const [students, setStudents] = useState([]); // List of all students
  const [loading, setLoading] = useState(false); // Loading state for fetching
  const [deleteLoading, setDeleteLoading] = useState(false); // Loading state for deletion
  const [fetchError, setFetchError] = useState(null); // Error message for fetch failures
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [errors, setErrors] = useState({
    name: "", parentEmail: "", relation: "", authorizedPersonName: "", role: "", className: "",
    govIdType: "", govIdNumber: "", studentId: "", address: "", pincode: "", state: "",
    mobileNumber: "", secondaryMobileNumber: "", admissionDate: "", dob: "", gender: "",
  });

  // Constants for dropdown options
  const govIdTypes = ["Aadhar", "passport"];
  const relations = ["Father", "Mother", "Guardian"];
  const genders = ["male", "female", "other"];

  // ====================================================================
  // DATA FETCHING SECTION - Load student data when component mounts
  // ====================================================================

  useEffect(() => {
    (async () => {
          const classListData = await getFromIndexedDB('school-class-List-admin');
    if (classListData ) {
       setClassList(classListData)
    }
    })()
  }, [])
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const userData = await axios.get(
          `${BaseUrl}admin/student-list/${selectedClass}`,{ withCredentials: true }
        );
        setStudents(userData.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setFetchError("Failed to load students. Please try again.");
        showError("Failed to load student data");
      }
      
    };
    if (selectedClass) fetchData();
  }, [selectedClass]);

  // ====================================================================
  // EVENT HANDLERS SECTION - Functions for user interactions
  // ====================================================================
  const handleEditClick = (student) => {
    setEditingStudent({ ...student });
    setViewingStudent(null);
    setErrors({});
  };

  const handleViewClick = (student) => {
    setViewingStudent(student);
    setEditingStudent(null);
  };

  const handleBackClick = () => {
    setEditingStudent(null);
    setViewingStudent(null);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setErrors({});
  };

  // ====================================================================
  // FORM SUBMISSION HANDLER - Save edited student data
  // ====================================================================
  const handleSaveChanges = async (e) => {
    e.preventDefault();
   
    // Create updated student object from form data
    const updatedStudent = {
      ...editingStudent,
      name: e.target.name.value.trim(),
      parentEmail: e.target.parentEmail.value.trim(),
      mobileNumber: e.target.mobileNumber?.value.trim(),
      secondaryMobileNumber: e.target.secondaryMobileNumber?.value.trim(),
      govIdType: e.target.govIdType?.value.trim(),
      govIdNumber: e.target.govIdNumber?.value.trim(),
      authorizedPersonName: e.target.authorizedPersonName?.value.trim(),
      className: e.target.className?.value.trim(),
      dob: e.target.dob?.value,
      gender: e.target.gender?.value,
      studentId: e.target.studentId?.value.trim(),
      address: e.target.address?.value.trim(),
      pincode: e.target.pincode?.value.trim(),
      state: e.target.state?.value.trim(),
    };

    const newErrors = {};

    // Name validation
    if (!updatedStudent.name) {
      newErrors.name = "❌ Name is required.";
    } else if (!/^[A-Za-z\s'-]{3,50}$/.test(updatedStudent.name)) {
      newErrors.name = "❌ Only letters, spaces, apostrophes, and hyphens allowed.";
    }

    // Class validation
    if (!updatedStudent.className) {
      newErrors.className = "❌ Please select a class.";
    }

    // Email validation
    if (!updatedStudent.parentEmail) {
      newErrors.parentEmail = "❌ Email is required.";
    } else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(updatedStudent.parentEmail)) {
      newErrors.parentEmail = "❌ Enter a valid email address.";
    }

    // Mobile number validation
    if (!updatedStudent.mobileNumber) {
      newErrors.mobileNumber = "❌ Primary mobile number is required.";
    } else if (!/^\d{10}$/.test(updatedStudent.mobileNumber)) {
      newErrors.mobileNumber = "❌ Enter a valid 10-digit primary number.";
    }

    // Secondary mobile number validation
    if (updatedStudent.secondaryMobileNumber && !/^\d{10}$/.test(updatedStudent.secondaryMobileNumber)) {
      newErrors.secondaryMobileNumber = "❌ Enter a valid 10-digit secondary number.";
    }

    // Pincode validation
    if (!updatedStudent.pincode) {
      newErrors.pincode = "❌ Pincode is required.";
    } else if (!/^\d{6}$/.test(updatedStudent.pincode)) {
      newErrors.pincode = "❌ Enter a valid 6-digit pincode.";
    }


    // Authorized person name validation
    if (updatedStudent.authorizedPersonName && !/^[A-Za-z\s'-]{3,50}$/.test(updatedStudent.authorizedPersonName)) {
      newErrors.authorizedPersonName = "❌ Only letters, spaces, apostrophes, and hyphens allowed.";
    }

    // Government ID validation
    if (!updatedStudent.govIdType) {
      newErrors.govIdType = "❌ Please select a Government ID Type.";
    }

// Government ID number validation
if (updatedStudent.govIdType === "Aadhar") {
  if (!/^\d{12}$/.test(updatedStudent.govIdNumber)) {
    newErrors.govIdNumber = "❌ Enter a valid 12-digit Aadhar number.";
  }
} else if (updatedStudent.govIdType.toLowerCase() === "passport") {
  // More flexible passport format: 5-17 alphanumeric characters (case insensitive)
  if (!/^[A-Za-z0-9]{5,17}$/i.test(updatedStudent.govIdNumber)) {
    newErrors.govIdNumber = "❌ Enter a valid passport number (5–17 alphanumeric characters).";
  }
}

    // Address validation
    if (!updatedStudent.address) {
      newErrors.address = "❌ Address is required.";
    } else if (updatedStudent.address.length < 10) {
      newErrors.address = "❌ Address must be at least 10 characters long.";
    }

    // State validation
    if (!updatedStudent.state) {
      newErrors.state = "❌ Please select your state.";
    }
     if (!updatedStudent.gender) {
      newErrors.gender = "❌ Please select your gender.";
    }
// Date of birth validation
if (!updatedStudent.dob) {
  newErrors.dob = "❌ Date of birth is required.";
} else {
  const today = new Date();
  const dobDate = new Date(updatedStudent.dob);
  const age = today.getFullYear() - dobDate.getFullYear();
  const hasBirthdayPassedThisYear =
    today.getMonth() > dobDate.getMonth() ||
    (today.getMonth() === dobDate.getMonth() && today.getDate() >= dobDate.getDate());

  const actualAge = hasBirthdayPassedThisYear ? age : age - 1;

  if (dobDate > today || actualAge < 3 || actualAge > 100) {
    newErrors.dob = "DOB must be valid and age between 3 to 100.";
  }
}

    // Admission date validation
    if (!updatedStudent.admissionDate) {
      newErrors.admissionDate = "❌ Admission date is required.";
    }

    // Student ID validation
    if (updatedStudent.studentId && !/^\d{6}$/.test(updatedStudent.studentId)) {
      newErrors.studentId = "❌ Student ID must be a 6-digit number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseUrl}admin/student-profile/edit`,
        updatedStudent,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setStudents(prevStudents =>
          prevStudents.map(s =>
            s._id === updatedStudent._id ? updatedStudent : s
          )
        );
        showSuccess("Student updated successfully!");
        setEditingStudent(null);
      }
    } catch (error) {
       setLoading(false);
      showError("Failed to update student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // DELETE HANDLER - Delete a student record
  // ====================================================================
  const handleDeleteStudent = async (item) => {
    if (!window.confirm(`Are you sure you want to ${item} this student?`)) return;

    setDeleteLoading(true);
    try {
      const response = await axios.delete(
        `${BaseUrl}admin/student/${item}/${editingStudent._id}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setStudents(prevStudents =>
          prevStudents.filter(s => s._id !== editingStudent._id)
        );
        showSuccess("Student deleted successfully!");
        setEditingStudent(null);
      } else {
        showError(response.data.message || "Failed to delete student");
      }
    } catch (error) {
      showError("Failed to delete student. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ====================================================================
  // SEARCH FUNCTIONALITY - Filter students based on search term
  // ====================================================================
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.trim().toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      (student.email && student.email.toLowerCase().includes(searchLower)) ||
      (student.rollno && student.rollno.toLowerCase().includes(searchLower)) ||
      (student.department && student.department.toLowerCase().includes(searchLower)) ||
      (student.phonenumber && student.phonenumber.toLowerCase().includes(searchLower)) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchLower)) ||
      (student.className && student.className.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return <Loading/>
  }

  // ======================================================================
  // VIEW STUDENT DETAILS - Display detailed view of a single student
  // ======================================================================
  if (viewingStudent) {
    return (
      <PageWrapper>
  <div className="min-h-screen flex justify-center items-center px-4 py-8 bg-white">
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1877f2]">Student Details</h2>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm border border-gray-300"
        >
          Back to List
        </button>
      </div>

      <div className="space-y-6">
       {/* ✅ Student Profile Header */}
<div className="flex items-center gap-5 p-4 bg-white rounded-lg shadow">
  {/* Profile Image */}
  <img
    className="h-20 w-20 rounded-full border-2 border-gray-300 object-cover"
    src={viewingStudent.profilePicUrl || "/images/avatar.png"}
    alt="Student profile"
  />

  {/* Student Details */}
  <div>
    <h3 className="text-xl font-semibold text-gray-900">
      {viewingStudent.name}
    </h3>
    <p className="text-sm text-gray-600">{viewingStudent.studentId}</p>

    {/* Status Badge */}
    <span
      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium 
        ${
          viewingStudent.status === "blocked"
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
    >
      {viewingStudent.status || "active"}
    </span>
  </div>
</div>


        {/* Basic & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-semibold text-lg mb-2 text-[#1877f2]">
              Basic Information
            </h4>
            <div className="space-y-1 text-gray-700 text-sm">
              <p>
                <span className="font-medium">Class:</span>{" "}
                {viewingStudent.className || "N/A"}
              </p>
              <p>
                <span className="font-medium">Student ID:</span>{" "}
                {viewingStudent.studentId}
              </p>
              <p>
                <span className="font-medium">DOB:</span>{" "}
                {new Date(viewingStudent.dob).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Gender:</span>{" "}
                {viewingStudent.gender}
              </p>
              <p>
                <span className="font-medium">Admission Date:</span>{" "}
                {viewingStudent.admissionDate?.slice(0, 10)}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-lg mb-2 text-[#1877f2]">
              Contact Information
            </h4>
            <div className="space-y-1 text-gray-700 text-sm">
              <p>
                <span className="font-medium">Mobile:</span>{" "}
                {viewingStudent.mobileNumber}
              </p>
              <p>
                <span className="font-medium">Secondary Mobile:</span>{" "}
                {viewingStudent.secondaryMobileNumber || "N/A"}
              </p>
              <p>
                <span className="font-medium">Parent Email:</span>{" "}
                {viewingStudent.parentEmail || "N/A"}
              </p>
              <p>
                <span className="font-medium">Authorized Person:</span>{" "}
                {viewingStudent.authorizedPersonName || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Address & Academic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-2 text-[#1877f2]">
              Address
            </h4>
            <p className="text-sm text-gray-700">{viewingStudent.address}</p>
            <p className="text-sm text-gray-700">
              {viewingStudent.state}, {viewingStudent.pincode}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-2 text-[#1877f2]">
              Academic Information
            </h4>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Admission Date:</span>{" "}
              {new Date(viewingStudent.admissionDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Government ID */}
        <div>
          <h4 className="font-semibold text-lg mb-2 text-[#1877f2]">
            Government ID
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-medium">Type:</span>{" "}
              {viewingStudent.govIdType}
            </p>
            <p>
              <span className="font-medium">Number:</span>{" "}
              {viewingStudent.govIdNumber}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => handleEditClick(viewingStudent)}
            className="px-5 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg text-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
        </div>
        </PageWrapper>
);

  }

// ======================================================================
// EDIT STUDENT FORM - Form for editing student details
// ======================================================================
if (editingStudent) {
  return (
  <PageWrapper>
  <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-md border border-gray-200 rounded-xl">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-black">
        Edit Student Profile
      </h2>
      <button
        onClick={handleBackClick}
        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
      >
        Back to List
      </button>
    </div>

    <form className="space-y-6" onSubmit={handleSaveChanges}>
      {/* Name and Email Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            defaultValue={editingStudent.name || "Anjali Sharma"}
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Student ID</label>
          <input
            type="text"
            name="studentId"
            defaultValue={editingStudent.studentId || "72233201"}
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.studentId && <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>}
        </div>
      </div>

      {/* Parent Information Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Parent Email</label>
          <input
            type="email"
            name="parentEmail"
            defaultValue={editingStudent.parentEmail || "parent@example.com"}
            placeholder="parent@example.com"
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.parentEmail && <p className="mt-1 text-sm text-red-500">{errors.parentEmail}</p>}
        </div>
      </div>

      {/* Authorized Person and Class Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Authorized Person</label>
          <input
            type="text"
            name="authorizedPersonName"
            defaultValue={editingStudent.authorizedPersonName || "Parent Guardian"}
            placeholder="Person handling admission"
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.authorizedPersonName && (
            <p className="mt-1 text-sm text-red-500">{errors.authorizedPersonName}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Class</label>
          <select
            name="className"
            defaultValue={editingStudent.className || "10"}
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          >
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          {errors.className && <p className="mt-1 text-sm text-red-500">{errors.className}</p>}
        </div>
      </div>

      {/* Date of Birth and Gender */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="dob"
            defaultValue={editingStudent.dob ? new Date(editingStudent.dob).toISOString().split('T')[0] : "2008-05-15"}
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob}</p>}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Gender</label>
          <select
            name="gender"
            defaultValue={editingStudent.gender?.toLowerCase() || "female"}
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          >
            <option value="">Select Gender</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>
          {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Address</label>
        <textarea
          name="address"
          defaultValue={editingStudent.address || "123 Main Street, Koyilandy, Kerala"}
          rows={2}
          placeholder="Full Address"
          className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* Pincode and State */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Pincode</label>
          <input
            type="text"
            name="pincode"
            defaultValue={editingStudent.pincode || "673305"}
            placeholder="Pincode"
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.pincode && <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">State</label>
          <select
            name="state"
            defaultValue={editingStudent.state || "Kerala"}
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          >
            <option value="">Select State</option>
            {countries.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
        </div>
      </div>

      {/* Mobile Numbers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Primary Mobile</label>
          <input
            type="tel"
            name="mobileNumber"
            defaultValue={editingStudent.mobileNumber || "7034884827"}
            placeholder="Primary Mobile"
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.mobileNumber && <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Secondary Mobile</label>
          <input
            type="tel"
            name="secondaryMobileNumber"
            defaultValue={editingStudent.secondaryMobileNumber || "9876543210"}
            placeholder="Secondary Mobile"
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.secondaryMobileNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.secondaryMobileNumber}</p>
          )}
        </div>
      </div>

      {/* Government ID */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Government ID Type</label>
          <select
            name="govIdType"
            defaultValue={editingStudent.govIdType || "Aadhar"}
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          >
            <option value="">Select ID Type</option>
            {govIdTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.govIdType && <p className="mt-1 text-sm text-red-500">{errors.govIdType}</p>}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Government ID Number</label>
          <input
            type="text"
            name="govIdNumber"
            defaultValue={editingStudent.govIdNumber || "123456789012"}
            placeholder="Enter ID number"
            className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800"
          />
          {errors.govIdNumber && <p className="mt-1 text-sm text-red-500">{errors.govIdNumber}</p>}
        </div>
      </div>

    {/* Action Buttons */}
<div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

  {/* Left Action Buttons */}
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      type="button"
      onClick={() => handleDeleteStudent("deleted")}
      disabled={deleteLoading}
      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50"
    >
      {deleteLoading ? "Deleting..." : "Delete🗑️"}
    </button>
{editingStudent.status === 'blocked' ? (
  <button
    type="button"
    onClick={() => handleDeleteStudent("active")} // 👈 Unblock
    className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
  >
    Unblock 🔓
  </button>
) : (
  <button
    type="button"
    onClick={() => handleDeleteStudent("blocked")} // 👈 Block
    className="px-4 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition"
  >
    Block 🚫
  </button>
)}

  </div>

  {/* Right Action Buttons */}
  <div className="flex gap-3 justify-end">
    <button
      type="button"
      onClick={handleCancelEdit}
      className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading}
      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
    >
      {loading ? "Saving..." : "Save Changes"}
    </button>
  </div>

</div>

    </form>
      </div>
      </PageWrapper>

);

}
  return (
  <PageWrapper>
  <div className="p-4 min-h-screen bg-white text-gray-800">
    {/* Header Section */}
    <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-2xl font-bold">Student Management</h1>

      {/* Class Select + Search Input */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
        {/* Class Select Input */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>

            {classList.map((cls) => (
            <option key={cls} value={cls}>
                  {cls}
                </option>
                ))}
            </select>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    {/* Loading and Error States */}
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    ) : fetchError ? (
      <div className="text-center py-10 text-red-500">{fetchError}</div>
    ) : (
      // Student List Table
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow">
        <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  ID No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={student.profilePicUrl || "/images/avatar.png"}
                            alt="Student"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-800">
                            {student.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{student.studentId}</td>
                    <td className="px-6 py-4 text-sm">
                      {student.className || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{student.mobileNumber || student.phonenumber}</div>
                      <div className="text-xs text-gray-500">
                        {student.parentEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                    <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    student.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-red-700"
                    }`}
                    >
                    {student.status || "unknown"}
                    </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleViewClick(student)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
      </div>
      </PageWrapper>
);


}

export default StudentsList;