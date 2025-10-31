import React from 'react'
import StudentDetailsPage from '../../components/teacher_layout/ClassStudents_List/StudentDetailsPage'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'
function FullStudentInfo() {
  return (
    <div>
          <Navbar />
          <StudentDetailsPage/>
    </div>
  )
}

export default FullStudentInfo
