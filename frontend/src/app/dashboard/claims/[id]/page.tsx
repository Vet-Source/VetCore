"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ClaimDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("vs_user");
    if (userData) setUser(JSON.parse(userData));
    const token = localStorage.getItem("vs_token");
    fetch(`${API}/claims/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setClaim(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleDecision(decision: string) {
    setSubmitting(true); setMsg("");
    const token = localStorage.getItem("vs_token");
    const res = await fetch(`${API}/claims/${id}/review`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ decision, approvedAmount: parseFloat(approvedAmount) || null, notes: reviewNote }),
    });
    if (res.ok) {
      const d = await res.json();
      setClaim(d.data);
      setMsg(decision === "APPROVED" ? "Claim approved and payment authorised" : "Claim rejected");
    }
    setSubmitting(false);
  }

  if (loading) return (
    <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontFamily: "system-ui" }}>
      Loading claim...
    </div>
  );

  if (!claim) return (
    <div style={{ padding: 48, textAlign: "center", fontFamily: "system-ui" }}>
      <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 12 }}>Claim not found</div>
      <Link href="/dashboard/claims" style={{ color: "#95c11f", textDecoration: "none", fontWeight: 600 }}>Back to claims</Link>
    </div>
  );

  const statusColors: any = { PENDING: "#d97706", UNDER_REVIEW: "#3b82f6", APPROVED: "#059669", REJECTED: "#dc2626" };
  const statusColor = statusColors[claim.status] || "#6b7280";

  return (
    <div style={{ padding: 32, maxWidth: 860, fontFamily: "system-ui, sans-serif" }}>
      <Link href="/dashboard/claims" style={{ color: "#95c11f", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 20 }}>Back to Claims</Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#374822", margin: 0 }}>Claim Details</h1>
          <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace", marginTop: 4 }}>ID: {claim.id}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: statusColor, background: statusColor + "18", padding: "6px 16px", borderRadius: 20, display: "inline-block" }}>{claim.status?.replace(/_/g, " ")}</div>
          {claim.blockchainTxId && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, fontFamily: "monospace" }}>TX: {claim.blockchainTxId}</div>}
        </div>
      </div>

      {msg && (
        <div style={{ padding: "12px 16px", background: msg.includes("approved") ? "#d1fae5" : "#fee2e2", borderRadius: 8, fontSize: 14, fontWeight: 600, color: msg.includes("approved") ? "#065f46" : "#991b1b", marginBottom: 20 }}>{msg}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          ["Patient", `${claim.patientName} (${claim.patientSpecies}${claim.patientBreed ? ", " + claim.patientBreed : ""})`],
          ["Owner", claim.ownerName],
          ["Owner Email", claim.ownerEmail],
          ["Treating Vet", claim.vetName],
          ["Clinic", claim.clinicName],
          ["Treatment Date", claim.treatmentDate ? new Date(claim.treatmentDate).toLocaleDateString("en-GB") : "-"],
          ["Claim Amount", `GBP ${Number(claim.amount)?.toLocaleString()}`],
          ["Approved Amount", claim.approvedAmount ? `GBP ${Number(claim.approvedAmount)?.toLocaleString()}` : "-"],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8eaed", padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8eaed", padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Diagnosis</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>{claim.diagnosis}</div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Treatment Description</div>
        <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{claim.treatmentDescription}</div>
        {claim.reviewNotes && (
          <>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6, marginTop: 16 }}>Review Notes</div>
            <div style={{ fontSize: 14, color: "#374151", fontStyle: "italic" }}>{claim.reviewNotes}</div>
          </>
        )}
      </div>

      {user?.role === "INSURER" && claim.status === "PENDING" && (
        <div style={{ background: "#fff", borderRadius: 10, border: "2px solid #95c11f", padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#374822", marginTop: 0, marginBottom: 16 }}>Insurer Review Decision</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374822", display: "block", marginBottom: 6 }}>Approved Amount (GBP)</label>
            <input value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} type="number" step="0.01"
              placeholder={`Max: GBP ${Number(claim.amount)?.toLocaleString()}`}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as any }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374822", display: "block", marginBottom: 6 }}>Review Notes</label>
            <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)}
              placeholder="Add review notes for the clinic..."
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, height: 80, boxSizing: "border-box" as any, resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => handleDecision("APPROVED")} disabled={submitting}
              style={{ flex: 1, padding: "12px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Approve Claim
            </button>
            <button onClick={() => handleDecision("REJECTED")} disabled={submitting}
              style={{ flex: 1, padding: "12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Reject Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}