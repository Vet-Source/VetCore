'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';

export function ClaimsChart() {
  const { data } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn: () => api.get('/dashboard/claims-over-time').then(r => r.data.data),
  });

  // Mock data for development
  const chartData = data ?? [
    { month: 'Aug', submitted: 12, approved: 8, rejected: 2 },
    { month: 'Sep', submitted: 19, approved: 14, rejected: 3 },
    { month: 'Oct', submitted: 15, approved: 11, rejected: 2 },
    { month: 'Nov', submitted: 22, approved: 17, rejected: 4 },
    { month: 'Dec', submitted: 18, approved: 13, rejected: 2 },
    { month: 'Jan', submitted: 28, approved: 21, rejected: 3 },
  ];

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Claims Overview</h2>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500 inline-block" /> Submitted</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-success-600 inline-block" /> Approved</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-danger-600 inline-block" /> Rejected</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="submitted" fill="#0066CC" radius={[4,4,0,0]} />
          <Bar dataKey="approved" fill="#16A34A" radius={[4,4,0,0]} />
          <Bar dataKey="rejected" fill="#DC2626" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
