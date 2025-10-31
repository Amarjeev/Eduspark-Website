import React, { useEffect ,useState } from 'react';
import useUserSchoolData from '../../../hooks/useUserSchoolData';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from '../../../utils/toast';

function ParentEntryHome() {
  const [schoolName, setSchoolName] = useState('');
    const [studentList, setStudentList] = useState([]);
    const [complaint, setComplaint] = useState("");
  const navigate = useNavigate();
   const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }, 100); // delay helps after route change
      }
    }
  }, [location]);
  
   useEffect(() => {
    // Custom hook to manage parent school-related logic
    useUserSchoolData('parent');

    // Async function to fetch school name from IndexedDB
    const fetchSchoolName = async () => {
      try {
        const response = await axios.get(`${BaseUrl}parents/get-studentdata`, { withCredentials: true })
        setStudentList(response?.data?.students)
        setSchoolName(response?.data?.students[0]?.schoolname || 'empty');
      } catch (error) {
        showError("Something went wrong. Please try again.");
          setTimeout(() => {
    navigate('/');
  }, 2000);
      }
    };

    fetchSchoolName();
   }, []);
  
  const handleComplaintSubmit = () => {
  if (!complaint.trim()) {
    // alert("Please write something before submitting.");
    return;
  }

  // alert("Thank you for your feedback!");

 // setComplaint(""); // Clear after submission
};
  
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Welcome to <span className="text-yellow-400">Eduspark 🎓</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-100 mb-8">
            Empowering parents to stay connected with <span className="text-yellow-400 font-semibold">"{ schoolName}"</span>.
            Track your child’s progress, attendance, and school updates — all in one place.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase text-blue-600">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Designed for Engaged Parents</h2>
            <p className="max-w-2xl mx-auto text-gray-600 mt-4">
              Eduspark offers powerful tools to keep you informed, involved, and in control of your child's school journey — every step of the way.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: '📊', title: 'Track Academic Progress', desc: 'View your child\'s grades, report cards, and performance history in real-time.' },
              { icon: '📅', title: 'Attendance Monitoring', desc: 'Stay updated with daily attendance records and receive instant notifications.' },
              { icon: '📬', title: 'School Notifications', desc: 'Get timely updates on school events, holidays, circulars, and announcements.' },
              { icon: '💬', title: 'Direct Communication', desc: 'Connect with teachers and staff directly to stay engaged in your child’s learning.' },
              { icon: '💳', title: 'Fee & Payment Info', desc: 'View fee structure, track due payments, and receive alerts on deadlines.' },
              { icon: '🕒', title: 'Timetable Access', desc: 'Easily check your child’s class schedule and upcoming exam routines anytime.' },
              { icon: '🎥', title: 'Live Meeting Access', desc: 'Join parent-teacher meetings and school webinars through secure live video calls.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">{feature.icon} {feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Tracking Section */}
      <section id="services" className="py-16 bg-gradient-to-r  bg-zinc-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-black underline mb-4">Your Children</h3>
          <p className="text-md text-center text-black mb-10">
            Click on a card to see student tracking<br />
            <span className="text-2xl">👇</span>
          </p>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
  {studentList.map((student, index) => (
   <Link
    key={index}
    to="/parent/Home"
    state={{ studentId: student.studentId,className: student.className ,url:student.profilePicUrl}}
    className="w-full max-w-xs bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
  >
      <img
        src={student.profilePicUrl || "/images/avatar.png"}
        alt={student.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 text-center">
        <h2 className="text-lg font-semibold text-gray-800">{student.name}</h2>
        <p className="text-sm text-gray-600 mt-1">Class: {student.className}</p>
      </div>
    </Link>
  ))}
</div>



        </div>
      </section>
 <footer id="contact" className="bg-gray-900 text-gray-400 py-12">
  <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
    {/* About Eduspark */}
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">About Eduspark</h3>
      <ul className="space-y-2">
        <li><a href="#" className="hover:text-white transition-colors">Our Mission</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Leadership</a></li>
        <li><a href="#" className="hover:text-white transition-colors">School Life</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
      </ul>
    </div>

    {/* Academics */}
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">Academics</h3>
      <ul className="space-y-2">
        <li><a href="#" className="hover:text-white transition-colors">Subjects</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Class Timetable</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Examinations</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Results</a></li>
      </ul>
    </div>

    {/* Quick Links */}
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
      <ul className="space-y-2">
        <li><a href="#" className="hover:text-white transition-colors">Student Login</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Parent Dashboard</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Teacher Portal</a></li>
        <li><a href="#" className="hover:text-white transition-colors">Fee Payment</a></li>
      </ul>
    </div>

    {/* Complaint Box */}
    {/* Complaint Box Section */}
<div>
  <h3 className="text-white text-lg font-semibold mb-3">Have a Concern?</h3>
  <p className="text-sm text-gray-300 mb-4">
    We care about your experience. If you have any issues, feedback, or suggestions related to our school or platform, please let us know below.
  </p>

  <textarea
    value={complaint}
    onChange={(e) => setComplaint(e.target.value)}
    placeholder="Write your complaint or feedback here..."
    className="w-full bg-gray-800 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400"
    rows={5}
  />

<div className="flex flex-wrap gap-2 mt-3">
  <button
    onClick={handleComplaintSubmit}
    className="bg-green-400 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
  >
    Submit
  </button>
  <button
    onClick={() => setComplaint("")}
    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
  >
    Clear
  </button>
</div>

</div>

  </div>

  {/* Footer Bottom Note */}
  <div className="mt-12 text-center text-sm text-gray-500 px-4">
    © {new Date().getFullYear()} Eduspark School. All rights reserved.
  </div>
</footer>

    </div>
  );
}

export default ParentEntryHome;
