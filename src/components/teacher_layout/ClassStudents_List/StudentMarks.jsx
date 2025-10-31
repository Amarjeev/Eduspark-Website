import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from "../../../utils/toast";
import PageWrapper from '../../../PageWrapper';

function StudentMarks({ studentId }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [marksData, setMarksData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const handleSubmitFilter = async () => {
    try {
      const response = await axios.get(`${BaseUrl}student/Mark/teacher`, {
        params: { studentId, selectedDate },
        withCredentials: true,
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        setMarksData(response.data);
        setError('');
      } else {
        setMarksData([]);
        setError('No marks data found for the selected date.');
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
    }
  };

  return (
    <PageWrapper>
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md h-full text-black">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-black">
        🎯 Student Marks
      </h2>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="w-full md:w-1/2">
          <label className="block font-semibold text-gray-700 mb-1">
            Filter by Exam Date:
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmitFilter}
          disabled={!selectedDate}
          className={`w-full md:w-auto font-semibold px-5 py-2 rounded-lg shadow transition duration-200 ${
            selectedDate
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          🔍 Submit
        </button>
      </div>

      {/* Table or Error Message */}
      <div className="overflow-x-auto border rounded-lg shadow-sm scrollbar-thin scrollbar-thumb-gray-300">
        {marksData.length > 0 ? (
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="border px-4 py-3 text-left whitespace-nowrap">Subject</th>
                <th className="border px-4 py-3 text-left whitespace-nowrap">Marks</th>
                <th className="border px-4 py-3 text-left whitespace-nowrap">Total</th>
                <th className="border px-4 py-3 text-left whitespace-nowrap">Grade</th>
                <th className="border px-4 py-3 text-left whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis">Exam Name</th>
                <th className="border px-4 py-3 text-left whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">Exam Date</th>
              </tr>
            </thead>
            <tbody>
              {marksData.map((exam, index) =>
                exam.marks.map((mark, i) => (
                  <tr key={`${index}-${i}`} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 whitespace-nowrap">{mark.subject}</td>
                    <td className="border px-4 py-2">{mark.mark}</td>
                    <td className="border px-4 py-2">{mark.totalMark}</td>
                    <td className="border px-4 py-2">{mark.grade}</td>
                    <td className="border px-4 py-2 font-medium max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {exam.examName}
                    </td>
                    <td className="border px-4 py-2 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {exam.examDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          error && (
            <div className="p-6 text-center text-red-600 font-medium">{error}</div>
          )
        )}
      </div>
      </div>
      </PageWrapper>
  );
}

export default StudentMarks;
