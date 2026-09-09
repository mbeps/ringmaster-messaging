import Image from "next/image";
import AuthForm from "./components/AuthForm";

/**
 * Root page which is the authentication page.
 * It displays:
 *  - Logo
 *  - Title
 *  - Authentication Form
 * @returns (JSX.Element): root page which is the login page
 */
const Auth = () => {
  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Image
          height="24"
          width="24"
          className="mx-auto w-24"
          src="/images/logo.svg"
          alt="Logo"
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
};

export default Auth;
