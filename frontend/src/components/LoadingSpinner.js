const LoadingSpinner = ({ message = "Fetching data — please wait…", ...props }) => {
  return (
    <>
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gray-50 hidden">
      <div className="flex items-center gap-4">
        {/* SVG spinner */}
        <svg
          className="animate-spin h-12 w-12 text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
        <div>
          <h3 className="text-lg text-gray-600 font-medium">Loading</h3>
          <p className="text-sm text-gray-600">Fetching data — please wait…</p>
        </div>
      </div>
    </div>
    {/* Hidden ^ */}
    
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-16 w-16 text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700">Loading</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    </div>
            </>
  );
}

export default LoadingSpinner;