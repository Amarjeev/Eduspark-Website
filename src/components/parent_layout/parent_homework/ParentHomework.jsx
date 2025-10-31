import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import useParentHomework from "./useParentHomework";
import { showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import PageWrapper from "../../../PageWrapper";
import { useNavigate } from 'react-router-dom';
/**
 * ParentHomework Component
 * Displays homework list and details for parents to view
 * @param {string} className - Class name passed as prop
 */
function ParentHomework({ className ,studentId}) {
  // ========== STATE MANAGEMENT ==========
  const navigate = useNavigate();
  const [homeworkList, setHomeworkList] = useState([]);          // List of all homework assignments
  const [selectedHomework, setSelectedHomework] = useState(null); // Currently selected homework
  const [answers, setAnswers] = useState({});                    // Student answers (keyed by homework ID)
  const [reloadHomework, setReloadHomework] = useState(false);    // Trigger to reload homework list
  const [submittedAnswer, setSubmittedAnswer] = useState("");    // Student's submitted answer
  const [loading, setLoading] = useState(false);                  // Loading state for UI
  const [currentTime, setCurrentTime] = useState();               // Current timestamp (ms)
  const [showAnswer, setShowAnswer] = useState(false); 
  // Ref for scrolling to answer section
  const answerRef = useRef(null);

  // ========== EFFECT HOOKS ==========

  /**
   * Auto-scroll to answer section when homework is selected
   */
  useEffect(() => {
    if (selectedHomework && answerRef.current) {
      answerRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }
  }, [selectedHomework]);

  /**
   * Fetch submitted answer when homework selection changes
   */
  useEffect(() => {
    const fetchAnswer = async () => {
      if (selectedHomework?.homeworkSubmitId) {
        setLoading(true);
        try {
          const id = selectedHomework.homeworkSubmitId;
          const response = await useParentHomework(
            "get-answer", 
            "parent", 
            id, 
            className
          );
          setSubmittedAnswer(response.answerText);
        } catch (error) {
            showError("Failed to fetch answer. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAnswer();
  }, [selectedHomework]);

  /**
   * Fetch homework list on component mount or when reload is triggered
   */
  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true);
      try {
        const response = await useParentHomework(
          "get", 
          "parent", 
          null, 
          className
        );
        setHomeworkList(response.data);
        setCurrentTime(new Date(response.time).getTime());
      } catch (error) {
          showError("Failed to load homework. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();

    // Update countdown timer every second
    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval
  }, [reloadHomework]);

  const handleViewSubmittedAnswer = () => {
       navigate('/verified-submitted-homework/parent', {
    state: {
      role: 'parent',
      childrenId: studentId,
      className: className,
    },
  });
    setShowAnswer(true);
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
};


  // ========== HELPER FUNCTIONS ==========

  /**
   * Formats milliseconds into HH:MM:SS countdown string
   * @param {number} ms - Milliseconds to format
   * @returns {string} Formatted time string
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

  // Show loading spinner while data is being fetched
  if (loading) return <Loading />;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-zinc-50 text-black flex flex-col sm:flex-row p-4">
        {/* ========== LEFT PANEL - HOMEWORK LIST ========== */}
        <div className="w-full sm:w-1/3 border-r border-yellow-900 pr-4 mb-6 sm:mb-0 px-2">
          <h2 className="text-lg font-extrabold text-black mb-4 px-1 uppercase tracking-wide">
            Homework List
          </h2>

          <div className="h-[calc(130vh-270px)] overflow-y-auto pr-3">
            {homeworkList?.length === 0 ? (
              <p className="text-sm text-gray-300 px-1">
                No homework available now.
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
                          status: isExpired ? "expired" : "active" 
                        })
                      }
                      className={`cursor-pointer rounded-xl p-4 border-2 shadow-md transition-all duration-300
                        ${
                          isSelected
                            ? "bg-yellow-400 text-black border-yellow-600"
                            : "bg-zinc-100 text-black border-yellow-500 hover:bg-yellow-100"
                        }`}
                    >
                      <h3 className="font-bold text-base mb-1">{hw.subject}</h3>
                      <p className={`text-xs font-semibold mb-2 ${
                        hw.isAnswered ? "text-green-600" : "text-red-600"
                      }`}>
                        {hw.isAnswered ? "✅ Answer submitted" : "⚠️ No answer submitted yet."}
                      </p>
                      <p className="text-xs mb-1">👤 <span className="font-medium">{hw.name}</span></p>
                      <p className="text-xs mb-1">🏫 Class: {hw.className}</p>
                      <p className="text-xs mb-1">🕒 Created: {format(new Date(hw.createdAt), "dd MMM yyyy")}</p>
                      <p className="text-xs mb-1">📅 Deadline: {format(new Date(hw.deadline), "dd MMM yyyy")}</p>

                      {!isExpired && (
                        <p className="text-xs mt-1 text-red-500 font-mono">
                          ⏳ Time left: {formatCountdown(timeLeft)}
                        </p>
                      )}

                      <p className={`text-xs font-semibold mt-1 ${
                        isExpired ? "text-red-400" : "text-green-400"
                      }`}>
                        {isExpired ? "⛔ Expired" : "✅ Active"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT PANEL - HOMEWORK DETAILS ========== */}
        <div className="w-full sm:w-2/3 pl-0 sm:pl-6">
      <button
      onClick={handleViewSubmittedAnswer}
      className="mt-4 mb-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
      >
      <span className="text-lg">👁️</span> See Submitted Answer
      </button>

          {selectedHomework ? (
            <div className="bg-zinc-50 text-black rounded-lg p-4 sm:p-5 shadow-md max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-200">
              <div className="bg-zinc-100 p-4 rounded-md space-y-4">
                {/* Homework Content Section */}
                <h2 className="text-xl sm:text-2xl font-bold">{selectedHomework.subject}</h2>
                <p className="text-sm sm:text-base whitespace-pre-line break-words">
                  {selectedHomework.content}
                </p>

                {/* Teacher Verification Status */}
                <div className="text-sm sm:text-base mt-3">
                  <span className="font-semibold">Teacher Review:</span>{" "}
                  {selectedHomework?.verified ? (
                    <span className="text-green-600 font-semibold">
                      ✅ Verified by Teacher
                    </span>
                  ) : (
                    <span className="text-orange-500 font-semibold">
                      ⏳ Awaiting Verification
                    </span>
                  )}
                </div>

                {/* Student Answer Section */}
                <p className={`text-xs font-semibold mb-2 ${
                  selectedHomework?.isAnswered ? "text-green-600" : "text-red-600"
                }`}>
                  {selectedHomework?.isAnswered 
                    ? " Student's Submitted Answer 🔒" 
                    : "⚠️ No answer submitted yet."}
                </p>
                <div className="relative">
                  <textarea
                    ref={answerRef}
                    value={answers[selectedHomework._id] || submittedAnswer || ""}
                    disabled={true}
                    rows={5}
                    className="w-full p-3 pr-10 rounded border border-black focus:ring-2 focus:outline-none bg-white text-sm sm:text-base resize-none"
                    placeholder="Answer not available"
                  ></textarea>
                  <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                    🔒
                  </div>
                </div>

                {/* Correct Answer (if available) */}
                {selectedHomework.correctAnswer && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-green-600">
                      ✅ Correct Answer
                    </label>
                    <div className="bg-white border border-green-400 p-3 rounded text-sm sm:text-base">
                      {selectedHomework.correctAnswer}
                    </div>
                  </div>
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

export default ParentHomework;