'use client';
import { format } from 'date-fns';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const STATUS_CLASSES: Record<string, string> = {
  DRAFT:        'badge-draft',
  SUBMITTED:    'badge-submitted',
  UNDER_REVIEW: 'badge-review',
  APPROVED:     'badge-approved',
  REJECTED:     'badge-rejected',
  PAID:         'badge-paid',
  DISPUTED:     'badge-review',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={STATUS_CLASSES[status] || 'badge-draft'}>
      {status.replace('_', ' ')}
    </span>
  );
}

interface Claim {
  id: string;
  claimNumber: string;
  status: string;
  totalAmount: number;
  submittedAt: string;
  pet?: { name: string; species: string };
  clinic?: { clinicName: string };
  txHash?: string;
}

export function ClaimsTable({ claims, compact }: { claims: Claim[]; compact?: boolean }) {
  if (!claims.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No claims found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-2 text-slate-500 font-medium">Claim #</th>
            {!compact && <th className="text-left py-3 px-2 text-slate-500 font-medium">Patient</th>}
            <th className="text-left py-3 px-2 text-slate-500 font-medium">Status</th>
            <th className="text-left py-3 px-2 text-slate-500 font-medium">Amount</th>
            {!compact && <th className="text-left py-3 px-2 text-slate-500 font-medium">Submitted</th>}
            {!compact && <th className="text-left py-3 px-2 text-slate-500 font-medium">Blockchain</th>}
            <th className="py-3 px-2" />
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-3 px-2 font-mono text-xs">{claim.claimNumber}</td>
              {!compact && (
                <td className="py-3 px-2">
                  <span className="font-medium">{claim.pet?.name}</span>
                  <span className="text-slate-400 ml-1">({claim.pet?.species})</span>
                </td>
              )}
              <td className="py-3 px-2"><StatusBadge status={claim.status} /></td>
              <td className="py-3 px-2 font-medium">£{Number(claim.totalAmount).toFixed(2)}</td>
              {!compact && (
                <td className="py-3 px-2 text-slate-500">
                  {claim.submittedAt ? format(new Date(claim.submittedAt), 'dd MMM yyyy') : '—'}
                </td>
              )}
              {!compact && (
                <td className="py-3 px-2">
                  {claim.txHash ? (
                    <a
                      href={`https://explorer.solana.com/tx/${claim.txHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-500 hover:underline text-xs font-mono"
                    >
                      {claim.txHash.slice(0, 8)}… <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-300 text-xs">Pending</span>
                  )}
                </td>
              )}
              <td className="py-3 px-2 text-right">
                <Link href={`/claims/${claim.id}`} className="text-brand-500 hover:underline text-xs">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
