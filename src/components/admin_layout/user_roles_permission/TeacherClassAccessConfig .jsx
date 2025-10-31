import React, { useState, useEffect } from 'react';
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import { getFromIndexedDB} from '../../../utils/indexedDBUtils';
import PageWrapper from '../../../PageWrapper';

function TeacherClassAccessConfig() {
  const [selectedTeacher, setSelectedTeacher] = useState(null); // 👨‍🏫 Currently selected teacher
  const [assignedClasses, setAssignedClasses] = useState([]);   // ✅ Classes selected for assignment
  const [classList, setClassList] = useState([]);               // 📚 All available classes from backend
  const [teacherList, setTeacherList] = useState([]);           // 👥 All teachers from backend
  const [loading, setLoading] = useState(false);                // ⏳ Loading spinner flag
  const [unsavedChangesWarning, setUnsavedChangesWarning] = useState(false); // ⚠️ Warning if there are unsaved changes
  const [reloadDataTrigger, setReloadDataTrigger] = useState(false); // 🔁 Toggle to re-fetch data after save
  const [udiseCode,setUdiseCode]=useState('')

  // 📦 Fetch teachers and class list from backend
  useEffect(() => {
    const storedUdiseCode = localStorage.getItem("uidseCode");
    setUdiseCode(storedUdiseCode);

    const fetchData = async () => {
      try {
        setLoading(true);

        const teacherListRes = await axios.post(`${BaseUrl}admin/teacher-access/teacher-list`, {}, { withCredentials: true });

                  const classListData = await getFromIndexedDB('school-class-List-admin');
                if (classListData) {
               setClassList(classListData)
                }

        setTeacherList(teacherListRes.data);

      } catch (error) {
        showError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reloadDataTrigger]);

  // 🚨 Detect if user made changes (added/removed class)
  useEffect(() => {
    if (!selectedTeacher) {
      setUnsavedChangesWarning(false);
      return;
    }

    const originalAssignedClasses = selectedTeacher.assignedClasses || [];

    // If count differs, it's definitely modified
    if (assignedClasses.length !== originalAssignedClasses.length) {
      setUnsavedChangesWarning(true);
    } else {
      setUnsavedChangesWarning(false);
    }
  }, [assignedClasses, selectedTeacher]);

  // 👆 When user clicks "Assign" for a teacher
  const handleAssignClick = (teacher) => {
    if (unsavedChangesWarning) {
      return showError("⚠️ Please save current changes before switching.");
    }
    setSelectedTeacher(teacher);                         // Mark as selected
    setAssignedClasses(teacher.assignedClasses || []);   // Load their assigned classes
  };

  // ☑️ Handle checkbox toggle for a class
  const handleCheckboxChange = (className) => {
    const updated = assignedClasses.includes(className)
      ? assignedClasses.filter(c => c !== className)
      : [...assignedClasses, className];
    setAssignedClasses(updated); // Update assigned list
  };

  // 💾 Save assigned classes for the selected teacher
  const handleSave = async () => {
    if (!selectedTeacher) {
      return showError('❗ Please select a teacher first.');
    }
    if (assignedClasses.length === 0) {
      return showError('❗ Please select at least one class.');
    }

    setLoading(true);
    try {
      await axios.post(
        `${BaseUrl}admin/teacher-access/assigned-classes`,
        { teacherId: selectedTeacher._id, assignedClasses },
        { withCredentials: true }
      );

      // Reset UI state after successful save
      setSelectedTeacher(null);
      setAssignedClasses([]);
      setReloadDataTrigger(prev => !prev); // Trigger data refresh
      showSuccess(`Access successfully saved for ${selectedTeacher.name}.`);
    } catch (error) {
      showError("Failed to save teacher class access. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4 py-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow"
        >
          💾 Save Access
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Panel - Teacher List */}
        <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-md max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl text-gray-800 font-semibold mb-4">
            👨‍🏫 Select a Teacher
          </h2>
          {teacherList.length === 0 ? (
  <p className="text-center text-gray-500 py-4">👨‍🏫 No teacher data found.</p>
) : (
  <ul className="space-y-3">
    {teacherList.map((teacher) => (
      <li
        key={teacher._id}
        className={`flex justify-between items-center p-4 rounded-lg ${
          selectedTeacher?._id === teacher._id
            ? 'bg-blue-100 text-blue-800 font-semibold'
            : 'bg-white/70 text-gray-800'
        }`}
      >
        <div>
          <p className="text-lg">{teacher.name}</p>
          <p className="text-sm text-gray-600">ID: {teacher.employId}</p>
        </div>
        <button
          onClick={() => handleAssignClick(teacher)}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700"
        >
          Assign
        </button>
      </li>
    ))}
  </ul>
)}

        </div>

        {/* Right Panel - Class Assignment */}
        <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-md max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl text-gray-800 font-bold mb-4 flex flex-wrap items-center gap-2">
            🏫 Classes
            {selectedTeacher && (
              <span className="text-lg text-blue-700 bg-blue-100 px-3 py-1 rounded-full shadow-sm">
                👨‍🏫 {selectedTeacher.name}
              </span>
            )}
            {selectedTeacher?.employId && (
              <span className="text-sm text-black bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg shadow-inner border border-white/30">
                🆔 ID: {selectedTeacher.employId}
              </span>
            )}
          </h2>

          {selectedTeacher ? (
            classList.length > 0 ? (
              <div className="space-y-3">
                {classList.map((cls, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 text-gray-800 text-lg"
                  >
                    <input
                      type="checkbox"
                      checked={assignedClasses.includes(cls)}
                      onChange={() => handleCheckboxChange(cls)}
                      className="accent-blue-600 w-5 h-5"
                    />
                    {cls}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-base mt-4">📭 No classes available.</p>
            )
          ) : (
            <p className="text-gray-500 text-base mt-4">🚫 Select a teacher to assign classes.</p>
          )}
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default TeacherClassAccessConfig;
