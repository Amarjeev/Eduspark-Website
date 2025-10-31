import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useUserSchoolData from "../../../hooks/useUserSchoolData";
import PageWrapper from "../../../PageWrapper";

const cardData = [
  {
    title: "Today's Schedule",
    description:
      "Review all your scheduled classes and sessions for the day, including subjects, timings, and room assignments.",
    img: "/images/today's_class.jpg",
    link: "/teacher/today-schedule",
  },
  {
    title: "Attendance Tracker",
    description:
      "Mark daily student attendance and access attendance history records for each class efficiently.",
    img: "/images/attendance_management.webp",
    link: "/teacher/attendance-Dashboard/teacher",
  },
  {
    title: "Class Roster",
    description:
      "View your assigned students with complete details like names, contact info, and academic status.",
    img: "/images/students_list.jpg",
    link: "/students-by-class",
  },
  {
    title: "Weekly Timetable",
    description:
      "Access your complete weekly class schedule with subjects, timings, and assigned rooms.",
    img: "/images/time_table.jpg",
    link: "/teacher/timetable",
  },
  {
    title: "Parent Communication",
    description:
      "Engage with parents through messages and updates to discuss student progress and concerns.",
    img: "/images/chat_with_parents.jpg",
    link: "#",
  },
  {
    title: "School Alerts",
    description:
      "Send or receive urgent school notifications, reminders, and policy updates instantly.",
    img: "/images/school_alert_message.jpg",
    link: "/school-alerts/teacher",
  },
  {
    title: "Assign Homework",
    description:
      "Create and distribute homework or project tasks with due dates and special instructions.",
    img: "/images/home_work.jpg",
    link: "/teacher/assign-homework",
  },
  {
    title: "Marks Entry",
    description:
      "Input and update students’ test and exam scores, and view academic performance reports.",
    img: "/images/exam_mark.jpg",
    link: "/teacher/exam-marks/add/teacher",
  },
  {
    title: "Announcements",
    description:
      "Publish general notices or class-specific messages to keep parents and students informed.",
    img: "/images/message_parents.jpg",
    link: "#",
  },
  {
    title: "Homework Archive",
    description:
      "Browse past homework submissions, assignment status, and feedback history for each student.",
    img: "/images/check_home_work.jpg",
    link: "/teacher/homework-archive",
  },
];

function TeacherHomePage() {
  // 🧠 Hook to fetch teacher's assigned classes and divisions
  useUserSchoolData("teacher");

  // 🧮 Alert message count (mocked for now)
  const alertCount = 5;

  // 📍 Ref to scroll into view
  const sectionRef = useRef(null);

  // 🌀 Scroll to section on mount
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <PageWrapper>
      <section
        ref={sectionRef}
        className="bg-white py-20 min-h-screen scroll-smooth"
      >
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-left text-gray-800 drop-shadow-sm">
              📘 Teacher Dashboard
            </h2>
            <div className="w-full h-1 bg-black mt-2 rounded"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cardData.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.1,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.05 }}
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-gray-100"
              >
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 text-black">
                    {card.title}
                  </h3>
                  <p className="text-sm text-black mb-4">
                    {card.description.length > 60
                      ? card.description.slice(0, 60) + "..."
                      : card.description}
                  </p>
                  <a
                    href={card.link}
                    className="inline-block text-blue-600 font-medium text-sm hover:underline"
                  >
                    Go to {card.title} →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default TeacherHomePage;
