// 📚 Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { Plus, Save } from 'lucide-react';
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import PageWrapper from '../../../PageWrapper';

const CreateTimetable = () => {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem('selectedClass') || '';
  });
  const [loading, setLoading] = useState(true);
  const [subjectList, setSubjectList] = useState([]);

  const [timetableData, setTimetableData] = useState(() => {
    const storedData = localStorage.getItem("timetableData");
    return storedData ? JSON.parse(storedData) : [];
  });

  const [teacherIdWarning, setTeacherIdWarning] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('selectedClass', selectedClass);
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedClass]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("timetableData", JSON.stringify(timetableData));
    }, 300);
    return () => clearTimeout(timeout);
  }, [timetableData]);

  useEffect(() => {
    const fetchClassAndSubjects = async () => {
      try {
        setLoading(true);
        const classListData = await getFromIndexedDB('school-class-List-admin');
        if (classListData) {
          setClassList(classListData)
        }
        const subjectsData = await getFromIndexedDB('school-subjects-List-admin');
        if (subjectsData) {
          setSubjectList(subjectsData)
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError("Something went wrong. Please try again.");
      }
    };
    fetchClassAndSubjects();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    day: '',
    timeFrom: '',
    timeTo: '',
    subject: '',
    teacherName: '',
    teacherId: '',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchTeacherName = async () => {
    try {
      if (formData.teacherId.length === 8) {
        setLoading(true);
        const response = await axios.get(`${BaseUrl}admin/data/teacher/${formData.teacherId}`, { withCredentials: true });
        setFormData(prev => ({ ...prev, teacherName: response.data.name || '' }));
        setTeacherIdWarning('');
        setLoading(false);
      } else {
        setTeacherIdWarning('⚠️ Teacher not found.');
      }
    } catch (error) {
      showError("Something went wrong. Please try again.");
      setTeacherIdWarning(error.response?.data?.warning || "Error fetching teacher name.");
      setLoading(false);
    }
  };

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minuteStr} ${ampm}`;
  };

  const handleSave = () => {
    const { day, timeFrom, timeTo, subject, teacherName, teacherId } = formData;
    if (!selectedClass || !day || !timeFrom || !timeTo || !subject || !teacherName || !teacherId) {
      alert('🚫 Please fill in all fields');
      return;
    }

    const time = `${formatTime(timeFrom)} to ${formatTime(timeTo)}`;

    if (formatTime(timeFrom) === formatTime(timeTo)) {
      alert("⛔ 'From' and 'To' times cannot be the same.");
      return;
    }

    if (editingEntry) {
      setTimetableData(prev =>
        prev.map(entry =>
          entry.id === editingEntry.id
            ? { ...entry, day, time, subject, teacherName, teacherId, className: selectedClass }
            : entry
        )
      );
    } else {
      const newEntry = {
        id: Date.now().toString(),
        day,
        time,
        subject,
        teacherName,
        teacherId,
        className: selectedClass
      };
      setTimetableData(prev => [...prev, newEntry]);
    }
    resetForm();
  };

  const handleDelete = (id) => {
    setTimetableData(prev => prev.filter(entry => entry.id !== id));
  };

  const handleEdit = (entry) => {
    const [from, to] = entry.time.split(' to ').map(t => {
      const [timeStr, period] = t.trim().split(' ');
      let [hour, minute] = timeStr.split(':').map(Number);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    setEditingEntry(entry);
    setFormData({
      day: entry.day,
      timeFrom: from,
      timeTo: to,
      subject: entry.subject,
      teacherName: entry.teacherName,
      teacherId: entry.teacherId
    });
    setSelectedClass(entry.className);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      day: '',
      timeFrom: '',
      timeTo: '',
      subject: '',
      teacherName: '',
      teacherId: ''
    });
    setEditingEntry(null);
    setIsModalOpen(false);
    setTeacherIdWarning('');
  };

  const getEntriesForDay = (day) => {
    return timetableData.filter(entry => entry.day === day && entry.className === selectedClass);
  };

  const saveFinalTimetable = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${BaseUrl}admin/timetable/save`,
        { entries: timetableData },
        { withCredentials: true }
      );
      setTimetableData([]);
      setSelectedClass('');
      localStorage.removeItem("timetableData");
      localStorage.removeItem("selectedClass");
      setLoading(false)
      showSuccess("Timetable saved successfully!");
    } catch (error) {
      setLoading(false)
       showError(" Failed to save timetable. Please try again.");
    }
  };

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 text-black">
      <div className="max-w-4xl w-full mx-auto px-2 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4">🗓️ Timetable Creator</h1>

        <div className="mb-6">
          <select
            className="w-full sm:max-w-xs border border-gray-300 p-2 rounded-md"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={timetableData.length > 0}
          >
            <option value="">Select Class</option>
            {classList.map((cls, index) => (
              <option key={index} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Timetable Entry
          </button>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-2 sm:px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md mx-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{editingEntry ? 'Edit Entry' : 'Add Entry'}</h2>
              <div className="space-y-3">
                <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Day</option>
                  {days.map(day => <option key={day} value={day}>{day}</option>)}
                </select>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Time Duration <span className="text-red-500">*</span></label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-col w-full">
                      <label className="text-xs text-gray-500 mb-1">Start Time</label>
                      <input type="time" value={formData.timeFrom} onChange={e => setFormData({ ...formData, timeFrom: e.target.value })} className="p-2 border rounded w-full" />
                    </div>
                    <div className="flex flex-col w-full">
                      <label className="text-xs text-gray-500 mb-1">End Time</label>
                      <input type="time" value={formData.timeTo} onChange={e => setFormData({ ...formData, timeTo: e.target.value })} className="p-2 border rounded w-full" />
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="Teacher ID (8 digits)"
                    value={formData.teacherId}
                    onBlur={fetchTeacherName}
                    onChange={e => {
                      const value = e.target.value;
                      if (/^\d{0,8}$/.test(value)) {
                        setFormData({ ...formData, teacherId: value });
                      }
                    }}
                    className={`w-full p-2 border rounded ${teacherIdWarning ? 'border-red-500' : ''}`}
                  />
                  {teacherIdWarning && <p className="text-red-600 text-sm mt-1">{teacherIdWarning}</p>}
                </div>

                <input placeholder="Teacher Name" value={formData.teacherName} readOnly className="w-full p-2 border rounded" />

                <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full p-2 border rounded">
                  <option value="">Select Subject</option>
                  {subjectList.map((sub, index) => (
                    <option key={index} value={sub}>{sub}</option>
                  ))}
                </select>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button onClick={handleSave} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center">
                    <Save className="mr-2 h-4 w-4" /> Save
                  </button>
                  <button onClick={resetForm} className="w-full sm:w-auto border px-4 py-2 rounded-md">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timetable Table */}
        {selectedClass && (
          <div className="bg-white shadow-md rounded-md p-2 sm:p-4 overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">📘 Timetable for {selectedClass}</h2>

            <div className="mb-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all timetable entries and selected class?")) {
                    setTimetableData([]);
                    setSelectedClass('');
                    localStorage.removeItem("timetableData");
                    localStorage.removeItem("selectedClass");
                  }
                }}
              >
                🧹 Clear All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border min-w-[640px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Day</th>
                    <th className="p-2 border">Time</th>
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Teacher</th>
                    <th className="p-2 border">Teacher ID</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => {
                    const entries = getEntriesForDay(day);
                    if (entries.length === 0) return null;
                    return (
                      <React.Fragment key={day}>
                        <tr className="bg-gray-200">
                          <td colSpan={6} className="font-semibold p-2">{day}</td>
                        </tr>
                        {entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="p-2 border">{entry.day}</td>
                            <td className="p-2 border">{entry.time}</td>
                            <td className="p-2 border">{entry.subject}</td>
                            <td className="p-2 border">{entry.teacherName}</td>
                            <td className="p-2 border">{entry.teacherId}</td>
                            <td className="p-2 border">
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {entries.length >= 5 && (
                          <tr>
                            <td colSpan={6} className="text-yellow-700 text-right italic p-2">⚠️ {day} has {entries.length} periods!</td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {timetableData.length > 0 && (
              <div className="mt-4 text-center sm:text-right">
                <button onClick={saveFinalTimetable} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                  💾 Save Timetable
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      </PageWrapper>
  );
};

export default CreateTimetable;