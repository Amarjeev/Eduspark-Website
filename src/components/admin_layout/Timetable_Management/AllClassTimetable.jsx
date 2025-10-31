// ✅ React & Hooks
import React, { useState, useEffect } from 'react';
import { getFromIndexedDB} from '../../../utils/indexedDBUtils';

// 🌐 API + Utils
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";

// ⏳ Loading Component
import Loading from "../../loading_ui/Loading";
import PageWrapper from '../../../PageWrapper';

// 🗓️ Days of the week
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function AllClassTimetable() {
  const [timetableData, setTimetableData] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedEntry, setEditedEntry] = useState([]);
  const [classLists, setClassLists] = useState([]);
  const [subjectLists, setSubjectLists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);

          const classListData = await getFromIndexedDB('school-class-List-admin');
        if (classListData) {
       setClassLists(classListData)
        }
            const subjectsData = await getFromIndexedDB('school-subjects-List-admin');
    if (subjectsData ) {
      setSubjectLists(subjectsData)
    }

        setLoading(false);
      } catch (error) {
        showError("Something went wrong. Please try again.");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (selectedClass) {
        try {
          const response = await axios.get(`${BaseUrl}admin/timetable/all/admin/${selectedClass}`, {
            withCredentials: true,
          });

          const enrichedData = response.data.map((item, index) => ({
            ...item,
            className: item.className || selectedClass,
            _id: item._id || `${selectedClass}_${index}`,
          }));

          setTimetableData(enrichedData);
        } catch (error) {
          showError("Unable to load timetable. Please try again.");
        }
      }
    };
    fetchTimetable();
  }, [selectedClass, loading]);

  const handleEdit = (entry) => {
    setEditId(entry._id);
    setEditedEntry({ ...entry });
  };

  const handleChange = (field, value) => {
    setEditedEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (id) => {
    setLoading(true);
    try {
      setTimetableData(prev =>
        prev.map(item => (item._id === id ? { ...editedEntry, _id: id } : item))
      );

      await axios.put(
        `${BaseUrl}admin/timetable/edit`,
        { entries: [editedEntry] },
        { withCredentials: true }
      );

      setLoading(false);
      showSuccess("Timetable updated successfully!");
      setEditId(null);
      setEditedEntry({});
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.details?.subject) {
        alert(error.response.data.details.subject);
      } else {
        showError("Failed to save changes. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this timetable entry?");
      if (!confirmDelete) return;

      setTimetableData(prev => prev.filter(item => item._id !== id));

      await axios.delete(
        `${BaseUrl}admin/timetable/delete/${id}`,
        { withCredentials: true }
      );

      showSuccess('deleted successfully!');
    } catch (error) {
      showError("❌ Failed to delete timetable entry. Please try again.");
    }
  };

  const groupedByClass = timetableData.reduce((acc, entry) => {
    if (!acc[entry.className]) acc[entry.className] = [];
    acc[entry.className].push(entry);
    return acc;
  }, {});

  const filteredData = selectedClass ? { [selectedClass]: groupedByClass[selectedClass] || [] } : groupedByClass;

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 overflow-auto text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6">📚 All Classes Timetable</h1>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="mb-6 p-2 rounded-md border border-gray-300 w-full sm:w-auto text-black"
        >
          <option value="">Select Class to Filter</option>
        {classLists.map((cls, index) => (
    <option key={index} value={cls}>
      {cls}
    </option>
  ))}
        </select>

        {/* 📭 Show if no data */}
        {Object.keys(filteredData).length === 0 ||
         Object.values(filteredData).every(entries => entries.length === 0) ? (
          <div className="text-center text-gray-500 mt-10 text-sm sm:text-base">
            📭 Timetable data is empty for the selected class.
          </div>
        ) : (
          Object.entries(filteredData).map(([cls, entries]) => (
            <div key={cls} className="mb-10">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-4">🎓 Class: {cls}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full border text-sm shadow bg-white rounded-md">
                  <thead className="bg-indigo-100 text-gray-800">
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
                      const dayEntries = entries.filter(e => e.day === day);
                      if (dayEntries.length === 0) return null;

                      return (
                        <React.Fragment key={day}>
                          <tr className="bg-gray-200">
                            <td colSpan={6} className="font-semibold p-2">📅 {day}</td>
                          </tr>
                          {dayEntries.map(t => (
                            <tr key={t._id} className="hover:bg-gray-50">
                              <td className="p-2 border">{t.day}</td>
                              <td className="p-2 border">
                                {editId === t._id ? (
                                  <input value={editedEntry.time} onChange={(e) => handleChange('time', e.target.value)} className="p-1 border rounded w-full" />
                                ) : t.time}
                              </td>
                              <td className="p-2 border">
                                {editId === t._id ? (
                                  <select
                                    value={editedEntry.subject || ''}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                    className="p-1 border rounded w-full"
                                  >
                                    <option value="">{editedEntry.subject}</option>
                                    {subjectLists.map((subject) => (
                                      <option key={subject._id || subject} value={subject.name || subject}>
                                        {subject.name || subject}
                                      </option>
                                    ))}
                                  </select>
                                ) : t.subject}
                              </td>
                              <td className="p-2 border">
                                {editId === t._id ? (
                                  <input readOnly value={editedEntry.teacherName} onChange={(e) => handleChange('teacherName', e.target.value)} className="p-1 border rounded w-full" />
                                ) : t.teacherName}
                              </td>
                              <td className="p-2 border">
                                {editId === t._id ? (
                                  <input value={editedEntry.teacherId} onChange={(e) => handleChange('teacherId', e.target.value)} className="p-1 border rounded w-full" />
                                ) : t.teacherId}
                              </td>
                              <td className="p-2 border">
                                {editId === t._id ? (
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => handleSaveEdit(t._id)} className="text-green-600 font-medium">💾 Save</button>
                                    <button onClick={() => { setEditId(null); setEditedEntry({}); }} className="text-gray-600">✖️ Cancel</button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => handleEdit(t)} className="text-blue-600 hover:underline">✏️ Edit</button>
                                    <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:underline">🗑️ Delete</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
      </PageWrapper>
  );
}

export default AllClassTimetable;
