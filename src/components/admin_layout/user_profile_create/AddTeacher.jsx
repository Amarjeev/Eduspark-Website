import React, { useState ,useEffect} from "react";
import departments from "../../data/departments";
import { getFromIndexedDB} from '../../../utils/indexedDBUtils';
import axios from 'axios'
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import PageWrapper from "../../../PageWrapper";

function AddTeacher() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
    phonenumber: "",
    subject: "",
    department: "",
    employId: "",
    govidtype: "",
    govidnumber: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isIdGenerated, setIsIdGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading
  const [subject, setSubjects] = useState([]);
  
useEffect(() => {
  (async () => {
    const subjectsData = await getFromIndexedDB('school-subjects-List-admin');
    if (subjectsData ) {
      setSubjects(subjectsData)
    }
  })();
}, []);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required.";
        else if (!/^[A-Za-z\s]+$/.test(value))
          error = "Name can only contain letters and spaces.";
        else if (value.length < 3 || value.length > 25)
          error = "Name must be between 3 and 25 characters long."; 
        break;

      case "email":
        if (!value.trim()) error = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Email is invalid.";
        break;

      case "password":
        if (!value) error = "Password is required.";
        else if (value.length < 5 || value.length > 10)
          error = "Password must be 5-10 characters long.";
        else if (formData.rePassword && value !== formData.rePassword)
          error = "Passwords do not match.";
        break;

      case "rePassword":
        if (!value) error = "Please confirm your password.";
        else if (value !== formData.password) error = "Passwords do not match.";
        break;

      case "phonenumber":
        if (!value) error = "Phone number is required.";
          else if (!/^\d{7,15}$/.test(value.replace(/[\s-]/g, '')))
    error = "Phone number must be 7 to 15 digits (no country code).";
        break;

      case "subject":
        if (!value) error = "Subject is required.";
        break;

      case "department":
        if (!value) error = "Department is required.";
        else if (!departments.includes(value))
          error = "Please select a valid department.";
        break;

      case "employId":
        if (!value) error = "Employ ID is required.";
        else if (value.toString().length !== 8)
          error = "Employ ID must be exactly 8 digits.";
        break;

      case "govidtype":
        break;

      case "govidnumber":
        if (formData.govidtype && !value)
          error = `${formData.govidtype.charAt(0).toUpperCase() + formData.govidtype.slice(1)} number is required.`;
        else if (formData.govidtype) {
          switch (formData.govidtype.toLowerCase()) {
            case "aadhar":
              if (!/^\d{12}$/.test(value))
                error = "Aadhar number must be exactly 12 digits.";
              break;
            case "license":
              if (!/^[A-Z]{2}\d{2}[0-9A-Z]{11,13}$/.test(value))
                error =
                  "License number format: 2 letters + 2 digits + 11-13 chars.";
              break;
            case "voterid":
              if (!/^[A-Z]{3}\d{7}$/.test(value))
                error = "Voter ID format: 3 letters followed by 7 digits.";
              break;
            default:
              break;
          }
        }
        break;

      default:
        break;
    }
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) newErrors[name] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);

      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));

      if (name === "password" && touched["rePassword"]) {
        setErrors((prev) => ({
          ...prev,
          rePassword:
            value !== formData.rePassword ? "Passwords do not match." : "",
        }));
      }
      if (name === "rePassword" && touched["password"]) {
        setErrors((prev) => ({
          ...prev,
          password:
            formData.password !== value ? "Passwords do not match." : "",
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const generateEmployId = () => {
    const newId = Math.floor(10000000 + Math.random() * 90000000).toString();
    setFormData((prev) => ({ ...prev, employId: newId }));
    setErrors((prev) => ({ ...prev, employId: "" }));
    setTouched((prev) => ({ ...prev, employId: true }));
    setIsIdGenerated(true);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched = {};
    Object.keys(formData).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    // Validate all fields
    const newErrors = validateAll();

    // Check if any errors exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submissionData = {
      ...formData,
    };
    delete submissionData.rePassword;

    try {
      setIsLoading(true); // Start loading
      const response = await axios.post(
        `${BaseUrl}admin/teachers/signup`, 
         submissionData , 
        { withCredentials: true }
      );
      
      if (response.data.status === true) {
        showSuccess('Teacher added successfully')
        // Optionally reset form here
              setFormData({
          name: "",
          email: "",
          password: "",
          rePassword: "",
          phonenumber: "",
          subject: "",
          department: "",
          employId: "",
          govidtype: "",
          govidnumber: ""
        });
        setErrors({});
        setTouched({});
        setIsIdGenerated(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
          const field = error.response.data.field;
        if (field === "email") {
          showError("This email is already registered. Please use a different email.");
          return;
        }
      }
      showError('Error submitting form. Please try again.')
    } finally {
      setIsLoading(false); // Stop loading regardless of success/error
    }
  };

  // Show loading screen if isLoading is true
  if (isLoading) {
    return <Loading/>;
  }

  return (
   <PageWrapper>
  <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4 py-6 text-black">
    <div className="w-full max-w-3xl bg-white border border-gray-300 rounded-xl shadow-md p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-center text-black mb-6">
        Teacher Signup Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block font-medium text-sm">Full Name</label>
          <input
            type="text"
            name="name"
            minLength={3}
            maxLength={25}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Full Name"
            className="w-full p-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && touched.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="email@example.com"
            className="w-full p-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && touched.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password and Confirm Password */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-medium text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="******"
              className="w-full p-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && touched.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block font-medium text-sm">Re-enter Password</label>
            <input
              type="password"
              name="rePassword"
              value={formData.rePassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="******"
              className="w-full p-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.rePassword && touched.rePassword && (
              <p className="text-red-500 text-xs mt-1">{errors.rePassword}</p>
            )}
          </div>
        </div>

        {/* Phone & Employ ID */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-medium text-sm">Phone Number</label>
            <input
              type="tel"
              name="phonenumber"
              pattern="\d{7,15}"
              value={formData.phonenumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Phone Number"
              className="w-full p-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phonenumber && touched.phonenumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phonenumber}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-sm">Employ ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="employId"
                readOnly
                value={formData.employId}
                placeholder="Auto-generated"
                className="flex-1 p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={generateEmployId}
                disabled={isIdGenerated}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition ${
                  isIdGenerated
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isIdGenerated ? "Generated" : "Generate"}
              </button>
            </div>
            {errors.employid && touched.employId && (
              <p className="text-red-500 text-xs mt-1">{errors.employId}</p>
            )}
          </div>
        </div>

        {/* Subject & Department */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-medium text-sm">Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {subject.map((sub, i) => (
                <option key={i} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            {errors.subject && touched.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-sm">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && touched.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>
        </div>

        {/* Government ID */}
        <div>
          <label className="block font-medium text-sm">Government ID Type</label>
          <div className="flex gap-4 flex-wrap">
            {["Aadhar", "License", "VoterId"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="govidtype"
                  value={type}
                  checked={formData.govidtype === type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {type}
              </label>
            ))}
          </div>
          {formData.govidtype && (
            <div className="mt-3">
              <label className="block font-medium text-sm">
                {formData.govidtype === "Aadhar"
                  ? "Aadhar Number"
                  : formData.govidtype === "License"
                  ? "License Number"
                  : "Voter ID"}
              </label>
              <input
                type="text"
                name="govidnumber"
                value={formData.govidnumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter ID Number"
                className="w-full p-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.govidnumber && touched.govidnumber && (
                <p className="text-red-500 text-xs mt-1">{errors.govidnumber}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-2 rounded-md font-semibold bg-blue-500 hover:bg-blue-600 transition text-white text-sm"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
      </div>
      </PageWrapper>
);

}

export default AddTeacher;