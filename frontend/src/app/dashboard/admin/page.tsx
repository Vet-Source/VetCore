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
    orange: { bg: "#ffedd5", text: "#9a3412" },
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
  const [tab, setTab] = useState("PENDING");
  const [pwModal, setPwModal] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteExpiry, setInviteExpiry] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);

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

  async function handleApprove(id: string, decision: string) {
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/admin/users/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    if (res.ok) {
      setMsg(decision === "ACTIVE" ? "User approved and activated" : "User registration rejected");
      fetchUsers();
    }
  }

  async function handleSuspend(id: string, suspended: boolean) {
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/admin/users/${id}/suspend`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ suspended }),
    });
    if (res.ok) { setMsg(suspended ? "User suspended" : "User reinstated"); fetchUsers(); }
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

  async function generateInvite() {
    setGeneratingInvite(true);
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/admin/generate-invite`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) {
      setInviteCode(data.data.code);
      setInviteExpiry(new Date(data.data.expiresAt).toLocaleString("en-GB"));
    }
    setGeneratingInvite(false);
  }

  const pendingUsers = users.filter(u => u.status === "PENDING");
  const filtered = users.filter(u => {
    const matchTab = tab === "ALL" ? true : tab === "PENDING" ? u.status === "PENDING" : tab === "ACTIVE" ? u.status === "ACTIVE" : u.role === tab;
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.name || "").toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === "PENDING").length,
    active: users.filter(u => u.status === "ACTIVE").length,
    suspended: users.filter(u => u.suspended).length,
  };

  function statusColor(u: any) {
    if (u.suspended) return "red";
    if (u.status === "PENDING") return "orange";
    if (u.status === "REJECTED") return "red";
    return "green";
  }

  function statusText(u: any) {
    if (u.suspended) return "Suspended";
    if (u.status === "PENDING") return "Pending";
    if (u.status === "REJECTED") return "Rejected";
    return "Active";
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#374822", margin: 0 }}>Admin Panel</h1>
        <p style={{ color: "#779451", fontSize: 14, marginTop: 4 }}>Manage all users, roles, approvals and access</p>
      </div>

      {msg && (
        <div style={{ padding: "12px 16px", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 8, color: "#065f46", fontSize: 14, marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
          {msg} <span onClick={() => setMsg("")} style={{ cursor: "pointer", fontWeight: 700 }}>x</span>
        </div>
      )}
      {error && <div style={{ padding: "12px 16px", background: "#fee2e2", borderRadius: 8, color: "#991b1b", fontSize: 14, marginBottom: 20 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Users", value: stats.total, color: "#374822" },
          { label: "Pending Approval", value: stats.pending, color: "#d97706" },
          { label: "Active Users", value: stats.active, color: "#95c11f" },
          { label: "Suspended", value: stats.suspended, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: s.label === "Pending Approval" && stats.pending > 0 ? "2px solid #f59e0b" : "1px solid #e8eaed" }}>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Admin Invite Code Generator */}
      <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #374822", padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#374822", marginTop: 0, marginBottom: 8 }}>Admin Invite Code</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, marginTop: 0 }}>Generate a one-time invite code to allow a new admin to register. Codes expire after 24 hours.</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={generateInvite} disabled={generatingInvite} style={{ padding: "10px 20px", background: "#374822", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {generatingInvite ? "Generating..." : "Generate Invite Code"}
          </button>
          {inviteCode && (
            <div style={{ flex: 1, display: "flex", gap: 12, alignItems: "center", background: "#f4fce8", border: "1px solid #95c11f", borderRadius: 8, padding: "10px 16px" }}>
              <div>
                <div style={{ fontSize: 13, color: "#374822", fontWeight: 700 }}>Code: <span style={{ fontFamily: "monospace", fontSize: 15, letterSpacing: "0.1em" }}>{inviteCode}</span></div>
                <div style={{ fontSize: 12, color: "#779451", marginTop: 2 }}>Expires: {inviteExpiry}</div>
              </div>
              <button onClick={() => navigator.clipboard.writeText(inviteCode)} style={{ marginLeft: "auto", padding: "6px 12px", background: "#95c11f", color: "#374822", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Copy</button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none" }} />
            {["PENDING", "ACTIVE", "ALL", "CLINIC", "INSURER", "ADMIN"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "7px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, cursor: "pointer",
                fontWeight: tab === t ? 700 : 400,
                background: tab === t ? "#374822" : "#fff",
                color: tab === t ? "#fff" : "#374151",
                borderColor: tab === t ? "#374822" : "#d1d5db",
                position: "relative" as any,
              }}>
                {t}
                {t === "PENDING" && stats.pending > 0 && <span style={{ marginLeft: 6, background: "#f59e0b", color: "#fff", borderRadius: 10, padding: "0 5px", fontSize: 10, fontWeight: 700 }}>{stats.pending}</span>}
              </button>
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
                <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6", background: u.status === "PENDING" ? "#fffbeb" : u.suspended ? "#fff5f5" : i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{u.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    {u.status === "PENDING" ? (
                      <Badge text={u.role} color="gray" />
                    ) : (
                      <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, cursor: "pointer", background: "#fff" }}>
                        <option value="CLINIC">CLINIC</option>
                        <option value="INSURER">INSURER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "#374151" }}>{u._count?.claims || 0}</td>
                  <td style={{ padding: "14px 18px" }}><Badge text={statusText(u)} color={statusColor(u)} /></td>
                  <td style={{ padding: "14px 18px", fontSize: 12, color: "#9ca3af" }}>{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {u.status === "PENDING" && <>
                        <button onClick={() => handleApprove(u.id, "ACTIVE")} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #6ee7b7", fontSize: 12, cursor: "pointer", background: "#d1fae5", color: "#065f46", fontWeight: 600 }}>Approve</button>
                        <button onClick={() => handleApprove(u.id, "REJECTED")} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", fontSize: 12, cursor: "pointer", background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>Reject</button>
                      </>}
                      {u.status === "ACTIVE" && <>
                        <button onClick={() => handleSuspend(u.id, !u.suspended)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid", fontSize: 12, cursor: "pointer", background: u.suspended ? "#d1fae5" : "#fef3c7", color: u.suspended ? "#065f46" : "#92400e", borderColor: u.suspended ? "#6ee7b7" : "#fcd34d", fontWeight: 600 }}>
                          {u.suspended ? "Reinstate" : "Suspend"}
                        </button>
                        <button onClick={() => { setPwModal(u); setNewPassword(""); }} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #93c5fd", fontSize: 12, cursor: "pointer", background: "#dbeafe", color: "#1e40af", fontWeight: 600 }}>Password</button>
                      </>}
                      <button onClick={() => handleDelete(u.id, u.email)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", fontSize: 12, cursor: "pointer", background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>Delete</button>
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