import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-[#1d4ed8] animate-spin" />
          <div className="absolute inset-0 w-10 h-10 rounded-full bg-[#1d4ed8]/10 animate-pulse" />
        </div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
