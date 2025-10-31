import React from 'react'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'
import AttendanceHistory from '../../components/teacher_layout/attendance/AttendanceHistory'
function AttendanceHistoryPage() {
  return (
    <div>
          <Navbar />
          <AttendanceHistory/>
    </div>
  )
}

export default AttendanceHistoryPage
