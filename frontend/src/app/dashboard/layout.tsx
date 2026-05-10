"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
    { href: "/dashboard", label: "Overview", icon: "grid", roles: ["CLINIC","INSURER","ADMIN"] },
    { href: "/dashboard/claims", label: "Claims", icon: "list", roles: ["CLINIC","INSURER","ADMIN"] },
    { href: "/dashboard/submit", label: "Submit Claim", icon: "plus", roles: ["CLINIC","ADMIN"] },
    { href: "/dashboard/notifications", label: "Notifications", icon: "bell", roles: ["CLINIC","INSURER","ADMIN"] },
    { href: "/dashboard/audit", label: "Audit Log", icon: "shield", roles: ["INSURER","ADMIN"] },
    { href: "/dashboard/admin", label: "Admin Panel", icon: "admin", roles: ["ADMIN"] },
  ];

  function NavIcon({ icon }: { icon: string }) {
    const icons: any = {
      grid: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
      list: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
      plus: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
      bell: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
      shield: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      admin: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    };
    return icons[icon] || null;
  }

  const visibleNav = navItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ width: 250, background: "#374822", color: "#fff", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Image src="/logo-primary-sm.png" alt="VETcore" width={160} height={109} style={{ objectFit: "contain", maxWidth: "100%" }} />
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {visibleNav.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, marginBottom: 4, textDecoration: "none",
              background: pathname === item.href ? "rgba(149,193,31,0.2)" : "transparent",
              borderLeft: pathname === item.href ? "3px solid #95c11f" : "3px solid transparent",
              color: pathname === item.href ? "#95c11f" : item.icon === "admin" ? "#fbbf24" : "rgba(255,255,255,0.7)",
              fontSize: 14, fontWeight: pathname === item.href ? 600 : 400,
            }}>
              <NavIcon icon={item.icon} />
              {item.label}
              {item.icon === "admin" && <span style={{ marginLeft: "auto", fontSize: 10, background: "#dc2626", color: "#fff", padding: "1px 6px", borderRadius: 10 }}>ADMIN</span>}
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