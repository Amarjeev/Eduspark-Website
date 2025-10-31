import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [schoolName, setSchoolName] = useState("");

  return (
    <UserContext.Provider value={{ schoolName, setSchoolName}}>
      {children}
    </UserContext.Provider>
  );
};

