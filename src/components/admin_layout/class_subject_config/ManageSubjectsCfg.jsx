import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import axios from 'axios';
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from '../../loading_ui/Loading';
import PageWrapper from '../../../PageWrapper';

function ManageSubjectsCfg() {
  // 📝 Input field state for subject entry
  const [subject, setSubject] = useState('');

  // 📋 Local waiting list for subjects before saving
  const [waitingList, setWaitingList] = useState([]);

  // ✏️ Index of item currently being edited in waiting list
  const [editIndex, setEditIndex] = useState(null);

  // ✏️ Editing fetched/saved subject list
  const [savedEditIndex, setSavedEditIndex] = useState(null);
  const [savedEditValue, setSavedEditValue] = useState('');

  // 📦 Fetched subjects from database
  const [newSubject, setNewSubject] = useState([]);

  // ⚠️ Duplicate subjects state
  const [duplicateSubjects, setDuplicateSubjects] = useState([]);

  // 🆔 Currently editing subject ID
  const [editingId, setEditingId] = useState(null);

  // ✅ State to track delete status for refresh
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // ⏳ Global loading indicator
  const [loading, setLoading] = useState(false);

  // 📡 Fetch subjects from backend on load or edit/delete change
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BaseUrl}admin/subjects/get`, {
          withCredentials: true,
        });
        const subjects = response.data.data;
        setNewSubject(subjects); // ✅ Store fetched subjects
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError("Something went wrong. Please try again.");
      }
      setDeleteSuccess(false); // 🔄 Reset delete flag after refresh
    };
    fetchSubjects();
  }, [savedEditIndex, deleteSuccess]);

  // ➕ Add or update a subject in the waiting list
  const handleAddOrUpdate = () => {
    if (!subject.trim()) return;
    const updated = [...waitingList];
    if (editIndex !== null) {
      updated[editIndex] = subject.trim(); // ✏️ Update existing item
      setEditIndex(null);
    } else {
      updated.push(subject); // ➕ Add new item
    }
    setWaitingList(updated);
    setSubject(''); // 🧼 Clear input
  };

  // ✏️ Handle edit click for waiting list item
  const handleEdit = (index) => {
    setSubject(waitingList[index]);
    setEditIndex(index);
  };

  // 🗑️ Remove subject from waiting list
  const handleDelete = (index) => {
    setWaitingList(waitingList.filter((_, i) => i !== index));
    if (editIndex === index) {
      setSubject('');
      setEditIndex(null); // 🧼 Clear editing if deleted item is being edited
    }
  };

  // 💾 Save waiting list to backend
  const handleSaveAll = async () => {
    if (waitingList.length === 0) return;

    setSavedEditIndex(null);
    setSavedEditValue('');

    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseUrl}admin/subjects/create`,
        { subjects: waitingList },
        { withCredentials: true }
      );
      if (response.data.status) {
        setSavedEditIndex(true);
        setLoading(false);
        showSuccess('Subjects saved successfully');
        setWaitingList([]); // ✅ Clear list on success
        setDuplicateSubjects([]);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setLoading(false);
        return setDuplicateSubjects(error.response.data.duplicates); // ⚠️ Handle duplicates
      }
      showError('❌ Something went wrong while saving subjects. Please try again.');
    }
  };

  // ✏️ Save edited subject name
  const handleSaveEdit = async (id) => {
    const newNameArray = [savedEditValue]; // 🔁 Convert value to array for backend compatibility

    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseUrl}admin/subjects/create`,
        {
          subjectId: id,           // 🆔 ID of subject to update
          subjects: newNameArray, // 📝 New subject name
          status: 'edit'
        },
        {
          withCredentials: true
        }
      );
      setSavedEditIndex(true);
      setLoading(false);
      if (response.data.status) return showSuccess('Subject updated');
    } catch (error) {
      setLoading(false);
      if (error.status === 409) {
        return showError('❌ This subject already exists. Please choose a different name.');
      }
      showError("Something went wrong. Please try again.");
    }
  };

  // 🗑️ Delete subject by ID
  const handleDeleteSubject = async (id) => {
      const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this subject?");
      if (!confirmDelete) return; 
    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseUrl}admin/subjects/create`,
        {
          subjectId: id,      // 🆔 ID of subject to delete
          status: 'delete'    // ❗ Delete operation
        },
        {
          withCredentials: true
        }
      );
      setDeleteSuccess(true);
      setLoading(false);
      if (response.data.status) {
        showSuccess('🗑️ Subject deleted successfully');
      }
    } catch (error) {
      showError("Something went wrong. Please try again.");
    }
  };

  // ⏳ Show loading indicator while fetching or saving
  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }




  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl grid grid-cols-1 gap-8 mt-10">

        {/* Subject Input Form */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Add / Edit Subject</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter subject (e.g., Math)"
              value={subject}
              maxLength={30}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {subject.length >= 30 && (
              <p className="text-red-400 text-sm mt-1">⚠️ Max 30 characters allowed!</p>
            )}
          </div>
          {duplicateSubjects.length > 0 && (
        <div className='text-red-600'>
           <h1 className="font-semibold">
      ⚠️ The following subject(s) already exist in the system and cannot be added again:
         </h1>
          <p className="mt-2 text-sm text-amber-50">
           {duplicateSubjects.join(", ")}
           </p>
           <p className="mt-2 text-sm">
            Please remove or change them before submitting again.
          </p>
        </div>
         )}

          <div className="flex justify-end gap-4">
            {editIndex !== null && (
              <button
                onClick={() => {
                  setSubject('');
                  setEditIndex(null);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-gray-600 rounded-xl"
              >
                <FiX /> Cancel
              </button>
            )}
            <button
              onClick={handleAddOrUpdate}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 rounded-xl"
            >
              <FiSave /> {editIndex !== null ? 'Update' : 'Add'}
            </button>
          </div>
        </div>

        {/* Waiting List */}
        {waitingList.length > 0 && (
          <div className="bg-gray-800 p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Waiting List</h2>
            <ul className="space-y-3">
              {waitingList.map((item, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-xl">
                  <span>{item}</span>
                  <div className="flex space-x-3">
                    <button onClick={() => handleEdit(index)} className="text-blue-400 hover:text-blue-600">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(index)} className="text-red-400 hover:text-red-600">
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={handleSaveAll}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium"
            >
              Save All
            </button>
          </div>
        )}

        {/* Saved Subjects */}
  <div className="bg-gray-800 p-8 rounded-3xl shadow-xl">
    <h2 className="text-2xl font-bold mb-6">Saved Subjects</h2>
    <div className="overflow-x-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-700 text-left">
        <thead>
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300">#</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Subject</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
       <tbody className="divide-y divide-gray-700">
  {newSubject.length === 0 ? (
    <tr>
      <td colSpan="3" className="px-4 py-4 text-center text-white">
        📭 No saved Subjects data available.
      </td>
    </tr>
  ) : (
    newSubject.map((subj, index) => (
      <tr key={subj._id} className="hover:bg-gray-700 transition-all">
        <td className="px-4 py-3">{index + 1}</td>
        <td className="px-4 py-3">
          {savedEditIndex === index ? (
            <input
              type="text"
              maxLength={30}
              value={savedEditValue}
              onChange={(e) => setSavedEditValue(e.target.value)}
              className="bg-gray-600 text-white px-2 py-1 rounded"
            />
          ) : (
            subj.name
          )}
        </td>
        <td className="px-4 py-3">
          {savedEditIndex === index ? (
            <div className="flex space-x-2">
              <button
                onClick={() => handleSaveEdit(subj._id)}
                className="text-green-400 hover:text-green-600"
              >
                <FiSave />
              </button>
              <button
                onClick={() => {
                  setSavedEditIndex(null);
                  setSavedEditValue('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSavedEditIndex(index);
                  setSavedEditValue(subj.name);
                }}
                className="text-blue-400 hover:text-blue-600"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => handleDeleteSubject(subj._id)}
                className="text-red-400 hover:text-red-600"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
  </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default ManageSubjectsCfg;
