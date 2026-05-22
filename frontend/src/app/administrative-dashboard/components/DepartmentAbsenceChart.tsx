'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DepartmentAbsenceChartInner = dynamic(
    () => import('./DepartmentAbsenceChartInner'),
    { ssr: false, loading: () => <div className="animate-pulse bg-muted rounded-lg h-52 w-full" /> }
);

export default function DepartmentAbsenceChart() {
    return <DepartmentAbsenceChartInner />;
}