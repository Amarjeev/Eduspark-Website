import React from 'react'
import StudentProfilePage from '../admin_dashboard/StudentProfilePage'
import StudentProfileCard from '../../components/teacher_layout/ClassStudents_List/StudentProfileCard'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'

function StudentProfileCardPage() {
  return (
      <div>
          <Navbar/>
      <StudentProfileCard/>
    </div>
  )
}

export default StudentProfileCardPage
