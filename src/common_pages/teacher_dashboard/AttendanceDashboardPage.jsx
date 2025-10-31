import React from 'react'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'
import AttendanceDashboard from '../../components/teacher_layout/attendance/AttendanceDashboard'
function AttendanceDashboardPage() {
  return (
    <div>
          <Navbar />
          <AttendanceDashboard/>
    </div>
  )
}

export default AttendanceDashboardPage
