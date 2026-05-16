"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/auth";
import {
  ArrowLeft,
  Upload,
  FileArchive,
  CheckCircle,
  XCircle,
  Shield,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Code,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  buildStatus: "pending" | "installing" | "building" | "ready" | "failed";
  buildLog?: string;
  createdAt: string;
}

export default function UploadTemplatePage() {
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (String(user.role).toLowerCase() !== "admin") {
        setIsAdminUser(false);
      } else {
        setIsAdminUser(true);
      }
    } catch {
      setIsAdminUser(false);
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Only</h1>
          <p className="text-gray-500 mb-6">
            Only administrators can upload and manage templates.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <AdminUploadContent />;
}

function AdminUploadContent() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    buildStatus?: string;
    buildLog?: string;
  } | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/site-admin/templates", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const pollBuildStatus = async (templateId: string) => {
    try {
      const res = await fetch(`/api/site-admin/templates/${templateId}/status`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && data.template) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  buildStatus: data.template.buildStatus,
                  buildLog: data.template.buildLog,
                }
              : t
          )
        );

        if (data.template.buildStatus === "ready" || data.template.buildStatus === "failed") {
          return;
        }

        setTimeout(() => pollBuildStatus(templateId), 5000);
      }
    } catch (error) {
      console.error("Failed to poll build status:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setResult(null);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const descInput = form.elements.namedItem("description") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    const name = nameInput?.value;
    const description = descInput?.value || "";

    if (!file || !name) {
      setResult({ success: false, message: "Please select a file and enter a name" });
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("zip", file);
    formData.append("name", name);
    formData.append("description", description);

    try {
      const res = await fetch("/api/site-admin/templates", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Template "${name}" uploaded successfully! Build status: ${data.buildStatus}. ${
            data.dashboardDetected
              ? "Dashboard requirements detected."
              : "No dashboard file found, so requirements were inferred automatically."
          }`,
        });
        fetchTemplates();

        if (data.buildStatus !== "ready") {
          setTimeout(() => pollBuildStatus(data.templateId), 3000);
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
        (form.elements.namedItem("name") as HTMLInputElement).value = "";
        (form.elements.namedItem("description") as HTMLInputElement).value = "";
      } else {
        setResult({
          success: false,
          message: data.error || "Upload failed",
          buildLog: data.buildLog,
        });
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) {
      return;
    }

    setDeleting(templateId);

    try {
      const res = await fetch(`/api/site-admin/templates?templateId=${templateId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (data.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      } else {
        alert(data.error || "Failed to delete template");
      }
    } catch (error) {
      alert("Failed to delete template");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle size={12} /> Ready
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <XCircle size={12} /> Failed
          </span>
        );
      case "building":
      case "installing":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            <Loader2 size={12} className="animate-spin" /> Building...
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            <Loader2 size={12} className="animate-spin" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Manage Templates</h1>
        <p className="text-gray-500 mt-1">
          Upload React applications as templates. They will be built and made available for use.
        </p>
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Code size={20} className="text-blue-600" />
          How to Upload a React Template
        </h2>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>Create your React app using Create React App (CRA), Vite, or similar</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>Make sure your package.json has a valid build script (e.g., "build": "react-scripts build")</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span>
              <strong>Important:</strong> Remove node_modules from your project folder before zipping
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              4
            </span>
            <span>Zip the entire project folder (src, public, package.json, etc.) and upload below</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              5
            </span>
            <span>
              Add <strong>bdesh.dashboard.json</strong> to declare dashboard sections, filters, pages, and setup requirements for unique templates
            </span>
          </li>
        </ol>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <a
            href="/templates/bdesh.dashboard.example.json"
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium"
          >
            <FileArchive size={16} />
            Download dashboard example
          </a>
          <a
            href="/templates/TEMPLATE_CONTRACT.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium"
          >
            <FileText size={16} />
            View template contract
          </a>
        </div>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Nike Store"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              name="description"
              placeholder="e.g. A modern e-commerce template for fashion stores"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP File
            </label>
            <input
              type="file"
              name="file"
              ref={fileInputRef}
              accept=".zip"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only .zip files accepted. Include package.json and src folder, but exclude node_modules.
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading & Building...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload & Build Template
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Message */}
      {result && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 mb-8 ${
            result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <div className="flex-1">
            <p className="font-medium">{result.message}</p>
            {result.buildLog && (
              <details className="mt-2">
                <summary className="text-sm cursor-pointer">View build log</summary>
                <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-auto max-h-40">
                  {result.buildLog}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Uploaded Templates</h2>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No templates uploaded yet. Upload your first React template above.
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FileText size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(template.buildStatus)}

                  {template.buildStatus === "failed" && (
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Retry build"
                    >
                      <RefreshCw size={16} />
                    </button>
                  )}

                  {template.buildStatus === "ready" && (
                    <Link
                      href={`/templates/${template.id}`}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Preview
                    </Link>
                  )}

                  <button
                    onClick={() => handleDelete(template.id, template.name)}
                    disabled={deleting === template.id}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Delete template"
                  >
                    {deleting === template.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="mt-8 bg-amber-50 rounded-xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <AlertCircle size={18} />
          Important Notes:
        </h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>• Make sure node_modules is NOT included in the ZIP file</li>
          <li>• Your project must have a package.json with a "build" script</li>
          <li>• Add bdesh.dashboard.json for template-specific dashboard requirements like Men/Women filters</li>
          <li>• Build process may take 2-5 minutes depending on project size</li>
          <li>• Uploaded templates are available to all users in the platform</li>
        </ul>
      </div>
    </div>
  );
}
