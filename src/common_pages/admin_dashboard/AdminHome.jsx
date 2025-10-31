import React from 'react'
import AdminDashboard from '../../components/admin_layout/admin_dashboard/AdminDashboard'
import Navbar from '../../components/admin_layout/admin_navbar/Navbar'

function AdminHome() {
  return (
      <div>
          <Navbar/>
      <AdminDashboard />
      
    </div>
  )
}

export default AdminHome
