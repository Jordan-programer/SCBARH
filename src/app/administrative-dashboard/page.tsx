import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import KPIBentoGrid from './components/KPIBentoGrid';
import AttendanceTrendChart from './components/AttendanceTrendChart';
import DepartmentAbsenceChart from './components/DepartmentAbsenceChart';
import BiometricEventFeed from './components/BiometricEventFeed';
import AlertsPanel from './components/AlertsPanel';

export default function AdministrativeDashboardPage() {
  return (
    <AppLayout currentPath="/administrative-dashboard">
      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6 xl:px-8 2xl:px-10">
        <DashboardHeader />
        <KPIBentoGrid />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <AttendanceTrendChart />
            <DepartmentAbsenceChart />
          </div>
          <div className="space-y-6">
            <AlertsPanel />
            <BiometricEventFeed />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}