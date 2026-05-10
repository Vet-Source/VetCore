'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, ArrowRight, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentUploader } from '@/components/claims/DocumentUploader';

const claimSchema = z.object({
  petId: z.string().uuid('Select a pet'),
  policyId: z.string().uuid().optional(),
  treatmentDate: z.string().min(1, 'Treatment date required'),
  diagnosis: z.string().min(10, 'Please provide a detailed diagnosis'),
  treatmentDetails: z.string().min(20, 'Please describe the treatment in detail'),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 250.00)'),
});

type ClaimForm = z.infer<typeof claimSchema>;

const STEPS = ['Patient & Policy', 'Treatment Details', 'Documents', 'Review'];

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [submittedClaim, setSubmittedClaim] = useState<any>(null);

  const { data: pets } = useQuery({
    queryKey: ['pets'],
    queryFn: () => api.get('/users/me/pets').then(r => r.data.data),
  });

  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => api.get('/users/me/policies').then(r => r.data.data),
  });

  const form = useForm<ClaimForm>({ resolver: zodResolver(claimSchema) });
  const { register, handleSubmit, formState: { errors }, watch } = form;
  const values = watch();

  const submitMutation = useMutation({
    mutationFn: async (data: ClaimForm) => {
      // Submit claim
      const claimRes = await api.post('/claims', data);
      const claimId = claimRes.data.data.id;

      // Upload documents
      if (uploadedDocs.length > 0) {
        const formData = new FormData();
        uploadedDocs.forEach(f => formData.append('files', f));
        await api.post(`/documents/claim/${claimId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return claimRes.data.data;
    },
    onSuccess: (claim) => {
      setSubmittedClaim(claim);
      setStep(4); // success state
      toast.success('Claim submitted successfully!');
    },
    onError: () => toast.error('Failed to submit claim. Please try again.'),
  });

  if (step === 4 && submittedClaim) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Claim Submitted!</h1>
        <p className="text-slate-500 mb-2">Your claim has been recorded on the blockchain.</p>
        <p className="text-sm font-mono bg-slate-100 rounded px-3 py-2 mb-6">
          #{submittedClaim.claimNumber}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push('/claims')} className="btn-primary">
            View All Claims
          </button>
          <button onClick={() => router.push(`/claims/${submittedClaim.id}`)} className="btn-secondary">
            View This Claim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Submit New Claim</h1>
        <p className="text-slate-500 mt-1">Fill in the details below to submit an insurance claim.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${i < step ? 'bg-brand-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === step ? 'font-medium' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Step 0: Patient & Policy */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Patient & Policy Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Patient (Pet) *</label>
              <select {...register('petId')} className="input">
                <option value="">Select a patient...</option>
                {pets?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.species}</option>
                ))}
              </select>
              {errors.petId && <p className="text-danger-600 text-xs mt-1">{errors.petId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Insurance Policy (optional)</label>
              <select {...register('policyId')} className="input">
                <option value="">Select a policy...</option>
                {policies?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.policyNumber} — {p.coverageType}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Treatment Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Treatment Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Treatment Date *</label>
              <input type="date" {...register('treatmentDate')} className="input" />
              {errors.treatmentDate && <p className="text-danger-600 text-xs mt-1">{errors.treatmentDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diagnosis *</label>
              <input type="text" {...register('diagnosis')} placeholder="e.g. Acute gastroenteritis" className="input" />
              {errors.diagnosis && <p className="text-danger-600 text-xs mt-1">{errors.diagnosis.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Treatment Details *</label>
              <textarea rows={4} {...register('treatmentDetails')} placeholder="Describe the treatment provided..." className="input resize-none" />
              {errors.treatmentDetails && <p className="text-danger-600 text-xs mt-1">{errors.treatmentDetails.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount (£) *</label>
              <input type="text" {...register('totalAmount')} placeholder="0.00" className="input" />
              {errors.totalAmount && <p className="text-danger-600 text-xs mt-1">{errors.totalAmount.message}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Supporting Documents</h2>
            <p className="text-slate-500 text-sm">Upload invoices, medical records, prescriptions or lab results.</p>
            <DocumentUploader files={uploadedDocs} onChange={setUploadedDocs} />
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Review & Submit</h2>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Treatment Date</span>
                <span className="font-medium">{values.treatmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diagnosis</span>
                <span className="font-medium">{values.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-medium text-lg">£{values.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Documents</span>
                <span className="font-medium">{uploadedDocs.length} file(s)</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              By submitting, this claim will be permanently recorded on the Solana blockchain and cannot be altered.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            className={`btn-secondary ${step === 0 ? 'invisible' : ''}`}
          >
            Back
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit((data) => submitMutation.mutate(data))}
              disabled={submitMutation.isPending}
              className="btn-primary"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Claim'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
