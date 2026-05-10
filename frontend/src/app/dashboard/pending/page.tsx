"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PendingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("vs_user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  function logout() {
    localStorage.removeItem("vs_token");
    localStorage.removeItem("vs_user");
    router.push("/auth/login");
  }

  const roleLabel = user?.role === "INSURER" ? "Insurance Provider" : user?.role === "ADMIN" ? "Administrator" : "Veterinary Clinic";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#374822", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/logo-primary-sm.png" alt="VETcore" width={120} height={82} style={{ objectFit: "contain" }} />
        <button onClick={logout} style={{ padding: "8px 16px", background: "rgba(149,193,31,0.15)", border: "1px solid rgba(149,193,31,0.3)", borderRadius: 8, color: "#95c11f", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          Sign out
        </button>
      </div>

      {/* Pending wall */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="40" height="40" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#374822", margin: "0 0 12px" }}>Account Pending Approval</h1>
          <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, marginBottom: 32 }}>
            Your <strong>{roleLabel}</strong> account is currently under review by the VETcore admin team.
            You will be notified once your account has been approved and you can access the platform.
          </p>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8eaed", padding: 28, marginBottom: 24, textAlign: "left" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#374822", margin: "0 0 16px" }}>What happens next?</h3>
            {[
              { step: "1", title: "Admin Review", desc: "The VETcore team reviews your registration details" },
              { step: "2", title: "Verification", desc: "Your clinic or organisation details are verified" },
              { step: "3", title: "Approval", desc: "You receive confirmation and full platform access" },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#95c11f", color: "#374822", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374822" }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#f4fce8", border: "1px solid #95c11f", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374822", marginBottom: 4 }}>Account Details</div>
            <div style={{ fontSize: 13, color: "#779451" }}>Email: <strong style={{ color: "#374822" }}>{user?.email}</strong></div>
            <div style={{ fontSize: 13, color: "#779451", marginTop: 4 }}>Role: <strong style={{ color: "#374822" }}>{roleLabel}</strong></div>
            <div style={{ fontSize: 13, color: "#779451", marginTop: 4 }}>Status: <strong style={{ color: "#d97706" }}>Pending Approval</strong></div>
          </div>

          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
            If you have questions, contact us at <strong style={{ color: "#374822" }}>admin@vetcore.co.uk</strong>
          </p>

          <button onClick={logout} style={{ padding: "12px 32px", background: "#374822", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}