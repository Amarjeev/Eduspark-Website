import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from '../../../utils/toast';
import PageWrapper from '../../../PageWrapper';

function StudentExamMarks({ studentId }) {
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
      const response = await axios.get(`${BaseUrl}student/Mark/student`, {
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
      <div className="bg-black p-4 md:p-6 rounded-xl shadow-md min-h-[80vh] text-white">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-2 mt-15">
          🎯 Student Marks
        </h2>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="w-full md:w-1/2">
            <label className="block font-medium text-yellow-300 mb-1">
              Filter by Exam Date:
            </label>
            <input
              type="date"
              className="w-full border border-yellow-500 bg-white text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmitFilter}
            disabled={!selectedDate}
            className={`w-full md:w-auto font-semibold px-5 py-2 rounded-lg shadow transition duration-200 ${
              selectedDate
                ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                : 'bg-gray-600 text-white cursor-not-allowed'
            }`}
          >
            🔍 Submit
          </button>
        </div>

        {/* Marks Table */}
        <div className="overflow-x-auto border border-yellow-500 rounded-lg shadow-inner scrollbar-thin scrollbar-thumb-yellow-500">
          {marksData.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="bg-yellow-400 text-black">
                <tr>
                  <th className="border px-4 py-3 text-left">Subject</th>
                  <th className="border px-4 py-3 text-left">Marks</th>
                  <th className="border px-4 py-3 text-left">Total</th>
                  <th className="border px-4 py-3 text-left">Grade</th>
                  <th className="border px-4 py-3 text-left">Exam Name</th>
                  <th className="border px-4 py-3 text-left">Exam Date</th>
                </tr>
              </thead>
              <tbody>
                {marksData.map((exam, index) =>
                  exam.marks.map((mark, i) => (
                    <tr
                      key={`${index}-${i}`}
                      className="hover:bg-gray-800 transition"
                    >
                      <td className="border px-4 py-2 whitespace-nowrap">{mark.subject}</td>
                      <td className="border px-4 py-2">{mark.mark}</td>
                      <td className="border px-4 py-2">{mark.totalMark}</td>
                      <td className="border px-4 py-2">{mark.grade}</td>
                      <td className="border px-4 py-2 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
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
              <div className="p-6 text-center text-red-400 font-semibold">
                {error}
              </div>
            )
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default StudentExamMarks;
