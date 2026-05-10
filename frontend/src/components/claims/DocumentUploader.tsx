'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

interface DocumentUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploader({ files, onChange }: DocumentUploaderProps) {
  const onDrop = useCallback((accepted: File[]) => {
    onChange([...files, ...accepted]);
  }, [files, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className={clsx('w-8 h-8 mx-auto mb-3', isDragActive ? 'text-brand-500' : 'text-slate-300')} />
        <p className="text-sm font-medium text-slate-600">
          {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-slate-400 mt-1">PDF, JPEG, PNG — up to 10MB each</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <FileText className="w-4 h-4 text-brand-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <CheckCircle className="w-4 h-4 text-success-600 shrink-0" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-slate-400 hover:text-danger-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
