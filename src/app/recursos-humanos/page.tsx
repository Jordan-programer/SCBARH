import React from 'react';
import AppLayout from '@/components/AppLayout';
import RHClient from './components/RHClient';

export default function RecursosHumanosPage() {
  return (
    <AppLayout currentPath="/recursos-humanos">
      <div className="px-6 py-6 max-w-screen-2xl mx-auto xl:px-8 2xl:px-10">
        <RHClient />
      </div>
    </AppLayout>
  );
}
