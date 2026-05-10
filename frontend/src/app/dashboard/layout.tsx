"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("vs_token");
    const userData = localStorage.getItem("vs_user");
    if (!token) { router.push("/auth/login"); return; }
    if (userData) setUser(JSON.parse(userData));
  }, []);

  function logout() {
    localStorage.removeItem("vs_token");
    localStorage.removeItem("vs_user");
    router.push("/auth/login");
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/claims", label: "Claims", icon: "📋" },
    { href: "/dashboard/submit", label: "Submit Claim", icon: "➕" },
    { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
    { href: "/dashboard/audit", label: "Audit Log", icon: "📜" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ width: 250, background: "#374822", color: "#fff", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, background: "#95c11f", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🐾</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.5px" }}>
                <span style={{ color: "#95c11f" }}>VET</span>
                <span style={{ background: "#95c11f", color: "#374822", borderRadius: 4, padding: "0 4px", marginLeft: 1 }}>core</span>
              </div>
              <div style={{ fontSize: 10, color: "#779451", letterSpacing: "0.05em", textTransform: "uppercase" }}>Claims Platform</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, marginBottom: 4, textDecoration: "none",
              background: pathname === item.href ? "rgba(149,193,31,0.2)" : "transparent",
              borderLeft: pathname === item.href ? "3px solid #95c11f" : "3px solid transparent",
              color: pathname === item.href ? "#95c11f" : "rgba(255,255,255,0.7)",
              fontSize: 14, fontWeight: pathname === item.href ? 600 : 400,
              transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {user && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
            Signed in as<br />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{user.name || user.email}</span>
            <br /><span style={{ fontSize: 10, color: "#95c11f", textTransform: "uppercase", letterSpacing: "0.05em" }}>{user.role}</span>
          </div>}
          <button onClick={logout} style={{ width: "100%", padding: "8px 12px", background: "rgba(149,193,31,0.15)", border: "1px solid rgba(149,193,31,0.3)", borderRadius: 8, color: "#95c11f", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Sign out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, background: "#f5f6f8", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}