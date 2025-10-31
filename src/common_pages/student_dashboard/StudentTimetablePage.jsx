import React from 'react'
import Navbar from '../../components/student_layout/student_navbar/StudentNavbar'
import StudentTimetable from '../../components/student_layout/time_Table/StudentTimetable'

function StudentTimetablePage() {
  return (
    <div>
          <Navbar />
          <StudentTimetable/>
    </div>
  )
}

export default StudentTimetablePage
