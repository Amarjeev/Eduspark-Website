import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useArchiveHomework, useHomeworkAnswer, useverifySubmittedAnswer } from "./useArchiveHomework";
import { showError, showSuccess } from "../../../../utils/toast";
import Loading from "../../../loading_ui/Loading";
import PageWrapper from "../../../../PageWrapper";
import { getFromIndexedDB } from "../../../../utils/indexedDBUtils";

/**
 * ParentHomework Component
 * Displays homework list and details for parents to view
 * @param {string} className - Class name passed as prop
 */
function HomeworkList() {
  // ========== STATE MANAGEMENT ==========

  const [homeworkList, setHomeworkList] = useState([]); // 📋 List of all fetched homework
  const [selectedHomework, setSelectedHomework] = useState(null); // ✅ Homework currently selected
  const [loading, setLoading] = useState(false); // 🔄 UI loading flag
  const [currentTime, setCurrentTime] = useState(); // 🕒 Current time used for countdown
  const [submittedStudents, setSubmittedStudents] = useState([]); // 👨‍🎓 Students who submitted
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]); // 🕑 Students who haven't submitted
  const [studentAnswers, setStudentAnswers] = useState([]); // ✍️ Selected student's answers

  const [classOptions, setClassOptions] = useState([]); // 📚 All available classes
  const [subjectList, setSubject] = useState([]); // 🧪 All available subjects
  const [startDate, setStartDate] = useState(""); // 📅 Selected homework date

  const [teacherComment, setTeacherComment] = useState(""); // 💬 Teacher's comment

  const [selectedClassName, setSelectedClassName] = useState(); // ✅ Selected class filter
  const [selectedSubjectName, setSelectedSubjectName] = useState(); // ✅ Selected subject filter
  const [selectedId, setSelectedId] = useState(""); // 📌 Selected homework ID
  const [studentList, setStudentList] = useState([]); // 👩‍🏫 List of all students

  const [openAnswered, setOpenAnswered] = useState(false); // 🔓 Answered dropdown visibility
  const [openWithout, setOpenWithout] = useState(false); // 🔓 Not Answered dropdown visibility

  const [selectedAnsweredUser, setSelectedAnsweredUser] = useState(null); // ✅ Selected student with answer
  const [selectedNotAnsweredUser, setSelectedNotAnsweredUser] = useState(null); // 🚫 Selected student without answer
  const [answerStatus, setAnswerStatus] = useState(null); // 📊 Answer correctness state

  const answerRef = useRef(null); // 📍 Ref to scroll to answer panel

  // ✅ Sync state with fetched answer data
  useEffect(() => {
    if (studentAnswers?.VerifiedanswerStatus) {
      setAnswerStatus(studentAnswers.VerifiedanswerStatus);
    }
  }, [studentAnswers ,selectedHomework]);

  /**
   * Submits teacher comment and verification for the answer
   */
  const handleSubmitComment = async () => {
    const trimmedComment = teacherComment.trim();

    if (trimmedComment && trimmedComment.length > 300) {
      showError("Comment is too long. Maximum 300 characters allowed.");
      return;
    }

    if (trimmedComment && trimmedComment.length < 10) {
      showError("Comment is too short. Minimum 10 characters required.");
      return;
    }

    if (!answerStatus) {
      showError("Please select if the answer is correct or incorrect.");
      return;
    }

    const payload = {
      homeworkId: selectedHomework?.homeworkSubmitId,
      studentId: selectedAnsweredUser?.studentId,
      answerStatus: answerStatus,
      teacherComment: teacherComment || "No comment provided by teacher.",
    };

    try {
      const response = await useverifySubmittedAnswer(payload);

      if (response?.success) {
        showSuccess("Homework verified successfully");
      }
    } catch (error) {
      showError("Something went wrong while verifying the homework. Please try again.");
    }
  };

  // ========== EFFECT HOOKS ==========

  // ⬇️ Load dropdown data from local IndexedDB storage
  useEffect(() => {
    const loadDropdownData = async () => {
      const classData = await getFromIndexedDB("school-class-List-teacher");
      setClassOptions(classData || []);
      const subjectData = await getFromIndexedDB("school-subjects-List-teacher");
      setSubject(subjectData || []);
    };
    loadDropdownData();
  }, []);

  // 📥 Fetch homework data whenever filters are selected
  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const response = await useArchiveHomework("get", selectedClassName, selectedSubjectName, startDate);
        setHomeworkList(response.data);
        setStudentList(response.studentlist);
        setCurrentTime(new Date(response.time).getTime());
      } catch (error) {
        showError("Unable to fetch homework. Please try again.");
      }
    };

    if (selectedClassName || selectedSubjectName || startDate) {
      fetchHomework();
    }

    // ⏲️ Update clock every second for countdown
    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(interval); // 🧹 Clean interval on unmount
  }, [selectedClassName, selectedSubjectName, startDate ]);

  // 🎯 Auto-scroll to answers section after selecting homework
  useEffect(() => {
    if (selectedHomework && answerRef.current) {
      answerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedHomework]);

  // 📊 Fetch students who answered and who did not
  useEffect(() => {

    const fetchAnswer = async () => {
      const homeworkId = selectedHomework?._id;
      if (homeworkId) {
        const studentIdArray = await useHomeworkAnswer("get-answerStudentList", homeworkId, 'teacher');

        const submitted = [];
        const notSubmitted = [];

        studentList.forEach((item) => {
          if (studentIdArray.includes(item.studentId)) {
            submitted.push(item);
          } else {
            notSubmitted.push(item);
          }
        });

        setSubmittedStudents(submitted);
        setNotSubmittedStudents(notSubmitted);
      }
    };

    if (selectedHomework) {
      fetchAnswer();
    }
  }, [selectedHomework]);

  /**
   * Formats ms into HH:MM:SS for countdown display
   */
  const formatCountdown = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  /**
   * Handles student selection from dropdowns
   */
  const handleSelect = (user, status) => {
    if (status === "Answered") {
      setSelectedAnsweredUser(user);
      setOpenAnswered(false);
      setSelectedNotAnsweredUser(null);
    }
    if (status === "Without") {
      setSelectedNotAnsweredUser(user);
      setOpenWithout(false);
      setSelectedAnsweredUser(null);
    }
  };
//clear current values in righte panel
  useEffect(() => {
    setSelectedAnsweredUser(null);
    setOpenAnswered(false);
    setSelectedNotAnsweredUser(null);
    setSelectedNotAnsweredUser(null);
    setOpenWithout(false);
    setSelectedAnsweredUser(null);
  },[selectedHomework])

  // 🧠 Fetch selected student's submitted answer when selected
  useEffect(() => {
    if (selectedAnsweredUser) {
      const fetchSubmittedStudents = async () => {
        const homeWorkId = selectedHomework.homeworkSubmitId;
        const studentId = selectedAnsweredUser.studentId;
        const payload = {
          homeWorkId,
          studentId,
        };

        try {
          const studentIdArray = await useHomeworkAnswer("get-studentSumbitedAnswer", payload);
          setStudentAnswers(studentIdArray[0]);
        } catch (error) {
            showError("Unable to fetch submitted answers. Please try again.");
        }
      };

      fetchSubmittedStudents();
    }
  }, [selectedAnsweredUser]);

  // ========== RENDER LOGIC ==========

  // 🌀 Show loader while data is loading
  if (loading) return <Loading />;

 return (
  <PageWrapper>
    <div className="min-h-screen bg-zinc-50 text-black flex flex-col sm:flex-row p-4">
      {/* ========== LEFT PANEL - HOMEWORK LIST ========== */}
      <div className="w-full sm:w-1/3 border-r border-yellow-900 pr-4 mb-6 sm:mb-0 px-2">
        <h2 className="text-lg font-extrabold text-black mb-4 px-1 uppercase tracking-wide">
          Homework List
        </h2>

        {/* 🔍 Filters - Two Rows: Date + Class/Subject */}
        <div className="flex flex-wrap gap-3 mb-3">
          {/* 🏫 Class Dropdown */}
          <select
            value={selectedClassName}
            onChange={(e) => setSelectedClassName(e.target.value)}
            className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
          >
            <option value="">-- Select Class --</option>
            {classOptions.map((cls, index) => (
              <option key={index} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {/* 📘 Subject Dropdown */}
          {selectedClassName && (
            <select
              value={selectedSubjectName}
              onChange={(e) => setSelectedSubjectName(e.target.value)}
              className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
            >
              <option value="">-- Select Subject --</option>
              {subjectList.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedClassName && (
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
              placeholder="Start Date"
            />
          </div>
        )}

        <div className="h-[calc(130vh-270px)] overflow-y-auto pr-3">
          {homeworkList?.length === 0 ? (
            <p className="text-sm text-gray-300 px-1">
              No homework available for selected date.
            </p>
          ) : (
            <div className="space-y-4">
              {homeworkList.map((hw) => {
                const deadlineTime = new Date(hw.deadline).getTime();
                const isExpired = deadlineTime <= currentTime;
                const timeLeft = deadlineTime - currentTime;
                const isSelected = selectedHomework?._id === hw._id;

                return (
                  <div
                    key={hw._id}
                    onClick={() =>
                      setSelectedHomework({
                        ...hw,
                        status: isExpired ? "expired" : "active",
                      })
                    }
                    className={`cursor-pointer rounded-xl p-4 border-2 shadow-md transition-all duration-300 ${
                      isSelected
                        ? "bg-yellow-400 text-black border-yellow-600"
                        : "bg-zinc-100 text-black border-yellow-500 hover:bg-yellow-100"
                    }`}
                  >
                    <h3 className="font-bold text-base mb-1">{hw.subject}</h3>
                    <p className="text-xs mb-1">
                      👤 <span className="font-medium">{hw.name}</span>
                    </p>
                    <p className="text-xs mb-1">🏫 Class: {hw.className}</p>
                    <p className="text-xs mb-1">
                      🕒 Created: {format(new Date(hw.createdAt), "dd MMM yyyy")}
                    </p>
                    <p className="text-xs mb-1">
                      📅 Deadline: {format(new Date(hw.deadline), "dd MMM yyyy")}
                    </p>

                    {!isExpired && (
                      <p className="text-xs mt-1 text-red-500 font-mono">
                        ⏳ Time left: {formatCountdown(timeLeft)}
                      </p>
                    )}

                    <p
                      className={`text-xs font-semibold mt-1 ${
                        isExpired ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {isExpired ? "⛔ Deadline Passed" : "✅ Within Deadline"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========== RIGHT PANEL - HOMEWORK DETAILS & USER SELECTION ========== */}
      <div className="w-full sm:w-2/3 pl-0 sm:pl-6">
        {selectedHomework && (
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Answered Students Dropdown */}
            <div className="w-full sm:w-64 mt-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Answered Student
              </label>
              <button
                onClick={() => setOpenAnswered(!openAnswered)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {selectedAnsweredUser ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={
                        selectedAnsweredUser.profilePicUrl || "/images/avatar.png"
                      }
                      alt={selectedAnsweredUser.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{selectedAnsweredUser.name}</span>
                  </div>
                ) : (
                  <span className="text-green-600">-- Choose Answered Person --</span>
                )}
                <svg
                  className="w-4 h-4 ml-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openAnswered && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-green-600 rounded-md shadow max-h-60 overflow-y-auto">
            {submittedStudents.length > 0 ? (
              submittedStudents.map((user) => (
            <li
              key={user.studentId}
              className="flex items-center space-x-2 p-2 hover:bg-green-300 cursor-pointer"
              onClick={() => handleSelect(user, "Answered")}
            >
          <img
              src={user.profilePicUrl || "/images/avatar.png"}
              alt={user.name}
              className="w-6 h-6 rounded-full"
          />
          <span>{user.name}</span>
          </li>
          ))
          ) : (
            <li className="p-2 text-gray-500 text-center">No answered students</li>
          )}
        </ul>
          )}

            </div>

            {/* Pending Submissions Dropdown */}
            <div className="w-full sm:w-64 mt-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pending Submissions
              </label>
              <button
                onClick={() => setOpenWithout(!openWithout)}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {selectedNotAnsweredUser ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={
                        selectedNotAnsweredUser.profilePicUrl || "/images/avatar.png"
                      }
                      alt={selectedNotAnsweredUser.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{selectedNotAnsweredUser.name}</span>
                  </div>
                ) : (
                  <span className="text-red-600 border-red-600">
                    Students Without Submission
                  </span>
                )}
                <svg
                  className="w-4 h-4 ml-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openWithout && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-red-600 rounded-md shadow max-h-60 overflow-y-auto">
            {notSubmittedStudents.length > 0 ? (
            notSubmittedStudents.map((user) => (
            <li
            key={user.studentId}
            className="flex items-center space-x-2 p-2 hover:bg-red-400 cursor-pointer"
            onClick={() => handleSelect(user, "Without")}
          >
          <img
            src={user.profilePicUrl || "/images/avatar.png"}
            alt={user.name}
            className="w-6 h-6 rounded-full"
          />
          <span>{user.name}</span>
        </li>
        ))
        ) : (
      <li className="p-2 text-gray-500 text-center">No students without submission</li>
      )}
      </ul>
      )}

            </div>
          </div>
        )}

        {/* Homework Details */}
        {selectedHomework ? (
          <div className="bg-zinc-50 text-black rounded-lg p-4 sm:p-5 shadow-md max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-200">
            <div className="bg-zinc-100 p-4 rounded-md space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">{selectedHomework.subject}</h2>
              <p className="text-sm sm:text-base whitespace-pre-line break-words">
                {selectedHomework.content}
              </p>

              {selectedAnsweredUser && (
                <div className="text-sm sm:text-base mt-3">
                  <span className="font-semibold">Teacher Review:</span>{" "}
                  {studentAnswers?.teacherVerified ? (
                    <span className="text-green-600 font-semibold">✅ Verified by Teacher</span>
                  ) : (
                    <span className="text-orange-500 font-semibold">⏳ Awaiting Verification</span>
                  )}
                </div>
              )}

              {(selectedNotAnsweredUser || selectedAnsweredUser) && (
                <div className="mt-4 p-4 border rounded-lg shadow-sm bg-gray-50">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Selected Student
                  </h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedAnsweredUser?.profilePicUrl ||
                        selectedNotAnsweredUser?.profilePicUrl ||
                        "/images/avatar.png"
                      }
                      alt="Student Avatar"
                      className="w-10 h-10 rounded-full border"
                    />
                    <div className="text-sm sm:text-base">
                      <p className="text-blue-700 font-medium">
                        {selectedAnsweredUser?.name || selectedNotAnsweredUser?.name}
                      </p>
                      <p className="text-gray-600">
                        ID: {selectedAnsweredUser?.studentId || selectedNotAnsweredUser?.studentId}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedNotAnsweredUser && (
                <div className="mt-6 text-center text-sm sm:text-base text-gray-500">
                  <h1 className="text-lg sm:text-xl font-semibold text-red-500">
                    ❌ No Answer Submitted
                  </h1>
                  <p className="mt-1">
                    This student has not submitted their homework yet.
                  </p>
                </div>
              )}

              {selectedAnsweredUser && (
                <>
                  <p
                    className={`text-xs font-semibold mb-2 ${
                      selectedHomework?.isAnswered ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {selectedHomework?.isAnswered
                      ? " Student's Submitted Answer 🔒"
                      : "⚠️ No answer submitted yet."}
                  </p>
                  <div className="relative">
                    <textarea
                      ref={answerRef}
                      value={studentAnswers.answerText || ""}
                      disabled={true}
                      rows={5}
                      className="w-full p-3 pr-10 rounded border border-black focus:ring-2 focus:outline-none bg-white text-sm sm:text-base resize-none"
                      placeholder="Answer not available"
                    ></textarea>
                    <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                      🔒
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => setAnswerStatus("correct")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded shadow"
                      >
                        ✅ Accept Answer (Correct)
                      </button>
                      <button
                        onClick={() => setAnswerStatus("wrong")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded shadow"
                      >
                        ❌ Reject Answer (Incorrect)
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 text-sm font-medium text-gray-600">
                      📊 Selected Status:{" "}
                      {answerStatus === "correct" ? (
                        <span className="text-green-600 font-semibold">✅ Correct</span>
                      ) : answerStatus === "wrong" ? (
                        <span className="text-red-600 font-semibold">❌ Incorrect</span>
                      ) : (
                        <span className="text-black italic">
                          {studentAnswers?.VerifiedanswerStatus === "correct"
                            ? "✅ Correct"
                            : studentAnswers?.VerifiedanswerStatus === "wrong"
                            ? "❌ Incorrect"
                            : "⏸️ Not Selected"}
                        </span>
                      )}
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                      📝 Teacher's Comment
                    </label>

                    <textarea
                      value={teacherComment || studentAnswers.teacherComment}
                      onChange={(e) => setTeacherComment(e.target.value)}
                      rows={4}
                      maxLength={300}
                      placeholder="Add your feedback or explanation here..."
                      className="w-full p-3 border border-gray-300 rounded resize-none bg-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleSubmitComment}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
                      >
                        Save Comment
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center mt-20 text-gray-400">
            Select homework to view details
          </div>
        )}
      </div>
    </div>
  </PageWrapper>
);

}

export default HomeworkList;