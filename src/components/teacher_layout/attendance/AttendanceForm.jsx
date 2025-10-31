// 📦 Core dependencies
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher } from 'react-icons/fa';
import {useParams} from 'react-router-dom';

// 🌐 Base URL & Utils
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showSuccess, showError } from "../../../utils/toast";
import { getFromIndexedDB, saveToIndexedDB ,removeFromIndexedDB} from '../../../utils/indexedDBUtils';
import PageWrapper from '../../../PageWrapper';
// 🌀 Loading UI
import Loading from "../../loading_ui/Loading";

// 📌 Predefined list of absence reasons with emojis
const absenceReasons = [
  "🪒 Sick",
  "🏡 Family Emergency",
  "🗕 Function",
  "🚫 Transport Issue",
  "💊 Medical Appointment",
  "📌 Other"
];

function AttendanceForm() {
  // 🧠 State declarations
  const [loading, setLoading] = useState(false);                  // ⏳ Loading state
  const [selectedClass, setSelectedClass] = useState('');         // 🏷️ Selected class
  const [students, setStudents] = useState([]);                   // 👨‍🎓 Student list
  const [attendance, setAttendance] = useState({});               // 📝 Attendance object
  const [teacherId, setTeacherId] = useState('');                 // 🧑‍🏫 Teacher ID
  const [teacherName, setTeacherName] = useState('');             // 🧑‍🏫 Teacher Name
  const [udiseCode, setUdiseCode] = useState('');                 // 🏫 School UDISE code
  const [attendanceDate, setAttendanceDate] = useState('');       // 📅 Selected date
  const [savedDate, setSavedDate] = useState('');                 // 🗓️ Previously saved date
  const [duplicateError, setDuplicateError] = useState('');       // 🚫 Duplicate error
  const [errors, setErrors] = useState({});                       // ❗ Form field errors
  const [assignedClassNames, setAssignedClassNames] = useState([]);     // 🎯 Assigned classes
  const [finalClassOptions, setFinalClassOptions] = useState([]);       // 📘 Final class dropdown options
  const [hide, sethide] = useState(null);                        // 🙈 UI visibility toggle
  const [studentList, setStudentList] = useState([]);            // 👩‍🎓 List of students
  const { role } = useParams();

  // 💾 Load saved data from IndexedDB on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
const storedClass = await getFromIndexedDB(`selectedClass_${role}`);
const storedDate = await getFromIndexedDB(`attendanceDate_${role}`);
const storedAttendance = await getFromIndexedDB(`attendance_${role}`);
const storedDupDate = await getFromIndexedDB(`duplicateDate_${role}`);
const storedDupMsg = await getFromIndexedDB(`duplicateMessage_${role}`);

      if (storedClass) setSelectedClass(storedClass);
      if (storedDate) setAttendanceDate(storedDate);
      if (storedAttendance) setAttendance(storedAttendance);
      if (storedDupDate) setSavedDate(storedDupDate);
      if (storedDupMsg) setDuplicateError(storedDupMsg);
      setLoading(false);
    })();
  }, []);

    // 💾🧠 Save attendance form states (class, date, data) to IndexedDB in one place
  useEffect(() => {
    (async () => {
      // 🏷️ Save selected class
      if (selectedClass) {
        await saveToIndexedDB(`selectedClass_${role}`, selectedClass);
      }

      // 📅 Save attendance date
      if (attendanceDate) {
        await saveToIndexedDB(`attendanceDate_${role}`, attendanceDate);
      }

      // 📝 Save attendance records
      if (Object.keys(attendance).length !== 0) {
        await saveToIndexedDB(`attendance_${role}`, attendance);
      }

      // 🙈 Show UI parts conditionally if attendance exists
      if (Object.keys(attendance).length > 0) {
        sethide(true);
      }
    })();
  }, [selectedClass, attendanceDate, attendance]);


  // 📚 Fetch class list & teacher info from IndexedDB
  useEffect(() => {
    const fetchClassList = async () => {
      setLoading(true);
      const classData = await getFromIndexedDB(`school-class-List-${role}`);
      const userProfileData = await getFromIndexedDB(`${role}_ProfileData`);
      setTeacherId(userProfileData.employId);
      setTeacherName(userProfileData.name);
      setUdiseCode(userProfileData.udisecode);
      setFinalClassOptions(classData);
      setLoading(false);
    };
    fetchClassList();
  }, []);

  // 📥 Fetch student list when class is selected
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      const fetchStudentList = async () => {
        try {
          const studentList = await axios.get(
            `${BaseUrl}students/by-class/${selectedClass}`,
            { withCredentials: true }
          );
          setStudentList(studentList.data);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          showError("Failed to load data. Please try again.");
        }
      };
      fetchStudentList();
    }
  }, [selectedClass]);

  // 🧩 Handle class change
  const handleClassChange = (e) => {
   if (Object.keys(attendance).length !== 0) return showError('Please save current attendense');
    const selected = e.target.value;
    setSelectedClass(selected);
    setStudents([]);
    setAttendance({});
    setErrors({});
  };

  // ✅ Mark present/absent
  const handleAttendanceChange = (studentId, status) => {
    sethide(true);
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // 💬 Add absence reason
  const handleReasonChange = (studentId, reason) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment: reason,
      },
    }));
  };

  // ✅ Validate form before submit
  const validateForm = () => {
    const newErrors = {};
    if (!teacherId.trim()) newErrors.teacherId = '⚠️ Teacher ID is required';
    if (!attendanceDate) newErrors.attendanceDate = '⚠️ Date is required';
    if (!selectedClass) newErrors.selectedClass = '⚠️ Please select a class';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📤 Submit attendance
  const handleSubmit = async () => {
    setLoading(true);
    if (!validateForm()) return setLoading(false);

    // 📊 Format data for backend
    const formatted = studentList.map((student) => ({
      id: student.studentId,
      name: student.name,
      status: attendance[student.studentId]?.status || '',
      comment: attendance[student.studentId]?.comment || '',
    }));

    // ⚠️ Check for unmarked students
    const emptyStatusStudents = formatted.filter((d) => d.status === '');
    if (emptyStatusStudents.length > 0) {
      setLoading(false);
      return showError(`⚠️ ${emptyStatusStudents.length} student(s) have unmarked attendance. Please mark everyone before submitting.`);
    }

    // 🧾 Attendance summary object
    const summary = {
      udiseCode,
      teacherId,
      teacherName,
      date: attendanceDate,
      className: selectedClass,
      attendanceRecords: formatted,
    };

    // 🚫 Prevent duplicate entry
    if (duplicateError && savedDate === attendanceDate) {
      showError(`⚠️ Please choose a different date. You selected: ${summary.date}, but attendance was already submitted for: ${attendanceDate}`);
      setLoading(false);
      return;
    } else {
      // 🧹 Clear old duplicate info
      setDuplicateError('');
      setSavedDate('');
      await saveToIndexedDB(`duplicateDate_${role}`, '');
      await saveToIndexedDB(`duplicateMessage_${role}`, '');
    }

    try {
      // 📡 Send attendance to backend
      const response = await axios.post(
        `${BaseUrl}teacher/updateStudentAttendance`,
        summary,
        { withCredentials: true }
      );

      showSuccess('Attendance submitted successfully!');
      setStudentList([]);
      setAssignedClassNames([]);
      setAttendanceDate('');
      setSelectedClass('');
      setDuplicateError('');
      sethide(false);

    // 🧹 Clear stored data for specific role
await removeFromIndexedDB(`selectedClass_${role}`);
await removeFromIndexedDB(`attendanceDate_${role}`);
await removeFromIndexedDB(`attendance_${role}`);
await removeFromIndexedDB(`duplicateDate_${role}`);
await removeFromIndexedDB(`duplicateMessage_${role}`);


      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.duplicate === true) {
        const { date, message } = error.response.data;
        setSavedDate(date);
        setDuplicateError(message);
        await saveToIndexedDB(`duplicateDate_${role}`, date);
        await saveToIndexedDB(`duplicateMessage_${role}`, message);
        return;
      }

      showError("Failed to submit attendance. Please try again.");
    }
  };

  // ⏳ Show loading screen if needed
  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="p-4 max-w-6xl mx-auto bg-white rounded-xl shadow space-y-6">
      <div className="flex items-center gap-3 text-white bg-gradient-to-r from-indigo-700 to-blue-600 p-3 rounded shadow">
        <FaChalkboardTeacher className="text-xl" />
        <h2 className="font-bold tracking-wide">📋 Attendance Form</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          <div>
            <label className="font-medium text-gray-800">Class</label>
            <select
              className="w-full p-2 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 text-black"
              value={selectedClass}
              onChange={handleClassChange}
            >
              <option value="">-- Choose --</option>
              {finalClassOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            {errors.selectedClass && <p className="text-red-500 text-xs mt-1">{errors.selectedClass}</p>}
          </div>

          <div>
            <label className="font-medium text-gray-800">Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 text-black"
            />
            {errors.attendanceDate && <p className="text-red-500 text-xs mt-1">{errors.attendanceDate}</p>}
          </div>

         {`${role}`==="teacher"&& <div>
            <label className="font-medium text-gray-800">Teacher ID</label>
            <input
              type="text"
              readOnly
              value={teacherId}
              className="w-full p-2 rounded border border-gray-300 bg-white text-black"
            />
            {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>}
          </div>}

          <div>
            <label className="font-medium text-gray-800">Teacher Name</label>
            <input
              type="text"
              readOnly
              value={teacherName}
              className="w-full p-2 rounded border border-gray-300 bg-white text-black"
            />
          </div>

      { duplicateError&& <h1 class="text-red-600 text-lg font-semibold bg-red-100 border border-red-300 px-4 py-2 rounded-md shadow-sm">
          {duplicateError}
          </h1>}

        </div>

        {/* Right Column */}
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          {selectedClass && (
            <div className="bg-white p-3 rounded shadow-inner text-black">
              <p className="mb-2"><strong>Class:</strong> {selectedClass}</p>
              <p><strong>Total Students:</strong> {studentList.length}</p>
            </div>
          )}

          {selectedClass&&studentList.map((student) => (
            <div key={student.studentId} className="border rounded p-2 bg-white space-y-2">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200 shadow-sm text-sm">
                <p className="text-black font-medium">
                  <span className="text-blue-600 font-semibold">👤 Name:</span> {student.name}
                </p>
                <p className="text-gray-800 font-medium">
                  <span className="text-blue-600 font-semibold">🆔 ID:</span> {student.studentId}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap text-black">
                <label>
                  <input
                    type="radio"
                    name={`status-${student.studentId}`}
                     checked={attendance[student.studentId]?.status === 'Present'}
                    onChange={() => handleAttendanceChange(student.studentId, 'Present')}
                  />{' '}Present
                </label>
                <label>
                  <input
                    type="radio"
                    name={`status-${student.studentId}`}
                     checked={attendance[student.studentId]?.status === 'Absent'}
                    onChange={() => handleAttendanceChange(student.studentId, 'Absent')}
                  />{' '}Absent
                </label>
                {attendance[student.studentId]?.status === 'Absent' && (
                  <select
                    className="border p-1 rounded"
                    value={attendance[student.studentId]?.comment || ''}
                    onChange={(e) => handleReasonChange(student.studentId, e.target.value)}
                  >
                    <option value="">-- Reason --</option>
                    {absenceReasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}

          {selectedClass&&finalClassOptions.length > 0 && (
       <div className="flex justify-end gap-3 mt-4">
  <button
    onClick={handleSubmit}
    className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-2 rounded shadow hover:shadow-lg transition flex items-center gap-2 text-sm"
  >
    📤 Submit Attendance
  </button>

  <button
    onClick={async() => {
      setStudentList([]);
      setAssignedClassNames([]);
                  setAttendanceDate('');
                  setAttendance({})
      setSelectedClass('');
      setDuplicateError('');
      sethide(false);


     // 🧹 Clear stored data
      await removeFromIndexedDB("selectedClass");
      await removeFromIndexedDB("attendanceDate");
      await removeFromIndexedDB("attendance");
      await removeFromIndexedDB("duplicateDate");
      await removeFromIndexedDB("duplicateMessage");
    }}
    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded shadow hover:shadow-lg transition flex items-center gap-2 text-sm"
  >
    🧹 Clear All
  </button>
</div>

          )}
        </div>
      </div>
      </div>
       </PageWrapper>
  );
}

export default AttendanceForm;
