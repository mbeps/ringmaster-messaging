"use client";

import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButtont";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/libs/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schema/LoginSchema";
import { RegisterSchema } from "@/schema/RegisterSchema";

type Variant = "LOGIN" | "REGISTER";

/**
 * Authentication form which handles both login and registration.
 * There are 2 variants: LOGIN and REGISTER.
 * @returns (JSX.Element)
 */
function AuthForm() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * If the user is already authenticated, redirect to the users page.
   */
  useEffect(() => {
    if (session) {
      router.push(ROUTES.USERS);
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
      const schema = variant === "LOGIN" ? LoginSchema : RegisterSchema;
      return zodResolver(schema)(values as any, context, options as any);
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
        callbackURL: ROUTES.USERS,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Account created!");
            router.push(ROUTES.USERS);
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
        callbackURL: ROUTES.USERS,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged in!");
            router.push(ROUTES.USERS);
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

    authClient.signIn.social({
      provider: action as "github" | "google",
      callbackURL: ROUTES.USERS,
      fetchOptions: {
        onError: (ctx) => {
            toast.error("OAuth authentication failed: " + ctx.error.message);
        }
      }
    })
    .finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        className="
        bg-white
        px-4
        py-8
        shadow
        sm:rounded-2xl
        sm:px-10
      "
      >
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
              <div className="w-full border-t border-gray-300" />
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

        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === "LOGIN"
              ? "New to Ringmaster?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;