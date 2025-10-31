import React, { useState, useEffect } from "react";
import {
  FaUserGraduate, FaSchool, FaIdBadge, FaPhoneAlt,
  FaCalendarAlt, FaTransgender
} from "react-icons/fa";
import axios from "axios";
import { BaseUrl } from "../../BaseUrl/BaseUrl";
import { useParams } from 'react-router-dom';
import PageWrapper from "../../PageWrapper";
import { showError } from "../../utils/toast";

// 🎯 Grade calculator based on percentage
function getGrade(mark, total) {
  const percentage = (mark / total) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 40) return "C";
  return "F";
}

// 🧠 Main component to show student profile and marks
export default function StudentProfile() {
  const [profile, setProfile] = useState(null); // 👤 Student profile data
  const [marks, setMarks] = useState([]);       // 📊 Exam marks data
  const { id, studentId } = useParams();         // 🟡 Extract route parameters

  // 📡 Fetch student profile and exam marks from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BaseUrl}profile/${id}/${studentId}`, {
          withCredentials: true
        });
        setProfile(response.data.profile || null);
        setMarks(response.data.marks || []);
      } catch (error) {
        showError(" Failed to fetch student data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 🧑‍🎓 Student Profile Card */}
        {profile && (
          <div className="bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl p-8 border-l-8 border-blue-600 hover:scale-[1.01] transition-transform">
            <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
              <div className="flex items-center space-x-5">
                <img
                  src="/images/avatar.png"
                  alt="Student"
                  className="w-24 h-24 rounded-full border-4 border-blue-400 shadow-lg hover:scale-105 transition-transform"
                />
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                    <FaUserGraduate className="text-blue-600 animate-pulse" /> {profile.name}
                  </h2>
                  <p className="text-sm text-gray-600">{profile.parentEmail}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FaSchool className="mr-2" /> {profile.schoolname}
                  </p>
                </div>
              </div>

              {/* 🧾 Additional Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-sm text-gray-700 w-full md:w-auto">
                <p><FaIdBadge className="inline text-blue-500 mr-1" /> <b>ID:</b> {profile.studentId}</p>
                <p><b>Class:</b> {profile.className}</p>
                <p><FaCalendarAlt className="inline text-green-500 mr-1" /> <b>DOB:</b> {new Date(profile.dob).toLocaleDateString()}</p>
                <p><FaTransgender className="inline text-pink-500 mr-1" /> <b>Gender:</b> {profile.gender}</p>
                <p><b>Admission:</b> {new Date(profile.admissionDate).toLocaleDateString()}</p>
                <p><b>UDISE:</b> {profile.udisecode}</p>
                <p><b>Gov ID:</b> {profile.govIdType} - {profile.govIdNumber}</p>
                <p><FaPhoneAlt className="inline mr-1 text-blue-500" /> {profile.mobileNumber}</p>
              </div>
            </div>

            {/* 🏠 Address */}
            <div className="mt-4 text-sm text-gray-600">
              <p><b>Address:</b> {profile.address}, {profile.state} - {profile.pincode}</p>
            </div>
          </div>
        )}

        {/* 📘 Academic Performance */}
        <h3 className="text-2xl font-bold text-blue-800 tracking-wide">📚 Academic Performance</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ⚠️ No marks found */}
          {marks.length === 0 ? (
            <div className="col-span-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow">
              ⚠️ This student has not attended any exams yet.
            </div>
          ) : (
            marks.map((exam, idx) => {
              const totalMarks = exam.marks.reduce((sum, s) => sum + s.totalMark, 0);
              const totalScored = exam.marks.reduce((sum, s) => sum + s.mark, 0);
              const overallPercentage = Math.round((totalScored / totalMarks) * 100);

              return (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-t-4 border-blue-500 hover:shadow-2xl transition-all"
                >
                  <h4 className="text-lg font-bold text-indigo-700 mb-1">{exam.examName}</h4>
                  <p className="text-xs text-gray-500 mb-3">📅 Exam Date: {exam.examDate}</p>

                  {/* 📄 Subjects Table */}
                  <table className="w-full text-sm mb-3">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th>Subject</th>
                        <th>Mark</th>
                        <th>Total</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.marks.map((subject, i) => (
                        <tr key={i} className="text-gray-700 border-b hover:bg-blue-50">
                          <td className="py-1 capitalize">{subject.subject}</td>
                          <td className="py-1">{subject.mark}</td>
                          <td className="py-1">{subject.totalMark}</td>
                          <td className="py-1">
                            <span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold bg-gradient-to-tr from-green-400 to-green-600">
                              {subject.grade || getGrade(subject.mark, subject.totalMark)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 🧮 Total Summary */}
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    🎯 Total Score:{" "}
                    <span className="text-blue-700 font-semibold">
                      {totalScored} / {totalMarks}
                    </span>{" "}
                    ({overallPercentage}%)
                  </div>

                  {/* 📊 Progress Bar */}
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        overallPercentage >= 85
                          ? "bg-green-500"
                          : overallPercentage >= 60
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${overallPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}
