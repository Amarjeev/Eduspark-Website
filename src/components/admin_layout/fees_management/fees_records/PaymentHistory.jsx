import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from "../../../../BaseUrl/BaseUrl";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../../loading_ui/Loading";
import PageWrapper from '../../../../PageWrapper';

function PaymentHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BaseUrl}admin/fees/history/${id}`, {
          withCredentials: true,
        });
        setHistory(res.data?.paymentHistory || []);
        setStudentName(res.data?.studentData?.name || 'Unknown Student');
      } catch (err) {
        showError(" Failed to load payment history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHistory();
  }, [id]);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      {/* Header */}
<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 border-b pb-4">
  <div>
    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
      💳 Payment History of
      <span className="text-green-700">{studentName}</span>
    </h2>
  </div>

  <div>
    <button
      onClick={() => navigate(-1)}
      className="bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition duration-200 ease-in-out"
    >
      ⬅ Back
    </button>
  </div>
</div>


      {/* History Content */}
      {history.length === 0 ? (
        <div className="text-gray-500 text-center py-10 italic">
          No payment history available.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div
              key={entry._id}
              className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Payment #{index + 1}</p>
                  <p className="text-lg font-semibold text-gray-800">₹{entry.amount}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  {new Date(entry.date).toLocaleDateString("en-IN", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      </PageWrapper>
  );
}

export default PaymentHistory;
