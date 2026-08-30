"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Check, ArrowDown, Circle } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth/context";
import { adminApi } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const STEPS = ["Uploaded", "Text Extracted", "Chunks Created", "Generating Embeddings", "Vector Indexing", "Ready"];

export default function UploadPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [version, setVersion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(/\.[^.]+$/, "").replace(/_/g, " "));
    }
  }, [title]);

  const handleUpload = async () => {
    if (!file || !title) return;
    setUploading(true);
    setError("");
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((s) => (s < STEPS.length - 2 ? s + 1 : s));
    }, 800);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      if (department) formData.append("department", department);
      if (documentType) formData.append("document_type", documentType);
      if (version) formData.append("version", version);

      await adminApi.uploadDocument(formData);
      setCurrentStep(STEPS.length - 1);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setCurrentStep(-1);
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={() => { signOut(); router.push("/"); }} />
      <main className="flex-1 p-4 lg:p-8 max-w-2xl">
        <Link href="/admin/documents" className="text-sm text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Documents</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Upload Document</h1>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center mb-6 transition-all",
            dragOver && "ring-2 ring-blue-600 border-blue-600"
          )}
        >
          <Upload className="h-10 w-10 text-blue-600 mx-auto mb-4" />
          <p className="font-medium text-gray-900">Drop your college document here</p>
          <p className="text-sm text-gray-600 mt-2">or browse files</p>
          <input
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            id="file-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/_/g, " ")); }
            }}
          />
          <Button variant="secondary" className="mt-4" onClick={() => document.getElementById("file-input")?.click()}>
              Browse Files
            </Button>
          <p className="text-xs text-gray-600 mt-4">PDF · Maximum 25 MB</p>
          {file && (
            <div className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-900">{file.name}</div>
          )}
        </div>

        <Card className="space-y-4 mb-6">
          <Input placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Department (optional)" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Input placeholder="Document type (e.g. academic_regulations)" value={documentType} onChange={(e) => setDocumentType(e.target.value)} />
          <Input placeholder="Version (e.g. 2026)" value={version} onChange={(e) => setVersion(e.target.value)} />
        </Card>

        {currentStep >= 0 && (
          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Document Processing</h3>
            <div className="space-y-2">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3 text-sm">
                  {i < currentStep ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : i === currentStep ? (
                    <Circle className="h-4 w-4 text-blue-600 fill-blue-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={cn(
                    i < currentStep ? "text-green-600" : i === currentStep ? "text-blue-600" : "text-gray-400"
                  )}>
                    {step}
                  </span>
                  {i < STEPS.length - 1 && <ArrowDown className="h-3 w-3 text-gray-400 ml-1" />}
                </div>
              ))}
            </div>
          </Card>
        )}

        {error && <p className="text-sm text-red-500 mb-4" role="alert">{error}</p>}

        {done ? (
          <Button onClick={() => router.push("/admin/documents")} className="w-full">View Documents</Button>
        ) : (
          <Button onClick={handleUpload} loading={uploading} disabled={!file || !title} className="w-full">
            Upload & Index
          </Button>
        )}
      </main>
    </div>
  );
}
