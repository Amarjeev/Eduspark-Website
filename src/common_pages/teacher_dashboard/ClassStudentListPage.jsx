import React from 'react'
import ClassStudentList from '../../components/teacher_layout/ClassStudents_List/ClassStudentList'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'

function ClassStudentListPage() {
  return (
      <div>
          <Navbar/>
      <ClassStudentList/>
    </div>
  )
}

export default ClassStudentListPage
