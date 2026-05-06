import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Truck, CheckCircle, XCircle } from "lucide-react";

function getStatusColor(status: string) {
  switch (status) {
    case "DELIVERED": return "text-green-600 bg-green-50";
    case "SHIPPED": return "text-blue-600 bg-blue-50";
    case "PROCESSING": return "text-yellow-600 bg-yellow-50";
    case "CONFIRMED": return "text-purple-600 bg-purple-50";
    case "PENDING": return "text-gray-600 bg-gray-50";
    case "CANCELLED": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case "PAID": return "text-green-600 bg-green-50";
    case "FAILED": return "text-red-600 bg-red-50";
    case "REFUNDED": return "text-orange-600 bg-orange-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export default async function OrderHistoryPage() {
  const user = await getSessionUser();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <Link href="/login?redirect=/dashboard/orders">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shipping: true,
      store: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">When you place orders, they'll appear here.</p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-2">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ৳{item.price}
                        </p>
                      </div>
                      <p className="font-semibold">৳{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Store: {order.store.name}</p>
                    {order.shipping && (
                      <p className="mt-1">
                        <Truck className="w-4 h-4 inline mr-1" />
                        {order.shipping.name} - {order.shipping.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold">৳{order.total}</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 flex gap-2">
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                  {order.status === "DELIVERED" && (
                    <Button variant="outline" size="sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Write Review
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
