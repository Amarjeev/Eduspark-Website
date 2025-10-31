import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import indianStates from '../../data/indianStates';
import { validateAdminSignup } from '../../../form_validation/ValidateAdminSignup';
import { showSuccess, showError } from "../../../utils/toast";
import axios from "axios";
import Loading from "../../loading_ui/Loading";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import PageWrapper from '../../../PageWrapper';

function AdminSignupPage() {
  const navigate = useNavigate();

  const [formErrors, setFormErrors] = useState();
  const [loading, setLoading] = useState(false);
  const [idtype,setIdtype]=useState('')

  const [formData, setFormData] = useState({
    role:'admin',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    schoolType: '',
    udisecode: '',
    schoolname: '',
    address: '',
    state:'',
  });


  useEffect(() => {
 setFormData((prev) => ({
        ...prev,
        udisecode: "",
      }));
},[formData.schoolType])

  useEffect(() => {
    if (formData.schoolType === "Government") {
      setIdtype('Udise-Code')
    } else {
      setIdtype('Institution-Code')
    }
    const fetchSchoolName = async () => {
      setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}search/schools/${formData.udisecode}`);
      // Assuming response.data has a property schoolName
      if (response.data && response.data.schoolName) {
        setFormData((prev) => ({
          ...prev,
          schoolname: response.data.schoolName,
        }));
        setLoading(false)
      } else {
        // No school found for given code
        setFormData((prev) => ({
          ...prev,
          schoolname: "",
        }));
         setLoading(false)
      showError("No school found with this UDISE code. Please enter a valid UDISE code.");
      }
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        schoolname: "",
      }));
        setLoading(false)
      showError("Failed to fetch school name. Please try again or check the UDISE code.");
    }
    };

   const isValidUdise = /^\d{11}$/.test(formData?.udisecode);

    if (isValidUdise && formData?.schoolType === "Government") {
      const timeoutId = setTimeout(() => {
      fetchSchoolName();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }
  },[formData?.udisecode,formData?.schoolType])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateUdisecode = () => {
  const code = Math.floor(10000000000 + Math.random() * 90000000000); // Generates an 11-digit number
  setFormData({ ...formData, udisecode: code.toString() });
};
  
  const handleSignup =async() => {
if (Object.values(formData).some(value => value.trim() === '')) {
  showError("Please fill in all the fields");
  return
}
    const errors = validateAdminSignup(formData);
    setFormErrors(errors);
if (Object.keys(errors).length !== 0) {
  showError("Please fix the errors in the form before submitting.");
  return
    }
    
    try {
      setLoading(true)
  const response = await axios.post(`${BaseUrl}admin/signup`, formData);

  // ✅ Handle success
  if (response.data.success) {
    // For example, show success message or 
    setLoading(false)
       setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        schoolType: '',
        udisecode: '',
        schoolname: '',
        address: '',
        state: '',
      });
    showSuccess("Account created successfully. UDISE code has been sent to your email inbox.");

  }
    } catch (error) {
      setLoading(false)
      if (error?.response?.data?.success === 'duplicate') {
        showError("Duplicate account found. Please use a different email or UDISE code.")
        return
      } else {
       showError("Something went wrong. Please try again.");
      }
}

  }

    if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="w-full m-0 sm:m-4 md:m-10 bg-white shadow sm:rounded-lg flex flex-col lg:flex-row justify-center flex-1">
        <div className="w-full lg:w-1/2 xl:w-5/12 p-4 sm:p-6 md:p-12">
          {/* 🔙 Back Button - aligned left */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-gray-700 flex items-center hover:text-black transition"
            >
              <span className="text-xl mr-1">←</span> Back
            </button>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-black mb-2">
              EduSpark <span role="img" aria-label="cap">🎓</span>
            </h1>
              <p className="text-xs sm:text-sm text-center text-gray-600 mb-6">
              This is the <strong>EduSpark Admin Signup Page</strong>
              </p>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col items-center">
            <div className="w-full flex-1">
              <div className="w-full mx-auto max-w-xs">
                {/* All inputs bind to useState */}
                {formErrors?.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                <input
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {formErrors?.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                <input
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {formErrors?.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                <input
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formErrors?.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                <input
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                    {formErrors?.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
                <input
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                    {formErrors?.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                  <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                  >
                    <option value="">Select State</option>
                  {indianStates.map((state) => (
                  <option key={state} value={state}>
                  {state}
                  </option>
                  ))}
                </select>
                {formErrors?.schoolType && <p className="text-red-500 text-xs mt-1">{formErrors.schoolType}</p>}
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleChange}
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                >
                  <option value="">Select Institution Type</option>
                  <option value="Government">Government Institution</option>
                  <option value="Private">Private Institution</option>
                </select>
                {formData.schoolType&&
                  <>
                  <a
                  className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                  {idtype}
                  </a>
                  <div className="flex gap-2 mb-3 sm:mb-4">
                    {formErrors?.udisecode && <p className="text-red-500 text-xs mt-1">{formErrors.udisecode}</p>}
                  <input
                    className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="text"
                    name="udisecode"
                    placeholder={idtype}
                      disabled={formData.schoolType !== "Government"}
                    value={formData.udisecode}
                    onChange={handleChange}
                  />
                { formData.schoolType!=="Government"&& <button
                    type="button"
                      onClick={generateUdisecode}
                      disabled={formData.udisecode}
                    className="px-3 sm:px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm whitespace-nowrap"
                  >
                    Generate
                  </button>}
                  </div>
                      {formErrors?.schoolname && <p className="text-red-500 text-xs mt-1">{formErrors.schoolname}</p>}
                <input
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4"
                  type="text"
                  name="schoolname"
                    placeholder="School Name"
                    disabled={formData.schoolType === "Government"}
                  value={formData.schoolname}
                  onChange={handleChange}
                    />
                    </>
                }
                {formErrors?.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                <textarea
                  name="address"
                  placeholder="School Address"
                  rows={3}
                  className="w-full px-4 sm:px-8 py-2 sm:py-3 rounded-lg bg-gray-100 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3 sm:mb-4 resize-none"
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>

                <button
                    onClick={handleSignup}
                  className="mt-2 tracking-wide font-semibold bg-green-500 text-white w-full py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none text-sm"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 -ml-1 mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EduSpark Info Right Side - Now visible on all screens */}
        <div className="w-full lg:w-1/2 bg-green-100 text-center flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-md w-full">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
              alt="EduSpark Cap Icon"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4"
            />
            <div className="text-center mb-3 sm:mb-4 md:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800">Welcome to</h2>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black">
                EduSpark <span role="img" aria-label="cap">🎓</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 md:mb-4">
              <strong>EduSpark</strong> is a modern, secure, and scalable school management platform built to transform how institutions operate in the digital era.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 md:mb-4">
              Designed specifically for <strong>school administrators</strong>, EduSpark enables seamless registration, efficient student management, structured class configuration, and real-time communication — all from a single, user-friendly dashboard.
            </p>
            <ul className="list-disc list-inside text-left text-xs sm:text-sm text-gray-700 mt-2 sm:mt-3">
              <li>Digitize student profiles and academic records</li>
              <li>Configure and manage classes, divisions, and subjects</li>
              <li>Assign staff roles and permissions securely</li>
              <li>Broadcast real-time alerts and school-wide announcements</li>
              <li>Ensure data privacy with cloud-based protection</li>
            </ul>

<p className="text-xs sm:text-sm text-gray-700 mt-4">
  <span className="block text-base sm:text-lg font-semibold text-red-500 mb-1">
    What is UDISE Code and Institute Code?
  </span>
  The <strong>UDISE Code</strong> (Unified District Information System for Education) is an 11-digit unique identification number assigned to every school in India by the Ministry of Education. It is primarily used for <strong>Government schools</strong> and helps in tracking school-specific data like enrollment, infrastructure, and academic performance.
  <br />
  The <strong>Institute Code</strong> is a unique internal identifier used by EduSpark to manage and distinguish between different schools or educational institutions registered on the platform. It is generally used for <strong>Private institutes</strong> to ensure smooth integration and organization within the system.
</p>


            <p className="text-xs sm:text-sm text-gray-700 mt-2 sm:mt-3 md:mt-4">
              Experience the future of school management. <strong>EduSpark</strong> – Where education meets innovation.
            </p>
          </div>
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default AdminSignupPage;