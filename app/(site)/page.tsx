import Image from "next/image";
import AuthForm from "@/app/(site)/_components/auth-form";
import { ASSETS } from "@/config/assets";

/**
 * Root page which is the authentication page.
 * It displays:
 *  - Logo
 *  - Title
 *  - Authentication Form
 * @returns root page which is the login page
 */
export default function AuthPage() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Image
          height="24"
          width="24"
          className="mx-auto w-24"
          src={ASSETS.LOGO.path}
          alt={ASSETS.LOGO.alt}
        />
        {/* Title */}
        <h2 className="mt-6 text-center font-bold text-3xl text-gray-900 tracking-tight">
          Sign in to your account
        </h2>
      </div>
      {/* Authentication Form */}
      <AuthForm />
    </div>
  );
}
