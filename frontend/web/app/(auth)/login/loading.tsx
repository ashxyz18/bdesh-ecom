export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mx-auto" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-11 w-full bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
