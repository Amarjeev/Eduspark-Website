import React from 'react'
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "../../../components/loading_ui/Loading";
import SessionVerifier from "../../SessionVerifier";


function ProtectedStudentRoute({ children }) {
  const [studentToken, setStudentToken] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await SessionVerifier("student");
          setStudentToken(response);
      } catch (error) {
        setStudentToken(false);
      }
    };

    checkToken();
  }, []);

  if (studentToken === null) {
    return <Loading />;
  }

  // Define allowed student routes (base paths)
  const allowedRoutes = [
    "/student/dashboard",
    "/student/timeTable",
    "/student/teacher-list",
    "/student/exam-mark-view",
    "/student/school-announcement",
    "/student/Home-Work",
    "/student/progress-report",
    "/student/Fees-History",
    '/verified-submitted-homework/student'
  ];

  const isAllowed = allowedRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // If not authenticated → redirect to login
  if (!studentToken) {
    return <Navigate to="/" />;
  }

  // Authenticated but trying to access restricted path
  if (!isAllowed) {
    return <Navigate to="/student/dashboard" />;
  }

  // All good → render the protected component
  return children;
}

export default ProtectedStudentRoute;
