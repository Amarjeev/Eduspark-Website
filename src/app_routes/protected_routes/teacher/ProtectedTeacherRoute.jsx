import React from 'react'
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "../../../components/loading_ui/Loading";
import SessionVerifier from "../../SessionVerifier";


function ProtectedTeacherRoute({ children }) {
  const [teacherToken, setTeacherToken] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await SessionVerifier("teacher");
          setTeacherToken(response);
      } catch (error) {
        setTeacherToken(false);
      }
    };

    checkToken();
  }, []);

  if (teacherToken === null) {
    return <Loading />;
  }

  // Define allowed admin routes (base paths)
  const allowedRoutes = [
    '/teacher/dashboard',
    "/teacher/today-schedule",
    '/attendance-history',
    '/students-by-class',
    '/students/profile',
    '/teacher/timetable',
    '/teacher/assign-homework',
    '/teacher/homework/details',
    '/teacher/exam-marks/add',
    '/student/details',
    "/teacher/details",
    '/teacher/attendance-Dashboard',
    '/teacher/attendance-history',
    '/teacher/take-attendance',
    '/teacher/exam-marks/add',
    "/school-alerts",
    "/teacher/homework-archive"
  ];

  const isAllowed = allowedRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // If not authenticated → redirect to login
  if (!teacherToken) {
    return <Navigate to="/" />;
  }

  // Authenticated but trying to access restricted path
  if (!isAllowed) {
    return <Navigate to="/teacher/dashboard" />;
  }

  // All good → render the protected component
  return children;
}

export default ProtectedTeacherRoute;
