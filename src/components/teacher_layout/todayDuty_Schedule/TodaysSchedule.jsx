import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  FaChalkboardTeacher,
  FaClock,
  FaLanguage,
  FaCalendarDay,
} from 'react-icons/fa';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showSuccess, showError } from "../../../utils/toast";
import PageWrapper from '../../../PageWrapper';

// 🧩 Single Schedule Card
const ScheduleCard = ({ day, time, class: className, subject }) => (
  <div className="bg-white w-full rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200">
    <div className="mb-3 text-center">
      <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold text-lg">
        <FaCalendarDay className="text-gray-500" />
        <span>{day}</span>
      </div>
    </div>
    <div className="text-gray-600 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <FaChalkboardTeacher className="text-gray-500" />
        <span>
          <span className="font-medium">Class:</span> {className}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <FaClock className="text-gray-500" />
        <span>{time}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <FaLanguage className="text-gray-500" />
        <span>{subject}</span>
      </div>
    </div>
  </div>
);

// 🧾 Main Component
function TodaysSchedule() {
  const [dutyData, setDutyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BaseUrl}teachers/duties/today`, {
          withCredentials: true,
        });
        setDutyData(response.data);
      } catch (error) {
        showError("Failed to load today's duty schedule. Please try again.");
      }
    };

    fetchData();
  }, []);

  return (
    <PageWrapper>
    <div className="min-h-screen py-6 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">
          📘 Teacher Duty Schedule
        </h2>

        {dutyData.length === 0 ? (
          <div className="text-center text-gray-600 bg-white rounded-xl shadow p-6">
            ℹ️ No duties have been assigned. Awaiting your schedule.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dutyData.map((item, index) => (
              <ScheduleCard
                key={index}
                day={item.day}
                time={item.time}
                class={item.className}
                subject={item.subject}
              />
            ))}
          </div>
        )}
      </div>
      </div>
      </PageWrapper>
  );
}

export default TodaysSchedule;
