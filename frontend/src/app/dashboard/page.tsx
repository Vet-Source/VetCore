"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function StatCard({ label, value, color = "#4d9e6e" }: any) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e8eaed" }}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    PENDING: { bg: "#fef3c7", text: "#92400e" },
    UNDER_REVIEW: { bg: "#dbeafe", text: "#1e40af" },
    APPROVED: { bg: "#d1fae5", text: "#065f46" },
    REJECTED: { bg: "#fee2e2", text: "#991b1b" },
  };
  const c = colors[status] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text }}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

export default function DashboardPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("vs_user");
    if (userData) setUser(JSON.parse(userData));
    const token = localStorage.getItem("vs_token");
    fetch(`${API}/claims`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setClaims(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === "PENDING").length,
    approved: claims.filter(c => c.status === "APPROVED").length,
    rejected: claims.filter(c => c.status === "REJECTED").length,
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#374822", margin: 0 }}>
          Welcome Back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p style={{ color: "#779451", fontSize: 14, marginTop: 4 }}>VETcore Blockchain Claims Platform</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Claims" value={stats.total} color="#111827" />
        <StatCard label="Pending Review" value={stats.pending} color="#d97706" />
        <StatCard label="Approved" value={stats.approved} color="#059669" />
        <StatCard label="Rejected" value={stats.rejected} color="#dc2626" />
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374822", margin: 0 }}>Recent Claims</h2>
          <Link href="/dashboard/submit" style={{ fontSize: 13, color: "#95c11f", fontWeight: 600, textDecoration: "none", padding: "7px 14px", border: "1px solid #95c11f", borderRadius: 8 }}>+ Submit new claim</Link>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading claims...</div>
        ) : claims.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>ðŸ“‹</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No claims yet</div>
            <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>Submit your first insurance claim to get started</div>
            <Link href="/dashboard/submit" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", background: "#95c11f", color: "#374822", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Submit Claim</Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Claim ID", "Patient", "Amount", "Status", "Date", "Blockchain TX", ""].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.slice(0, 10).map((claim, i) => (
                <tr key={claim.id} style={{ borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{claim.id?.slice(0, 8)}...</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#374151" }}>{claim.patientName || "-"}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#059669" }}>GBP {Number(claim.amount)?.toLocaleString()}</td>
                  <td style={{ padding: "14px 20px" }}><StatusBadge status={claim.status} /></td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#6b7280" }}>{new Date(claim.createdAt).toLocaleDateString("en-GB")}</td>
                  <td style={{ padding: "14px 20px", fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>{claim.blockchainTxId ? claim.blockchainTxId.slice(0, 14) + "..." : "pending"}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <Link href={`/dashboard/claims/${claim.id}`} style={{ fontSize: 13, color: "#95c11f", fontWeight: 600, textDecoration: "none" }}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}