import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useHomeworkAnswer} from "../../teacher_layout/homework/HomeworkArchive/useArchiveHomework";
import { showError, showSuccess } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import PageWrapper from "../../../PageWrapper";
import { getFromIndexedDB, saveToIndexedDB, removeFromIndexedDB } from "../../../utils/indexedDBUtils";
import { useVerifieddHomework } from "./useStudentHomework";
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
/**
 * VerifiedSubmittedHomework Component
 * Displays verified homework submissions for students to view, including teacher feedback and verification status.
 * Manages homework selection, answer viewing, and status display.
 */
function VerifiedSubmittedHomework() {
  // ========== STATE MANAGEMENT ==========
  const [homeworkList, setHomeworkList] = useState([]); // List of all fetched homework
  const [selectedHomework, setSelectedHomework] = useState(null); // Currently selected homework
  const [loading, setLoading] = useState(false); // Loading state for UI indicators
  const [currentTime, setCurrentTime] = useState(); // Current time for countdown calculations
  const [studentAnswers, setStudentAnswers] = useState([]); // Student's submitted answers
  const [studentId, setStudentId] = useState(null); // Current student ID

  const answerRef = useRef(null); // Reference for scrolling to answer section
  const navigate = useNavigate();
  const location = useLocation();
  const { role, childrenId, className } = location.state || {};
  // ========== EFFECT HOOKS ==========

  /**
   * Fetches verified homework list on component mount
   * Sets up interval for countdown timer
   */
  useEffect(() => {
    const fetchVerifiedHomework = async () => {
      setLoading(true);
      let interval;

      try {
         const userRol = role || "student";
        const response = await useVerifieddHomework(userRol,className ,childrenId);
        setHomeworkList(response?.data);
        setStudentId(response?.studentId);
        setCurrentTime(new Date(response?.time).getTime());

        // Update time every second for countdown
        interval = setInterval(() => {
          setCurrentTime((prev) => prev + 1000);
        }, 1000);
      } catch (error) {
        setLoading(false);
        showError("Unable to load verified homework. Please try again.");
      } finally {
        setLoading(false);
        return () => clearInterval(interval);
      }
    };

    fetchVerifiedHomework();
  }, []);

  /**
   * Persists selected homework to IndexedDB with 5-minute expiry
   */
 // 🧠 Save to IndexedDB when selectedHomework and studentId are available
useEffect(() => {
  if (!selectedHomework || !studentId) return;
  setLoading(true);
  const homeworkWithTimestamp = {
    value: selectedHomework,
    timestamp: Date.now(),
  };

  // Save to DB
  saveToIndexedDB(`selectedHomework_${studentId}`, homeworkWithTimestamp)
    .then(() => {
      const timer = setTimeout(() => {
        removeFromIndexedDB(`selectedHomework_${studentId}`);
      }, 5 * 60 * 1000);

      return () => clearTimeout(timer);
    })
    .catch((err) => {showError("Unable to cache homework locally. Please try again.")})
    .finally(() => setLoading(false));
}, [selectedHomework, studentId]);


// 🧠 Load from IndexedDB when studentId is available
useEffect(() => {
  if (!studentId) return;

  const loadHomeworkFromDB = async () => {
    setLoading(true);
    try {
      const data = await getFromIndexedDB(`selectedHomework_${studentId}`);

      if (data) {
        const now = Date.now();
        const isValid = now - data.timestamp <= 5 * 60 * 1000;

        if (isValid) {
          setSelectedHomework(data.value);
        } else {
          await removeFromIndexedDB(`selectedHomework_${studentId}`);
        }
      }
    } catch (err) {
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  loadHomeworkFromDB();
}, [studentId]);

  /**
   * Auto-scrolls to answers section when homework is selected
   */
  useEffect(() => {
    if (selectedHomework && answerRef.current) {
      answerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedHomework]);

  /**
   * Fetches student's submitted answer when homework is selected
   */
  useEffect(() => {
    if (selectedHomework || childrenId ) {
      setLoading(true);
      const fetchSubmittedStudents = async () => {
        const homeWorkId = selectedHomework?.homeworkSubmitId;
       const userRol = role || "student";
        const payload = {
          homeWorkId,
          studentId:studentId||childrenId,
        };

        try {
          const studentIdArray = await useHomeworkAnswer("get-studentSumbitedAnswer", payload,  userRol);
          setStudentAnswers(studentIdArray[0]);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          showError("Error fetching submitted answers. Please try again.");
        }
      };

      fetchSubmittedStudents();
    }
  }, [selectedHomework ,role ,childrenId]);

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Formats milliseconds into HH:MM:SS countdown string
   * @param {number} ms - Milliseconds remaining
   * @returns {string} Formatted countdown string
   */
  const formatCountdown = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // ========== RENDER LOGIC ==========

  // Show loading indicator while data is being fetched
  if (loading) return <Loading />;

  return (
  <PageWrapper>
    <div className="min-h-screen bg-zinc-50 text-black flex flex-col lg:flex-row p-2 sm:p-4 gap-4 mt-16">
        {/* ========== LEFT PANEL - HOMEWORK LIST ========== */}
        <div className="w-full lg:w-1/3 border border-yellow-900 rounded-xl p-2 sm:p-3 bg-white">
          <button
            onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 rounded bg-yellow-200 hover:bg-yellow-300 text-black font-semibold border border-yellow-600 shadow-sm transition"
          >
          ⬅️ Back
          </button>
        <h2 className="text-base sm:text-lg font-extrabold text-black mb-4 uppercase tracking-wide">
          Homework List
        </h2>

        {/* Homework List Items */}
        <div className="space-y-3 overflow-y-auto max-h-[85vh] scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-200">
          {homeworkList?.map((hw) => {
            const deadlineTime = new Date(hw?.deadline).getTime();
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
                className={`cursor-pointer rounded-xl p-3 border-2 shadow-md transition-all duration-300 ${
                  isSelected
                    ? "bg-yellow-400 text-black border-yellow-600"
                    : "bg-zinc-100 text-black border-yellow-500 hover:bg-yellow-100"
                }`}
              >
                <h3 className="font-bold text-sm sm:text-base mb-1">{hw.subject}</h3>
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
      </div>

      {/* ========== RIGHT PANEL - HOMEWORK DETAILS & ANSWERS ========== */}
      <div className="w-full lg:w-2/3">
        {selectedHomework ? (
          <div className="bg-zinc-50 text-black rounded-lg p-3 sm:p-5 shadow-md max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400  scrollbar-track-yellow-200">
            <div className="bg-zinc-100 p-3 sm:p-4 rounded-md space-y-4">
              <h2 className="text-lg sm:text-2xl font-bold">{selectedHomework.subject}</h2>
              <p className="text-sm sm:text-base whitespace-pre-line break-words">
                {selectedHomework.content}
              </p>

              <div className="text-sm sm:text-base mt-3">
                <span className="font-semibold">Teacher Review:</span>{" "}
                {studentAnswers?.teacherVerified ? (
                  <span className="text-green-600 font-semibold">✅ Verified by Teacher</span>
                ) : (
                  <span className="text-orange-500 font-semibold">⏳ ❌ Teacher not verified yet</span>
                )}
              </div>

              {studentAnswers && (
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
                    <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {studentAnswers?.VerifiedanswerStatus === "correct" && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded shadow">
                          ✅ Accept Answer (Correct)
                        </button>
                      )}
                      {studentAnswers?.VerifiedanswerStatus === "wrong" && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded shadow">
                          ❌ Reject Answer (Incorrect)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    {studentAnswers?.teacherVerified === "true" && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          📝 Teacher's Comment
                        </label>
                        <textarea
                          value={
                            studentAnswers?.teacherComment?.trim()
                              ? studentAnswers.teacherComment
                              : "✏️ No comments have been provided by the teacher yet."
                          }
                          readOnly
                          rows={4}
                          maxLength={300}
                          className="w-full p-3 border border-gray-300 rounded resize-none bg-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Add your feedback or explanation here..."
                        />
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center mt-20 text-gray-400 text-sm sm:text-base">
            Select homework to view details
          </div>
        )}
      </div>
    </div>
  </PageWrapper>
);

}

export default VerifiedSubmittedHomework;