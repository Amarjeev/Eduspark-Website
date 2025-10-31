import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../../../BaseUrl/BaseUrl";
import Loading from "../../../components/loading_ui/Loading";
import SessionVerifier from "../../SessionVerifier";

const ProtectedAdminRoute = ({ children }) => {
  const [adminToken, setAdminToken] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      try {
       const response = await SessionVerifier("admin");
        setAdminToken(response);
      } catch (error) {
        setAdminToken(false);
      }
    };

    checkToken();
  }, []);

  if (adminToken === null) {
    return <Loading />;
  }

  // Define allowed admin routes (base paths)
  const allowedRoutes = [
    '/admin/dashboard',
    '/admin/teachers',
    '/admin/students',
    '/admin/teacher-signup',
    '/admin/student-signup',
    '/admin/class-management',
    '/admin/classDivisionConfig',
    '/admin/manage-subjects',
    '/admin/exam-marks/add',
    '/admin/feesconfig/option',
    "/admin/fees/config",
    '/admin/timetable',
    '/admin/timetable/option',
    '/admin/timetable/all',
    '/admin/fees/history',
    '/admin/teacher-class-access',
    '/admin/attendance-Dashboard',
    '/admin/attendance-history',
    '/admin/take-attendance',
    '/admin/teacher-profile/edit',
    "/admin/school-announcements",
    "/admin/profile-view",
    "/admin/fees/payment"
  ];

  const isAllowed = allowedRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // If not authenticated → redirect to login
  if (!adminToken) {
    return <Navigate to="/" />;
  }

  // Authenticated but trying to access restricted path
  if (!isAllowed) {
    return <Navigate to="/admin/dashboard" />;
  }

  // All good → render the protected component
  return children;
};

export default ProtectedAdminRoute;
