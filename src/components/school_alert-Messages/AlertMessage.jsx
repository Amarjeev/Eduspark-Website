import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import axios from "axios";
import { BaseUrl } from "../../BaseUrl/BaseUrl";
import { showSuccess, showError } from '../../utils/toast';
import Loading from '../loading_ui/Loading';
import PageWrapper from '../../PageWrapper';

function AlertMessage() {
  const navigate = useNavigate();
  const { role } = useParams();
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [announcementList, setAnnouncementList] = useState([]);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [count, setCount] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    if (filterDate) setCount(1);
  }, [filterDate]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const safeDate = filterDate || "null";
        const response = await axios.get(`${BaseUrl}announcements-get/${count}/${safeDate}/${role}`, {
          withCredentials: true,
        });
        setAnnouncementList(response?.data?.response || []);
        setAnnouncementCount(response?.data?.count || 0);
        const pages = Math.ceil(response?.data?.count / 10);
        setTotalPages(pages);
      } catch (error) {
        showError("Failed to load announcements. Please try again.");
      } finally {
        setLoading(false);
        setRefresh(false);
      }
    })();
  }, [refresh, count]);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-6 flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full max-w-3xl mb-4 px-2 sm:px-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-white shadow-xl rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            🛎️ School Alert Messages
          </h2>
          <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md z-10">
            {announcementCount}
          </span>
        </div>

        {/* Show loader if needed */}
        {loading ? (
          <p className="text-center text-gray-500">Loading alerts...</p>
        ) : (
          announcementList.map((alert, index) => (
            <div
              key={index}
              className="border border-yellow-300 bg-yellow-50 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center mb-2">
                <AlertTriangle className="text-yellow-600 w-5 h-5 mr-2" />
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                  Alert #{(count - 1) * 10 + index + 1}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                📅 <strong>Date:</strong> {alert.date}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                🏫 <strong>School:</strong> {alert.schoolname}
              </p>
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                {alert.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {announcementCount > 10 && (
        <div className="w-full max-w-3xl mt-6 px-2 sm:px-0 flex justify-between">
          {count !== 1 && (
            <button
              onClick={() => setCount((prev) => prev - 1)}
              className="w-1/2 sm:w-auto text-center px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100"
            >
              ⬅️ Previous
            </button>
          )}
          {count !== totalPages && (
            <button
              onClick={() => setCount((prev) => prev + 1)}
              className="w-1/2 sm:w-auto text-center px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 ml-2 sm:ml-0"
            >
              Next ➡️
            </button>
          )}
        </div>
      )}
      </div>
      </PageWrapper>
  );
}

export default AlertMessage;
