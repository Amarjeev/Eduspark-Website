import React from 'react'
import AdminHomePage from '../../components/student_layout/student_dashboard/StudentHomePage'
import Navbar from '../../components/student_layout/student_navbar/StudentNavbar'

function StudentHome() {
  return (
      <div>
          <Navbar/>
      <AdminHomePage/>
    </div>
  )
}

export default StudentHome
