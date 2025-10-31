import React from 'react'
import AttendanceForm from '../../components/teacher_layout/attendance/AttendanceForm'
import Navbar from '../../components/admin_layout/admin_navbar/Navbar'

function AttendancePageAdmin() {
  return (
    <div>
      <Navbar/>
      <AttendanceForm/>
    </div>
  )
}

export default AttendancePageAdmin
