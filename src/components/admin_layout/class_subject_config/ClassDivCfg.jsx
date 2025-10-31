// ClassDivCfgEditor.jsx
// React component for managing class & division input, editing, displaying, and saving to backend

import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiX } from 'react-icons/fi'; // Feather icons
import axios from 'axios'; // For HTTP requests
import { BaseUrl } from "../../../BaseUrl/BaseUrl"; // Base URL for API
import { showSuccess, showError } from "../../../utils/toast"; // Toast notifications
import PageWrapper from '../../../PageWrapper';

const ClassDivCfg = () => {
  // ===============================
  // Input Form States
  // ===============================
  const [className, setClassName] = useState('');            // Input value for class
  const [division, setDivision] = useState('');              // Input value for division

  // ===============================
  // Application States
  // ===============================
  const [classes, setClasses] = useState([]);                // Stores unsaved class-division entries
  const [savedClasses, setSavedClasses] = useState([]);      // Stores class-division data fetched from backend
  const [editIndex, setEditIndex] = useState(null);          // Tracks currently edited local entry
  const [bthide, setBtHide] = useState(false);               // Controls "Save All" button visibility
  const [duplError, setDuplError] = useState('');            // Stores duplicate error response from backend
  const [editSavedId, setEditSavedId] = useState(null);      // Stores ID of saved entry being edited
  const [activeEditId, setActiveEditId] = useState(false);   // Boolean flag to toggle saved list editing UI
  const [newClassName, setNewClassName] = useState('');      // Input value for editing saved class name
  const [newDivisionName, setNewDivisionName] = useState('');// Input value for editing saved division
  const [currentID, setcurrentID] = useState(null);          // ID reference for saved entry being modified

  // ===============================
  // Fetch and prepare saved data from backend
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔄 Fetch saved class-division data
        const classDivisionData = await axios.get(`${BaseUrl}admin/get-class-divisions`, {
          withCredentials: true,
        });

        const classNameArray = classDivisionData.data.className || [];

        // 🔍 Split '1st-A' format into class and division objects
        const splitClassDivisions = classNameArray.map(item => {
          const [className, division] = item.value.split('-');
          return {
            _id: item._id,
            className: className.trim(),
            division: division.trim(),
          };
        });

        // 🔤 Alphabetically sort by class and division
        const sortedClassDivisions = splitClassDivisions.sort((a, b) => {
          const classCompare = a.className.localeCompare(b.className);
          if (classCompare !== 0) return classCompare;
          return a.division.localeCompare(b.division);
        });

        // ✅ Save organized list to state
        setSavedClasses(sortedClassDivisions);
      } catch (error) {
        showError("Something went wrong. Please try again.");
      }
    };

    fetchData();

    // 👁️ Show or hide "Save All" button depending on unsaved entries
    setBtHide(classes.length > 0);

  }, [classes, activeEditId]);

  // ===============================
  // Add or update an entry in local class-division list
  // ===============================
  const handleSave = async () => {
    if (className.length >= 20 || division.length >= 15) return; // 🔒 Validation: length check
    if (!className || !division) return;                         // 🔒 Validation: non-empty check

    const updated = [...classes];

    if (editIndex !== null) {
      // ✏️ Update existing item
      updated[editIndex] = { className, division };
      setEditIndex(null);
    } else {
      // ➕ Add new entry
      updated.push({ className, division });
    }

    // ♻️ Clear inputs and update list
    setClasses(updated);
    setClassName('');
    setDivision('');
  };

  // ===============================
  // Load entry into input fields for editing
  // ===============================
  const handleEdit = (index) => {
    setEditIndex(index);
    setClassName(classes[index].className);
    setDivision(classes[index].division);
  };

  // ===============================
  // Remove entry from local unsaved list
  // ===============================
  const handleDelete = (index) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  // ===============================
  // Save entire list to backend
  // ===============================
  const handleSaveAll = async () => {
    try {
      const response = await axios.post(
        `${BaseUrl}admin/create-class-division`,
        classes,
        { withCredentials: true }
      );

      if (response.data.status) {
        setClasses([]);       // 🧹 Clear local list
        setBtHide(false);     // 🔽 Hide "Save All" button
        setDuplError('');     // ❌ Clear duplicate error
        showSuccess(response.data.message); // ✅ Show success toast
      }
    } catch (error) {
      // ❌ Handle duplicate entries
      if (error.status === 409) {
        const duplicates = error.response.data.duplicate;
        setDuplError(duplicates);
        return showError('Some class-division pairs already exist for this school.');
      }
      showError("Something went wrong. Please try again.");
    }
  };

  // ===============================
  // Enable edit mode for a saved entry
  // ===============================
  const handleEditList = (id) => {
    const item = savedClasses.find((entry) => entry._id === id); // 🔍 Locate by ID
    setNewClassName(item.className);   // ✏️ Load class
    setNewDivisionName(item.division); // ✏️ Load division
    setcurrentID(id);                  // 🆔 Set current ID
    setActiveEditId(true);             // ✅ Show edit form
  }

  // ===============================
  // Submit edited entry to backend
  // ===============================
  const handlSaveList = async () => {
    if (newClassName.length >= 20 || newClassName.length < 1 || newDivisionName.length >= 15 || newDivisionName.length < 1) return;

    const newData = [{
      newClassName: newClassName.trim(),
      newDivisionName: newDivisionName.trim(),
      currentID: currentID
    }];

    try {
      const res = await axios.put(`${BaseUrl}admin/edit-class-division`, {
        action: 'edit',
        newData
      }, { withCredentials: true });

      showSuccess(res.data.message); // ✅ Success toast
      setActiveEditId(false);        // 🔚 Exit edit mode

    } catch (error) {
      // ❌ Handle duplicate update error
      if (error.status === 409) {
        showError('❌ Cannot update: The combination "1st-AB" already exists in your school list. Please avoid duplicates')
      } else {
        showError("Something went wrong. Please try again.");
      }
    }
  }

  // ===============================
  // Delete an entry from backend
  // ===============================
  const handleDeleteList = async () => {
    try {
      const res = await axios.put(`${BaseUrl}admin/edit-class-division`, {
        action: 'delete',
        currentID
      }, { withCredentials: true });

      if (res.data.status) {
        setActiveEditId(false); // 🔚 Exit edit mode
        return showSuccess('Class-division deleted successfully.');
      }
    }
    catch (error) {
      showError("Something went wrong. Please try again.");
    }
  }





  return (
  <PageWrapper>
  <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-4 flex flex-col items-center pb-8">

    {/* Main Section - Add/Edit Class + Display Lists */}
    {activeEditId === false && (
      <div className="w-full max-w-7xl grid grid-cols-1 gap-8 mt-8">

        {/* Add/Edit Class Card */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full">
          <h2 className="text-3xl font-bold mb-6">Add / Edit Class</h2>

          {duplError && (
            <p className="text-red-500 mb-4">
              🚫 Duplicate: <span className="text-white">{duplError.join(', ')}</span>
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Class Name Input */}
            <div>
              <input
                type="text"
                placeholder="Enter Class (e.g., 1st, 2nd)"
                maxLength={20}
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {className.length >= 20 && (
                <p className="text-red-400 text-sm mt-1">⚠️ Only 20 characters allowed!</p>
              )}
            </div>

            {/* Division Input */}
            <div>
              <input
                type="text"
                placeholder="Enter Division (e.g., A, B)"
                maxLength={15}
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {division.length >= 15 && (
                <p className="text-red-400 text-sm mt-1">⚠️ Only 15 characters allowed!</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            {editIndex !== null && (
              <button
                onClick={() => {
                  setEditIndex(null);
                  setClassName('');
                  setDivision('');
                }}
                className="flex items-center gap-2 px-5 py-2 bg-gray-600 rounded-xl"
              >
                <FiX /> Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 rounded-xl"
            >
              <FiSave /> {editIndex !== null ? 'Update' : 'Add'}
            </button>
          </div>
        </div>

        {/* Current Session List */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Current Session</h2>
            {bthide && (
              <button
                onClick={handleSaveAll}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Save All
              </button>
            )}
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-700 text-left">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Class</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Division</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {classes.map((item, index) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">{item.className}</td>
                    <td className="px-4 py-3">{item.division}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-blue-400 hover:text-blue-600 mr-4"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {classes.length === 0 && (
              <p className="text-center mt-6 text-lg text-gray-300">🚫 No classes added yet.</p>
            )}
          </div>
        </div>

        {/* Saved Class List */}
        <div className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full">
          <h2 className="text-3xl font-bold mb-6">All Classes (Saved)</h2>

          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-700 text-left">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Class</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Division</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {savedClasses.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">{item.className}</td>
                    <td className="px-4 py-3">{item.division}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEditList(item._id)}
                        className="text-red-500 hover:text-blue-600"
                      >
                        <FiEdit2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {savedClasses.length === 0 && (
              <p className="text-center mt-6 text-lg text-gray-300">📭 No saved class data available.</p>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Edit Card UI */}
    {activeEditId && (
      <div className="w-full max-w-3xl my-12 bg-gray-900 rounded-3xl shadow-2xl border border-gray-700">

        <div className="bg-indigo-700 py-6 px-8 rounded-t-3xl">
          <h2 className="text-2xl font-bold text-center">✏️ Edit Class & Division</h2>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Class Name</label>
            <input
              type="text"
              maxLength={20}
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g., 1st"
              className="w-full p-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {newClassName.length >= 20 && (
              <p className="text-red-400 text-sm mt-1">⚠️ Max 20 characters allowed!</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Division</label>
            <input
              type="text"
              maxLength={15}
              value={newDivisionName}
              onChange={(e) => setNewDivisionName(e.target.value)}
              placeholder="e.g., A"
              className="w-full p-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {newDivisionName.length >= 15 && (
              <p className="text-red-400 text-sm mt-1">⚠️ Max 15 characters allowed!</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setActiveEditId(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl"
            >
              <FiX /> Cancel
            </button>
            <button
              onClick={handlSaveList}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
            >
              <FiSave /> Save
            </button>
            <button
              onClick={handleDeleteList}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </div>
    )}
      </div>
      </PageWrapper>
);


};

export default ClassDivCfg;