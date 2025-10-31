import React from 'react';
import { Link } from 'react-router-dom'; // Using Link for navigation
import { FiPlus, FiList, FiBookOpen } from 'react-icons/fi';
import PageWrapper from '../../../PageWrapper';

function ClassDashboard() {
  const cards = [
    {
      title: '➕ Add Class & Division',
      icon: <FiPlus className="text-5xl text-indigo-600 mb-4" />,
      route: '/admin/classDivisionConfig',
      border: 'border-indigo-500',
    },
    {
      title: '📋 View Class List',
      icon: <FiList className="text-5xl text-green-600 mb-4" />,
      route: '#',
      border: 'border-green-500',
    },
    {
      title: '📚 Add & Manage Subjects',
      icon: <FiBookOpen className="text-5xl text-purple-600 mb-4" />,
      route: '/admin/manage-subjects',
      border: 'border-purple-500',
    },
  ];

  return (
   <PageWrapper>
  <div className="min-h-screen bg-gray-100 text-gray-900 py-16 px-6">
    {/* Header */}
    <div className="text-center mb-14">
      <h1 className="text-4xl font-bold tracking-wide text-gray-800">
        🎓 Class Management Dashboard
      </h1>
      <p className="text-gray-600 mt-2 text-lg">
        Organize your classes, divisions, and subjects efficiently
      </p>
    </div>

    {/* Cards */}
    <div className="max-w-6xl mx-auto grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card, index) => (
        <Link
          to={card.route}
          key={index}
          className={`bg-white text-gray-800 rounded-3xl p-8 shadow-md border-l-4 ${card.border}
            hover:shadow-xl hover:scale-105 transform transition-all duration-300 block`}
        >
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            {card.icon}
            <h2 className="text-xl font-bold">{card.title}</h2>
          </div>
        </Link>
      ))}
    </div>

    {/* Footer */}
    <div className="text-center mt-16 text-sm text-gray-500">
      © {new Date().getFullYear()} EduSpark - All rights reserved.
    </div>
      </div>
      </PageWrapper>
);

}

export default ClassDashboard;
