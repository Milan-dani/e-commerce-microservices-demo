import Button from "@/components/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl text-center p-8 bg-white rounded-lg shadow">
        <div className="mx-auto mb-4 w-28 h-28 flex items-center justify-center rounded-full bg-blue-50">
          <svg
            className="h-12 w-12 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M21 21l-4.35-4.35"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 19a8 8 0 100-16 8 8 0 000 16z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-5xl text-gray-600 font-bold mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-6">
          We couldn&apos;t find the page you&apos;re looking for.
        </p>

        {/* <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-blue-600 text-white rounded shadow"
          >
            Take me home
          </Link>
          <Link
            href="/products"
            className="inline-block px-5 py-2 border border-gray-300 rounded"
          >
            Browse products
          </Link>
        </div> */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            // className="inline-block px-5 py-2 bg-blue-600 text-white rounded shadow"
          >
            <Button variant="primary" size="lg" className="px-5 py-2 shadow">
              Take me home
            </Button>
          </Link>
          <Link
            href="/products"
            // className="inline-block px-5 py-2 border border-gray-300 rounded"
          >
            <Button variant="primary-outline" size="lg" className="px-5 py-2 shadow">
              Browse products
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If you think this is an error, contact support@micromerce.com
        </p>
      </div>
    </div>
  );
}
