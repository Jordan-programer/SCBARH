import React from 'react';
import AppLayout from '@/components/AppLayout';
import EmployeeManagementClient from './components/EmployeeManagementClient';

export default function EmployeeManagementPage() {
  return (
    <AppLayout currentPath="/employee-management">
      <div className="px-6 py-6 max-w-screen-2xl mx-auto xl:px-8 2xl:px-10">
        <EmployeeManagementClient />
      </div>
    </AppLayout>
  );
}