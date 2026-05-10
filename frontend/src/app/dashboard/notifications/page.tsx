"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vs_token");
    fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setNotifications(d.data || []); setLoading(false); })
      .catch(() => { setNotifications([]); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#374822", marginBottom: 8 }}>Notifications</h1>
      <p style={{ color: "#779451", fontSize: 14, marginBottom: 28 }}>Real-time alerts for claim status updates</p>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 48, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No notifications yet</div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>You will be notified here when claim statuses change</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n: any) => (
            <div key={n.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8eaed", padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.type === "APPROVED" ? "#d1fae5" : n.type === "REJECTED" ? "#fee2e2" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke={n.type === "APPROVED" ? "#059669" : n.type === "REJECTED" ? "#dc2626" : "#3b82f6"} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{n.title || "Claim Update"}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>{new Date(n.createdAt).toLocaleString("en-GB")}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#95c11f", flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}