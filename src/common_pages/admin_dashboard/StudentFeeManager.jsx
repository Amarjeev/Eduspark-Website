import React from 'react'
import ManageStudentFees from '../../components/admin_layout/fees_management/pay_student_fees/ManageStudentFees'
import Navbar from '../../components/admin_layout/admin_navbar/Navbar'

function StudentFeeManager() {
  return (
      <div>
          <Navbar/>
      <ManageStudentFees/>
    </div>
  )
}

export default StudentFeeManager
