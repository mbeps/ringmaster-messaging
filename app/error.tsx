"use client";

import Link from "next/link";
import { useEffect } from "react";
import Button from "@/components/button";
import { ROUTES } from "@/config/routes";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary to catch uncaught runtime errors in the application.
 * @param param0: error details and reset callback
 * @returns error boundary component
 */
export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <p className="font-semibold text-red-500 text-sm uppercase tracking-wide">
          Error
        </p>
        <h2 className="mt-2 font-bold text-3xl text-gray-900 tracking-tight">
          Something went wrong!
        </h2>
        <p className="mt-3 text-gray-600 text-sm">
          An unexpected error occurred. Please try again or return to the sign
          in page.
        </p>
        <div className="mt-6 flex items-center justify-center gap-x-4">
          <Button onClick={() => reset()}>Try again</Button>
          <Link href={ROUTES.AUTH.path}>
            <Button secondary>Go to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
