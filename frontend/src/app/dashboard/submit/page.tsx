"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:3001/api";

export default function SubmitClaimPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    patientName: "", patientSpecies: "dog", patientBreed: "",
    ownerName: "", ownerEmail: "",
    treatmentDate: "", diagnosis: "", treatmentDescription: "",
    amount: "", vetName: "", clinicName: "",
  });

  function handleChange(e: any) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const token = localStorage.getItem("vs_token");
      const res = await fetch(`${API}/claims`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Submission failed"); return; }
      setSuccess("Claim submitted! Blockchain TX: " + data.data.blockchainTxId);
      setTimeout(() => router.push("/dashboard/claims"), 3000);
    } catch {
      setError("Failed to connect to backend. Make sure the API is running on port 3001.");
    } finally {
      setLoading(false);
    }
  }

  const inp: any = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", outline: "none" };
  const lbl: any = { fontSize: 13, fontWeight: 600, color: "#374822", display: "block", marginBottom: 6 };

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#374822", margin: 0 }}>Submit Insurance Claim</h1>
        <p style={{ color: "#779451", fontSize: 14, marginTop: 4 }}>Claims are validated by smart contract and recorded on-chain with a unique transaction ID</p>
      </div>
      {error && <div style={{ padding: "12px 16px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, color: "#991b1b", fontSize: 14, marginBottom: 20 }}>{error}</div>}
      {success && <div style={{ padding: "12px 16px", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 8, color: "#065f46", fontSize: 14, marginBottom: 20 }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374822", marginTop: 0, marginBottom: 20 }}>🐾 Patient Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={lbl}>Patient Name *</label><input name="patientName" value={form.patientName} onChange={handleChange} required style={inp} placeholder="e.g. Max" /></div>
            <div><label style={lbl}>Species *</label>
              <select name="patientSpecies" value={form.patientSpecies} onChange={handleChange} style={inp}>
                <option value="dog">Dog</option><option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option><option value="bird">Bird</option><option value="other">Other</option>
              </select>
            </div>
            <div><label style={lbl}>Breed</label><input name="patientBreed" value={form.patientBreed} onChange={handleChange} style={inp} placeholder="e.g. Labrador" /></div>
            <div><label style={lbl}>Owner Name *</label><input name="ownerName" value={form.ownerName} onChange={handleChange} required style={inp} placeholder="Full name" /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Owner Email *</label><input name="ownerEmail" type="email" value={form.ownerEmail} onChange={handleChange} required style={inp} placeholder="owner@example.com" /></div>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374822", marginTop: 0, marginBottom: 20 }}>💊 Treatment Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={lbl}>Treatment Date *</label><input name="treatmentDate" type="date" value={form.treatmentDate} onChange={handleChange} required style={inp} /></div>
            <div><label style={lbl}>Claim Amount (£) *</label><input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} required style={inp} placeholder="0.00" /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Diagnosis *</label><input name="diagnosis" value={form.diagnosis} onChange={handleChange} required style={inp} placeholder="Primary diagnosis" /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Treatment Description *</label><textarea name="treatmentDescription" value={form.treatmentDescription} onChange={handleChange} required style={{ ...inp, height: 90, resize: "vertical" }} placeholder="Describe the treatment provided..." /></div>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374822", marginTop: 0, marginBottom: 20 }}>🏥 Clinic Information</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={lbl}>Treating Vet *</label><input name="vetName" value={form.vetName} onChange={handleChange} required style={inp} placeholder="Dr. Smith" /></div>
            <div><label style={lbl}>Clinic Name *</label><input name="clinicName" value={form.clinicName} onChange={handleChange} required style={inp} placeholder="City Vets Ltd" /></div>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#374822", marginTop: 0, marginBottom: 8 }}>📎 Supporting Documents</h2>
          <p style={{ fontSize: 13, color: "#779451", marginBottom: 16 }}>Upload invoices, medical records, or other supporting files (PDF, JPG, PNG)</p>
          <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed #95c11f", borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: files.length ? "#f4fce8" : "#fafafa" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#374822" }}>{files.length ? `${files.length} file(s) selected` : "Click to upload documents"}</div>
            <div style={{ fontSize: 12, color: "#779451", marginTop: 4 }}>PDF, JPG, PNG up to 10MB each</div>
            {files.length > 0 && <div style={{ marginTop: 12 }}>{files.map(f => <div key={f.name} style={{ fontSize: 12, color: "#95c11f" }}>✓ {f.name}</div>)}</div>}
          </div>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFiles(Array.from(e.target.files || []))} style={{ display: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: "14px 24px", background: loading ? "#779451" : "#95c11f", color: "#374822", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Submitting to blockchain..." : "Submit Claim →"}
          </button>
          <button type="button" onClick={() => router.back()} style={{ padding: "14px 24px", background: "#fff", color: "#374822", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 15, cursor: "pointer" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}