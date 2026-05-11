"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  LogOut,
  Shield,
  FolderArchive,
  RefreshCw,
  Info,
} from "lucide-react";

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

interface UploadStats {
  totalFiles: number;
  htmlPages: number;
}

const ADMIN_KEY = "bdesh-site-admin-2024";
const SESSION_KEY = "siteAdminAuth";

export default function SiteAdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === ADMIN_KEY) {
      setIsAuthorized(true);
      fetchTemplates();
    } else {
      setLoading(false);
    }
  }, []);

  const login = () => {
    if (password === ADMIN_KEY) {
      sessionStorage.setItem(SESSION_KEY, ADMIN_KEY);
      setIsAuthorized(true);
      setPassword("");
      setMessage(null);
      fetchTemplates();
    } else {
      setMessage({ type: "error", text: "Invalid admin password" });
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthorized(false);
    setTemplates([]);
    setMessage(null);
  };

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/site-admin/templates?adminKey=${ADMIN_KEY}`
      );
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      } else {
        setTemplates([]);
        if (res.status === 403) {
          setMessage({ type: "error", text: "Authentication failed. Please log in again." });
          logout();
        }
      }
    } catch {
      setTemplates([]);
      setMessage({ type: "error", text: "Failed to fetch templates" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    if (!uploadFile) {
      setMessage({ type: "error", text: "Please select a ZIP file to upload." });
      setUploading(false);
      return;
    }

    if (!uploadName.trim()) {
      setMessage({ type: "error", text: "Template name is required." });
      setUploading(false);
      return;
    }

    if (!uploadFile.name.endsWith(".zip")) {
      setMessage({ type: "error", text: "Only .zip files are accepted." });
      setUploading(false);
      return;
    }

    if (uploadFile.size > 50 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size exceeds 50MB limit." });
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("zip", uploadFile);
    formData.append("name", uploadName);
    formData.append("description", uploadDescription);
    formData.append("adminKey", ADMIN_KEY);

    try {
      const res = await fetch("/api/site-admin/templates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const stats: UploadStats = data.stats;
        setMessage({
          type: "success",
          text: `Template "${data.name}" uploaded successfully! ${stats?.htmlPages || 0} HTML pages, ${stats?.totalFiles || 0} total files.`,
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
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(templateId);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/site-admin/templates?adminKey=${ADMIN_KEY}&templateId=${templateId}`,
        { method: "DELETE" }
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
    } catch {
      setMessage({ type: "error", text: "Failed to delete template" });
    } finally {
      setDeleting(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".zip")) {
      setUploadFile(file);
    } else {
      setMessage({ type: "error", text: "Please drop a .zip file" });
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Login Screen ───────────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Site Admin Panel
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Authorized personnel only. Enter the admin password to manage website templates.
            </p>
          </div>

          {message && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {message.text}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn size={18} />
                Access Admin Panel
              </span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              This is a restricted area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading Screen ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading templates...</p>
        </div>
      </div>
    );
  }

  // ─── Main Admin Panel ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Site Admin Panel
              </h1>
              <p className="text-xs text-gray-500">
                Upload & manage website templates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTemplates()}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh templates"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : message.type === "info"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check size={18} className="shrink-0" />
            ) : message.type === "info" ? (
              <Info size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="shrink-0 hover:opacity-70"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by name, description, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <Upload size={18} />
            Upload Website ZIP
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FolderArchive size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.length}
                </p>
                <p className="text-xs text-gray-500">Total Templates</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.reduce((sum, t) => sum + (t.pages || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">Total Pages</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredTemplates.length}
                </p>
                <p className="text-xs text-gray-500">Showing</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">Active</p>
                <p className="text-xs text-gray-500">Session</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Upload Website Template
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Upload a ZIP file containing your website HTML/CSS/JS files
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., My Fashion Store"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This will be used as the template ID (lowercase, hyphenated)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of the template..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Website ZIP File <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                      dragOver
                        ? "border-blue-500 bg-blue-50"
                        : uploadFile
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadFile ? (
                      <>
                        <FolderArchive className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-green-700 font-medium">
                          {uploadFile.name}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadFile(null);
                          }}
                          className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium mb-1">
                          Drag & drop your ZIP file here
                        </p>
                        <p className="text-sm text-gray-400 mb-3">or click to browse</p>
                        <p className="text-xs text-gray-400">
                          ZIP files only • Max 50MB • Must contain HTML files
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      onChange={(e) =>
                        setUploadFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Uploading & deploying...
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2 rounded-full animate-pulse w-3/4" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setUploadFile(null);
                      setUploadName("");
                      setUploadDescription("");
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile || !uploadName.trim()}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deploying...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Upload size={16} />
                        Upload & Deploy
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FolderArchive className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery
                ? "No templates match your search. Try a different keyword."
                : "Upload your first website template to get started. Click the button above to upload a ZIP file."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <span className="flex items-center gap-2">
                  <Upload size={18} />
                  Upload Your First Template
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg hover:border-gray-300 transition-all"
              >
                {/* Preview */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={template.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors shadow-lg"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </a>
                    <a
                      href={template.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors shadow-lg"
                      title="Open in new tab"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[2.5rem]">
                    {template.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <FileText size={12} />
                      <span>{template.pages || 0} pages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package size={12} />
                      <span>{template.size || "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {template.id}
                    </code>
                    <button
                      onClick={() => handleDelete(template.id, template.name)}
                      disabled={deleting === template.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-gray-400">
          Site Admin Panel • Bdesh E-Commerce Platform • Authorized Access Only
        </div>
      </footer>
    </div>
  );
}
