import React, { useState, useEffect, useRef } from "react";
import { format, isBefore } from "date-fns";
import { Calendar } from "lucide-react";
import {useStudentHomework }from "./useStudentHomework";
import { showSuccess, showError } from "../../../utils/toast";
import { getFromIndexedDB, saveToIndexedDB, removeFromIndexedDB } from '../../../utils/indexedDBUtils';
import Loading from "../../loading_ui/Loading"; // ⏳ Loading spinner UI
import PageWrapper from "../../../PageWrapper";
import { useNavigate } from 'react-router-dom';
// import VerifiedSubmittedHomework from "./VerifiedSubmittedHomework";

function StudentHomework() {
  // 📌 Stores the list of homework fetched from backend
  const [homeworkList, setHomeworkList] = useState([]);

  // 📌 Tracks the currently selected homework item
  const [selectedHomework, setSelectedHomework] = useState(null);

  // 📌 Stores the typed answers by student, mapped by homework ID
  const [answers, setAnswers] = useState({});

  // 🔁 Triggers re-fetching of homework list
  const [reloadHomework, setReloadHomework] = useState(false);

  // 📌 Stores submitted answer text (retrieved from backend)
  const [submittedAnswer, setSubmittedAnswer] = useState('');

  // ⏳ Controls loading spinner visibility
  const [loading, setLoading] = useState(false);

  // ⏱️ Stores the current time (used for countdowns/deadlines)
  const [currentTime, setCurrentTime] = useState();

 const [showAnswer, setShowAnswer] = useState(false);

  const answerRef = useRef(null);

  const navigate = useNavigate();
  
  const handleViewSubmittedAnswer = () => {
       navigate('/verified-submitted-homework/student')
    setShowAnswer(true);
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
};
  
  useEffect(() => {
      setShowAnswer(false)
    if (selectedHomework && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedHomework]);

  // 💾 Save the current homework + typed answer to IndexedDB when changed
  useEffect(() => {
    if (selectedHomework && answers[selectedHomework._id]?.trim()) {
      const key = `homework-${selectedHomework._id}`;
      saveToIndexedDB(key, {
        homework: selectedHomework,
        answer: answers[selectedHomework._id],
      });
    }
  }, [selectedHomework, answers]);

  // 💾 Load the saved answer from IndexedDB when homework is selected
  useEffect(() => {
    if (selectedHomework) {
      (async () => {
        const key = `homework-${selectedHomework._id}`;
        const savedData = await getFromIndexedDB(key);
        setAnswers((prev) => ({
          ...prev,
          [selectedHomework._id]: savedData?.answer || "",
        }));
      })();
    }
  }, [selectedHomework]);

  // 📥 Fetch student's previously submitted answer from backend
  useEffect(() => {
    const fetchAnswer = async () => {
      if (selectedHomework?.homeworkSubmitId) {
        setLoading(true);
        try {
          const id = selectedHomework.homeworkSubmitId;
          const response = await useStudentHomework('get-answer', 'student', id);
          setSubmittedAnswer(response.answerText);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          showError("Failed to load answer. Please try again.");
        }
      }
    };

    fetchAnswer();
  }, [selectedHomework]);

  // 📥 Fetch homework list for student and setup live timer
  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true);
      try {
        const response = await useStudentHomework('get', 'student');
        setHomeworkList(response.data); // 📌 Store fetched homework
        setCurrentTime(new Date(response.time).getTime()); // ⏱️ Save current time for deadline logic
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError("Failed to load homework. Please try again.");
      }
    };

    fetchHomework();

    // ⏲️ Update the current time every second
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1000);
    }, 1000);

    // 🧹 Cleanup on component unmount
    return () => clearInterval(interval);
  }, [reloadHomework]);

  // ⏳ Format time in HH:MM:SS
  const formatCountdown = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // 📨 Handle homework submission
  const handleSubmit = async (e) => {
    const trimmedAnswer = (answers[selectedHomework._id] || "").trim();

    // ❌ Empty check
    if (!trimmedAnswer) {
      return showError("❌ Please enter your answer before submitting.");
    }

    // ✍️ Minimum character requirement
    if (trimmedAnswer.length < 10) {
      return showError("✍️ Your answer is too short. Minimum 10 characters required.");
    }

    // 🚫 Maximum character limit
    if (trimmedAnswer.length > 2000) {
      return showError("⚠️ Your answer is too long. Maximum allowed is 2000 characters.");
    }

    // ⚠️ Homework status check
    if (e.status !== "active") {
      return showError("⚠️ This homework is expired and cannot be submitted.");
    }

    setLoading(true);

    const { className, employid, name, subject, _id, status, isAnswered, homeworkSubmitId } = e;

    // 🧾 Prepare submission payload
    const payload = {
      className,
      employid,
      studentName: name,
      subject,
      homeworkId: _id,
      answer: trimmedAnswer,
      status: status,
      isAnswered: isAnswered || false,
      dbID: homeworkSubmitId || null
    };

    // 📤 Submit answer to backend
    try {
      const response = await useStudentHomework('post', 'student', payload);
      setLoading(false);

      if (response.success) {
        setReloadHomework(true); // 🔁 Refresh list after submit
        showSuccess('Homework submitted successfully');
      }
    } catch (error) {
      setLoading(false);
      showError(" Failed to submit homework. Please try again.");
      return;
    }

    // 🧹 Cleanup local state & storage
    removeFromIndexedDB(`homework-${selectedHomework._id}`);
    setSelectedHomework(null);
    setAnswers((prev) => {
      const updatedAnswers = { ...prev };
      delete updatedAnswers[selectedHomework._id];
      return updatedAnswers;
    });
  };

  // 🧼 Clear the answer textarea and remove from IndexedDB
  const handleClear = async () => {
    if (!selectedHomework) return alert('no id');

    setLoading(true);
    const key = `homework-${selectedHomework._id}`;
    await removeFromIndexedDB(key);

    setSelectedHomework(null);
    setAnswers((prev) => ({
      ...prev,
      [selectedHomework._id]: "",
    }));
    setLoading(false);
  };

  // ⏳ Show loader while fetching or submitting
  if (loading) return <Loading />;


  return (
    <PageWrapper>
    <div className="min-h-screen bg-black text-yellow-400 flex flex-col sm:flex-row p-4">

      {/* 📅 Left Panel - Homework List */}
      <div className="w-full sm:w-1/3 border-r border-yellow-900 pr-4 mb-6 sm:mb-0 mt-16 px-2">

        {/* 🔠 Homework List Title */}
        <h2 className="text-lg font-extrabold text-yellow-500 mb-4 px-1 uppercase tracking-wide">Homework List</h2>

        {/* 📝 Homework Items Scrollable List */}
        <div className="h-[calc(120vh-270px)] overflow-y-auto pr-3">
          {homeworkList?.length === 0 ? (
            // ❕ No homework to show
            <p className="text-sm text-gray-300 px-1">No homework available now.</p>
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
                      setSelectedHomework({ ...hw, status: isExpired ? "expired" : "active" })
                    }
                    className={`cursor-pointer rounded-xl p-4 border-2 shadow-md transition-all duration-300
                      ${isSelected ? "bg-yellow-400 text-black border-yellow-600" : "bg-black text-yellow-100 border-yellow-500 hover:bg-yellow-100 hover:text-black"}`}
                  >
                    <h3 className="font-bold text-base mb-1">{hw.subject}</h3>
                    {hw.isAnswered === true ? (
                      <p className="text-xs text-green-600 font-semibold mb-2">
                        ✅ Answer submitted by student.
                        </p>
                      ) : (
                    <p className="text-xs text-red-600 font-semibold mb-2">
                  ⚠️ No answer submitted yet.
                  </p>
                  )}

                    <p className="text-xs mb-1">👤 <span className="font-medium">{hw.name}</span></p>
                    <p className="text-xs mb-1">🏫 Class: {hw.className}</p>
                    <p className="text-xs mb-1">🕒 Created: {format(new Date(hw.createdAt), "dd MMM yyyy")}</p>
                    <p className="text-xs mb-1">📅 Deadline: {format(new Date(hw.deadline), "dd MMM yyyy")}</p>

                    {/* ⏳ Countdown timer */}
                    {!isExpired && (
                      <p className="text-xs mt-1 text-red-500 font-mono">
                        ⏳ Time left: {formatCountdown(timeLeft)}
                      </p>
                    )}

                    {/* 🚦 Status Indicator */}
                    <p className={`text-xs font-semibold mt-1 ${isExpired ? "text-red-400" : "text-green-400"}`}>
                      {isExpired ? "⛔ Expired" : "✅ Active"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 📄 Right Panel - Homework Content */}
        <div className="w-full sm:w-2/3 pl-0 sm:pl-6 mt-18">
      <button
      onClick={handleViewSubmittedAnswer}
      className="mt-4 mb-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
      >
      <span className="text-lg">👁️</span> See Submitted Answer
      </button>

  {selectedHomework && !showAnswer ? (
    <div className="bg-amber-100 text-black rounded-lg p-4 sm:p-5 shadow-md max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-200">

      {/* 🧾 Homework Details */}
      <h2 className="text-xl sm:text-2xl font-bold mb-3">{selectedHomework.subject}</h2>

      {/* 📜 Homework Content */}
      <p className="text-sm sm:text-base mb-4 whitespace-pre-line break-words">{selectedHomework.content}</p>

      {/* ✍️ Answer Input */}
      <label className="block text-sm font-medium mb-2">Your Answer:</label>

      {/* 🔒 Expired Message */}
      {selectedHomework?.status === "expired" && (
        <h1 className="text-red-600 text-base font-semibold mb-2">
          ⛔ This homework has expired. You can no longer submit it.
        </h1>
      )}

      {/* 📝 Answer Textarea */}
      <textarea
        ref={answerRef}
        value={answers[selectedHomework._id] ||submittedAnswer|| ""}
        onChange={(e) => {
        const updatedAnswer = e.target.value;
        setAnswers((prev) => ({
          ...prev,
        [selectedHomework._id]: updatedAnswer,
          }));
        }}
        rows={5}
        disabled={selectedHomework?.status === "expired"}
        className="w-full p-3 rounded border border-yellow-400 focus:ring-2 focus:ring-yellow-300 focus:outline-none bg-white text-sm sm:text-base"
        placeholder="Write your answer here..."
        ></textarea>

      {/* 🖱️ Buttons */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          disabled={selectedHomework?.status === "expired"}
          onClick={() => handleSubmit(selectedHomework)}
          className={`px-4 py-2 rounded font-semibold border transition 
            ${
              selectedHomework?.status === "expired"
                ? "bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white border-green-700 hover:bg-green-700"
            }`}
        >
          Submit
        </button>

        <button
          onClick={handleClear}
          className="bg-red-500 text-white px-4 py-2 rounded border border-red-600 hover:bg-red-600 transition"
        >
          Clear
        </button>
      </div>

    </div>
  ) : (
    <div className="text-center mt-20 text-gray-400">Select homework to view details</div>
  )}
</div>

      </div>
      </PageWrapper>
  );
}

export default StudentHomework;
