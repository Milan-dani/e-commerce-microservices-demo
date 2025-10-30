"use client";
import Link from "next/link";
import ErrorResetButton from "@/components/ErrorResetButton";
import ErrorDetails from "@/components/ErrorDetails";
import Button from "@/components/Button";

export default function Error({ error, reset }) {
  // Do not expose error details in production by default — provide a collapsible details panel
  const message = error ? String(error?.message || error) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl text-center bg-white p-8 rounded-lg shadow">
        {/* illustrative SVG icon */}
        <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-12 w-12 text-red-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 9v4"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 17h.01"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-4 text-gray-600">
          An unexpected error occurred while rendering this page.
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          {/* <Link href="/" className="px-4 py-2 border rounded">Go home</Link>
          <Link href="/products" className="px-4 py-2 border rounded">Browse products</Link> */}
          <Link
            href="/"
            // className="inline-block px-5 py-2 bg-blue-600 text-white rounded shadow"
          >
            <Button
              variant="primary-outline"
              size="lg"
              className="px-5 py-2 shadow"
            >
              Go home
            </Button>
          </Link>
          <Link
            href="/products"
            // className="inline-block px-5 py-2 border border-gray-300 rounded"
          >
            <Button
              variant="primary-outline"
              size="lg"
              className="px-5 py-2 shadow"
            >
              Browse products
            </Button>
          </Link>
        </div>

        {/* Collapsible details (client component) */}
        <ErrorDetails
          message={process.env.NODE_ENV === "development" ? message : message}
        />

        <div className="mt-6">
          <ErrorResetButton reset={reset} />
        </div>
      </div>
    </div>
  );
}
