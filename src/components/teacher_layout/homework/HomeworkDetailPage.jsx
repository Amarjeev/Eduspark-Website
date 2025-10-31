import React, { useState, useEffect } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { getFromIndexedDB } from '../../../utils/indexedDBUtils';
import { showError, showSuccess } from "../../../utils/toast"; 
import Loading from '../../loading_ui/Loading';
import PageWrapper from '../../../PageWrapper';

const HomeworkDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔑 States for homework info, dropdowns, and UI control
  const [homeworkId, setHomeworkId] = useState(null);
  const [homeworkData, setHomeworkData] = useState(null);
  const [classData, setClassData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  // ⏳ UI Loading & Sidebar Toggle
  const [loading, setLoading] = useState(false);

  // 🧾 Homework state
  const [homework, setHomework] = useState({
    className: '',
    subject: '',
    content: '',
    createdAt: '',
    deadline: '',
  });

  // ✏️ Edit mode & edited copy of homework
  const [editMode, setEditMode] = useState(false);
  const [editedHomework, setEditedHomework] = useState({ ...homework });

  // 🔄 On mount: fetch class/subject data & homework details
  useEffect(() => {
    setLoading(true);

    if (id) setHomeworkId(id);

    (async () => {
      try {
        // 📥 Get dropdown data from IndexedDB
        const classList = await getFromIndexedDB("school-class-List-teacher");
        const subjectList = await getFromIndexedDB("school-subjects-List-teacher");

        setClassData(classList || []);
        setSubjectData(subjectList || []);

        // 📡 Fetch homework details from backend
        const response = await axios.get(
          `${BaseUrl}teacher/homework/update/${id}`,
          { withCredentials: true }
        );

        const data = response.data;
        setHomeworkData(data);

        // 🎯 Prepare editable homework fields
        const updated = {
          className: data.className || '',
          subject: data.subject || '',
          content: data.content || '',
          createdAt: data.createdAt || '',
          deadline: data.deadline || '',
        };

        setHomework(updated);
        setEditedHomework(updated);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError(' Failed to fetch homework data. please try again');
      }
    })();
  }, [id]);

  // 🖊 Enable edit mode
  const handleEditClick = () => setEditMode(true);

  // ❌ Cancel edit and restore original homework
  const handleCancelClick = () => {
    setEditedHomework({ ...homework });
    setEditMode(false);
  };

  // 💾 Handle save button click
  const handleSaveClick = async () => {
    setLoading(true);

    // 📅 Validate date fields
    const createdAt = editedHomework.createdAt;
    const deadline = editedHomework.deadline;
    const createdDate = new Date(createdAt);
    const deadlineDate = new Date(deadline);
    const errors = {};

    if (!createdAt || !deadline) {
      errors.deadline = "Please select both the assigned date and deadline.";
    } else if (createdDate.getTime() === deadlineDate.getTime()) {
      errors.deadline = "The deadline cannot be the same as the assigned time. Please choose a later time.";
    } else if (deadlineDate.getTime() < createdDate.getTime()) {
      errors.deadline = "The deadline must be after the assigned time.";
    }

    // ✅ Class & Subject validation
    const filterClass = editedHomework.className;
    const filterSubject = editedHomework.subject;

    if (!filterClass?.trim()) errors.class = "Class is required.";
    if (!filterSubject?.trim()) errors.subject = "Subject is required.";

    // 📝 Validate homework content
    const content = editedHomework.content?.trim();
    if (!content) {
      errors.content = "Homework content is required.";
    } else if (content.length < 20) {
      errors.content = "Homework content is too short. Minimum 20 characters required.";
    } else if (content.length > 1000) {
      errors.content = "Homework content is too long. Maximum 1000 characters allowed.";
    }

    // ❌ Show first error if validation fails
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      showError(errors.deadline || errors.content || errors.class || errors.subject);
      return;
    }

    // 💾 Save changes locally and to backend
    setHomework({ ...editedHomework });
    setEditMode(false);

    const response = await axios.put(
      `${BaseUrl}teacher/homework/update/${id}`,
      editedHomework,
      { withCredentials: true }
    );

    setLoading(false);
    showSuccess("Homework updated successfully!");
  };

  // 🧠 Handle input changes during editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedHomework((prev) => ({ ...prev, [name]: value }));
  };

  // 🔄 Show loading while fetching or saving
  if (loading) return <Loading />;


  return (
   <PageWrapper>
  <div className="min-h-screen bg-gray-100 p-4 md:p-8">
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
      
      {/* 🔰 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400 text-black transition"
          >
            ⬅ Back
          </button>
          <h2 className="text-2xl font-bold text-indigo-600">
            📘 Homework Details
          </h2>
        </div>

        {!editMode ? (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow transition duration-300"
          >
            <Pencil size={16} />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleCancelClick}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 📄 Homework Info Section */}
      <div className="space-y-5 text-gray-700 text-sm md:text-base">

        {/* 👩‍🏫 Teacher */}
        <p>
          <strong>👨‍🏫 Teacher:</strong> {homeworkData?.name}
        </p>

        {/* 📚 Subject Dropdown */}
        <div>
          <strong>📚 Subject:</strong>{' '}
          {!editMode ? (
            homework.subject
          ) : (
            <select
              name="subject"
              value={editedHomework.subject}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Subject</option>
              {subjectData?.map((subject, index) => (
                <option key={index} value={subject.name || subject}>
                  {subject.name || subject}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 🏫 Class Dropdown */}
        <div>
          <strong>🏫 Class:</strong>{' '}
          {!editMode ? (
            homework.className
          ) : (
            <select
              name="className"
              value={editedHomework.className}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Class</option>
              {classData?.map((cls, index) => (
                <option key={index} value={cls.name || cls}>
                  {cls.name || cls}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 🗓️ Created At */}
        <div>
          <strong>🗓️ Assigned:</strong>{' '}
          {!editMode ? (
            moment(homework.createdAt).format('MMMM Do YYYY, h:mm A')
          ) : (
            <input
              type="datetime-local"
              name="createdAt"
              value={moment(editedHomework.createdAt).format("YYYY-MM-DDTHH:mm")}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* ⏰ Deadline */}
        <div>
          <strong>⏰ Deadline:</strong>{' '}
          {!editMode ? (
            moment(homework.deadline).format('MMMM Do YYYY, h:mm A')
          ) : (
            <input
              type="datetime-local"
              name="deadline"
              value={moment(editedHomework.deadline).format("YYYY-MM-DDTHH:mm")}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* 📝 Homework Content */}
        <div>
          <strong>📝 Content:</strong>
          {!editMode ? (
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 text-gray-800 text-sm md:text-base">
              {homework.content}
            </pre>
          ) : (
            <textarea
              name="content"
              value={editedHomework.content}
              onChange={handleChange}
              rows={8}
              className="border border-gray-300 rounded-lg w-full mt-2 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      </div>
    </div>
      </div>
       </PageWrapper>
);

};

export default HomeworkDetailPage;
