import React from 'react';
import '../../css/dashboard-style.css'
import Customer from './Customer';
import DashBoardDays from './DashBoardDays';
import PatientCard from './PatientCard';
import './Dashboard.css'
import { getLoggedInUser } from '../../common/businesslogic';


const Dashboard = () => {
  const loggedInUser = getLoggedInUser()
  return (
    <div className='flex flex-col gap-3 w-full h-full'>
      <div class="w-full rounded-lg shadow-lg border-2 p-5 bg-[#ffffff]">
        <Customer />
      </div>
      <div className='grid md:grid-cols-12 gap-2'>
        <div className='md:col-span-4 rounded-lg shadow-lg border-2 p-5 bg-[#ffffff] w-50 '>
          <DashBoardDays />
        </div>
        {loggedInUser?.role === 'admin' &&
          <div className='md:col-span-8 rounded-lg shadow-lg border-2 p-5 bg-[#ffffff] w-full'>
            <PatientCard />
          </div>}
      </div>
    </div>
  )
}

export default Dashboard;
