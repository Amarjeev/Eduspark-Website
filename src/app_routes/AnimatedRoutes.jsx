// AnimatedRoutes.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from '../PageWrapper';

// 🔐 Route Guards
import ProtectedAdminRoute from './protected_routes/admin/ProtectedAdminRoute';
import ProtectedTeacherRoute from './protected_routes/teacher/ProtectedTeacherRoute';
import ProtectedStudentRoute from './protected_routes/student/ProtectedStudentRoute';
import ProtectedParentRoute from './protected_routes/parent/ProtectedParentRoute';


import Home from '../common_pages/main_home_page/Home';
import LoginPage from '../common_pages/common_login/LoginPage';
import CreateAdminAccountPage from '../common_pages/create_adminAccount/CreateAdminAccountPage';
import CreateParentAccountPage from '../common_pages/create_parentAccount/CreateParentAccountPage';
import ParentEntryHomePage from '../common_pages/parent_dashboard/ParentEntryHomePage';
import ParentHomePage from '../common_pages/parent_dashboard/ParentHomePage';
import HomeworkArchivePage from '../common_pages/teacher_dashboard/HomeworkListPage';
import AdminHome from '../common_pages/admin_dashboard/AdminHome';
import HomeworkListPage from '../common_pages/teacher_dashboard/HomeworkListPage';
import VerifiedSubmittedHomeworkPage from '../common_pages/student_dashboard/VerifiedSubmittedHomeworkPage';
import StudentFeesHistoryPage from '../common_pages/student_dashboard/StudentFeesHistoryPage';
import StudentProgressReportPage from '../common_pages/student_dashboard/StudentProgressReportPage';
import StudentHome from '../common_pages/student_dashboard/StudentHome';
import StudentTimetablePage from '../common_pages/student_dashboard/StudentTimetablePage';
import StudentTeacherListPage from '../common_pages/student_dashboard/StudentTeacherListPage';
import SchoolMessagePage from '../common_pages/student_dashboard/SchoolMessagePage';
import StudentHomeworkPage from '../common_pages/student_dashboard/StudentHomeworkPage';
import AdminProfileViewPage from '../common_pages/admin_dashboard/AdminProfileViewPage';
import ForgotPasswordPage from '../common_pages/forgotCredentials/ForgotPasswordPage';
import ForgotUdisecodePage from '../common_pages/forgotCredentials/ForgotUdisecodePage';
import UserEntryHomePage from '../common_pages/main_home_page/UserEntryHomePage';
import AlertMessage from '../common_pages/alert_Message/AlertMessagePage';
import EditTeacherProfile from '../common_pages/admin_dashboard/EditTeacherProfile';
import AttendanceDashboardAdmin from '../common_pages/admin_dashboard/AttendanceDashboardPageAdmin';
import AttendanceHistoryAdmin from '../common_pages/admin_dashboard/AttendanceHistoryPageadmin';
import StudentAttendanceAdmin from '../common_pages/admin_dashboard/AttendancePageAdmin';
import TeacherDetails from '../components/teacher_layout/teacher_navbar/TeacherDetails';
import FullStudentInfo from '../common_pages/teacher_dashboard/FullStudentInfo';
import OTPVerify from '../components/common_authentication/OTPVerify';
import TeacherSignup from '../common_pages/admin_dashboard/TeacherSignup';
import TeachersList from '../common_pages/admin_dashboard/TeachersList';
import StudentSignup from '../common_pages/admin_dashboard/StudentSignup';
import StudentList from '../common_pages/admin_dashboard/StudentList';
import StudentProfilePage from '../common_pages/admin_dashboard/StudentProfilePage';
import ClassDivisionConfig from '../common_pages/admin_dashboard/ClassDivisionConfig';
import ClassManagment from '../common_pages/admin_dashboard/ClassManagment';
import ManageSubjects from '../common_pages/admin_dashboard/ManageSubjects';
import AddExamMarkAdmin from '../common_pages/admin_dashboard/AddExamMarkAdmin';
import AddExamMarkTeacher from '../common_pages/teacher_dashboard/AddExamMarkTeacher';
import ConfigFeesStructure from '../common_pages/admin_dashboard/ConfigFeesStructure';
import StudentFeeManager from '../common_pages/admin_dashboard/StudentFeeManager';
import FeeManagmentOption from '../common_pages/admin_dashboard/FeeManagmentOption';
import OptionFeeMange from '../components/admin_layout/fees_management/Option_feeMange/OptionFeeMange';
import CreateTimetablePage from '../common_pages/admin_dashboard/CreateTimetablePage';
import AllClassTimetablePage from '../common_pages/admin_dashboard/AllClassTimetablePage';
import AllClassTimetable from '../components/admin_layout/Timetable_Management/AllClassTimetable';
import OptionTwoCardPage from '../common_pages/admin_dashboard/OptionTwoCardPage';
import StudentFeesHistory from '../common_pages/admin_dashboard/StudentFeesHistory';
import PaymentHistory from '../components/admin_layout/fees_management/fees_records/PaymentHistory';
import AttendancePage from '../common_pages/teacher_dashboard/AttendancePage';
import TeacherAccessConfigPage from '../common_pages/admin_dashboard/TeacherAccessConfigPage';
import TeacherHomePage from '../common_pages/teacher_dashboard/HomePage';
import TeacherTodaySchedule from '../common_pages/teacher_dashboard/TeacherTodaySchedule';
import AttendanceDashboardPage from '../common_pages/teacher_dashboard/AttendanceDashboardPage';
import AttendanceHistoryPage from '../common_pages/teacher_dashboard/AttendanceHistoryPage';
import ClassStudentListPage from '../common_pages/teacher_dashboard/ClassStudentListPage';
import StudentProfileCardPage from '../common_pages/teacher_dashboard/StudentProfileCardPage';
import ClasswiseTimetableViewerPage from '../common_pages/teacher_dashboard/ClasswiseTimetableViewerPage';
import AssignHomeworkPage from '../common_pages/teacher_dashboard/AssignHomeworkPage';
import HomeworkDetailPage from '../components/teacher_layout/homework/HomeworkDetailPage';
import SchoolAnnouncementsPage from '../common_pages/admin_dashboard/SchoolAnnouncementsPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">
        <PageWrapper>
          <Routes location={location} key={location.pathname}>

            {/* 🌐 Public Routes */}
            <Route path="/" element={<UserEntryHomePage />} />
            <Route path="/role-selector" element={<Home />} />
            <Route path="/login/:role" element={<LoginPage />} />
            <Route path="/:role/otp-verify" element={<OTPVerify />} />
            <Route path="/parent/signup" element={<CreateParentAccountPage />} />
            <Route path="/school-alerts/:role" element={<AlertMessage />} />
            <Route path="/admin/create-account" element={<CreateAdminAccountPage />} />
            <Route path="/forgot-udisecode" element={<ForgotUdisecodePage />} />
            <Route path="/forgot-password/:role" element={<ForgotPasswordPage />} />

            {/* 🛡️ Admin Routes */}
            <Route path="/admin/profile-view" element={<ProtectedAdminRoute><AdminProfileViewPage /></ProtectedAdminRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminHome /></ProtectedAdminRoute>} />
            <Route path="/admin/teacher-signup" element={<ProtectedAdminRoute><TeacherSignup /></ProtectedAdminRoute>} />
            <Route path="/admin/teachers" element={<ProtectedAdminRoute><TeachersList /></ProtectedAdminRoute>} />
            <Route path="/admin/student-signup" element={<ProtectedAdminRoute><StudentSignup /></ProtectedAdminRoute>} />
            <Route path="/admin/students" element={<ProtectedAdminRoute><StudentList /></ProtectedAdminRoute>} />
            <Route path="/admin/classDivisionConfig" element={<ProtectedAdminRoute><ClassDivisionConfig /></ProtectedAdminRoute>} />
            <Route path="/admin/class-management" element={<ProtectedAdminRoute><ClassManagment /></ProtectedAdminRoute>} />
            <Route path="/admin/manage-subjects" element={<ProtectedAdminRoute><ManageSubjects /></ProtectedAdminRoute>} />
            <Route path="/admin/exam-marks/add/:role" element={<ProtectedAdminRoute><AddExamMarkAdmin /></ProtectedAdminRoute>} />
            <Route path="/admin/feesconfig/option" element={<ProtectedAdminRoute><FeeManagmentOption /></ProtectedAdminRoute>} />
            <Route path="/admin/fees/history" element={<ProtectedAdminRoute><StudentFeesHistory /></ProtectedAdminRoute>} />
            <Route path="/admin/fees/config" element={<ProtectedAdminRoute><ConfigFeesStructure /></ProtectedAdminRoute>} />
            <Route path="/admin/fees/payment" element={<ProtectedAdminRoute><StudentFeeManager /></ProtectedAdminRoute>} />
            <Route path="/admin/fees/history/:id" element={<PaymentHistory />} />
            <Route path="/admin/timetable" element={<ProtectedAdminRoute><CreateTimetablePage /></ProtectedAdminRoute>} />
            <Route path="/admin/timetable/all" element={<ProtectedAdminRoute><AllClassTimetablePage /></ProtectedAdminRoute>} />
            <Route path="/admin/timetable/option" element={<ProtectedAdminRoute><OptionTwoCardPage /></ProtectedAdminRoute>} />
            <Route path="/admin/teacher-class-access" element={<ProtectedAdminRoute><TeacherAccessConfigPage /></ProtectedAdminRoute>} />
            <Route path="/admin/teacher-profile/edit/:id" element={<ProtectedAdminRoute><EditTeacherProfile /></ProtectedAdminRoute>} />
            <Route path="/admin/attendance-Dashboard/:role" element={<ProtectedAdminRoute><AttendanceDashboardAdmin /></ProtectedAdminRoute>} />
            <Route path="/admin/attendance-history/:role" element={<ProtectedAdminRoute><AttendanceHistoryAdmin /></ProtectedAdminRoute>} />
            <Route path="/admin/take-attendance/:role" element={<ProtectedAdminRoute><StudentAttendanceAdmin /></ProtectedAdminRoute>} />
            <Route path="/admin/school-announcements" element={<ProtectedAdminRoute><SchoolAnnouncementsPage /></ProtectedAdminRoute>} />

            {/* 👩‍🏫 Teacher Routes */}
            <Route path="/teacher/dashboard" element={<ProtectedTeacherRoute><TeacherHomePage /></ProtectedTeacherRoute>} />
            <Route path="/teacher/today-schedule" element={<ProtectedTeacherRoute><TeacherTodaySchedule /></ProtectedTeacherRoute>} />
            <Route path="/teacher/take-attendance/:role" element={<ProtectedTeacherRoute><AttendancePage /></ProtectedTeacherRoute>} />
            <Route path="/teacher/attendance-Dashboard/:role" element={<ProtectedTeacherRoute><AttendanceDashboardPage /></ProtectedTeacherRoute>} />
            <Route path="/teacher/attendance-history/:role" element={<ProtectedTeacherRoute><AttendanceHistoryPage /></ProtectedTeacherRoute>} />
            <Route path="/students-by-class" element={<ProtectedTeacherRoute><ClassStudentListPage /></ProtectedTeacherRoute>} />
            <Route path="/students/profile/:id" element={<ProtectedTeacherRoute><StudentProfileCardPage /></ProtectedTeacherRoute>} />
            <Route path="/teacher/timetable" element={<ProtectedTeacherRoute><ClasswiseTimetableViewerPage /></ProtectedTeacherRoute>} />
            <Route path="/teacher/assign-homework" element={<ProtectedTeacherRoute><AssignHomeworkPage /></ProtectedTeacherRoute>} />
            <Route path="/teacher/homework/details/:id" element={<ProtectedTeacherRoute><HomeworkDetailPage /></ProtectedTeacherRoute>} />
            <Route path="/student/details" element={<ProtectedTeacherRoute><FullStudentInfo /></ProtectedTeacherRoute>} />
            <Route path="/teacher/details" element={<ProtectedTeacherRoute><TeacherDetails /></ProtectedTeacherRoute>} />
            <Route path="/teacher/exam-marks/add/:role" element={<ProtectedTeacherRoute><AddExamMarkTeacher /></ProtectedTeacherRoute>} />
            <Route path="/teacher/homework-archive" element={<ProtectedTeacherRoute><HomeworkListPage/></ProtectedTeacherRoute>} />

            {/* 👪 Parent Routes */}
            <Route path="/parent/dashboard" element={<ProtectedParentRoute><ParentEntryHomePage /></ProtectedParentRoute>} />
            <Route path="/parent/Home" element={<ProtectedParentRoute><ParentHomePage /></ProtectedParentRoute>} />
            <Route path="/verified-submitted-homework/parent" element={<ProtectedParentRoute><VerifiedSubmittedHomeworkPage/></ProtectedParentRoute>} />

            {/* 🎓 Student Routes */}
            <Route path="/verified-submitted-homework/student" element={<ProtectedStudentRoute><VerifiedSubmittedHomeworkPage/></ProtectedStudentRoute>} />
            <Route path="/student/dashboard" element={<ProtectedStudentRoute><StudentHome /></ProtectedStudentRoute>} />
            <Route path="/student/timeTable" element={<ProtectedStudentRoute><StudentTimetablePage /></ProtectedStudentRoute>} />
            <Route path="/student/teacher-list" element={<ProtectedStudentRoute><StudentTeacherListPage /></ProtectedStudentRoute>} />
            <Route path="/student/school-announcement" element={<ProtectedStudentRoute><SchoolMessagePage /></ProtectedStudentRoute>} />
            <Route path="/student/Home-Work" element={<ProtectedStudentRoute><StudentHomeworkPage /></ProtectedStudentRoute>} />
            <Route path="/student/progress-report" element={<ProtectedStudentRoute><StudentProgressReportPage /></ProtectedStudentRoute>} />
            <Route path="/student/Fees-History/:role" element={<ProtectedStudentRoute><StudentFeesHistoryPage /></ProtectedStudentRoute>} />

          </Routes>
        </PageWrapper>
      </AnimatePresence>
    </>
  );
}

export default AnimatedRoutes;
