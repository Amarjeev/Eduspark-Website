// 📦 Imports
import { School, CalendarDays } from 'lucide-react'; // Icon components for UI
import React, { useState, useEffect } from 'react'; // React core hooks
import axios from 'axios'; // Axios for HTTP requests
import { BaseUrl } from '../../../BaseUrl/BaseUrl'; // Base API URL
import { showError } from '../../../utils/toast'; // Toast for error display
import { ArrowLeft, ArrowRight } from 'lucide-react'; // Pagination icons
import Loading from '../../loading_ui/Loading';
import PageWrapper from '../../../PageWrapper';

function SchoolMessage() {
  // 🧠 State Variables
  const [announcementList, setAnnouncementList] = useState([]); // Holds list of announcements
  const [refresh, setRefresh] = useState(false); // Triggers re-fetching
  const [announcementCount, setAnnouncementCount] = useState(0); // Total announcements count
  const [count, setCount] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(0); // Total calculated pages
  const [loading, setLoading] = useState(false); // Loading state indicator

  // 🚀 Fetch announcements when component mounts or page/refresh changes
  useEffect(() => {
    setLoading(true); // Start loader

    (async () => {
      try {
        const safeDate = "null"; // Placeholder date filter
        const response = await axios.get(
          `${BaseUrl}announcements-get/${count}/${safeDate}/student`,
          { withCredentials: true }
        );

        // ✅ Set fetched announcements and pagination details
        setAnnouncementList(response?.data?.response);
        setAnnouncementCount(response?.data?.count);
        const pages = Math.ceil(response?.data?.count / 10); // 10 items per page
        setTotalPages(pages);
      } catch (error) {
        // ❌ Handle API error
        showError("Failed to load announcements. Please try again.");
      } finally {
        setLoading(false); // Stop loader
        setRefresh(false); // Reset refresh trigger
      }
    })();
  }, [refresh, count]);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-yellow-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-15">
        {/* 📣 Header Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-10 tracking-wide drop-shadow-xl">
          📣 School Announcements
        </h1>

        {/* 📋 Announcement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {announcementList.map((item) => (
            <div
              key={item._id}
              className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-50 text-black rounded-2xl p-6 shadow-xl transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* 🏫 Header: School name & date */}
              <div className="flex items-center justify-between mb-3 text-sm font-medium text-gray-800">
                <div className="flex items-center gap-1">
                  <School className="w-4 h-4 text-yellow-600" />
                  <span>{item.schoolname}</span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-300 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* 📄 Message content */}
              <p className="text-sm sm:text-base leading-relaxed">{item.message}</p>
            </div>
          ))}
        </div>

        {/* 🔢 Pagination Controls */}
        <div className="text-center mt-12">
          {announcementCount > 10 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              {/* ⬅️ Previous Page Button */}
              {count !== 1 && (
                <button
                  onClick={() => setCount((prev) => prev - 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border rounded hover:bg-gray-100"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}

              {/* ➡️ Next Page Button */}
              {count !== totalPages && (
                <button
                  onClick={() => setCount((prev) => prev + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border rounded hover:bg-gray-100"
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default SchoolMessage;
