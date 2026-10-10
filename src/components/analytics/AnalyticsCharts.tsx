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

const SENT_VS_REPLIES_DATA = [
  { day: 'Mon', sent: 12, replies: 4 },
  { day: 'Tue', sent: 18, replies: 7 },
  { day: 'Wed', sent: 15, replies: 6 },
  { day: 'Thu', sent: 24, replies: 11 },
  { day: 'Fri', sent: 20, replies: 9 },
  { day: 'Sat', sent: 8, replies: 3 },
  { day: 'Sun', sent: 5, replies: 2 },
];

const STAGE_VALUES_DATA = [
  { stage: 'Discovered', count: 6, value: 450000 },
  { stage: 'Outreach Sent', count: 7, value: 620000 },
  { stage: 'Call Scheduled', count: 3, value: 500000 },
  { stage: 'Negotiating', count: 2, value: 400000 },
  { stage: 'Committed', count: 4, value: 750000 },
  { stage: 'Payment Received', count: 2, value: 400000 },
];

const INTENT_DATA = [
  { name: 'Interested', value: 42, color: '#0C382E' },
  { name: 'Call Requested', value: 28, color: '#2E7D32' },
  { name: 'More Info Needed', value: 18, color: '#B25E00' },
  { name: 'Declined / Out of Budget', value: 12, color: '#D32F2F' },
];

const INDUSTRY_CONVERSION_DATA = [
  { industry: 'Developer Tools', replyRate: 48, commitments: '₹14L' },
  { industry: 'Cloud & Infra', replyRate: 41, commitments: '₹9.5L' },
  { industry: 'Fintech & Payments', replyRate: 35, commitments: '₹8.0L' },
  { industry: 'Web3 & Layer 1s', replyRate: 29, commitments: '₹5.5L' },
  { industry: 'EdTech & Upskilling', replyRate: 22, commitments: '₹3.0L' },
];

export function AnalyticsCharts() {
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SENT_VS_REPLIES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STAGE_VALUES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <p className="text-xs text-[#0C382E]/60">Categorized by Gemini AI</p>
            </div>
            <PieIcon className="w-4 h-4 text-[#0C382E]" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={INTENT_DATA}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {INTENT_DATA.map((entry, index) => (
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
              {INTENT_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#0C382E]/80 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-[#0C382E] font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industry Conversion Table */}
        <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-heading font-bold text-[#0C382E]">
                Conversion by Sponsor Vertical
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">Which industries respond fastest to college developer hackathons</p>
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
                  {INDUSTRY_CONVERSION_DATA.map((ind) => (
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
                      <td className="py-3 text-[#0C382E]/70 font-mono">1.4 days</td>
                      <td className="py-3 text-right font-mono font-bold text-[#0C382E]">{ind.commitments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
