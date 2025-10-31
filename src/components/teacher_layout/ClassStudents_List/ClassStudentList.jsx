// 📦 Importing React core, hooks & utilities
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from "../../../utils/toast";
import Loading from '../../loading_ui/Loading';
import { useNavigate } from 'react-router-dom';
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import PageWrapper from '../../../PageWrapper';

function ClassStudentList() {
  // 🚀 State & Navigation setup
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem('selectedClass') || '');
  const [modalOpen, setModalOpen] = useState(false); // 💬 Controls modal visibility
  const [searchResults, setSearchResults] = useState([]); // 🔍 Filtered students on search
  const [isFocused, setIsFocused] = useState(false); // 🧠 Tracks input focus state
  const [finalClassOptions, setFinalClassOptions] = useState([]); // 📚 List of class options
  const [loading, setLoading] = useState(false); // ⏳ Global loading state
  const [allStudents, setAllStudents] = useState([]); // 👨‍🎓 Full list of students by class

  // 🌐 Fetch class and teacher details on first render
  
useEffect(() => {
  (async () => {
    const classListData = await getFromIndexedDB('school-class-List-teacher');
    if (classListData ) {
      setFinalClassOptions(classListData)
    }
  })();
}, []);


  // 📋 Fetch student list when class is selected/changed
  useEffect(() => {
    const fetchStudentList = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BaseUrl}student/getClassStudents/${selectedClass}`, {
          withCredentials: true,
        });
        setAllStudents(res.data || []);
      } catch (error) {
        setAllStudents([]);
        showError('Unable to fetch students for this class. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedClass) {
      fetchStudentList();
    } else {
      setAllStudents([]);
    }
  }, [selectedClass]);
  // 🔍 Local search logic based on student name, ID or class
  const handleSearch = () => {
    const filtered = allStudents.filter((student) => {
      const term = searchTerm.toLowerCase();
      const matchName = student.name?.toLowerCase().includes(term);
      const matchId = student.studentId?.toLowerCase().includes(term);
      const matchClass = student.class?.toLowerCase().includes(term);
      return matchName || matchId || matchClass;
    });

    setSearchResults(filtered); // 💾 Save results
    setModalOpen(true);         // 📤 Show modal
  };

  // 🌀 Display loading UI if data is fetching
  if (loading) return <Loading />;

  return (
  <PageWrapper>
  <section className="bg-gray-100 py-10 px-4 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-black mb-8">
        📚 Class Student List
      </h2>

      {/* 🔍 Search + Filter Row */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8">
        {/* Search Input */}
        <div className="relative w-full sm:w-auto transition-all duration-300">
          <input
            type="text"
            disabled={allStudents.length === 0}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (searchTerm === '') setIsFocused(false);
            }}
            className={`bg-white h-10 px-4 pr-10 rounded-full text-sm text-black border border-gray-400 focus:outline-none w-full sm:w-auto transition-all duration-300 ease-in-out ${
              isFocused || searchTerm ? 'sm:w-64' : 'sm:w-12'
            }`}
            placeholder={isFocused || searchTerm ? '🔍 Search by name or ID' : ''}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
            </svg>
          </button>
        </div>

        {/* Class Selector */}
        <select
          value={selectedClass}
          onChange={(e) => {
            const selected = e.target.value;
            setSelectedClass(selected);
            localStorage.setItem("selectedClass", selected);
          }}
          className="w-full sm:w-[120px] px-3 py-2 border border-gray-400 rounded text-black bg-white"
        >
          <option value="">Select Class</option>
          {finalClassOptions.map((cls, idx) => (
            <option key={idx} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* 🧑‍🎓 Student List Table with Scrollbar */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-y-auto max-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200 text-gray-700 text-sm sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left">Profile</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Student ID</th>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3 text-left">Gender</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allStudents.length > 0 ? (
                allStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <img
                        src={student.profileImage || '/images/avatar.png'}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.studentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.className}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.gender}</td>
                    <td className="px-4 py-3">
                      <button
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-full transition"
                        onClick={() => {
                          localStorage.removeItem('selectedClass');
                                navigate(`/student/details`, {
                              state: {
                                  studentId: student.studentId,
                                  studentName: student.name,
                                  studentClass: student.className,
                            }
                          });
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔍 Modal for Search Results */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-teal-700">🔍 Search Results</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-red-600 text-2xl hover:scale-110 transition-transform"
                title="Close"
              >
                ✖
              </button>
            </div>

            {/* Modal Table */}
            {searchResults.length > 0 ? (
              <div className="overflow-y-auto max-h-[500px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 text-gray-700 text-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left">Profile</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Student ID</th>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left">Gender</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {searchResults.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <img
                            src={student.profileImage || '/images/avatar.png'}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.studentId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.className}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{student.gender}</td>
                        <td className="px-4 py-3">
                          <button
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-full transition"
                            onClick={() => {
                              localStorage.removeItem('selectedClass');
                                  navigate(`/student/details`, {
                              state: {
                                  studentId: student.studentId,
                                  studentName: student.name,
                                  studentClass: student.className,
                            }
                          });
                            }}
                          >
                             View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 text-lg mt-4">
                😔 No students found matching your search.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
      </section>
       </PageWrapper>
);

}

export default ClassStudentList;
