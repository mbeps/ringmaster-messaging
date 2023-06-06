"use client";

import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import React, { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButtont";
import { BsGithub, BsGoogle } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = "LOGIN" | "REGISTER";

/**
 * Authentication form which handles both login and registration.
 * There are 2 variants: LOGIN and REGISTER.
 * @returns (JSX.Element)
 */
const AuthForm: React.FC = () => {
  // gets the current session
  const session = useSession();
  const router = useRouter();
  // initial variant is LOGIN but it can be changed to REGISTER
  const [variant, setVariant] = useState<Variant>("LOGIN");
  // loading state for the authentication process
  const [isLoading, setIsLoading] = useState(false);

  /**
   * If the user is already authenticated, redirect to the users page.
   * This is to prevent the user from accessing the login page when they are already logged in.
   */
  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  /**
   * Toggles the variant between LOGIN and REGISTER.
   */
  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  /**
   * React Hook Form for handling the form state.
   * Keeps track of the input values and errors.
   */
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
   * If the variant is REGISTER, it will register the user.
   * If the variant is LOGIN, it will log the user in and redirect to the users page.
   * @param data (FieldValues): form data for signing in or registering
   */
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    // register the user
    if (variant === "REGISTER") {
      axios
        .post("/api/register", data)
        .then(() => signIn("credentials", data)) // automatically log in after registering
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            toast.error(error.response.data);
          } else if (error.request) {
            // The request was made but no response was received
            toast.error("No response from server. Please try again later.");
          } else {
            // Something happened in setting up the request that triggered an Error
            toast.error("Something went wrong");
          }
        })
        .finally(() => setIsLoading(false));
    }

    // log the user in
    if (variant === "LOGIN") {
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
              toast.success("Logged In");
              router.push("/users");
            }
          })
          .finally(() => setIsLoading(false));
      }
    }
  };

  /**
   * Handles authentication with third party providers.
   * @param action (string): either "github" or "google"
   */
  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials!");
        }

        if (callback?.ok) {
          toast.success("Logged In");
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
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
              "
            >
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
        <div
          className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
          "
        >
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
