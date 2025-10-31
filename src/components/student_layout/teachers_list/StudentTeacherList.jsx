import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BaseUrl } from '../../../BaseUrl/BaseUrl';
import { showError } from "../../../utils/toast";
import PageWrapper from '../../../PageWrapper';

function StudentTeacherList() {
  const [selected, setSelected] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState([]);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await axios.get(
          `${BaseUrl}get/teacher-profile/student`,
          { withCredentials: true }
        );
        setTeacherProfile(response.data.data);
      } catch (error) {
        showError("Failed to load profile data. Please try again.");
      }
    };

    fetchTeacherProfile();
  }, []);

  return (
    <PageWrapper>
    <section id="our-team" className="bg-gradient-to-br from-gray-900 to-indigo-900 min-h-screen py-16 text-white">
      <div className="container mx-auto px-4 mt-4">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-yellow-300 drop-shadow-lg">Meet Our Teachers</h2>

        {!selected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {teacherProfile.map((teacher) => (
              <div
  key={teacher._id}
  className=" bg-zinc-50 border border-white/20 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
  onClick={() => setSelected(teacher)}
>
  {/* Top half image */}
  <div className="h-40 w-full overflow-hidden">
    <img
      src={teacher.profilePicUrl || "/images/avatar.png"}
      alt={teacher.name}
      className="w-full h-full object-cover"
    />
  </div>

  {/* Bottom details */}
  <div className="p-4 text-center">
    <h3 className="text-lg font-semibold text-black">{teacher.name}</h3>
    <p className="text-sm text-gray-600 mt-1">{teacher.department}</p>
    <p className="text-sm text-gray-600">{teacher.subject}</p>
  </div>
</div>

            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto text-center transition-all">
            <img
              src={selected.profilePicUrl || "/images/avatar.png"}
              alt={selected.name}
              className="w-32 h-32 mx-auto rounded-full border-4 border-yellow-400 shadow-md mb-4 object-cover"
            />

            <h3 className="text-3xl font-bold text-yellow-300">{selected.name}</h3>
                <div className="text-left bg-white/5 p-5 rounded-xl mt-6 space-y-4 border border-white/10">
  <div>
    <p className="font-semibold text-white flex items-center gap-2">
      📧 Email:
    </p>
    <p className="text-white/90">{selected.email}</p>
  </div>

  <div>
    <p className="font-semibold text-white flex items-center gap-2">
      📞 Phone:
    </p>
    <p className="text-white/90">{selected.phonenumber}</p>
  </div>

  <div>
    <p className="font-semibold text-white flex items-center gap-2">
      📘 Subject:
    </p>
    <p className="text-white/90">{selected.subject}</p>
  </div>

  <div>
    <p className="font-semibold text-white flex items-center gap-2">
      🏢 Department:
    </p>
    <p className="text-white/90">{selected.department}</p>
  </div>
</div>


            <button
              onClick={() => setSelected(null)}
              className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-full shadow-lg transition"
            >
              ← Back to List
            </button>
          </div>
        )}
      </div>
      </section>
      </PageWrapper>
  );
}

export default StudentTeacherList
