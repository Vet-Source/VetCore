"use client";
import { useEffect, useState } from "react";

const API = "http://localhost:3001/api";

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
    <div style={{ padding:32, maxWidth:700 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"#111827", marginBottom:8 }}>Notifications</h1>
      <p style={{ color:"#6b7280", fontSize:14, marginBottom:28 }}>Real-time alerts for claim status updates</p>

      {loading ? (
        <div style={{ textAlign:"center", padding:48, color:"#9ca3af" }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e8eaed", padding:48, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
          <div style={{ fontSize:16, fontWeight:600, color:"#374151" }}>No notifications yet</div>
          <div style={{ fontSize:14, color:"#9ca3af", marginTop:4 }}>You'll be notified here when claim statuses change</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {notifications.map((n: any) => (
            <div key={n.id} style={{ background:"#fff", borderRadius:10, border:"1px solid #e8eaed", padding:"16px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ fontSize:22, flexShrink:0 }}>{n.type === "APPROVED" ? "✅" : n.type === "REJECTED" ? "❌" : "📋"}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{n.title || "Claim Update"}</div>
                <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>{n.message}</div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:6 }}>{new Date(n.createdAt).toLocaleString("en-GB")}</div>
              </div>
              {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:"#4d9e6e", flexShrink:0, marginTop:4 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
