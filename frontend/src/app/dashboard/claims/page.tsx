"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://localhost:3001/api";

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    PENDING: ["#fef3c7","#92400e"],
    UNDER_REVIEW: ["#dbeafe","#1e40af"],
    APPROVED: ["#d1fae5","#065f46"],
    REJECTED: ["#fee2e2","#991b1b"],
  };
  const [bg, color] = map[status] || ["#f3f4f6","#374151"];
  return <span style={{ padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:bg, color }}>{status?.replace(/_/g," ")}</span>;
}

export default function ClaimsListPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("vs_token");
    fetch(`${API}/claims`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setClaims(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? claims : claims.filter(c => c.status === filter);
  const tabs = ["ALL","PENDING","UNDER_REVIEW","APPROVED","REJECTED"];

  return (
    <div style={{ padding:32 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:"#111827", margin:0 }}>Claims</h1>
        <Link href="/dashboard/submit" style={{ padding:"10px 18px", background:"#4d9e6e", color:"#fff", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>+ New Claim</Link>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding:"7px 14px", borderRadius:20, border:"1px solid", fontSize:13, cursor:"pointer",
            fontWeight:filter===t?700:400,
            background:filter===t?"#0f2a1e":"#fff",
            color:filter===t?"#fff":"#374151",
            borderColor:filter===t?"#0f2a1e":"#d1d5db"
          }}>
            {t.replace(/_/g," ")} ({t==="ALL"?claims.length:claims.filter(c=>c.status===t).length})
          </button>
        ))}
      </div>
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e8eaed", overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:48, textAlign:"center", color:"#9ca3af" }}>Loading claims...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:48, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
            <div style={{ fontSize:15, color:"#6b7280" }}>No {filter!=="ALL"?filter.toLowerCase().replace(/_/g," ")+" ":""} claims found</div>
            {filter==="ALL" && <Link href="/dashboard/submit" style={{ display:"inline-block", marginTop:16, padding:"10px 20px", background:"#4d9e6e", color:"#fff", borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600 }}>Submit your first claim</Link>}
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f9fafb" }}>
                {["ID","Patient","Owner","Amount","Status","Date","Blockchain TX",""].map(h => (
                  <th key={h} style={{ padding:"12px 18px", textAlign:"left", fontSize:12, fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c,i) => (
                <tr key={c.id} style={{ borderTop:"1px solid #f3f4f6", background:i%2===0?"#fff":"#fafafa" }}>
                  <td style={{ padding:"13px 18px", fontSize:12, color:"#9ca3af", fontFamily:"monospace" }}>{c.id?.slice(0,8)}...</td>
                  <td style={{ padding:"13px 18px", fontSize:13, color:"#111827", fontWeight:500 }}>
                    {c.patientName||"—"} <span style={{fontSize:11,color:"#9ca3af"}}>({c.patientSpecies})</span>
                  </td>
                  <td style={{ padding:"13px 18px", fontSize:13, color:"#374151" }}>{c.ownerName||"—"}</td>
                  <td style={{ padding:"13px 18px", fontSize:13, fontWeight:700, color:"#059669" }}>£{Number(c.amount)?.toLocaleString()}</td>
                  <td style={{ padding:"13px 18px" }}><StatusBadge status={c.status}/></td>
                  <td style={{ padding:"13px 18px", fontSize:12, color:"#9ca3af" }}>{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                  <td style={{ padding:"13px 18px", fontSize:11, color:"#6b7280", fontFamily:"monospace" }}>{c.blockchainTxId?c.blockchainTxId.slice(0,14)+"...":"pending"}</td>
                  <td style={{ padding:"13px 18px" }}>
                    <Link href={`/dashboard/claims/${c.id}`} style={{ color:"#4d9e6e", fontSize:13, fontWeight:600, textDecoration:"none" }}>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
