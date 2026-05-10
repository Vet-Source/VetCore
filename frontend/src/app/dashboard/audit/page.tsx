"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vs_token");
    fetch(`${API}/audit`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setLogs(d.data || []); setLoading(false); })
      .catch(() => { setLogs([]); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#374822", marginBottom: 8 }}>Audit Log</h1>
      <p style={{ color: "#779451", fontSize: 14, marginBottom: 28 }}>Immutable on-chain record of all claim processing activity</p>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading audit log...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div style={{ fontSize: 15, color: "#6b7280" }}>No audit entries yet</div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>All claim activity will be recorded here</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["Timestamp", "Action", "Entity", "User", "Blockchain TX"].map(h => (
                <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {logs.map((log: any, i: number) => (
                <tr key={log.id} style={{ borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "#9ca3af" }}>{new Date(log.createdAt).toLocaleString("en-GB")}</td>
                  <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{log.action}</td>
                  <td style={{ padding: "12px 18px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{log.entityId?.slice(0, 10)}...</td>
                  <td style={{ padding: "12px 18px", fontSize: 13, color: "#374151" }}>{log.userId}</td>
                  <td style={{ padding: "12px 18px", fontSize: 11, color: "#95c11f", fontFamily: "monospace" }}>{log.txHash || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}