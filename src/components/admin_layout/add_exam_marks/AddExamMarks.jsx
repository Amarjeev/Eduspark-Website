import React, { useState, useEffect } from "react";
import { FaPlus, FaTrashAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from 'axios';
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import { useParams } from "react-router-dom";
import PageWrapper from "../../../PageWrapper";

function AddExamMarks() {
    const { role } = useParams();
  // State declarations for managing form data and UI
  const [studentId, setStudentId] = useState(""); // Stores the student ID input
  const [studentInfo, setStudentInfo] = useState([]); // Stores fetched student information
  const [studentStatus, setStudentStatus] = useState(null); // Tracks student fetch status (true = found, false = not found, null = not searched)
  const [subjects, setSubjects] = useState([]); // Available subjects for the student
  const [highestTotalMark, setHighestTotalMark] = useState(""); // Highest possible mark from grade ranges
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [rows, setRows] = useState([{ subject: "", mark: "", totalMark: "", grade: "" }]); // Mark entry rows
  const [expandedRows, setExpandedRows] = useState([true]); // Tracks which rows are expanded
  const [showGradeRanges, setShowGradeRanges] = useState(false); // Controls grade range section visibility
  const [gradeRanges, setGradeRanges] = useState([]); // Grade range definitions
  const [currentRowIndex, setCurrentRowIndex] = useState(0); // Tracks current active row
  const [examName, setExamName] = useState(""); // Exam name input
  const [examDate, setExamDate] = useState(""); // Exam date input

  // Error states for form validation
  const [errors, setErrors] = useState({
    studentId: '', // Student ID validation error
    gradeRanges: [], // Grade range validation errors
    rows: [], // Row-specific validation errors
    duplicateSubjects: [], // Tracks duplicate subjects
    markExceedsTotal: [], // Tracks marks exceeding total marks
    gradeLabelLength: [], // Grade label length errors
    gradeRangeLength: [], // Grade range format errors
    examName: '', // Exam name validation error
    examDate: '' // Exam date validation error
  });

  // Effect hook to fetch student details when studentId changes
  useEffect(() => {
    // Only proceed if studentId is exactly 6 digits
    if (studentId.length !== 6 || !/^\d+$/.test(studentId)) {
      setStudentStatus(false);
      return;
    }

    // Async function to fetch student details
    const fetchStudentDetails = async () => {
      setLoading(true);
      alert()
      try {
        const response = await axios.post(
          `${BaseUrl}add-marks/${role}`,
          { studentId },
          { withCredentials: true }
        );
        // Update state with fetched data
        setSubjects(response.data.subject || []);
        setStudentInfo(response.data);
        setStudentStatus(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error.response?.status === 404) {
          setStudentStatus(null);
        }
        showError("Something went wrong. Please try again.");
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  /* ====================== VALIDATION FUNCTIONS ====================== */

  // Validates student ID format
  const validateStudentId = (id) => {
    if (id.length !== 6) {
      setErrors(prev => ({...prev, studentId: 'Student ID must be exactly 6 digits'}));
      return false;
    }
    if (!/^\d+$/.test(id)) {
      setErrors(prev => ({...prev, studentId: 'Student ID must contain only numbers'}));
      return false;
    }
    setErrors(prev => ({...prev, studentId: ''}));
    return true;
  };

  // Validates grade range format (e.g., "2-10")
  const validateGradeRange = (range) => {
    if (!/^\d{1,15}-\d{1,15}$/.test(range)) {
      return 'Format must be like "2-10" (start-end), max 15 digits each';
    }
    const [start, end] = range.split('-').map(Number);
    if (start >= end) {
      return 'Start must be less than end (e.g., 2-10)';
    }
    if (start < 0 || end > 999999999999999) {
      return 'Range must be between 0-999999999999999';
    }
    return '';
  };

  // Validates grade label length
  const validateGradeLabel = (label) => {
    if (label.length > 6) {
      return 'Grade label cannot exceed 6 characters';
    }
    return '';
  };

  // Validates mark input against various criteria
  const validateMarkInput = (mark, totalMark) => {
    const errors = [];
    
    // Check mark length
    if (mark.length > 6) {
      errors.push('Mark cannot exceed 6 characters');
    }
    // Check numeric format
    if (!/^\d*$/.test(mark)) {
      errors.push('Mark must contain only numbers');
    }
    // Check against total marks
    if (totalMark && parseFloat(mark) > parseFloat(totalMark)) {
      errors.push('Mark cannot exceed total marks');
    }
    
    // Validate against grade ranges if they exist
    if (mark && gradeRanges.length > 0) {
      const numericMark = parseFloat(mark);
      if (!isNaN(numericMark)) {
        const inAnyRange = gradeRanges.some(range => {
          if (!range.range) return false;
          const [start, end] = range.range.split('-').map(Number);
          return numericMark >= start && numericMark <= end;
        });
        
        if (!inAnyRange) {
          errors.push('Mark does not fall within any grade range');
        }
      }
    }
    
    return errors.join(', ');
  };

  // Validates exam name
  const validateExamName = (name) => {
    if (!name.trim()) {
      return 'Exam name is required';
    }
    if (name.length > 50) {
      return 'Exam name cannot exceed 50 characters';
    }
    return '';
  };

// Validates exam date (past and today allowed, future not allowed)
const validateExamDate = (date) => {
  if (!date) {
    return 'Exam date is required';
  }

  const selectedDate = new Date(date);
  const today = new Date();

  // Remove time from both dates to compare only the date portion
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate.getTime() > today.getTime()) {
    return 'Future dates are not allowed';
  }

  return '';
};



  // Checks for duplicate subjects in rows
  const checkDuplicateSubjects = (rows) => {
    const duplicates = [];
    const subjectCount = {};
    
    rows.forEach((row, index) => {
      if (!row.subject) return;
      subjectCount[row.subject] = (subjectCount[row.subject] || 0) + 1;
      if (subjectCount[row.subject] > 1) {
        duplicates.push(index);
      }
    });

    setErrors(prev => ({...prev, duplicateSubjects: duplicates}));
    return duplicates.length === 0;
  };

  // Checks if any marks exceed their total marks
  const checkMarkExceedsTotal = (rows) => {
    const exceeds = [];
    
    rows.forEach((row, index) => {
      if (row.mark && row.totalMark && parseFloat(row.mark) > parseFloat(row.totalMark)) {
        exceeds.push(index);
      }
    });

    setErrors(prev => ({...prev, markExceedsTotal: exceeds}));
    return exceeds.length === 0;
  };

  /* ====================== EVENT HANDLERS ====================== */

  // Handles student ID input changes with validation
  const handleStudentIdChange = (e) => {
    const value = e.target.value.slice(0, 6);
    setStudentId(value);
    validateStudentId(value);
  };

  // Handles exam name input changes with validation
  const handleExamNameChange = (e) => {
    const value = e.target.value;
    setExamName(value);
    setErrors(prev => ({...prev, examName: validateExamName(value)}));
  };

  // Handles exam date input changes with validation
  const handleExamDateChange = (e) => {
    const value = e.target.value;
    setExamDate(value);
    setErrors(prev => ({...prev, examDate: validateExamDate(value)}));
  };

  // Handles changes to grade range inputs with validation
  const handleGradeRangeChange = (index, field, value) => {
    const updated = [...gradeRanges];
    
    if (field === 'label') {
      // Limit label to 6 characters and uppercase
      const limitedValue = value.slice(0, 6).toUpperCase().trim();
      updated[index][field] = limitedValue;
      
      // Validate label and update errors
      const labelError = validateGradeLabel(limitedValue);
      const labelErrors = [...errors.gradeLabelLength];
      labelErrors[index] = labelError;
      setErrors(prev => ({...prev, gradeLabelLength: labelErrors}));
    } else if (field === 'range') {
      // Split range into parts and limit each part to 15 digits
      const parts = value.split('-');
      if (parts.length === 2) {
        const start = parts[0].slice(0, 15);
        const end = parts[1].slice(0, 15);
        updated[index][field] = `${start}-${end}`;
      } else {
        updated[index][field] = value;
      }
      
      // Validate range format and update errors
      const rangeError = validateGradeRange(updated[index].range);
      const rangeErrors = [...errors.gradeRangeLength];
      rangeErrors[index] = rangeError;
      setErrors(prev => ({...prev, gradeRangeLength: rangeErrors}));
    }
    
    setGradeRanges(updated);
  };

  // Handles changes to mark entry rows with validation
  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...rows];
    updated[index][name] = value;
    
    // Special validation for mark field
    if (name === 'mark') {
      const markError = validateMarkInput(value, updated[index].totalMark);
      const rowErrors = [...errors.rows];
      rowErrors[index] = rowErrors[index] || {};
      rowErrors[index].mark = markError;
      setErrors(prev => ({...prev, rows: rowErrors}));
    }
    
    setRows(updated);
    // Check for duplicates and mark exceeding total
    checkDuplicateSubjects(updated);
    checkMarkExceedsTotal(updated);
    
    // Function to assign grade and total mark based on ranges
    const assignGradeAndTotal = () => {
      gradeRanges.forEach((range) => {
        if (!range.range) return;
        const [start, end] = range.range.split("-").map(Number);
        const currentMark = parseFloat(updated[index].mark);
        
        // Assign grade if mark falls within this range
        if (!isNaN(currentMark) && currentMark >= start && currentMark <= end) {
          updated[index].grade = range.label;
        }
      });

      // Set highest total mark from the highest range
      if (gradeRanges.length > 0) {
        const highestRangeItem = gradeRanges.reduce((prev, curr) => {
          const prevEnd = parseInt(prev.range.split("-")[1]);
          const currEnd = parseInt(curr.range.split("-")[1]);
          return currEnd > prevEnd ? curr : prev;
        });

        const highestMark = highestRangeItem.range.split("-")[1];
        setHighestTotalMark(highestMark);
        updated[index].totalMark = highestMark;
        
        // Revalidate mark against new total mark
        if (name === 'mark') {
          const markError = validateMarkInput(updated[index].mark, highestMark);
          const rowErrors = [...errors.rows];
          rowErrors[index] = rowErrors[index] || {};
          rowErrors[index].mark = markError;
          setErrors(prev => ({...prev, rows: rowErrors}));
          checkMarkExceedsTotal(updated);
        }
      }
    };

    // Apply grade assignment if ranges exist
    if (rows && gradeRanges.length > 0) {
      assignGradeAndTotal();
    }
  };

  /* ====================== GRADE RANGE MANAGEMENT ====================== */

  // Adds a new grade range
  const addGradeRange = () => {
    setGradeRanges([
      ...gradeRanges,
      { key: `grade${Date.now()}`, label: "", range: "" }
    ]);
    // Initialize error states for new range
    setErrors(prev => ({
      ...prev,
      gradeRanges: [...prev.gradeRanges, ''],
      gradeLabelLength: [...prev.gradeLabelLength, ''],
      gradeRangeLength: [...prev.gradeRangeLength, '']
    }));
  };

  // Deletes a grade range
  const deleteGradeRange = (index) => {
    setGradeRanges(gradeRanges.filter((_, i) => i !== index));
    // Clean up corresponding error states
    const gradeErrors = [...errors.gradeRanges];
    gradeErrors.splice(index, 1);
    setErrors(prev => ({
      ...prev,
      gradeRanges: gradeErrors,
      gradeLabelLength: prev.gradeLabelLength.filter((_, i) => i !== index),
      gradeRangeLength: prev.gradeRangeLength.filter((_, i) => i !== index)
    }));
  };

  /* ====================== ROW MANAGEMENT ====================== */

  // Adds a new mark entry row
  const addRow = () => {
    const currentRow = rows[currentRowIndex];
    // Validate current row before adding new one
    if (!currentRow.subject || !currentRow.mark || !currentRow.totalMark || !currentRow.grade) {
      showError("Please fill all fields in the current row before adding a new one");
      return;
    }
    
    if (errors.rows[currentRowIndex]?.mark) {
      showError("Please fix mark errors in current row before adding new one");
      return;
    }
    
    // Update state with new row
    setCurrentRowIndex((prevIndex) => prevIndex + 1);
    setRows([...rows, { subject: "", mark: "", totalMark: "", grade: "" }]);
    setExpandedRows([...expandedRows, false]);
    // Initialize error states for new row
    setErrors(prev => ({
      ...prev,
      rows: [...prev.rows, {}],
      duplicateSubjects: [],
      markExceedsTotal: []
    }));
  };

  // Deletes a mark entry row
  const deleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
    setExpandedRows(expandedRows.filter((_, i) => i !== index));
    
    // Clean up corresponding error states
    const rowErrors = [...errors.rows];
    rowErrors.splice(index, 1);
    setErrors(prev => ({
      ...prev,
      rows: rowErrors,
      duplicateSubjects: prev.duplicateSubjects.filter(i => i !== index),
      markExceedsTotal: prev.markExceedsTotal.filter(i => i !== index)
    }));
  };

  // Toggles row expansion
  const toggleRow = (index) => {
    const updated = [...expandedRows];
    updated[index] = !updated[index];
    setExpandedRows(updated);
  };

  /* ====================== FORM SUBMISSION ====================== */

  // Handles form submission with comprehensive validation
  const handleSubmit = async () => {
    // Validate all fields before submission
    const examNameError = validateExamName(examName);
    const examDateError = validateExamDate(examDate);
    setErrors(prev => ({
      ...prev,
      examName: examNameError,
      examDate: examDateError
    }));

    // Show error if validation fails
    if (examNameError || examDateError) {
      showError("Please fix exam information errors");
      return;
    }

    if (!validateStudentId(studentId)) {
      showError("Please enter a valid 6-digit student ID");
      return;
    }
    
    if (gradeRanges.length === 0) {
      showError("Please add at least one grade range");
      return;
    }
    
    // Check for grade range errors
    const hasGradeRangeErrors = gradeRanges.some((range, i) => {
      return validateGradeRange(range.range) || validateGradeLabel(range.label);
    });
    
    if (hasGradeRangeErrors) {
      showError("Please fix all grade range errors before submitting");
      return;
    }
    
    // Check for duplicate subjects
    if (!checkDuplicateSubjects(rows)) {
      showError("Duplicate subjects found. Please remove duplicates before submitting.");
      return;
    }
    
    // Check for marks exceeding totals
    if (!checkMarkExceedsTotal(rows)) {
      showError("Some marks exceed total marks. Please correct them.");
      return;
    }
    
    // Check for incomplete rows or mark errors
    const hasRowErrors = rows.some((row, i) => {
      return !row.subject || !row.mark || errors.rows[i]?.mark;
    });
    
    if (hasRowErrors) {
      showError("Please fill all required fields and fix errors in mark entries");
      return;
    }

    // Prepare submission data
    const submissionData = {
      studentId,
      examName,
      examDate,
      marks: rows.map(row => ({
        subject: row.subject,
        mark: parseFloat(row.mark),
        totalMark: parseFloat(row.totalMark),
        grade: row.grade
      }))
    };
    
    // Submit data to API
    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseUrl}add-marks/submit/${role}`,
      {examMark:submissionData},
        { withCredentials: true }
      );
      showSuccess("Marks submitted successfully!");
      // Clear all form fields after successful submission
      setStudentId("");
      setStudentInfo([]);
      setStudentStatus(null);
      setSubjects([]);
      setHighestTotalMark("");
      setRows([{ subject: "", mark: "", totalMark: "", grade: "" }]);
      setExpandedRows([true]);
      setShowGradeRanges(false);
      setGradeRanges([]);
      setCurrentRowIndex(0);
      setExamName("");
      setExamDate("");
      
      // Reset all errors
      setErrors({
        studentId: '',
        gradeRanges: [],
        rows: [],
        duplicateSubjects: [],
        markExceedsTotal: [],
        gradeLabelLength: [],
        gradeRangeLength: [],
        examName: '',
        examDate: ''
      });
    } catch (error) {
     showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator during API calls
  if (loading) return <Loading/>;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white py-10 px-5 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">📘 Student Marks Entry</h2>

        {/* Exam Information */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="examName" className="block text-sm font-medium text-gray-600 mb-2">
              📝 Exam Name
            </label>
            <input
              id="examName"
              type="text"
              placeholder="Enter exam name"
              value={examName}
              onChange={handleExamNameChange}
              maxLength={50}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.examName ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800`}
            />
            {errors.examName && (
              <p className="mt-2 text-sm text-red-600">⚠️ {errors.examName}</p>
            )}
          </div>
          <div>
            <label htmlFor="examDate" className="block text-sm font-medium text-gray-600 mb-2">
              📅 Exam Date
            </label>
            <input
              id="examDate"
              type="date"
              value={examDate}
              onChange={handleExamDateChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.examDate ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800`}
            />
            {errors.examDate && (
              <p className="mt-2 text-sm text-red-600">⚠️ {errors.examDate}</p>
            )}
          </div>
        </div>

        {/* Student ID Input */}
        <div className="mb-6">
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-600 mb-2">
            🎓 Student ID
          </label>
          <input
            id="studentId"
            type="text"
            placeholder="Enter Student ID (6 digits)"
            value={studentId}
            onChange={handleStudentIdChange}
            maxLength={6}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.studentId ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800`}
          />
          {errors.studentId && (
            <p className="mt-2 text-sm text-red-600">⚠️ {errors.studentId}</p>
          )}
          {studentStatus === null && !errors.studentId && (
            <p className="text-red-600">❌ Student not found</p>
          )}
        </div>

        {/* Student Info Display */}
        {studentStatus && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-gray-800 shadow-sm">
            <h3 className="font-semibold text-lg text-blue-800 mb-2">🎓 Student Details</h3>
            <p><span className="font-medium">Name:</span> {studentInfo.student?.name}</p>
            <p><span className="font-medium">Class:</span> {studentInfo.student?.className}</p>
          </div>
        )}

        {/* Grade Range Toggle */}
        <button
          onClick={() => setShowGradeRanges(!showGradeRanges)}
          className="w-full mb-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
        >
          {showGradeRanges ? "Hide Grade Ranges" : "Show Grade Ranges"}
        </button>

        {/* Grade Ranges Editor */}
        {showGradeRanges && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">🧮 Grade Ranges</h4>
            <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100 space-y-3">
              {gradeRanges.map((grade, index) => (
                <div key={index} className="relative bg-white p-3 border rounded-xl shadow-sm">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Grade Label (max 6 chars)</label>
                    <input
                      type="text"
                      value={grade.label}
                      onChange={(e) => handleGradeRangeChange(index, "label", e.target.value)}
                      placeholder="A+, B, etc."
                      maxLength={6}
                      className={`w-full px-3 py-2 border ${
                        errors.gradeLabelLength[index] ? 'border-red-500' : 'border-gray-300'
                      } rounded-md text-gray-800`}
                    />
                    {errors.gradeLabelLength[index] && (
                      <p className="text-xs text-red-600 mt-1">⚠️ {errors.gradeLabelLength[index]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Range (max 15 digits each)</label>
                    <input
                      type="text"
                      value={grade.range}
                      onChange={(e) => handleGradeRangeChange(index, "range", e.target.value)}
                      placeholder="e.g., 2-10 (start-end)"
                      className={`w-full px-3 py-2 border ${
                        errors.gradeRangeLength[index] ? 'border-red-500' : 'border-gray-300'
                      } rounded-md text-gray-800`}
                    />
                    {errors.gradeRangeLength[index] && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ {errors.gradeRangeLength[index]}
                      </p>
                    )}
                  </div>
                  <button
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                    onClick={() => deleteGradeRange(index)}
                    title="Remove"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addGradeRange}
              className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <FaPlus /> Add Grade Range
            </button>
          </div>
        )}

        {/* Subject Mark Entry Rows */}
        <div className="max-h-[400px] overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-200">
          {rows.map((row, index) => (
            <div 
              key={index} 
              className={`border rounded-xl shadow bg-gradient-to-br from-white via-gray-50 to-blue-50 ${
                errors.duplicateSubjects.includes(index) ? 'border-red-500 border-2' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Subject Row {index + 1}</h3>
                {errors.duplicateSubjects.includes(index) && (
                  <span className="text-xs text-red-600">⚠️ Duplicate subject</span>
                )}
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleRow(index)} className="text-gray-500 hover:text-blue-600" title="Toggle Details">
                    {expandedRows[index] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  <button onClick={() => deleteRow(index)} className="text-red-600 hover:text-red-800" title="Delete Row">
                    <FaTrashAlt />
                  </button>
                </div>
              </div>

              {/* Expanded Row View */}
              {expandedRows[index] && (
                <div className="px-5 py-4">
                  <select
                    name="subject"
                    value={row.subject}
                    onChange={(e) => handleRowChange(index, e)}
                    required
                    className={`w-full px-3 py-2 border ${
                      errors.duplicateSubjects.includes(index) ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800`}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <option key={subject._id} value={subject.name}>
                          {subject.name.charAt(0).toUpperCase() + subject.name.slice(1).toLowerCase()}
                        </option>
                      ))
                    ) : (
                      <option disabled>No subjects available</option>
                    )}
                  </select>

                  {/* Marks and Total */}
                  <div className="grid grid-cols-2 gap-4 mb-4 mt-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">🎯 Student Mark</label>
                      <input
                        type="text"
                        required
                        name="mark"
                        value={row.mark}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="Mark (max 6 digits)"
                        maxLength={6}
                        className={`w-full px-3 py-2 border ${
                          errors.rows[index]?.mark || errors.markExceedsTotal.includes(index) 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800`}
                      />
                      {(errors.rows[index]?.mark || errors.markExceedsTotal.includes(index)) && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ {errors.rows[index]?.mark || 'Mark cannot exceed total marks'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">📊 Total Mark</label>
                      <input
                        type="number"
                        readOnly
                        name="totalMark"
                        value={highestTotalMark || ''}
                        placeholder="Total"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Grade Display */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">🏅 Grade</label>
                    <input
                      type="text"
                      required
                      name="grade"
                      value={row.grade}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {studentStatus && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={addRow}
              className="w-full sm:w-1/2 py-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
            >
              <FaPlus /> Add Row
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-1/2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Marks"}
            </button>
          </div>
        )}
      </div>
      </div>
      </PageWrapper>
  );
}

export default AddExamMarks;