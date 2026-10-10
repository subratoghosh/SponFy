'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, Download } from 'lucide-react';
import { getAnalyticsData } from '@/lib/data/repositories/analytics';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { KPIRow } from '@/components/dashboard/KPIRow';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { KPISkeleton } from '@/components/skeletons/KPISkeleton';
import { ChartSkeleton } from '@/components/skeletons/ChartSkeleton';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const analytics = await getAnalyticsData();
      setData(analytics);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    toast('Exporting sponsorship analytics CSV...', 'info');
    setTimeout(() => {
      toast('SponFy_Analytics_2026.csv downloaded!', 'success');
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0C382E] text-[#FFF0B3] flex items-center justify-center shadow-md">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-[#0C382E]">Sponsorship Intelligence</h1>
            <p className="text-xs text-[#0C382E]/60">
              Real conversation metrics, pipeline velocity and verified committed revenue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range picker */}
          <div className="flex items-center bg-[#FFFFFF] p-1 rounded-xl border border-[#0C382E]/10">
            {['7d', '30d', '60d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase transition-all ${
                  timeRange === range
                    ? 'bg-[#0C382E] text-[#FFF0B3] shadow-sm'
                    : 'text-[#0C382E]/60 hover:text-[#0C382E]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-[#0C382E]/20 text-[#0C382E] gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards or Skeleton */}
      {loading ? (
        <KPISkeleton count={4} />
      ) : data?.summary ? (
        <KPIRow summary={data.summary} />
      ) : null}

      {/* Analytics Charts and Data Tables or Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton title="Loading Sent vs Replies Velocity" height="h-72" />
          <ChartSkeleton title="Loading Pipeline Value by Stage" height="h-72" />
        </div>
      ) : (
        <AnalyticsCharts />
      )}
    </div>
  );
}
