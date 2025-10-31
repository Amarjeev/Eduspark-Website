import React from 'react'
import Navbar from '../../components/teacher_layout/teacher_navbar/Navbar'
import ClassWiseTimetableForTeacher from '../../components/teacher_layout/Timetable/ClassWiseTimetableForTeacher'
function ClasswiseTimetableViewerPage() {
  return (
    <div>
          <Navbar />
          <ClassWiseTimetableForTeacher/>
    </div>
  )
}

export default ClasswiseTimetableViewerPage
