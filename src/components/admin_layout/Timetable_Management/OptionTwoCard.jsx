import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, ListOrdered } from 'lucide-react';
import PageWrapper from '../../../PageWrapper';

function OptionTwoCard() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
    <div className="min-h-screen bg-white text-black py-12 px-4">
      <h1 className="text-center text-4xl font-bold text-black mb-12">
        📘 Timetable Options
      </h1>

      <div className="grid gap-10 md:grid-cols-2 max-w-5xl mx-auto">
        {/* ➕ Create Timetable */}
        <div
          onClick={() => navigate('/admin/timetable')}
          className="cursor-pointer rounded-xl bg-white p-6 text-center text-gray-900 shadow-xl transition-transform hover:scale-105"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-md">
            <CalendarPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Create Timetable</h2>
          <p className="text-gray-600">
            Start building a new timetable by adding classes, subjects, and time slots.
          </p>
        </div>

        {/* 👁️ View Timetable */}
        <div
          onClick={() => navigate('/admin/timetable/all')}
          className="cursor-pointer rounded-xl bg-white p-6 text-center text-gray-900 shadow-xl transition-transform hover:scale-105"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-md">
            <ListOrdered className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">View All Timetables</h2>
          <p className="text-gray-600">
            Browse, view, and manage all your saved timetable entries in one place.
          </p>
        </div>
      </div>
      </div>
      </PageWrapper>
  );
}

export default OptionTwoCard;
