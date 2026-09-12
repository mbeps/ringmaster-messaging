"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BsGithub, BsGoogle } from "react-icons/bs";
import AuthSocialButton from "@/app/(site)/_components/auth-social-button";
import Button from "@/components/button";
import Input from "@/components/inputs/input";
import { ROUTES } from "@/config/routes";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/schemas/auth/login.schema";
import { registerSchema } from "@/schemas/auth/register.schema";

type Variant = "LOGIN" | "REGISTER";

/**
 * Authentication form which handles both login and registration.
 * There are 2 variants: LOGIN and REGISTER.
 * @returns authentication form component
 */
export default function AuthForm() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * If the user is already authenticated, redirect to the users page.
   */
  useEffect(() => {
    if (session) {
      router.push(ROUTES.USERS.path);
    }
  }, [session, router]);

  // Toggles the variant between LOGIN and REGISTER
  const toggleVariant = () => {
    setVariant(variant === "LOGIN" ? "REGISTER" : "LOGIN");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: (values, context, options) => {
      const schema = variant === "LOGIN" ? loginSchema : registerSchema;
      return zodResolver(schema)(values, context, options);
    },
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  /**
   * Handles the form submission for authentication.
   */
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    // Register the user
    if (variant === "REGISTER") {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: ROUTES.USERS.path,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Account created!");
            router.push(ROUTES.USERS.path);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Registration failed");
          },
        },
      });
      setIsLoading(false);
    }

    // Log the user in
    if (variant === "LOGIN") {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: ROUTES.USERS.path,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged in!");
            router.push(ROUTES.USERS.path);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Invalid credentials!");
          },
        },
      });
      setIsLoading(false);
    }
  };

  /**
   * Handles authentication with third party providers.
   */
  const socialAction = (action: string) => {
    setIsLoading(true);

    authClient.signIn
      .social({
        provider: action as "github" | "google",
        callbackURL: ROUTES.USERS.path,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(`OAuth authentication failed: ${ctx.error.message}`);
          },
        },
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-2xl sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              id="name"
              label="Name"
            />
          )}
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            id="email"
            label="Email address"
            type="email"
          />
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            id="password"
            label="Password"
            type="password"
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-gray-300 border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2 px-2 text-gray-500 text-sm">
          <div>
            {variant === "LOGIN"
              ? "New to Ringmaster?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="cursor-pointer underline">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
}
