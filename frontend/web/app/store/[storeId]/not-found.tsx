import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-3">Store not found</h1>
        <p className="opacity-60 mb-6">
          This store does not exist or has been removed by its owner.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
