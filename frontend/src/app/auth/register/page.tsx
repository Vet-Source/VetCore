"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CLINIC" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: any) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      localStorage.setItem("vs_token", data.data.token);
      localStorage.setItem("vs_user", JSON.stringify(data.data.user));
      router.push("/dashboard");
    } catch {
      setError("Cannot connect to backend. Make sure it is running on port 3001.");
    } finally {
      setLoading(false);
    }
  }

  const roles = [
    { value: "CLINIC", label: "Veterinary Clinic", desc: "Submit and track insurance claims" },
    { value: "INSURER", label: "Insurance Provider", desc: "Review and approve claims" },
    { value: "ADMIN", label: "Administrator", desc: "Manage the platform" },
  ];

  const inp: any = { width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };
  const lbl: any = { fontSize: 13, fontWeight: 600, color: "#374822", display: "block", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", background: "#374822", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: "#95c11f", borderRadius: 16, fontSize: 30, marginBottom: 16 }}>🐾</div>
          <div style={{ fontWeight: 800, fontSize: 28, color: "#fff", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#95c11f" }}>VET</span>
            <span style={{ background: "#95c11f", color: "#374822", borderRadius: 6, padding: "0 6px", marginLeft: 2 }}>core</span>
          </div>
          <div style={{ color: "#779451", fontSize: 13, marginTop: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Claims Platform</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#374822", margin: "0 0 24px" }}>Create your account</h2>

          {error && <div style={{ padding: "12px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, color: "#991b1b", fontSize: 13, marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. Jane Smith" style={inp} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@clinic.com" style={inp} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 8 characters" style={inp} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Account Type *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {roles.map(r => (
                  <div key={r.value} onClick={() => setForm(f => ({ ...f, role: r.value }))} style={{
                    padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                    border: form.role === r.value ? "2px solid #95c11f" : "1.5px solid #d1d5db",
                    background: form.role === r.value ? "#f4fce8" : "#fff",
                    transition: "all 0.15s"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374822" }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: "#779451", marginTop: 2 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: loading ? "#779451" : "#95c11f", color: "#374822", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#6b7280" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#95c11f", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#779451" }}>
          Secured by blockchain technology
        </div>
      </div>
    </div>
  );
}