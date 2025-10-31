import React from 'react'
import Navbar from '../../components/student_layout/student_navbar/StudentNavbar'
import StudentTeacherList from '../../components/student_layout/teachers_list/StudentTeacherList'

function StudentTeacherListPage() {
  return (
    <div>
          <Navbar />
          <StudentTeacherList/>
    </div>
  )
}

export default StudentTeacherListPage
