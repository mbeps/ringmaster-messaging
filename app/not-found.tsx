import Image from "next/image";
import Link from "next/link";
import Button from "@/components/button";
import { ASSETS } from "@/config/assets";
import { ROUTES } from "@/config/routes";

/**
 * Root 404 Not Found page for non-existent routes across the application.
 * @returns 404 page component
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          height={48}
          width={48}
          className="mx-auto w-12"
          src={ASSETS.LOGO.path}
          alt={ASSETS.LOGO.alt}
        />
        <p className="mt-6 font-semibold text-red-500 text-sm uppercase tracking-wide">
          404
        </p>
        <h1 className="mt-2 font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-gray-600 text-sm">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-6 flex items-center justify-center gap-x-4">
          <Link href={ROUTES.AUTH.path}>
            <Button>Back to home</Button>
          </Link>
          <Link href={ROUTES.CONVERSATIONS.path}>
            <Button secondary>Go to conversations</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
