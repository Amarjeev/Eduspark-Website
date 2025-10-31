import React from 'react'
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "../../../components/loading_ui/Loading";
import SessionVerifier from "../../SessionVerifier";


function ProtectedParentRoute({ children }) {
  const [teacherToken, setTeacherToken] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await SessionVerifier("parent");
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
    '/parent/dashboard',
    '/parent/Home',
   '/verified-submitted-homework/parent'
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
    return <Navigate to="/parent/dashboard" />;
  }

  // All good → render the protected component
  return children;
}

export default ProtectedParentRoute;
