import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import { showSuccess, showError } from "../../../utils/toast";
import Loading from "../../loading_ui/Loading";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getFromIndexedDB, saveToIndexedDB } from '../../../utils/indexedDBUtils';
import PageWrapper from "../../../PageWrapper";


/**
 * SchoolAnnouncements Component
 * 
 * This component manages school announcements with CRUD operations.
 * It includes features for creating, editing, deleting, and filtering announcements.
 * Uses IndexedDB for draft persistence and pagination for announcement listing.
 */
const SchoolAnnouncements = () => {
  // State for managing announcements and form fields
  const [announcementList, setAnnouncementList] = useState([]);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [count, setCount] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Reset pagination when filter date changes
  useEffect(() => {
    if (filterDate) setCount(1);
  }, [filterDate])

  // Load saved draft from IndexedDB on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await getFromIndexedDB("announcementDraft");
        if (draft) {
          setDate(draft.date || "");
          setMessage(draft.message || "");
        }
      } catch (error) {
        showError("Something went wrong. Please try again.");
      }
    };
    loadDraft();
  }, []);
  
  // Auto-save form changes to IndexedDB with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (date || message) {
        saveToIndexedDB("announcementDraft", { date, message });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [date, message]);

  // Fetch announcements from API based on current page and filter
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const safeDate = filterDate || "null";
        const response = await axios.get(`${BaseUrl}announcements-get/${count}/${safeDate}/admin`, {
          withCredentials: true,
        });
        setAnnouncementList(response?.data?.response);
        setAnnouncementCount(response?.data?.count);
       const pages = Math.ceil(response?.data?.count /10);
        setTotalPages(pages);
      } catch (error) {
        showError("Failed to load announcements. Please try again.");
      } finally {
        setLoading(false);
        setRefresh(false)
      }
    })();
  }, [refresh,count,filterDate]);

  /**
   * Handles form submission for creating or updating announcements
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation
    if (!date || !message.trim()) {
      showError("Please fill in both date and message.");
      return;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      showError("✏️ Message should be at least 10 characters long.");
      return;
    }
    if (trimmedMessage.length > 1000) {
      showError("✏️ Message should be under 500 characters.");
      return;
    }

    setLoading(true);
    const newAnnouncement = { date, message };

    // Edit existing announcement
    if (isEditing) {
      try {
        const response = await axios.put(
          `${BaseUrl}announcements-edit/${editId}`,
          newAnnouncement,
          { withCredentials: true }
        );

        if (response.data.success) {
          showSuccess("✏️ Announcement updated successfully!");
        }
      } catch (error) {
        setLoading(false)
        showError("Failed to update announcement. Please try again.");
      } finally {
        setRefresh(true)
        setLoading(false);
      }
    } else {
      // Create new announcement
      try {
        const response = await axios.post(
          `${BaseUrl}announcements-create`,
          newAnnouncement,
          { withCredentials: true }
        );

        if (response?.data?.success) {
          await saveToIndexedDB("announcementDraft", { date: "", message: "" });
          showSuccess("📢 Announcement created successfully!");
        }
      } catch (error) {
        showError("Failed to create announcement. Please try again.");
      } finally {
        setRefresh(true)
        setLoading(false);
      }
    }
    setDate("");
    setMessage("");
  };

  /**
   * Clears the form and resets editing state
   */
  const handleClear =async () => {
    setLoading(true);
    setIsEditing(false);
    setDate("");
    setMessage("");
    setEditingId(null);
    setEditId('');
     await saveToIndexedDB("announcementDraft", { date: "", message: "" });
    setLoading(false);
  };

  /**
   * Deletes an announcement after confirmation
   * @param {string} id - ID of the announcement to delete
   */
  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this announcement?");
    if (!confirm) return;

    setLoading(true);
    try {
      const response = await axios.delete(`${BaseUrl}announcements-delete/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        showSuccess("🗑️ Announcement deleted successfully!");
      }
    } catch (error) {
      setLoading(false)
      showError("Failed to delete announcement. Please try again.");
    } finally {
      setRefresh(true)
      setLoading(false);
    }
  };

  /**
   * Prepares the form for editing an existing announcement
   * @param {Object} announcement - The announcement object to edit
   */
  const handleEdit = (announcement) => {
    setLoading(true);
    setIsEditing(true);
    setDate(announcement.date);
    setMessage(announcement.message);
    setEditingId(announcement._id);
    setEditId(announcement._id);
    setLoading(false);
  };

  // Show loading indicator while processing
  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create/Update Announcement Form */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? "✏️ Edit Announcement" : "📝 Create Announcement"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
                placeholder="Type your announcement here..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
            {message&&<div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? "Update" : "Submit"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Clear
              </button>
            </div>}
          </form>
        </div>

        {/* Announcements List */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-gray-800">📋 All Announcements</h2>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>

          {announcementList.length === 0 ? (
            <p className="text-gray-500">No announcements found for selected date.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {announcementList?.map((item) => (
                <div
                  key={item._id}
                  onClick={() =>
                    setExpandedId(expandedId === item._id ? null : item._id)
                  }
                  className="border rounded-lg p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-blue-600 font-medium">{item.date}</p>
                    <span className="text-sm text-gray-500">
                      {expandedId === item._id ? "▲" : "▼"}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium mt-1 truncate">
                    {item.message.slice(0, 60)}...
                  </p>

                  {expandedId === item._id && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="mb-3">{item.message}</p>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
                  {announcementCount>10&& <div className="flex items-center justify-center gap-4 mt-4">
                {count!==1&&<button
                    onClick={() => setCount(prev=>prev-1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border rounded hover:bg-gray-100">
                  <ArrowLeft size={18} />
                    Back
                </button>}

                {count!==totalPages&& <button
                    onClick={() => setCount(prev=>prev+1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border rounded hover:bg-gray-100">
                  Next
                <ArrowRight size={18} />
              </button>}
              </div>}
              </div>
          )}
        </div>
      </div>
      </div>
      </PageWrapper>
  );
};

export default SchoolAnnouncements;