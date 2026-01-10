"use client";

import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import Input from "@/components/inputs/Input";
import Button from "@/components/Button";
import { authClient } from "@/lib/auth-client";
import { ChangePasswordSchema } from "@/schema/ChangePasswordSchema";

/**
 * Form for changing user password.
 * Uses Better Auth's changePassword API.
 */
function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");
      reset();
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        disabled={isLoading}
        label="Current Password"
        id="currentPassword"
        type="password"
        errors={errors}
        required
        register={register}
      />

      <Input
        disabled={isLoading}
        label="New Password"
        id="newPassword"
        type="password"
        errors={errors}
        required
        register={register}
      />

      <Input
        disabled={isLoading}
        label="Confirm New Password"
        id="confirmPassword"
        type="password"
        errors={errors}
        required
        register={register}
      />

      <div className="flex justify-end">
        <Button disabled={isLoading} type="submit">
          Change Password
        </Button>
      </div>
    </form>
  );
}

export default SecurityForm;
