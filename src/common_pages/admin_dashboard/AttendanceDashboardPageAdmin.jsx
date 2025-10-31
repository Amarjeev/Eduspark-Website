import React from 'react'
import Navbar from '../../components/admin_layout/admin_navbar/Navbar'
import AttendanceDashboard from '../../components/admin_layout/attendance/AttendanceDashboard'
function AttendanceDashboardPageAdmin() {
  return (
    <div>
          <Navbar/>
          <AttendanceDashboard/>
    </div>
  )
}

export default AttendanceDashboardPageAdmin
