"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Eye,
  ExternalLink,
  X,
  Check,
  AlertCircle,
  Loader2,
  Search,
  FileText,
  Package,
  LogIn,
} from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  previewUrl: string;
  pages?: number;
  size?: string;
  lastModified?: string;
}

const ADMIN_PASSWORD = "admin123";
const ADMIN_KEY = "bdesh-admin-2024";

export default function AdminPanelPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("bdeshUploadAdmin");
    if (stored === ADMIN_KEY) {
      setIsAuthorized(true);
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, []);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("bdeshUploadAdmin", ADMIN_KEY);
      setIsAuthorized(true);
      setPassword("");
      fetchTemplates();
    } else {
      setMessage({ type: "error", text: "Invalid password" });
    }
  };

  const logout = () => {
    sessionStorage.removeItem("bdeshUploadAdmin");
    setIsAuthorized(false);
    setTemplates([]);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin-panel/templates?adminKey=${ADMIN_KEY}`
      );
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    if (!uploadFile) {
      setMessage({
        type: "error",
        text: "Please select a ZIP file to upload.",
      });
      setUploading(false);
      return;
    }

    if (!uploadName.trim()) {
      setMessage({ type: "error", text: "Template name is required." });
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("zip", uploadFile);
    formData.append("name", uploadName);
    formData.append("description", uploadDescription);

    // Simple admin auth using form field
    formData.append("adminKey", ADMIN_KEY);

    try {
      const res = await fetch("/api/admin-panel/templates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadProgress(100);
        setMessage({
          type: "success",
          text: "Template uploaded and deployed successfully!",
        });
        setShowUploadForm(false);
        setUploadFile(null);
        setUploadName("");
        setUploadDescription("");
        fetchTemplates();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Upload failed. Please try again.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    try {
      setDeleting(templateId);
      setMessage(null);

      const res = await fetch(
        `/api/admin-panel/templates?adminKey=${ADMIN_KEY}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (data.success) {
        setTemplates(templates.filter((t) => t.id !== templateId));
        setMessage({
          type: "success",
          text: `Template "${templateName}" deleted successfully`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to delete template",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete template" });
    } finally {
      setDeleting(null);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1d4ed8]/10 rounded-xl mb-4">
              <LogIn className="w-6 h-6 text-[#1d4ed8]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Enter admin password to continue</p>
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {message.text}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>

          <p className="text-center mt-4 text-xs text-gray-400">
            Use password: "admin123"
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-500">Manage templates and deployments</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
              />
            </div>
          </div>
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] flex items-center gap-2 transition-colors"
          >
            <Upload size={18} />
            Upload Template
          </button>
        </div>

        {showUploadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upload Template
                </h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter template name"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] min-h-[80px]"
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your ZIP file here
                  </p>
                  <p className="text-sm text-gray-400 mb-4">or</p>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) =>
                      setUploadFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    ZIP files only. Max 50MB.
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#1d4ed8] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Uploading...
                      </span>
                    ) : (
                      "Upload & Deploy"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try a different search term."
                : "Upload your first template to get started."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af]"
              >
                Upload Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={template.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-[#1d4ed8]"
                    >
                      <Eye size={18} />
                    </a>
                    <a
                      href={template.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-[#1d4ed8]"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {template.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{template.pages || 0} pages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package size={14} />
                      <span>{template.size || "Unknown"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      ID: {template.id}
                    </span>
                    <button
                      onClick={() =>
                        handleDelete(template.id, template.name)
                      }
                      disabled={deleting === template.id}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleting === template.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
