import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, FileText, DollarSign } from 'lucide-react';
import PageWrapper from '../../../../PageWrapper';

function OptionFeeManage() {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Fee Skeleton Configuration',
      description: 'Configure fee structures for each class',
      icon: <Settings className="h-8 w-8 text-indigo-600" />,
      bgColor: 'bg-indigo-100',
      hoverShadow: 'shadow-indigo-500/40',
      route: "/admin/fees/config",
    },
    {
      title: 'Student Fee History',
      description: 'View payment records and fee status',
      icon: <FileText className="h-8 w-8 text-green-600" />,
      bgColor: 'bg-green-100',
      hoverShadow: 'shadow-green-500/40',
      route: '/admin/fees/history',
    },
    {
      title: 'Add Student Fee',
      description: 'Add and update individual student fee details',
      icon: <DollarSign className="h-8 w-8 text-yellow-600" />,
      bgColor: 'bg-yellow-100',
      hoverShadow: 'shadow-yellow-500/40',
      route: "/admin/fees/payment",
    },
  ];

  return (
    <PageWrapper>
  <div className="min-h-screen bg-gray-100 text-gray-900 py-12 px-4">
    <h1 className="text-center text-4xl font-bold text-gray-800 mb-12">
      💰 Fee Management Options
    </h1>

    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {options.map((opt, index) => (
        <div
          key={index}
          onClick={() => navigate(opt.route)}
          className="cursor-pointer rounded-2xl bg-white p-6 text-center shadow-md border border-gray-200 transition-transform hover:scale-105 hover:shadow-lg"
        >
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${opt.bgColor} ${opt.hoverShadow}`}
          >
            {opt.icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{opt.title}</h2>
          <p className="text-gray-600 text-sm">{opt.description}</p>
        </div>
      ))}
    </div>
      </div>
      </PageWrapper>
);

}

export default OptionFeeManage;
