'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AttendanceTrendChartInner = dynamic(
    () => import('./AttendanceTrendChartInner'),
    { ssr: false, loading: () => <div className="animate-pulse bg-muted rounded-lg h-64 w-full" /> }
);

export default function AttendanceTrendChart() {
    return <AttendanceTrendChartInner />;
}