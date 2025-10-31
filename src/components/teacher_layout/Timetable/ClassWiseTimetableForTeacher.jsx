import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { useDispatch, useSelector } from 'react-redux';
import { setTimetable } from '../../../redux/slices/useSchoolClassData';
import Loading from '../../loading_ui/Loading';
import { getFromIndexedDB} from '../../../utils/indexedDBUtils';
import PageWrapper from '../../../PageWrapper';

function ClassWiseTimetableForTeacher() {
  const dispatch = useDispatch();

  // 🎯 State Declarations
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false); // ⏳ Loading indicator
  const [finalClassOptions, setFinalClassOptions] = useState([]); // 📚 Classes for dropdown
  const [hide, sethide] = useState(true); // 👁️ Control timetable visibility
  const [localTimetable, setLocalTimetable] = useState(null); // 🗓️ Local timetable data

  const classWiseTimetables = useSelector((state) => state.commonData .classWiseTimetables); // 📦 Redux store
  const allClassNames = Object.keys(classWiseTimetables || {}); // 📘 All class names

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    (async () => {
         const classListData = await getFromIndexedDB('school-class-List-teacher');
         if (classListData ) {
           setFinalClassOptions(classListData)
         }
    })()
  },[])

  // 📡 Fetch timetable when selectedClass changes
  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BaseUrl}teacher/timetable/${selectedClass}`, {
          withCredentials: true,
        });

        dispatch(setTimetable({ className: selectedClass, data: response.data }));
        setLoading(false);
      } catch (error) {
        if (error.response?.data?.emptyData === true) {
          return sethide(false);
        }
          showError("Unable to fetch timetable. Please try again.");
      }
    };

    if (selectedClass && !allClassNames.includes(selectedClass)) {
      fetchTimetable();
    }
  }, [selectedClass]);

  // 🔁 Update localTimetable when Redux or selectedClass changes
  useEffect(() => {
    const updateTimetable = () => {
      setLoading(true);
      const selectedClassEntries = classWiseTimetables[selectedClass] || [];
      setLocalTimetable(selectedClassEntries);
      sethide(true);
      setLoading(false);
    };

    if (selectedClass) {
      updateTimetable();
    }
  }, [selectedClass, classWiseTimetables]);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6 md:p-8">
    <div className="max-w-6xl mx-auto">
      {/* 🧾 Page Heading */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center underline decoration-blue-600 decoration-4 underline-offset-2">
        Class Timetable
      </h1>

      {/* 🎯 Class Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 text-black">
        <label className="text-black font-medium">
          Select Class:
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full sm:w-60 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-black bg-white"
        >
          <option className='text-black' value="">-- Choose a class --</option>
          {finalClassOptions.map((cls, i) => (
            <option key={i} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* 🏷️ Selected Class Display */}
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
        Selected Class: <span className="font-bold">{selectedClass}</span>
      </h2>

      {/* 📋 Timetable Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md ring-1 ring-gray-200">
        <table className="min-w-[700px] w-full border border-gray-200 text-sm sm:text-sm text-[13px]">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="border px-2 sm:px-4 py-3 text-left text-gray-700 font-semibold bg-gray-200">
                Time
              </th>
              {daysOfWeek.map((day) => (
                <th
                  key={day}
                  className="border px-2 sm:px-4 py-3 text-center text-gray-700 font-semibold bg-gray-200"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          {/* 🧾 Timetable Body */}
          {selectedClass && hide && (
            <tbody>
              {Array.isArray(localTimetable) &&
                [...new Set(localTimetable.map((item) => item.time))].map((timeSlot) => (
                  <tr key={timeSlot} className="even:bg-gray-50">
                    <td className="border px-2 sm:px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {timeSlot}
                    </td>
                    {daysOfWeek.map((day) => {
                      const entry = localTimetable.find(
                        (item) => item.time === timeSlot && item.day === day
                      );
                      return (
                        <td
                          key={`${timeSlot}-${day}`}
                          className="border px-2 sm:px-4 py-3 text-center text-gray-800"
                        >
                          {entry ? (
                            <>
                              <div className="font-semibold">{entry.subject}</div>
                              <div className="text-xs text-gray-600">{entry.teacherName}</div>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          )}

          {/* 🚫 No Timetable Found Message */}
          {selectedClass && localTimetable && localTimetable.length === 0 && (
            <tr>
              <td colSpan={daysOfWeek.length + 1}>
                <h1 className="text-lg sm:text-2xl font-semibold text-red-600 text-center mt-10 mb-10">
                  🚫 This class timetable was not found
                </h1>
              </td>
            </tr>
          )}
        </table>
      </div>
    </div>
      </div>
     </PageWrapper>
);

}

export default ClassWiseTimetableForTeacher;