"use client";

import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButtont";
import { BsGithub, BsGoogle } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES, API_ROUTES } from "@/libs/routes";

type Variant = "LOGIN" | "REGISTER";

/**
 * Authentication form which handles both login and registration.
 * There are 2 variants: LOGIN and REGISTER.
 * @returns (JSX.Element)
 */
function AuthForm() {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * If the user is already authenticated, redirect to the users page.
   */
  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push(ROUTES.USERS);
    }
  }, [session?.status, router]);

  // Toggles the variant between LOGIN and REGISTER
  const toggleVariant = () => {
    setVariant(variant === "LOGIN" ? "REGISTER" : "LOGIN");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  /**
   * Handles the form submission for authentication.
   */
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    // Register the user
    if (variant === "REGISTER") {
      axios
        .post(API_ROUTES.REGISTER, data)
        .then(() => signIn("credentials", { ...data, redirect: false }))
        .then((callback) => {
          if (callback?.ok) {
            toast.success("Account created!");
            router.push(ROUTES.USERS);
          }
          if (callback?.error) {
            toast.error("Registration failed");
          }
        })
        .catch((error) => {
          if (error.response) {
            toast.error(error.response.data);
          } else if (error.request) {
            toast.error("No response from server. Please try again later.");
          } else {
            toast.error("Something went wrong");
          }
        })
        .finally(() => setIsLoading(false));
    }

    // Log the user in
    if (variant === "LOGIN") {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials!");
          }

          if (callback?.ok && !callback?.error) {
            toast.success("Logged in!");
            router.push(ROUTES.USERS);
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  /**
   * Handles authentication with third party providers.
   * Updated for NextAuth v5 - uses callbackUrl for proper redirects
   */
  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { 
      callbackUrl: ROUTES.USERS,
      redirect: true  // Changed to true for OAuth
    })
      .catch((error) => {
        toast.error("OAuth authentication failed");
        console.error("OAuth error:", error);
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
};

export default AuthForm;