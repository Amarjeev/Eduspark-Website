import React, { useEffect ,useState} from 'react';
import { Link } from 'react-router-dom';
import useUserSchoolData from "../../../hooks/useUserSchoolData";
import { getFromIndexedDB} from '../../../utils/indexedDBUtils';
import PageWrapper from '../../../PageWrapper';

function AdminHomePage() {
   const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    // Call non-async hook
    useUserSchoolData('student');

    // Async logic inside effect
    const fetchDraft = async () => {
      const profileData = await getFromIndexedDB("student_ProfileData");
       setSchoolName(profileData?.schoolname);
      // You can store this in state if needed
    };

    fetchDraft();
  }, []);

  const services = [
    { icon: "📅", title: "Timetable", desc: "Stay updated with your daily school schedule.", path: "/student/timeTable" },
    { icon: "👩‍🏫", title: "Teachers List", desc: "View and connect with your subject teachers.", path: "/student/teacher-list" },
    {icon: "📊",title: "Progress Report", desc: "View your exam marks, attendance history, and profile details.",path: "/student/progress-report"},
    { icon: "📢", title: "School Messages", desc: "Receive important notifications and updates.", path: "/student/school-announcement" },
    { icon: "💬", title: "Chat with Teachers", desc: "Ask doubts and connect with your teachers directly.", path: "/chat" },
    { icon: "🎥", title: "Online Classes", desc: "Attend live interactive classes from anywhere.", path: "/online-class" },
    { icon: "✏️", title: "Home Work", desc: "Complete and track daily homework assignments easily.", path: "/student/Home-Work" },
    { icon: "💰",title: "Fees History",desc: "View and track all your previous fee payments and receipts.",path: "/student/Fees-History/student"}

  ];

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-900 text-white font-sans">

      {/* Hero Section */}
      <section className="min-h-[70vh] flex items-center justify-center text-center px-4 bg-gray-800">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            Welcome to <span className="text-yellow-400">{schoolName}</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300">Empowering every learner, every day.</p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 bg-gray-900 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-10">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((item, idx) => (
            <Link to={item.path} key={idx}>
              <div className="bg-gray-800 p-5 rounded-2xl shadow-lg hover:border-yellow-400 hover:border transform hover:scale-105 transition duration-300">
                <div className="text-4xl sm:text-5xl mb-4 text-yellow-400">{item.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Complaint Section */}
      <section id="complaints" className="py-16 px-4 sm:px-6 bg-gray-800 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-yellow-400">Submit a Complaint</h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8">
          Facing any issues or have feedback? Share your concern below, and the school will look into it promptly.
        </p>
        <form className="max-w-xl mx-auto grid gap-4 bg-gray-900 p-5 sm:p-6 rounded-xl shadow-md">
          <input
            type="text"
            placeholder="Your Full Name"
            className="px-4 py-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            placeholder="Class / Section"
            className="px-4 py-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="email"
            placeholder="Your Email (optional)"
            className="px-4 py-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <textarea
            placeholder="Describe your complaint or issue"
            rows="5"
            className="px-4 py-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          ></textarea>
          <button
            type="submit"
            disabled={true}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition duration-300"
          >
            Submit Complaint
          </button>
        </form>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 bg-gray-900 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-6">About Us</h2>
        <p className="text-sm sm:text-base max-w-3xl mx-auto text-gray-300 leading-relaxed">
          Our platform empowers students by making academic life more connected. Access your profile, exam marks, school messages,
          and timetable. Features like live online classes and chat with teachers ensure students stay informed and supported.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-10 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-lg font-bold text-white mb-2">Acode Master School</h4>
            <p className="text-sm text-gray-400">Empowering students through digital education.</p>
          </div>
          <div>
            <h5 className="text-md font-semibold text-white mb-2">Contact</h5>
            <p className="text-sm">📞 +91 98765 43210</p>
            <p className="text-sm">✉️ support@acodemaster.edu.in</p>
          </div>
          <div>
            <h5 className="text-md font-semibold text-white mb-2">Address</h5>
            <p className="text-sm">📍 123 Learning Avenue,</p>
            <p className="text-sm">Tech City, Bengaluru, Karnataka - 560001</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Acode Master. All rights reserved.
        </div>
      </footer>
      </div>
      </PageWrapper>
  );
}

export default AdminHomePage;
