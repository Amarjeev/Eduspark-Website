import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showError } from '../../../utils/toast';
import Loading from '../../loading_ui/Loading';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import PageWrapper from '../../../PageWrapper';

const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Timetable({ className }) {
  const [loading, setLoading] = useState(false);
  const [timetableData, setTimetableData] = useState({});
  const [days, setDays] = useState(defaultDays);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BaseUrl}admin/timetable/all/parent/${className}`, {
          withCredentials: true,
        });

        const timetableArray = response.data;

        // Group by className
        const grouped = timetableArray.reduce((acc, item) => {
          const classKey = item.className || "Unknown";
          if (!acc[classKey]) {
            acc[classKey] = [];
          }
          acc[classKey].push(item);
          return acc;
        }, {});
        setTimetableData(grouped);

        // Get unique days from data
        const allDays = new Set();
        timetableArray.forEach((entry) => {
          if (entry.day) {
            allDays.add(entry.day);
          }
        });
        setDays(Array.from(allDays));

      } catch (error) {
        showError("Failed to load timetable data. Please try again.");
      } finally {
        setLoading(false);
      }
    };


      fetchTimetable();
  }, []);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="h-screen flex flex-col  bg-zinc-50 text-black">

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 mt-3">
        <div className="max-w-6xl mx-auto">
          {Object.keys(timetableData).length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm sm:text-base">
              📭 No timetable data available.
            </div>
          ) : (
            Object.entries(timetableData).map(([className, entries]) => (
              <div key={className} className="mb-10">
                <h2 className="text-xl font-semibold text-black mb-4">
                  🎓 Class: {className}
                </h2>

                {/* Desktop View */}
                <div className="hidden sm:block overflow-x-auto rounded-xl shadow-lg border border-yellow-500 bg-gradient-to-br from-gray-900 to-black">
                  <table className="w-full text-sm sm:text-base text-white">
                    <thead className="bg-yellow-600 text-black">
                      <tr>
                        <th className="p-3 border border-yellow-500">⏰ Time</th>
                        <th className="p-3 border border-yellow-500">📘 Subject</th>
                        <th className="p-3 border border-yellow-500">👨‍🏫 Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {days.map(day => {
                        const dayEntries = entries.filter(e => e.day === day);
                        if (dayEntries.length === 0) return null;

                        return (
                          <React.Fragment key={day}>
                            <tr className="bg-gray-800">
                              <td colSpan={5} className="font-semibold p-2 text-yellow-400 text-left">
                                📅 {day}
                              </td>
                            </tr>
                            {dayEntries.map(t => (
                              <tr key={t._id || `${t.day}-${t.time}`} className=" bg-zinc-50 transition text-black">
                                <td className="p-2 border border-black">{t.time}</td>
                                <td className="p-2 border border-black">{t.subject}</td>
                                <td className="p-2 border border-black">{t.teacherName || '—'}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden block space-y-4 mt-6">
                  {days.map(day => {
                    const dayEntries = entries.filter(e => e.day === day);
                    if (dayEntries.length === 0) return null;

                    return (
                      <div key={day}>
                        <h3 className="text-lg font-semibold text-black mb-2">📅 {day}</h3>
                        {dayEntries.map(t => (
                          <div
                            key={t._id || `${t.day}-${t.time}`}
                            className="bg-zinc-50 p-4 rounded-lg border border-yellow-500 shadow-md"
                          >
                            <p><span className="border-black">⏰ Time :</span> {t.time}</p>
                            <p><span className="border-black">📘 Subject :</span> {t.subject}</p>
                            <p><span className="border-black">👨‍🏫 Teacher :</span> {t.teacherName || '—'}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default Timetable;
