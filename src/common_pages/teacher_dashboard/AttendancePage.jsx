import React from 'react'
import AttendanceForm from '../../components/teacher_layout/attendance/AttendanceForm'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'

function AttendancePage() {
  return (
    <div>
      <Navbar/>
      <AttendanceForm/>
    </div>
  )
}

export default AttendancePage
