import React from 'react'
import TeacherList from '../../components/admin_layout/user_management/TeacherList'
import Navbar from '../../components/admin_layout/admin_navbar/Navbar'

function TeachersList() {
  return (
      <div>
          <Navbar/>
      <TeacherList />
    </div>
  )
}

export default TeachersList
