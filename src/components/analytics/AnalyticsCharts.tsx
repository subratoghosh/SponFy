'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrencyINR } from '@/lib/utils';
import { TrendingUp, PieChart as PieIcon, BarChart3, Users, DollarSign } from 'lucide-react';

interface AnalyticsChartsProps {
  data?: {
    funnel?: any[];
    outreachTrends?: any[];
    pipelineValueByStage?: any[];
    industryStats?: any[];
    intentDistribution?: any[];
    summary?: any;
  };
}

const BRAND_COLORS = ['#0C382E', '#2D6A4F', '#D4A373', '#CCD5AE', '#E76F51', '#52B788'];

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const outreachTrendsData =
    data?.outreachTrends && data.outreachTrends.length > 0
      ? data.outreachTrends.map((t) => ({
          day: t.week || t.day,
          sent: t.sent || 0,
          replies: t.replies || 0,
        }))
      : [];

  const stageValuesData =
    data?.pipelineValueByStage && data.pipelineValueByStage.length > 0
      ? data.pipelineValueByStage.map((s) => ({
          stage: s.stage,
          count: s.count || 0,
          value: s.value || 0,
        }))
      : [];

  const intentData =
    data?.intentDistribution && data.intentDistribution.length > 0
      ? data.intentDistribution.map((item: any, idx: number) => ({
          name: item.intent || item.name || "General",
          value: item.percentage || item.value || 0,
          color: BRAND_COLORS[idx % BRAND_COLORS.length],
        }))
      : [];

  const industryData =
    data?.industryStats && data.industryStats.length > 0
      ? data.industryStats.map((ind) => ({
          industry: ind.industry,
          replyRate: ind.rate || 0,
          commitments: formatCurrencyINR(ind.committedValue || 0),
        }))
      : [];
  return (
    <div className="space-y-6">
      {/* 2 Column charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outbound vs Replies Trend */}
        <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-heading font-bold text-[#0C382E]">
                Outreach Velocity & Reply Flow
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">Daily verified dispatches vs incoming replies</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#0C382E]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {outreachTrendsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={outreachTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0C382E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0C382E" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFF0B3" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FFF0B3" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0C382E" opacity={0.07} />
                    <XAxis dataKey="day" stroke="#0C382E" opacity={0.5} fontSize={11} tickLine={false} />
                    <YAxis stroke="#0C382E" opacity={0.5} fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0C382E',
                        borderRadius: '12px',
                        color: '#FAF4E6',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="sent" stroke="#0C382E" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" name="Sent" />
                    <Area type="monotone" dataKey="replies" stroke="#B25E00" strokeWidth={2} fillOpacity={1} fill="url(#colorReplies)" name="Replies" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#0C382E]/50 text-xs">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-30 text-[#0C382E]" />
                  <p className="font-medium">No outreach trend activity recorded yet</p>
                  <p className="text-[11px] text-[#0C382E]/40">Send outreach emails to begin populating real-time timeline analytics.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Value by Stage */}
        <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-heading font-bold text-[#0C382E]">
                Pipeline Sponsorship Value (INR)
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">Estimated target value by stage</p>
            </div>
            <DollarSign className="w-4 h-4 text-[#0C382E]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {stageValuesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageValuesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0C382E" opacity={0.07} />
                    <XAxis dataKey="stage" stroke="#0C382E" opacity={0.5} fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#0C382E"
                      opacity={0.5}
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val / 100000}L`}
                    />
                    <Tooltip
                      formatter={(val: any) => formatCurrencyINR(Number(val))}
                      contentStyle={{
                        backgroundColor: '#0C382E',
                        borderRadius: '12px',
                        color: '#FAF4E6',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill="#0C382E" radius={[6, 6, 0, 0]} name="INR Value" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#0C382E]/50 text-xs">
                  <DollarSign className="w-8 h-8 mb-2 opacity-30 text-[#0C382E]" />
                  <p className="font-medium">No active sponsorship pipeline value</p>
                  <p className="text-[11px] text-[#0C382E]/40">Add sponsors and assign target pipeline amounts to see distributions.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2 Column: Intent Distribution & Industry Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reply Intent Distribution */}
        <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-heading font-bold text-[#0C382E]">
                AI Reply Intent Mix
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">Categorized by Natural Language AI</p>
            </div>
            <PieIcon className="w-4 h-4 text-[#0C382E]" />
          </CardHeader>
          <CardContent className="pt-2">
            {intentData.length > 0 ? (
              <>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={intentData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {intentData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0C382E',
                          borderRadius: '10px',
                          color: '#FAF4E6',
                          border: 'none',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-2">
                  {intentData.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[#0C382E]/80 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-[#0C382E] font-mono">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-[#0C382E]/50 text-xs">
                <PieIcon className="w-8 h-8 mb-2 opacity-30 text-[#0C382E]" />
                <p className="font-medium">No replies analyzed yet</p>
                <p className="text-[11px] text-[#0C382E]/40">Incoming sponsor replies will be categorized by AI intent.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Industry Conversion Table */}
        <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-heading font-bold text-[#0C382E]">
                Conversion by Sponsor Vertical
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">Which industries respond fastest to your campaigns</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#0C382E]" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#0C382E]/10 text-[#0C382E]/50 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Industry / Sector</th>
                    <th className="pb-2">Reply Rate</th>
                    <th className="pb-2">Avg Response Time</th>
                    <th className="pb-2 text-right">Committed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0C382E]/5">
                  {industryData.length > 0 ? (
                    industryData.map((ind: any) => (
                      <tr key={ind.industry} className="hover:bg-[#FAF4E6]/50">
                        <td className="py-3 font-semibold text-[#0C382E]">{ind.industry}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-[#0C382E]/10 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#0C382E] h-full rounded-full"
                                style={{ width: `${ind.replyRate}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[#0C382E]">{ind.replyRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-[#0C382E]/70 font-mono">-</td>
                        <td className="py-3 text-right font-mono font-bold text-[#0C382E]">{ind.commitments}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#0C382E]/50">
                        No industry data recorded yet in active campaigns.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
