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
        const response = await axios.get(`${BaseUrl}students/${studentId}/student`, {
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
      <div className="max-w-4xl mx-auto px-4 py-6 text-white bg-black rounded-xl shadow-lg">
        {/* Profile Card */}
        <div className="bg-black border border-yellow-700 rounded-2xl shadow-md overflow-hidden mt-5">
          {/* Header */}
          <div className="px-6 py-6 flex flex-col md:flex-row items-center md:items-start gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-yellow-600 overflow-hidden">
              <img
                src={"/images/avatar.png"}
                alt={student?.profilePicUrl || student?.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-white">{student?.name}</h1>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2 text-sm">
                <span className="bg-black-300 text-white text-1xl px-3 py-1 rounded-full"><strong className='text-yellow-500'>Class :</strong> {student?.className}</span>
                <span className="bg-black-300 text-white text-1xl px-3 py-1 rounded-full"><strong className='text-yellow-500'>ID :</strong> {student?.studentId}</span>
              </div>
              <p className="mt-2 text-white text-sm">
                <strong className='text-yellow-500'>School:</strong> {student?.schoolname}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-black border-t border-yellow-100 px-4 md:px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <Section title="👤 Personal Info">
                  <Detail label="Date of Birth" value={student?.dob?.slice(0, 10)} />
                  <Detail label="Gender" value={student?.gender} />
                  <Detail label="Govt. ID" value={`${student?.govIdType}: ${student?.govIdNumber}`} />
                  <Detail label="Admission Date" value={student?.admissionDate?.slice(0, 10)} />
                </Section>

                <Section title="📞 Contact Info">
                  <Detail label="Mobile" value={student?.mobileNumber} />
                  <Detail label="Secondary Mobile" value={student?.secondaryMobileNumber} />
                  <Detail label="Email" value={student?.email} />
                </Section>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Section title="🏡 Family Info">
                  <Detail label="Relation" value={student?.relation} />
                  <Detail label="Guardian Name" value={student?.authorizedPersonName} />
                </Section>

                <Section title="📍 Address">
                  <Detail label="Full Address" value={student?.address} />
                  <Detail label="State & Pincode" value={`${student?.state}, ${student?.pincode}`} />
                </Section>

                <Section title="🏫 School Info">
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
    <div className="bg-black bg-opacity-10 rounded-lg p-4 border border-yellow-700">
      <h3 className="text-md font-semibold text-white-900 border-b border-yellow-700 pb-1 mb-3">
        {title}
      </h3>
      <dl className="space-y-2">{children}</dl>
    </div>
  );
}

// Reusable Detail Item
function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="col-span-1 text-sm text-yellow-500 font-medium">{label}</dt>
      <dd className="col-span-2 text-sm text-white font-semibold">{value || 'N/A'}</dd>
    </div>
  );
}

export default StudentProfileCard;
