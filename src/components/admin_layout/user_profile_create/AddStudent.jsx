// Import necessary dependencies and components
import React, { useState, useEffect } from "react";
import countries from "../../data/indianStates"; // State dropdown options
import axios from 'axios'; // HTTP client
import { BaseUrl } from "../../../BaseUrl/BaseUrl"; // Base URL config
import { showSuccess, showError } from "../../../utils/toast"; // Toast notifications
import Loading from "../../loading_ui/Loading";
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import PageWrapper from "../../../PageWrapper";

function AddStudent() {
  const [loading, setLoading] = useState(false); // State for showing loading spinner
  const [classList, setClassList] = useState([]); // Holds the list of available classes fetched from the backend

  // Stores error messages for each field
  const [errors, setErrors] = useState({
    name: "", parentEmail: "", relation: "", authorizedPersonName: "", role: "", className: "",
    govIdType: "", govIdNumber: "", studentId: "", address: "", pincode: "", state: "",
    mobileNumber: "", secondaryMobileNumber: "", admissionDate: "", dob: "", gender: "",
  });

  useEffect(() => {
    (async () => {
      const ClassListData = await getFromIndexedDB('school-class-List-admin');
      if (ClassListData) {
        setClassList(ClassListData)
      }
    })();
  }, []);

  // Initial form data
  const [formData, setFormData] = useState({
    name: "",
    parentEmail: "",
    relation: "",
    authorizedPersonName: "",
    role: "student",
    className: "",
    dob: "",
    gender: "",
    govIdType: "",
    govIdNumber: "",
    studentId: "",
    address: "",
    pincode: "",
    state: "",
    mobileNumber: "",
    secondaryMobileNumber: "",
    admissionDate: "",
  });

  // Auto-generate student ID if not present
  const generateId = () => {
    if (!formData.studentId) {
      const newId = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6-digit number
      setFormData((prev) => ({ ...prev, studentId: newId }));
    }
  };

  // Handle input changes and basic validation placeholders
  const handleChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = name === "name" || name === "parentEmail" || name === "mobileNumber" || name === "secondaryMobileNumber"
      ? value.trimStart()
      : value;

    // Allow only numeric input for pincode and mobile numbers
    if ((name === "pincode" || name === "mobileNumber" || name === "secondaryMobileNumber") && !/^\d*$/.test(trimmedValue)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: trimmedValue,
    }));

    // Clear individual error on change
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validation
    if (!/^[A-Za-z\s'-]{3,50}$/.test(formData.name)) {
      newErrors.name = "❌ Only letters, spaces, apostrophes, and hyphens allowed.";
    }

    if (!formData.className) {
      newErrors.className = "❌ Please select a class.";
    }

    if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(formData.parentEmail)) {
      newErrors.parentEmail = "❌ Enter a valid email address.";
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "❌ Enter a valid 10-digit primary number.";
    }

    if (formData.secondaryMobileNumber && !/^\d{10}$/.test(formData.secondaryMobileNumber)) {
      newErrors.secondaryMobileNumber = "❌ Enter a valid 10-digit secondary number.";
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "❌ Enter a valid 6-digit pincode.";
    }

    if (!/^[A-Za-z\s'-]{3,50}$/.test(formData.authorizedPersonName)) {
      newErrors.authorizedPersonName = "❌ Only letters, spaces, apostrophes, and hyphens allowed.";
    }

    if (!formData.govIdType) {
      newErrors.govIdType = "❌ Please select a Government ID Type.";
    }

    if (formData.govIdType === "Aadhar") {
      if (!/^\d{12}$/.test(formData.govIdNumber)) {
        newErrors.govIdNumber = "❌ Enter a valid 12-digit Aadhar number.";
      }
    } else if (formData.govIdType === "Passport") {
      if (!/^[A-PR-WYa-pr-wy][0-9]{7}$/.test(formData.govIdNumber)) {
        newErrors.govIdNumber = "❌ Enter a valid passport number (e.g., A1234567).";
      }
    }

    if (formData.address.length < 10) {
      newErrors.address = "❌ Address must be at least 10 characters long.";
    }

    if (!formData.state) {
      newErrors.state = "❌ Please select your state.";
    }

    if (!formData.dob) {
      newErrors.dob = "❌ Date of birth is required.";
    } else {
      const today = new Date();
      const dobDate = new Date(formData.dob);
      const age = today.getFullYear() - dobDate.getFullYear();
      const hasBirthdayPassedThisYear =
        today.getMonth() > dobDate.getMonth() ||
        (today.getMonth() === dobDate.getMonth() && today.getDate() >= dobDate.getDate());

      const actualAge = hasBirthdayPassedThisYear ? age : age - 1;

      if (dobDate > today || actualAge < 3 || actualAge > 100) {
        newErrors.dob = "DOB must be valid and age between 3 to 100.";
      }
    }

    if (!formData.admissionDate) {
      newErrors.admissionDate = "❌ Admission date is required.";
    }

    if (!/^\d{6}$/.test(formData.studentId)) {
      newErrors.studentId = "❌ Student ID must be a 6-digit number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseUrl}admin/student/signup`,
        formData,
        { withCredentials: true }
      );

      if (response.data.status) {
        showSuccess("Student registered successfully");

        // Clear form
        setFormData({
          name: "",
          parentEmail: "",
          relation: "",
          authorizedPersonName: "",
          role: "student",
          className: "",
          dob: "",
          gender: "",
          govIdType: "",
          govIdNumber: "",
          studentId: "",
          address: "",
          pincode: "",
          state: "",
          mobileNumber: "",
          secondaryMobileNumber: "",
          admissionDate: "",
        });

        // Clear all errors after success
        setErrors({});
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      showError("Something went wrong. Please try again.");
    }
  };

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4 py-6 text-black">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Student Registration Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Student Name</label>
            <input
              type="text"
              name="name"
              minLength={3}
              maxLength={50}
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter student name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Gender & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>
          </div>

          {/* Class & Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select
                name="className"
                required
                value={formData.className}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              >
                <option value="">Select Class</option>
                {classList.map((classItem, index) => (
                  <option key={index} value={classItem}>{classItem}</option>
                ))}
              </select>
              {errors.className && <p className="text-red-500 text-xs mt-1">{errors.className}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Student ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="studentId"
                  readOnly
                  required
                  value={formData.studentId}
                  className="flex-1 px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-sm text-gray-700"
                />
                <button
                  type="button"
                  onClick={generateId}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
                >
                  Generate
                </button>
              </div>
              {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
            </div>
          </div>

          {/* Parent Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                placeholder="Parent email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.parentEmail && <p className="text-red-500 text-xs mt-1">{errors.parentEmail}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Primary Mobile</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Primary mobile number"
                maxLength="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Secondary Mobile</label>
              <input
                type="tel"
                name="secondaryMobileNumber"
                value={formData.secondaryMobileNumber}
                onChange={handleChange}
                placeholder="Secondary mobile number (optional)"
                maxLength="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.secondaryMobileNumber && <p className="text-red-500 text-xs mt-1">{errors.secondaryMobileNumber}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Authorized Person</label>
              <input
                type="text"
                name="authorizedPersonName"
                value={formData.authorizedPersonName}
                onChange={handleChange}
                placeholder="Authorized person name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.authorizedPersonName && <p className="text-red-500 text-xs mt-1">{errors.authorizedPersonName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Government ID Type</label>
              <select
                name="govIdType"
                value={formData.govIdType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              >
                <option value="">Select ID Type</option>
                <option value="Aadhar">Aadhar</option>
                <option value="Passport">Passport</option>
              </select>
              {errors.govIdType && <p className="text-red-500 text-xs mt-1">{errors.govIdType}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Government ID Number</label>
              <input
                type="text"
                name="govIdNumber"
                value={formData.govIdNumber}
                onChange={handleChange}
                placeholder={formData.govIdType === "Aadhar" ? "12-digit Aadhar number" : "Passport number"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.govIdNumber && <p className="text-red-500 text-xs mt-1">{errors.govIdNumber}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                maxLength="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Admission Date</label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              />
              {errors.admissionDate && <p className="text-red-500 text-xs mt-1">{errors.admissionDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Relation</label>
              <select
                name="relation"
                value={formData.relation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
              >
                <option value="">Select Relation</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            ></textarea>
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
            >
              <option value="">Select State</option>
              {countries.map((item, i) => (
                <option key={i} value={item}>{item}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md text-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      </div>
      </PageWrapper>
  );
}

export default AddStudent;