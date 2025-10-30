export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gray-50">
      <div className="flex items-center gap-4">
        {/* SVG spinner */}
        <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div>
          <h3 className="text-lg text-gray-600 font-medium">Loading</h3>
          <p className="text-sm text-gray-600">Fetching data — please wait…</p>
        </div>
      </div>

      {/* Skeleton grid for product cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="bg-gray-200 animate-pulse h-40 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="flex items-center justify-between mt-4">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
