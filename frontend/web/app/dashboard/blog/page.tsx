import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Eye, Trash2, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

function getStatusColor(status: string) {
  switch (status) {
    case "PUBLISHED": return "text-green-600 bg-green-50";
    default: return "text-yellow-600 bg-yellow-50";
  }
}

export default async function BlogManagementPage({
  searchParams,
}: {
  searchParams: { storeId?: string; status?: string };
}) {
  const session = await getSession();
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MERCHANT")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need merchant or admin privileges.</p>
        </div>
      </div>
    );
  }

  const storeId = searchParams.storeId;
  const statusFilter = searchParams.status;

  // Build where clause
  const where: any = {};
  if (statusFilter && statusFilter !== "all") {
    where.isPublished = statusFilter === "published";
  }

  // For merchants, only show their store's posts
  if (session.user.role === "MERCHANT") {
    const store = await prisma.store.findFirst({
      where: { ownerId: session.user.id, deletedAt: null },
      select: { id: true },
    });
    if (store) where.storeId = store.id;
  } else if (storeId) {
    where.storeId = storeId;
  }

  const [posts, stores] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        store: { select: { id: true, name: true } },
      },
    }),
    session.user.role === "ADMIN" 
      ? prisma.store.findMany({ where: { deletedAt: null }, select: { id: true, name: true } })
      : [],
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button>New Post</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4 flex-wrap">
            <Link href="/dashboard/blog">
              <Button variant={!statusFilter ? "default" : "outline"} size="sm">
                All
              </Button>
            </Link>
            <Link href="/dashboard/blog?status=published">
              <Button variant={statusFilter === "published" ? "default" : "outline"} size="sm">
                Published
              </Button>
            </Link>
            <Link href="/dashboard/blog?status=draft">
              <Button variant={statusFilter === "draft" ? "default" : "outline"} size="sm">
                Drafts
              </Button>
            </Link>

            {session.user.role === "ADMIN" && stores.length > 0 && (
              <div className="ml-auto">
                <select
                  className="px-3 py-2 border rounded-lg text-sm"
                  onChange={(e) => window.location.href = `/dashboard/blog?storeId=${e.target.value}`}
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Blog Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
            <p className="text-gray-600">Create your first blog post to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <p className="text-sm text-gray-500">
                      {post.slug} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    {session.user.role === "ADMIN" && (
                      <p className="text-xs text-gray-400 mt-1">{post.store.name}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.isPublished ? "published" : "draft")}`}>
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                )}

                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/blog/${post.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  {post.isPublished && (
                    <Link href={`/store/${post.storeId}/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
