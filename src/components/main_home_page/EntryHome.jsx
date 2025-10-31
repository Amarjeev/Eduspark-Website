import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../utils/toast";
import { useNavigate } from 'react-router-dom';
import Loading from '../loading_ui/Loading';
import PageWrapper from '../../PageWrapper';



function EntryHome() {
  const [udisecode, setCode] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('');
 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!udisecode || !/^\d{11}$/.test(udisecode)) {
    showError('Please enter a valid 11-digit Code.');
    return;
  }

   try {
    setLoading(true)
    const response = await axios.post(`${BaseUrl}check-udisecode`, {udisecode});

    if (response?.data?.success === false) {
      showError('No account found for the entered code');
      setLoading(false)
      return
    } else {
      setSchoolName(response.data.schoolName);
      showSuccess('School found');
        setTimeout(() => {
          navigate('/role-selector', {
            state: {
              udisecode: udisecode,
              schoolName: response.data.schoolName,
            },
          });
        }, 1000);
      setLoading(false)
    }
   } catch (error) {
     setLoading(false)
     showError('Something went wrong while verifying the code. Please try again later.');
     console.log(error);
  }
};

  if (loading) return <Loading />;
  return (
    <PageWrapper>
  <div className="font font-Poppins bg-[#212529] min-h-screen">
  <div className="flex flex-col items-center relative pt-20 overflow-hidden">
    {/* Animated Background Text */}
    <h1 className="absolute text-3xl md:text-[7rem] font-bold text-white opacity-5 animate-pulse">
      Eduspark 🎓
    </h1>

    {/* Input for UDISE/Institute Code */}
    <div className="mt-50 w-full max-w-sm px-4">
      <input
        type="text"
        inputMode="numeric"
        maxLength={11}
        pattern="\d*"
        value={udisecode}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter UDISE Code or Institute Code"
        className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#facc15]"
      />

      <button
        disabled={schoolName}
        onClick={handleSubmit}
        className="w-full mt-4 bg-[#facc15] text-black font-semibold py-2 rounded-md hover:bg-yellow-400 transition duration-200"
      >
        Submit
      </button>

      {/* Forgot Code Link */}
      <div className="mt-2 text-right">
        <Link to="/forgot-udisecode" className="text-sm text-red-600 hover:underline">
          Forgot UDISE or Institute Code?
        </Link>
      </div>
    </div>

    {/* Description */}
    <p className="mt-3 text-gray-400 text-center max-w-md md:max-w-2xl px-4 text-xs md:text-sm animate-fade-in">
      <strong>UDISE Code</strong> is a unique 11-digit code assigned to every school in India by the government. 
      Private institutions may use an <strong>Institute Code</strong> provided by their governing body.
    </p>

    <p className="mt-2 text-gray-400 text-center max-w-md md:max-w-2xl px-4 text-xs md:text-sm animate-fade-in">
      Don’t have an Admin account?&nbsp;
      <Link to="/admin/create-account" className="text-yellow-400 hover:underline font-medium">
        Click here to create one
      </Link>
    </p>
  </div>
      </div>
      </PageWrapper>

  );
}

export default EntryHome;
