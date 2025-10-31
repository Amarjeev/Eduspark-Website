import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import Loading from '../../loading_ui/Loading';
import { showError } from '../../../utils/toast';
import PageWrapper from '../../../PageWrapper';

function StudentProfile({ studentId }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BaseUrl}students/${studentId}/parent`, {
          withCredentials: true,
        });
        setStudent(response.data);
      } catch (error) {
      showError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchProfile();
  }, [studentId]);

  if (loading) return <Loading />;

  return (
    <PageWrapper>
      <div className="w-full max-w-screen-xl mx-auto px-4 py-6 text-black bg-gradient-to-br from-zinc-50 to-zinc-100 min-h-screen">
        <div className="bg-white text-slate-800 rounded-2xl shadow-lg p-6 md:p-10 border border-yellow-400">

          {/* 🧑‍🎓 Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-yellow-400 pb-6">
            <div className="w-32 h-32 rounded-full border-4 border-yellow-400 overflow-hidden">
              <img
                src={student?.profilePicUrl || '/images/avatar.png'}
                alt={student?.profilePicUrl || student?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-black">{student?.name}</h1>
              <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                <InfoBadge label="Class" value={student?.className} />
                <InfoBadge label="ID" value={student?.studentId} />
              </div>
            </div>
          </div>

          {/* 📋 Details Grid */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* 👤 Personal Info */}
            <SectionCard title="👤 Personal Info">
              <Field label="Date of Birth" value={student?.dob?.slice(0, 10)} />
              <Field label="Gender" value={student?.gender} />
              <Field label="Govt. ID" value={`${student?.govIdType}: ${student?.govIdNumber}`} />
              <Field label="Admission Date" value={student?.admissionDate?.slice(0, 10)} />
            </SectionCard>

            {/* 📞 Contact Info */}
            <SectionCard title="📞 Contact Info">
              <Field label="Mobile" value={student?.mobileNumber} />
              <Field label="Secondary Mobile" value={student?.secondaryMobileNumber} />
              <Field label="Email" value={student?.email} />
            </SectionCard>

            {/* 🏡 Family Info */}
            <SectionCard title="🏡 Family Info">
              <Field label="Relation" value={student?.relation} />
              <Field label="Guardian Name" value={student?.authorizedPersonName} />
            </SectionCard>

            {/* 📍 Address */}
            <SectionCard title="📍 Address">
              <Field label="Full Address" value={student?.address} />
              <Field label="State & Pincode" value={`${student?.state}, ${student?.pincode}`} />
            </SectionCard>

            {/* 🏫 School Info */}
            <SectionCard title="🏫 School Info">
              <Field label="UDISE Code" value={student?.udisecode} />
              <Field label="School Name" value={student?.schoolname} />
            </SectionCard>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// 🔘 InfoBadge UI
function InfoBadge({ label, value }) {
  return (
    <span className="bg-yellow-100 text-black px-4 py-1 rounded-full text-sm border border-yellow-400 shadow-sm">
      <strong>{label}:</strong> {value || 'N/A'}
    </span>
  );
}

// 🧾 Input Field UI
function Field({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value || 'N/A'}
        disabled
        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
}

// 📦 Card Wrapper for Each Section
function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-yellow-300 rounded-2xl shadow-md p-5 transition hover:shadow-lg">
      <h3 className="text-xl font-semibold text-yellow-700 mb-4 border-b border-yellow-300 pb-2">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// 🔹 Optional Detail Row (if you use it elsewhere)
function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="col-span-1 text-sm text-slate-500 font-medium">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800 font-semibold">{value || 'N/A'}</dd>
    </div>
  );
}

export default StudentProfile;
