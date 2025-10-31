import React from 'react'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'
import HomeworkList from '../../components/teacher_layout/homework/HomeworkArchive/HomeworkList'

function HomeworkListPage() {
  return (
    <div>
          <Navbar />
          <HomeworkList/>
    </div>
  )
}

export default HomeworkListPage
