import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError, showSuccess } from "../../../utils/toast";
import Loading from '../../loading_ui/Loading';
import { getFromIndexedDB, saveToIndexedDB } from '../../../utils/indexedDBUtils';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../../PageWrapper';

function AssignHomework() {
  // 📌 Form input state
  const [homework, setHomework] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [deadline, setDeadline] = useState('');

  // 📋 Dropdown data and homework list
  const [classOptions, setClassOptions] = useState([]);
  const [subjectList, setSubject] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(null); 

  // ⚠️ Form validation error state
  const [errors, setErrors] = useState({});

  // ⏳ UI Loading & Sidebar Toggle
  const [loading, setLoading] = useState(false);
  const [showHomeworkSidebar, setShowHomeworkSidebar] = useState(true);

  // 🎯 Currently selected filter values
  const [selectedClassName, setSelectedClassName] = useState();
  const [selectedSubjectName, setSelectedSubjectName] = useState();

  // 🔢 Pagination states
  const [skipValue, setSkipValue] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [dummy, setDummy] = useState([]);
  const navigate = useNavigate();

  // 🔁 Reset skip value when filters change
  useEffect(() => {
    setSkipValue(0)
  }, [selectedClassName, selectedSubjectName]);

  // 🔁 Update dummy pagination buttons when page count changes
  useEffect(() => {
    if (pageCount > 5) {
      setDummy(Array.from({ length: 5 }, (_, i) => i + 1));
    } else {
      setDummy(Array.from({ length: pageCount }, (_, i) => i + 1));
    }
  }, [pageCount]);

  // 🔁 Calculate skip value when current page updates
  useEffect(() => {
    const skip = (currentPage - 1) * 5;
    setSkipValue(skip);
  }, [currentPage]);

  // 🧹 Clear all form and stored filter fields
  const handleClearAll = async () => {
    setFilterClass('');
    setFilterSubject('');
    setCreatedAt('');
    setDeadline('');
    setHomework('');
    setErrors({});

    await saveToIndexedDB("FilterClass", "");
    await saveToIndexedDB("FilterSubject", "");
    await saveToIndexedDB("CreatedAt", "");
    await saveToIndexedDB("Deadline", "");
    await saveToIndexedDB("HomeworkContent", "");
  };

  // 💾 Save form filters to IndexedDB whenever they change
  useEffect(() => {
    (async () => {
      if (filterClass) await saveToIndexedDB("FilterClass", filterClass);
      if (filterSubject) await saveToIndexedDB("FilterSubject", filterSubject);
      if (createdAt) await saveToIndexedDB("CreatedAt", createdAt);
      if (deadline) await saveToIndexedDB("Deadline", deadline);
      if (homework) await saveToIndexedDB("HomeworkContent", homework);
    })();
  }, [filterClass, filterSubject, createdAt, deadline, homework]);

  // 📦 Load stored filters from IndexedDB on initial load
  useEffect(() => {
    (async () => {
      const savedClass = await getFromIndexedDB("FilterClass");
      const savedSubject = await getFromIndexedDB("FilterSubject");
      const savedCreatedAt = await getFromIndexedDB("CreatedAt");
      const savedDeadline = await getFromIndexedDB("Deadline");
      const savedHomework = await getFromIndexedDB("HomeworkContent");

      if (savedClass) setFilterClass(savedClass);
      if (savedSubject) setFilterSubject(savedSubject);
      if (savedCreatedAt) setCreatedAt(savedCreatedAt);
      if (savedDeadline) setDeadline(savedDeadline);
      if (savedHomework) setHomework(savedHomework);
    })();
  }, []);

  // 📡 Fetch homework list and supporting data
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        let classData = classOptions;
        let subjectData = subjectList;

        // 🏫 Load class list from IndexedDB if not already in state
        if (!classOptions || classOptions.length === 0) {
          classData = await getFromIndexedDB("school-class-List-teacher");
          setClassOptions(classData || []);
        }

        // 📘 Load subject list from IndexedDB if not already in state
        if (!subjectList || subjectList.length === 0) {
          subjectData = await getFromIndexedDB("school-subjects-List-teacher");
          setSubject(subjectData || []);
        }

        // 📥 API call to get homework list with filters
        const response = await axios.get(`${BaseUrl}teacher/homework`, {
          params: {
            classList: selectedClassName ? [selectedClassName] : classData,
            subjectList: selectedSubjectName ? [selectedSubjectName] : subjectData,
            skip: skipValue,
          },
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
          },
          withCredentials: true,
        });

        // 📌 Update homework data and pagination counts
        setHomeworkList(response.data.data);
        setTotalCount(response.data.totalCount);
        setPageCount(Math.ceil(response.data.totalCount / 5));

        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Error fetching homework data. please try again')
      }
    })();
  }, [skipValue, selectedClassName, selectedSubjectName]);

  // 📝 Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const errors = {};

    // ✅ Form validation
    if (!filterClass?.trim()) errors.class = "Class is required";
    if (!filterSubject?.trim()) errors.subject = "Subject is required";

    const isValidCreatedAt = createdAt && !isNaN(Date.parse(createdAt));
    if (!isValidCreatedAt) errors.createdAt = "Valid 'createdAt' date-time is required";

    const isValidDeadline = deadline && !isNaN(Date.parse(deadline));
    if (!isValidDeadline) errors.deadline = "Valid 'deadline' date-time is required";

    if (isValidCreatedAt && isValidDeadline) {
      const createdDate = new Date(createdAt);
      const deadlineDate = new Date(deadline);
      if (createdDate.getTime() === deadlineDate.getTime()) {
        errors.deadline = "Deadline must be different from Created Time";
      } else if (deadlineDate.getTime() < createdDate.getTime()) {
        errors.deadline = "Deadline must be after Created Time";
      }
    }

    if (!homework?.trim()) {
      errors.content = "Homework content is required";
    } else {
      const length = homework.trim().length;
      if (length < 20) {
        errors.content = "Homework content is too short. Minimum 20 characters required.";
      } else if (length > 1000) {
        errors.content = "Homework content is too long. Maximum 1000 characters allowed.";
      }
    }

    // ❌ If there are validation errors, stop the submission
    setErrors(errors);
    if (Object.keys(errors).length > 0) return setLoading(false);

    // 📤 Prepare and send the final homework data
    const homeworkData = {
      className: filterClass,
      subject: filterSubject,
      createdAt,
      deadline,
      content: homework,
    };

    try {
      await axios.post(`${BaseUrl}homework/assign`, homeworkData, { withCredentials: true });

      // ✅ Reset form and IndexedDB after successful submission
      setFilterClass('');
      setFilterSubject('');
      setHomework('');
      setCreatedAt('');
      setDeadline('');

      await saveToIndexedDB("FilterClass", "");
      await saveToIndexedDB("FilterSubject", "");
      await saveToIndexedDB("CreatedAt", "");
      await saveToIndexedDB("Deadline", "");
      await saveToIndexedDB("HomeworkContent", "");

      setLoading(false);
      showSuccess('Homework Submitted!');
    } catch (error) {
      setLoading(false);
      showError('Failed to submit homework. Please try again.');
    }
  };

  // ⏳ Show loading UI if loading is true
  if (loading) return <Loading />;



  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 to-blue-50 p-3 sm:p-4">
      {/* 📂 Toggle Sidebar Button */}
      <div className="flex justify-start mb-3">
        <button
          onClick={() => setShowHomeworkSidebar((prev) => !prev)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-full shadow hover:shadow-md transition"
        >
          <span className="text-base">{showHomeworkSidebar ? '❌' : '📂'}</span>
          <span>{showHomeworkSidebar ? 'Hide Homework List' : 'Show Homework List'}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 📚 Sidebar */}
        {showHomeworkSidebar && (
          <div className="lg:col-span-1 bg-white shadow-md rounded-2xl p-4 border border-gray-200 max-h-[calc(100vh-50px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">📚 Submitted Homework</h3>

      {/* 🔍 Filters - Compact Layout (1 Row) */}
<div className="flex flex-wrap gap-3 mb-5">
  {/* Class Dropdown */}
  <select
    value={selectedClassName}
    onChange={(e) => setSelectedClassName(e.target.value)}
    className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
  >
    <option value="">-- Select Class --</option>
    {classOptions.map((cls, index) => (
      <option key={index} value={cls}>{cls}</option>
    ))}
  </select>

  {/* Subject Dropdown */}
  <select
    value={selectedSubjectName}
    onChange={(e) => setSelectedSubjectName(e.target.value)}
    className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
  >
    <option value="">Filter by Subject</option>
    {subjectList.map((subject, index) => (
      <option key={index} value={subject}>{subject}</option>
    ))}
  </select>
</div>



            {/* 📋 Homework List */}
            <div className="space-y-3">
              {homeworkList.length > 0 ? (
                homeworkList.map((item) => (
                  <div
                    key={item._id}
                      onClick={() => navigate(`/teacher/homework/details/${item._id}`)} 
                    className="cursor-pointer bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-xl p-3 shadow hover:shadow-lg transition"
                  >
                    <p className="text-xs text-gray-700"><span className="font-semibold">🗓️ Assigned On :</span> {new Date(item.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-700"><span className="font-semibold">📌 Deadline :</span> {new Date(item.deadline).toLocaleString()}</p>
                    <p className="text-xs text-gray-700"><span className="font-semibold">🎓 Class :</span> {item.className}</p>
                    <p className="text-xs text-gray-700"><span className="font-semibold">📘 Subject :</span> {item.subject}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">No homework found for selected filter.</p>
              )}
            </div>

            {/* 🔢 Pagination Buttons */}
            {totalCount > 5 && (
              <div className="flex justify-center gap-2 mt-6">
                {/* ← Prev Button */}
                {currentPage !== 1 && (
                  <button
                    onClick={() => {
                      let sum = currentPage - 1;
                      setCurrentPage(sum);
                      if (dummy[0] !== 1) {
                        setDummy((prev) => {
                          const prevNumber = prev[0] - 1;
                          return [prevNumber, ...prev.slice(0, -1)];
                        });
                      }
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    ← Prev
                  </button>
                )}

                {/* 🔢 Page Numbers */}
                {dummy.map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded-full ${
                      num === currentPage
                        ? 'bg-blue-600 text-white font-semibold shadow'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } text-sm`}
                  >
                    {num}
                  </button>
                ))}

                {/* → Next Button */}
                {currentPage < pageCount && (
                  <button
                    onClick={() => {
                      let sum = currentPage + 1;
                      setCurrentPage(sum);
                      if (dummy[dummy.length - 1] !== pageCount) { // ⚠️ HARDCODED VALUE - 12 should likely be dynamic
                        dummy.length < pageCount &&
                        setDummy((prev) => {
                          const next = prev[prev.length - 1] + 1;
                          return [...prev.slice(1), next];
                        })
                      }
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Next →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ✍️ Right Side */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <div className="flex justify-end mb-3">
            {(filterClass || filterSubject || createdAt || deadline || homework) && (
              <button
                onClick={handleClearAll}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-full text-sm font-medium shadow hover:shadow-md transition"
              >
                🧹 Clear All
              </button>
            )}
          </div>

          <h2 className="text-2xl font-extrabold mb-6 text-center text-slate-800 tracking-tight">
            📝 Assign Homework
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Class</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                >
                  <option value="">-- Select Class --</option>
                  {classOptions.map((cls, index) => (
                    <option key={index} value={cls}>{cls}</option>
                  ))}
                </select>
                {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Subject</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                >
                  <option value="">Filter by Subject</option>
                  {subjectList.map((subject, index) => (
                    <option key={index} value={subject}>{subject}</option>
                  ))}
                </select>
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Created Time & Date</label>
                <input
                  type="datetime-local"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                />
                {errors.createdAt && <p className="text-red-500 text-sm mt-1">{errors.createdAt}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Submission Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                />
                {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-2 text-base">Enter Homework</label>
              <textarea
                rows="7"
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 resize-none shadow-sm placeholder-slate-400"
                placeholder="✍️ Write your homework here in detail..."
              ></textarea>
              {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content}</p>}
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition"
              >
                📩 Submit Homework
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
      </PageWrapper>
  );
}

export default AssignHomework;