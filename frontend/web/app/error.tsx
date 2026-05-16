"use client";

import { useEffect } from "react";
import { Button } from "@/components/shared/Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-8">
          We apologize for the inconvenience. Our team has been notified and is working on a fix.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="inline-flex items-center gap-2 border-gray-300">
              <Home size={16} />
              Go Home
            </Button>
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto">
            <p className="text-xs font-mono text-red-600">{error.message}</p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500 mt-1">Digest: {error.digest}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
