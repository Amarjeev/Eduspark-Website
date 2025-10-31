import React from 'react'
import VerifiedSubmittedHomework from '../../components/student_layout/student_homework/VerifiedSubmittedHomework'
import { useLocation } from 'react-router-dom';
import ParentNavbar from '../../components/parent_layout/parent_navbar/ParentNavbar';
import StudentNavbar from '../../components/student_layout/student_navbar/StudentNavbar';
function VerifiedSubmittedHomeworkPage() {
    const { state } = useLocation();
  const role = state?.role;
  return (
    <div>
      {role === 'parent' ? <ParentNavbar /> : <StudentNavbar />}
      <VerifiedSubmittedHomework/>
    </div>
  )
}

export default VerifiedSubmittedHomeworkPage
