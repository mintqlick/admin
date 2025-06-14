import Box from '@/components/Box/Box';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Sidebar from '@/components/dashboard/SideBar';
import React from 'react';

const DashboardLayout = ({children}) => {
  return (
    <Box
      style={{
        position: 'relative',
        width: '100vw',
        // height: '100vh',
      }}
    >
      {/* your dashboard content here */}
        <DashboardHeader />
    
        {/* Sidebar and main content */}
      <div className="flex">
        <Sidebar />
        <main className="main-content mt-[90px] flex-1 p-6 bg-white">
          {children}
        </main>
      </div>
      
      


    </Box>
  );
};

export default DashboardLayout;
