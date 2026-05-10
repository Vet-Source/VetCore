"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function Badge({ text, color }: { text: string; color: string }) {
  const colors: any = {
    green: { bg: "#d1fae5", text: "#065f46" },
    red: { bg: "#fee2e2", text: "#991b1b" },
    blue: { bg: "#dbeafe", text: "#1e40af" },
    yellow: { bg: "#fef3c7", text: "#92400e" },
    gray: { bg: "#f3f4f6", text: "#374151" },
  };
  const c = colors[color] || colors.gray;
  return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text }}>{text}</span>;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("ALL");
  const [pwModal, setPwModal] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("vs_user");
    if (userData) {
      const u = JSON.parse(userData);
      if (u.role !== "ADMIN") { router.push("/dashboard"); return; }
    }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const token = localStorage.getItem("vs_token");
    try {
      const res = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUsers(data.data);
    } catch { setError("Failed to load users"); }
    setLoading(false);
  }

  async function handleSuspend(id: string, suspended: boolean) {
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/admin/users/${id}/suspend`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ suspended }),
    });
    if (res.ok) {
      setMsg(suspended ? "User suspended" : "User reinstated");
      fetchUsers();
    }
  }

  async function handleRoleChange(id: string, role: string) {
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) { setMsg("Role updated"); fetchUsers(); }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Delete user ${email}? This will also delete all their claims.`)) return;
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { setMsg("User deleted"); fetchUsers(); }
  }

  async function handlePasswordChange() {
    if (!newPassword || newPassword.length < 6) { setMsg("Password must be at least 6 characters"); return; }
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/admin/users/${pwModal.id}/password`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) { setMsg("Password changed for " + pwModal.email); setPwModal(null); setNewPassword(""); }
  }

  const filtered = users.filter(u => {
    const matchTab = tab === "ALL" || u.role === tab;
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.name || "").toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: users.length,
    clinics: users.filter(u => u.role === "CLINIC").length,
    insurers: users.filter(u => u.role === "INSURER").length,
    suspended: users.filter(u => u.suspended).length,
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#374822", margin: 0 }}>Admin Panel</h1>
        <p style={{ color: "#779451", fontSize: 14, marginTop: 4 }}>Manage all users, roles and access</p>
      </div>

      {msg && <div style={{ padding: "12px 16px", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 8, color: "#065f46", fontSize: 14, marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
        {msg} <span onClick={() => setMsg("")} style={{ cursor: "pointer", fontWeight: 700 }}>×</span>
      </div>}
      {error && <div style={{ padding: "12px 16px", background: "#fee2e2", borderRadius: 8, color: "#991b1b", fontSize: 14, marginBottom: 20 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Users", value: stats.total, color: "#374822" },
          { label: "Vet Clinics", value: stats.clinics, color: "#95c11f" },
          { label: "Insurers", value: stats.insurers, color: "#3b82f6" },
          { label: "Suspended", value: stats.suspended, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e8eaed" }}>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none" }} />
            {["ALL", "CLINIC", "INSURER", "ADMIN"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid", fontSize: 13, cursor: "pointer", fontWeight: tab === t ? 700 : 400, background: tab === t ? "#374822" : "#fff", color: tab === t ? "#fff" : "#374151", borderColor: tab === t ? "#374822" : "#d1d5db" }}>{t}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading users...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#6b7280" }}>No users found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f9fafb" }}>
              {["User", "Role", "Claims", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6", background: u.suspended ? "#fff5f5" : i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{u.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, cursor: "pointer", background: "#fff" }}>
                      <option value="CLINIC">CLINIC</option>
                      <option value="INSURER">INSURER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "#374151" }}>{u._count?.claims || 0} claims</td>
                  <td style={{ padding: "14px 18px" }}>
                    <Badge text={u.suspended ? "Suspended" : "Active"} color={u.suspended ? "red" : "green"} />
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 12, color: "#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => handleSuspend(u.id, !u.suspended)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid", fontSize: 12, cursor: "pointer", background: u.suspended ? "#d1fae5" : "#fef3c7", color: u.suspended ? "#065f46" : "#92400e", borderColor: u.suspended ? "#6ee7b7" : "#fcd34d", fontWeight: 600 }}>
                        {u.suspended ? "Reinstate" : "Suspend"}
                      </button>
                      <button onClick={() => { setPwModal(u); setNewPassword(""); }} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #93c5fd", fontSize: 12, cursor: "pointer", background: "#dbeafe", color: "#1e40af", fontWeight: 600 }}>
                        Password
                      </button>
                      <button onClick={() => handleDelete(u.id, u.email)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", fontSize: 12, cursor: "pointer", background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#374822", margin: "0 0 8px" }}>Change Password</h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>For: {pwModal.email}</p>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as any, marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handlePasswordChange} style={{ flex: 1, padding: "11px", background: "#95c11f", color: "#374822", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Update Password</button>
              <button onClick={() => setPwModal(null)} style={{ flex: 1, padding: "11px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}