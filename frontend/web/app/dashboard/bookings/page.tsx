import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function getStatusColor(status: string) {
  switch (status) {
    case "CONFIRMED": return "text-green-600 bg-green-50";
    case "COMPLETED": return "text-blue-600 bg-blue-50";
    case "CANCELLED": return "text-red-600 bg-red-50";
    case "PENDING": return "text-yellow-600 bg-yellow-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export default async function BookingManagementPage({
  searchParams,
}: {
  searchParams: { storeId?: string; status?: string };
}) {
  const session = await getSession();
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MERCHANT")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
    where.status = statusFilter;
  }

  // For merchants, only show their store's bookings
  if (session.user.role === "MERCHANT") {
    const store = await prisma.store.findFirst({
      where: { ownerId: session.user.id, deletedAt: null },
      select: { id: true },
    });
    if (store) where.storeId = store.id;
  } else if (storeId) {
    where.storeId = storeId;
  }

  const [bookings, stores] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { startTime: "asc" },
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
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4 flex-wrap">
            <Link href="/dashboard/bookings">
              <Button variant={!statusFilter ? "default" : "outline"} size="sm">
                All
              </Button>
            </Link>
            <Link href="/dashboard/bookings?status=PENDING">
              <Button variant={statusFilter === "PENDING" ? "default" : "outline"} size="sm">
                Pending
              </Button>
            </Link>
            <Link href="/dashboard/bookings?status=CONFIRMED">
              <Button variant={statusFilter === "CONFIRMED" ? "default" : "outline"} size="sm">
                Confirmed
              </Button>
            </Link>
            <Link href="/dashboard/bookings?status=COMPLETED">
              <Button variant={statusFilter === "COMPLETED" ? "default" : "outline"} size="sm">
                Completed
              </Button>
            </Link>
            <Link href="/dashboard/bookings?status=CANCELLED">
              <Button variant={statusFilter === "CANCELLED" ? "default" : "outline"} size="sm">
                Cancelled
              </Button>
            </Link>
          </div>

          {session.user.role === "ADMIN" && stores.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">Filter by Store</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {stores.map((store) => (
                  <Link key={store.id} href={`/dashboard/bookings?storeId=${store.id}`}>
                    <Button variant={storeId === store.id ? "default" : "outline"} size="sm">
                      {store.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600">No bookings match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                    <p className="text-sm text-gray-600">
                      {booking.customerName} • {booking.customerEmail || booking.customerPhone}
                    </p>
                    {session.user.role === "ADMIN" && (
                      <p className="text-xs text-gray-500 mt-1">{booking.store.name}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {booking.notes && (
                  <p className="text-sm text-gray-600 mb-4">{booking.notes}</p>
                )}

                <div className="flex gap-2">
                  {booking.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
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
