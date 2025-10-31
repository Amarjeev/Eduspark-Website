// 🚀 Importing core dependencies & libraries
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa"; // ✏️🗑️💾 Icons for UI actions
import { motion } from "framer-motion"; // 🎞️ For button animations
import axios from "axios"; // 🌐 For API calls
import { BaseUrl } from "../../../../BaseUrl/BaseUrl"; // 🔗 Base URL for backend API
import { showSuccess, showError } from "../../../../utils/toast"; // ✅ Toast utils
import Loading from "../../../loading_ui/Loading"; // 🌀 Loading UI
import { getFromIndexedDB} from '../../../../utils/indexedDBUtils';
import PageWrapper from "../../../../PageWrapper";

// 🧹 Main Component
export default function CreateFeeStructure() {
  const [formData, setFormData] = useState({
    className: "",
    date: "",
    totalFee: "",
  });

  const [feeStructures, setFeeStructures] = useState([]);
  const [classList, setClassList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [feeWarning, setFeeWarning] = useState("");
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);


  const totalFeeInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const ClassListData = await getFromIndexedDB('school-class-List-admin');

      setClassList(ClassListData);
      
      const feeStructureRes = await axios.get(`${BaseUrl}admin/fees/get-structure`, {
        withCredentials: true,
      });
 
      setFeeStructures(feeStructureRes.data.feeStructures || []);
      
    };
    fetchData();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
   
    if (!formData.className || !formData.date || !formData.totalFee) return;
       const amount = formData.totalFee.trim();


    if (amount.length < 3) {
      setFeeWarning("⚠️ Total fee must be at least 3 digits (e.g., ₹100).");
      return;
    }

    if (amount.length > 20) {
      setFeeWarning("⚠️ Total fee must not exceed 20 digits.");
      return;
    }

    setFeeWarning("");
    setIsLoading(true);

    try {
      if (editingIndex !== null) {
        const updated = [...feeStructures];
        updated[editingIndex] = { ...updated[editingIndex], ...formData };
        setFeeStructures(updated);
        setEditingIndex(null);
      } else {
        setFeeStructures([...feeStructures, formData]);
      }

   if (editingId) {

  await axios.post(
    `${BaseUrl}admin/fees/save-structure/edit`,
       {
    ...formData,
    id: editingId,
  },
    {
      withCredentials: true,
    }
     );
     showSuccess("Fee structure deleted successfully."); 
} else if (formData) {

  await axios.post(
    `${BaseUrl}admin/fees/save-structure/post`,
    formData,
    {
      withCredentials: true,
    }
     );
     showSuccess(" Fee structure saved");
}

      setFormData({ className: "", date: "", totalFee: "" });
      setDuplicateMessage("");
    } catch (error) {
      if (error.response?.data?.duplicate) {
        return setDuplicateMessage(error.response.data.duplicate);
      }
      showError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    const index = feeStructures.findIndex(item => item._id === id);
    if (index === -1) return alert("Item not found");

  const selected = feeStructures[index];

  // ✅ Format date as 'YYYY-MM-DD' for date input field
  const formattedDate = new Date(selected.date).toISOString().split('T')[0];

  setFormData({
    className: selected.className,
    date: formattedDate,
    totalFee: String(selected.totalFee),
  });
    setEditingId(id)
    setEditingIndex(index);

    setTimeout(() => {
      totalFeeInputRef.current?.focus();
    }, 0);
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this fee structure?");
      if (!confirmDelete) return;

      await axios.delete(`${BaseUrl}admin/fees/delete-structure/${id}`, {
        withCredentials: true
      });

      showSuccess("Fee structure deleted successfully.");
      const updated = feeStructures.filter((fee) => fee._id !== id);
      setFeeStructures(updated);
    } catch (error) {
      showError("❌ Failed to delete fee structure.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null)
     setDuplicateMessage("");
     setFormData({
    className: "",
    date: "",
    totalFee: "",
  });
  }

  return (
   <PageWrapper>
  <div className="min-h-screen p-4 bg-gradient-to-br from-indigo-100 via-white to-blue-100 text-black">
    {isLoading && (
      <div className="fixed inset-0 bg-white/60 z-50 flex items-center justify-center">
        <Loading />
      </div>
    )}

    <div className="max-w-5xl mx-auto rounded-3xl p-6 shadow-2xl border border-blue-200 backdrop-blur-md bg-white">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center tracking-wide">
        🏷️ Create Class-wise Fee Structure
      </h2>

      {/* 📟 Form */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="text-sm font-semibold text-gray-700">🎓 Class Name</label>
          <select
            name="className"
            value={formData.className}
            onChange={handleChange}
            className="w-full mt-2 p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Class</option>
            {classList.map((cls, i) => (
              <option key={i} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">📅 Effective Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full mt-2 p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">💰 Total Fee (₹)</label>
          <input
            type="number"
            name="totalFee"
            value={formData.totalFee}
            onChange={handleChange}
            ref={totalFeeInputRef}
            placeholder="Enter amount"
            className="w-full mt-2 p-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
          />
          {feeWarning && (
            <p className="text-xs text-red-600 mt-1 font-medium">{feeWarning}</p>
          )}
        </div>
      </div>

      {duplicateMessage && (
        <div className="text-center text-red-600 font-medium mb-4">{duplicateMessage}</div>
      )}

      {/* 🎯 Buttons */}
      <div className="text-center mb-8 flex justify-center gap-4 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition"
        >
          <FaSave className="inline mr-2" />
          {editingIndex !== null ? "Update Fee" : "Save Fee"}
        </motion.button>

        {editingId !== null && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelEdit}
            className="bg-red-100 text-red-600 px-8 py-2 rounded-full border border-red-300 hover:bg-red-200 transition"
          >
            Cancel
          </motion.button>
        )}
      </div>

      {/* 🧾 Fee Structures */}
      {feeStructures.length === 0 ? (
        <div className="text-center p-6 text-gray-500 italic">
          💤 No fee structures added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {/* 📱 Mobile Card View */}
          <div className="md:hidden space-y-4">
            {feeStructures.map((item) => (
              <div
                key={item._id}
                className="bg-white shadow rounded-xl p-4 border border-blue-100"
              >
                <div className="text-lg font-semibold text-indigo-700 mb-2">
                  {item.className}
                </div>
                <div className="text-sm text-gray-600">
                  📅 Date: {new Date(item.date).toISOString().slice(0, 10)}
                </div>
                <div className="text-sm text-gray-600">
                  💰 Fee: ₹{item.totalFee}
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => handleEdit(item._id)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 💻 Desktop Table View with Scroll */}
          <div className="hidden md:block max-h-[400px] overflow-y-auto border border-blue-200 rounded-xl shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-100 text-blue-800 font-semibold uppercase">
                <tr>
                  <th className="p-4">Class</th>
                  <th className="p-4">Effective Date</th>
                  <th className="p-4">Total Fee (₹)</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeStructures.map((item) => (
                  <tr
                    key={item._id}
                    className="bg-white border-t hover:bg-indigo-50 transition"
                  >
                    <td className="p-4">{item.className}</td>
                    <td className="p-4">
                      {new Date(item.date).toISOString().slice(0, 10)}
                    </td>
                    <td className="p-4 font-medium text-blue-600">₹{item.totalFee}</td>
                    <td className="p-4 flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleEdit(item._id)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
      </div>
      </PageWrapper>
);

}
