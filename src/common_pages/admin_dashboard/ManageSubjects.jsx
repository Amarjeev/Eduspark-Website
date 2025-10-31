import React from 'react'
import Navbar from '../../components/admin_layout/admin_navbar/Navbar'
import ManageSubjectsCfg from '../../components/admin_layout/class_subject_config/ManageSubjectsCfg'

function ManageSubjects() {
  return (
    <div>
          <Navbar />
          <ManageSubjectsCfg/>
    </div>
  )
}

export default ManageSubjects
