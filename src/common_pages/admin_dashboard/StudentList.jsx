import React from 'react'
import Navbar from '../../components/admin_layout/admin_navbar/Navbar'
import StudentsList from '../../components/admin_layout/user_management/StudentsList'

function StudentList() {
  return (
    <div>
      <Navbar />
      <StudentsList/>
    </div>
  )
}

export default StudentList
