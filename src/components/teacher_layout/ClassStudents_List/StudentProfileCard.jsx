import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import Loading from '../../loading_ui/Loading';
import { showError } from '../../../utils/toast';
import PageWrapper from '../../../PageWrapper';

function StudentProfileCard({ studentId }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BaseUrl}students/${studentId}/teacher`, {
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
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-md px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mt-15">
            {/* Avatar */}
            <div className="-mt-20 md:mt-0">
              <div className="w-28 h-28 rounded-full bg-white shadow-md border-4 border-white overflow-hidden">
                <img
                  src="/images/avatar.png"
                  alt={student?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{student?.name}</h1>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full">Class: {student?.className}</span>
                <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full">ID: {student?.studentId}</span>
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                <strong>School:</strong> {student?.schoolname}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Section title="Personal Information">
                <Detail label="Date of Birth" value={student?.dob?.slice(0, 10)} />
                <Detail label="Gender" value={student?.gender} />
                <Detail label="Govt. ID" value={`${student?.govIdType}: ${student?.govIdNumber}`} />
                <Detail label="Admission Date" value={student?.admissionDate?.slice(0, 10)} />
              </Section>

              <Section title="Contact Information">
                <Detail label="Mobile" value={student?.mobileNumber} />
                <Detail label="Secondary Mobile" value={student?.secondaryMobileNumber} />
                <Detail label="Parent Email" value={student?.parentEmail} />
              </Section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Section title="Family Information">
                <Detail label="Relation" value={student?.relation} />
                <Detail label="Guardian Name" value={student?.authorizedPersonName} />
              </Section>

              <Section title="Address">
                <Detail label="Full Address" value={student?.address} />
                <Detail label="State & Pincode" value={`${student?.state}, ${student?.pincode}`} />
              </Section>

              <Section title="School Information">
                <Detail label="UDISE Code" value={student?.udisecode} />
                <Detail label="School Name" value={student?.schoolname} />
              </Section>
            </div>
          </div>
        </div>
      </div>
      </div>
     </PageWrapper>
  );
}

// Reusable Section
function Section({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
        {title}
      </h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

// Reusable Detail Item
function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="col-span-1 text-sm font-medium text-gray-600">{label}</dt>
      <dd className="col-span-2 text-sm font-semibold text-gray-800">{value || 'N/A'}</dd>
    </div>
  );
}

export default StudentProfileCard;
