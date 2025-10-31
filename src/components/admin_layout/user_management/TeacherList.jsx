import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import { useNavigate } from 'react-router-dom';
import PageWrapper from "../../../PageWrapper";


function TeacherList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const teacherData = await axios.get(`${BaseUrl}admin/teachers/All`, {
          withCredentials: true,
        });
        setTeachers(teacherData.data);
      } catch (error) {
        showError("Failed to load teacher data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchTerm.trim().toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(searchLower) ||
      teacher.email?.toLowerCase().includes(searchLower) ||
      teacher.employId?.toLowerCase().includes(searchLower) ||
      teacher.department?.toLowerCase().includes(searchLower) ||
      teacher.subject?.toLowerCase().includes(searchLower) ||
      teacher.phonenumber?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return <Loading />; // ✅ Fixed loading return

  return (
    <PageWrapper>
    <div className="p-4 min-h-screen bg-white">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Management</h1>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
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
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border rounded-lg shadow overflow-hidden bg-white">
        <div className="overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Employ ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Subject
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      <div className="flex items-center">
                        <img
                          src={teacher.profilePicUrl || "/images/avatar.png"}
                          alt="Teacher"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium">{teacher.name}</div>
                          <div className="text-xs text-black">
                            {teacher.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {teacher.employId}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {teacher.subject}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {teacher.phonenumber}
                    </td>
                    <td className="px-4 py-2 text-sm">
                    <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium
                    ${
                      teacher.status === "blocked"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-400 text-yello-800"
                      }`}
                    >
                    {teacher.status || "unknown"}
                    </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-blue-600">
                          <button
                              onClick={() =>navigate(`/admin/teacher-profile/edit/${teacher._id}`)}
                              className="hover:underline"
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
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Teacher list not available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default TeacherList;
