'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';

export function RecentActivity() {
  const { data } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => api.get('/notifications?limit=8').then(r => r.data.data),
  });

  return (
    <div className="card p-6 h-full">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {(data ?? []).length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">No recent activity</p>
        )}
        {(data ?? []).map((n: any) => (
          <div key={n.id} className="flex gap-3 items-start">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-brand-500'}`} />
            <div>
              <p className="text-sm font-medium">{n.subject}</p>
              <p className="text-xs text-slate-400">{format(new Date(n.createdAt), 'dd MMM, HH:mm')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
